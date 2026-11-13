// Consultas agregadas usadas pelo painel, relatórios, pesquisa e exportação
import type { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { calcLeilao, calcObra } from "./calc";
import { TIPO_LANC_LOCACAO, type GrupoCusto, type StatusLeilao, type StatusObra, type DestinacaoObra } from "./constants";
import { hojeUTC, mesBR, mesKey, n, nn, onlyDigits } from "./format";
import { incluiE1, incluiE2, type Escopo } from "./escopo";

export type Periodo = { de: Date | null; ate: Date | null };

function noPeriodo(d: Date | null, p?: Periodo): boolean {
  if (!p || (!p.de && !p.ate)) return true;
  if (!d) return false;
  if (p.de && d < p.de) return false;
  if (p.ate && d > p.ate) return false;
  return true;
}

const soma = (xs: { valor: unknown }[]) => xs.reduce((a, x) => a + n(x.valor), 0);

// ------------------------------------------------------------
// Empresa 1 — Obras
// ------------------------------------------------------------
export async function linhasObras(p?: Periodo) {
  const obras = await prisma.obra.findMany({
    orderBy: { numero: "asc" },
    include: {
      construtora: { select: { razaoSocial: true } },
      aportes: { select: { valor: true, data: true, etapa: true } },
      custosVenda: { select: { valor: true } },
      locacoes: {
        select: {
          ativo: true,
          valorAluguel: true,
          lancamentos: { select: { tipo: true, valor: true, competencia: true, status: true } },
        },
      },
    },
  });

  return obras.map((o) => {
    const totalAportes = soma(o.aportes);
    const totalCustosVenda = soma(o.custosVenda);
    const vendaValor = nn(o.vendaValor);
    const c = calcObra({ custoPrevisto: n(o.custoPrevisto), totalAportes, vendaValor, totalCustosVenda });

    let receitasLocacao = 0;
    let despesasLocacao = 0;
    let aluguelMensal = 0;
    for (const loc of o.locacoes) {
      if (loc.ativo) aluguelMensal += n(loc.valorAluguel);
      for (const l of loc.lancamentos) {
        if (l.status === "CANCELADO" || !noPeriodo(l.competencia, p)) continue;
        if (TIPO_LANC_LOCACAO[l.tipo].receita) receitasLocacao += n(l.valor);
        else despesasLocacao += n(l.valor);
      }
    }
    const resultadoLocacao = receitasLocacao - despesasLocacao;
    const resultado =
      o.destinacao === "VENDA" ? c.resultadoVenda : o.destinacao === "ALUGUEL" ? resultadoLocacao : null;

    const porEtapa: Record<string, number> = {};
    for (const a of o.aportes) {
      const k = a.etapa || "Sem etapa";
      porEtapa[k] = (porEtapa[k] ?? 0) + n(a.valor);
    }

    return {
      id: o.id,
      numero: o.numero,
      nome: o.nome,
      cidade: o.cidade,
      uf: o.uf,
      endereco: o.endereco,
      matricula: o.matricula,
      inscricaoIptu: o.inscricaoIptu,
      status: o.status as StatusObra,
      destinacao: o.destinacao as DestinacaoObra | null,
      construtora: o.construtora?.razaoSocial ?? null,
      custoPrevisto: n(o.custoPrevisto),
      totalAportes,
      qtdAportes: o.aportes.length,
      porEtapa,
      ...c,
      vendaValor,
      vendaData: o.vendaData,
      totalCustosVenda,
      receitasLocacao,
      despesasLocacao,
      resultadoLocacao,
      aluguelMensal,
      yieldAnual: totalAportes > 0 && aluguelMensal > 0 ? (aluguelMensal * 12) / totalAportes : null,
      resultado,
      dataInicio: o.dataInicio,
      dataTerminoPrevista: o.dataTerminoPrevista,
      dataTermino: o.dataTermino,
    };
  });
}
export type LinhaObra = Awaited<ReturnType<typeof linhasObras>>[number];

// ------------------------------------------------------------
// Empresa 2 — Leilão
// ------------------------------------------------------------
export async function linhasLeilao() {
  const hoje = hojeUTC();
  const imoveis = await prisma.imovelLeilao.findMany({
    orderBy: { codigo: "asc" },
    include: { custos: { select: { grupo: true, categoria: true, valor: true } } },
  });
  return imoveis.map((i) => {
    const c = calcLeilao(
      {
        valorArrematacao: nn(i.valorArrematacao),
        valorVenda: nn(i.valorVenda),
        valorVendaEstimado: nn(i.valorVendaEstimado),
        dataCompra: i.dataCompra,
        dataVenda: i.dataVenda,
      },
      i.custos.map((x) => ({ grupo: x.grupo as GrupoCusto, categoria: x.categoria, valor: n(x.valor) })),
      hoje,
    );
    return {
      id: i.id,
      codigo: i.codigo,
      descricao: i.descricao,
      tipoImovel: i.tipoImovel,
      cidade: i.cidade,
      uf: i.uf,
      endereco: i.endereco,
      modalidade: i.modalidade,
      ocupado: i.ocupado,
      status: i.status as StatusLeilao,
      valorAvaliacao: nn(i.valorAvaliacao),
      valorLance: nn(i.valorLance),
      valorVendaEstimado: nn(i.valorVendaEstimado),
      dataCompra: i.dataCompra,
      dataVenda: i.dataVenda,
      ...c,
    };
  });
}
export type LinhaLeilao = Awaited<ReturnType<typeof linhasLeilao>>[number];

// ------------------------------------------------------------
// Fluxo mensal consolidado (saídas = investimentos/custos, entradas = vendas/aluguéis)
// ------------------------------------------------------------
export async function fluxoMensal(escopo: Escopo, meses = 12) {
  const hoje = hojeUTC();
  const inicio = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth() - (meses - 1), 1));
  const linhas = new Map<string, { mes: string; label: string; e1Saida: number; e1Entrada: number; e2Saida: number; e2Entrada: number }>();
  for (let k = 0; k < meses; k++) {
    const d = new Date(Date.UTC(inicio.getUTCFullYear(), inicio.getUTCMonth() + k, 1));
    linhas.set(mesKey(d), { mes: mesKey(d), label: mesBR(d), e1Saida: 0, e1Entrada: 0, e2Saida: 0, e2Entrada: 0 });
  }
  const add = (d: Date | null, campo: "e1Saida" | "e1Entrada" | "e2Saida" | "e2Entrada", v: number) => {
    if (!d) return;
    const l = linhas.get(mesKey(d));
    if (l) l[campo] += v;
  };

  if (incluiE1(escopo)) {
    const [aportes, lancs, vendas] = await Promise.all([
      prisma.aporte.findMany({ where: { data: { gte: inicio } }, select: { data: true, valor: true } }),
      prisma.lancamentoLocacao.findMany({
        where: { competencia: { gte: inicio }, status: { not: "CANCELADO" } },
        select: { competencia: true, valor: true, tipo: true },
      }),
      prisma.obra.findMany({ where: { vendaData: { gte: inicio } }, select: { vendaData: true, vendaValor: true } }),
    ]);
    aportes.forEach((a) => add(a.data, "e1Saida", n(a.valor)));
    lancs.forEach((l) => add(l.competencia, TIPO_LANC_LOCACAO[l.tipo].receita ? "e1Entrada" : "e1Saida", n(l.valor)));
    vendas.forEach((v) => add(v.vendaData, "e1Entrada", n(v.vendaValor)));
  }
  if (incluiE2(escopo)) {
    const [compras, custos, vendas] = await Promise.all([
      prisma.imovelLeilao.findMany({ where: { dataCompra: { gte: inicio } }, select: { dataCompra: true, valorArrematacao: true } }),
      prisma.custoLeilao.findMany({ where: { data: { gte: inicio } }, select: { data: true, valor: true } }),
      prisma.imovelLeilao.findMany({ where: { dataVenda: { gte: inicio } }, select: { dataVenda: true, valorVenda: true } }),
    ]);
    compras.forEach((c) => add(c.dataCompra, "e2Saida", n(c.valorArrematacao)));
    custos.forEach((c) => add(c.data, "e2Saida", n(c.valor)));
    vendas.forEach((v) => add(v.dataVenda, "e2Entrada", n(v.valorVenda)));
  }
  return [...linhas.values()];
}

// ------------------------------------------------------------
// Pesquisa de notas fiscais / lançamentos (Empresa 1, 2 ou ambas)
// ------------------------------------------------------------
export type FiltroNotas = { escopo: Escopo; q: string | null; de: Date | null; ate: Date | null; somenteNF: boolean };

export type LinhaNota = {
  key: string;
  empresa: 1 | 2;
  origem: string;
  href: string;
  data: Date | null;
  valor: number;
  cnpj: string | null;
  razaoSocial: string | null;
  nf: string | null;
  classificacao: string;
  descricao: string | null;
};

export async function pesquisarNotas(f: FiltroNotas): Promise<LinhaNota[]> {
  const q = f.q?.trim() || null;
  const digitos = q ? onlyDigits(q) : "";
  const linhas: LinhaNota[] = [];

  if (incluiE1(f.escopo)) {
    const and: Prisma.AporteWhereInput[] = [];
    if (q) {
      const or: Prisma.AporteWhereInput[] = [
        { emissorRazaoSocial: { contains: q, mode: "insensitive" } },
        { nfNumero: { contains: q, mode: "insensitive" } },
        { descricao: { contains: q, mode: "insensitive" } },
        { etapa: { contains: q, mode: "insensitive" } },
        { contrapartida: { contains: q, mode: "insensitive" } },
      ];
      if (digitos.length >= 3) or.push({ emissorCnpj: { contains: digitos } });
      and.push({ OR: or });
    }
    if (f.de) and.push({ data: { gte: f.de } });
    if (f.ate) and.push({ data: { lte: f.ate } });
    if (f.somenteNF) and.push({ nfNumero: { not: null } });
    const rows = await prisma.aporte.findMany({
      where: { AND: and },
      include: { obra: { select: { id: true, numero: true, nome: true } } },
      orderBy: { data: "desc" },
      take: 1000,
    });
    for (const r of rows) {
      linhas.push({
        key: `a${r.id}`,
        empresa: 1,
        origem: `Obra ${r.obra.numero} — ${r.obra.nome}`,
        href: `/obras/${r.obra.id}/aportes`,
        data: r.data,
        valor: n(r.valor),
        cnpj: r.emissorCnpj,
        razaoSocial: r.emissorRazaoSocial,
        nf: r.nfNumero,
        classificacao: r.etapa ?? "Aporte",
        descricao: r.descricao,
      });
    }
  }

  if (incluiE2(f.escopo)) {
    const and: Prisma.CustoLeilaoWhereInput[] = [];
    if (q) {
      const or: Prisma.CustoLeilaoWhereInput[] = [
        { fornecedorRazaoSocial: { contains: q, mode: "insensitive" } },
        { nfNumero: { contains: q, mode: "insensitive" } },
        { descricao: { contains: q, mode: "insensitive" } },
        { categoria: { contains: q, mode: "insensitive" } },
      ];
      if (digitos.length >= 3) or.push({ fornecedorCnpj: { contains: digitos } });
      and.push({ OR: or });
    }
    if (f.de) and.push({ data: { gte: f.de } });
    if (f.ate) and.push({ data: { lte: f.ate } });
    if (f.somenteNF) and.push({ nfNumero: { not: null } });
    const rows = await prisma.custoLeilao.findMany({
      where: { AND: and },
      include: { imovel: { select: { id: true, codigo: true, descricao: true } } },
      orderBy: { data: "desc" },
      take: 1000,
    });
    for (const r of rows) {
      linhas.push({
        key: `c${r.id}`,
        empresa: 2,
        origem: `Imóvel ${r.imovel.codigo} — ${r.imovel.descricao}`,
        href: `/leilao/${r.imovel.id}`,
        data: r.data,
        valor: n(r.valor),
        cnpj: r.fornecedorCnpj,
        razaoSocial: r.fornecedorRazaoSocial,
        nf: r.nfNumero,
        classificacao: r.categoria,
        descricao: r.descricao,
      });
    }
  }

  return linhas.sort((a, b) => (b.data?.getTime() ?? 0) - (a.data?.getTime() ?? 0));
}

/** Emissores já usados (autocomplete de CNPJ / razão social) */
export async function emissoresConhecidos(): Promise<{ cnpj: string; razaoSocial: string }[]> {
  const [a, c] = await Promise.all([
    prisma.aporte.findMany({
      where: { emissorCnpj: { not: null } },
      select: { emissorCnpj: true, emissorRazaoSocial: true },
      distinct: ["emissorCnpj"],
      take: 500,
    }),
    prisma.custoLeilao.findMany({
      where: { fornecedorCnpj: { not: null } },
      select: { fornecedorCnpj: true, fornecedorRazaoSocial: true },
      distinct: ["fornecedorCnpj"],
      take: 500,
    }),
  ]);
  const m = new Map<string, string>();
  a.forEach((x) => x.emissorCnpj && m.set(x.emissorCnpj, x.emissorRazaoSocial ?? ""));
  c.forEach((x) => x.fornecedorCnpj && !m.has(x.fornecedorCnpj) && m.set(x.fornecedorCnpj, x.fornecedorRazaoSocial ?? ""));
  return [...m.entries()].map(([cnpj, razaoSocial]) => ({ cnpj, razaoSocial }));
}
