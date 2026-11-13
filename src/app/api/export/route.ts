import type { Prisma } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { DESTINACAO, GRUPOS_CUSTO, STATUS_LEILAO, STATUS_OBRA } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { getEscopo } from "@/lib/escopo";
import { parseDate } from "@/lib/form";
import { dataBR, docMask, n, onlyDigits } from "@/lib/format";
import { linhasLeilao, linhasObras, pesquisarNotas } from "@/lib/queries";

export const dynamic = "force-dynamic";

type Cell = string | number | null | undefined;

function csv(cab: string[], linhas: Cell[][]): string {
  const esc = (v: Cell) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "number" ? v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }) : String(v);
    return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + [cab, ...linhas].map((l) => l.map(esc).join(";")).join("\r\n");
}

export async function GET(req: NextRequest) {
  if (!(await getSession())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const p = req.nextUrl.searchParams;
  const tipo = p.get("tipo");
  const de = parseDate(p.get("de"));
  const ate = parseDate(p.get("ate"));
  let nome = "export";
  let conteudo = "";

  if (tipo === "obras") {
    const obras = await linhasObras({ de, ate });
    nome = "obras";
    conteudo = csv(
      ["Nº", "Unidade", "Endereço", "Cidade", "UF", "Matrícula", "IPTU", "Construtora", "Status", "Início", "Término", "Custo previsto", "Aportado", "Execução %", "Destinação", "Venda", "Custos venda", "Receitas aluguel", "Despesas aluguel", "Resultado"],
      obras.map((o) => [
        o.numero, o.nome, o.endereco, o.cidade, o.uf, o.matricula, o.inscricaoIptu, o.construtora, STATUS_OBRA[o.status].label,
        dataBR(o.dataInicio), dataBR(o.dataTermino ?? o.dataTerminoPrevista), o.custoPrevisto, o.totalAportes,
        o.execucao === null ? null : o.execucao * 100, o.destinacao ? DESTINACAO[o.destinacao] : null, o.vendaValor,
        o.totalCustosVenda, o.receitasLocacao, o.despesasLocacao, o.resultado,
      ]),
    );
  } else if (tipo === "aportes") {
    const and: Prisma.AporteWhereInput[] = [];
    if (p.get("obra")) and.push({ obraId: Number(p.get("obra")) });
    if (p.get("etapa")) and.push({ etapa: { contains: p.get("etapa")!, mode: "insensitive" } });
    const q = p.get("q");
    if (q) {
      const dig = onlyDigits(q);
      and.push({
        OR: [
          { emissorRazaoSocial: { contains: q, mode: "insensitive" } },
          { nfNumero: { contains: q, mode: "insensitive" } },
          { descricao: { contains: q, mode: "insensitive" } },
          { contrapartida: { contains: q, mode: "insensitive" } },
          ...(dig.length >= 3 ? [{ emissorCnpj: { contains: dig } }] : []),
        ],
      });
    }
    if (de) and.push({ data: { gte: de } });
    if (ate) and.push({ data: { lte: ate } });
    const rows = await prisma.aporte.findMany({
      where: { AND: and },
      include: { obra: { select: { numero: true, nome: true } } },
      orderBy: [{ obra: { numero: "asc" } }, { data: "asc" }],
    });
    nome = "aportes";
    conteudo = csv(
      ["Obra nº", "Obra", "Data", "Etapa", "Descrição", "Contrapartida", "Forma pagamento", "CNPJ emissor", "Razão social emissor", "NF", "Valor"],
      rows.map((a) => [
        a.obra.numero, a.obra.nome, dataBR(a.data), a.etapa, a.descricao, a.contrapartida, a.formaPagamento,
        a.emissorCnpj ? docMask(a.emissorCnpj) : null, a.emissorRazaoSocial, a.nfNumero, n(a.valor),
      ]),
    );
  } else if (tipo === "leilao") {
    const im = await linhasLeilao();
    nome = "leilao";
    conteudo = csv(
      ["Código", "Imóvel", "Tipo", "Cidade", "UF", "Modalidade", "Status", "Data compra", "Data venda", "Prazo meses", "Avaliação", "Lance", "Arrematação", "Total aquisição", "Reforma", "Custos até a venda", "Custo total", "Venda", "Custos de venda", "Venda líquida", "Resultado", "ROI %", "Rendimento mês %", "Vendido"],
      im.map((i) => [
        i.codigo, i.descricao, i.tipoImovel, i.cidade, i.uf, i.modalidade, STATUS_LEILAO[i.status].label, dataBR(i.dataCompra),
        dataBR(i.dataVenda), i.prazoMeses, i.valorAvaliacao, i.valorLance, i.arrematacao, i.totalAquisicao, i.totalReforma,
        i.totalManutencao, i.custoTotal, i.venda, i.totalCustosVenda, i.vendaLiquida, i.resultado,
        i.roi === null ? null : i.roi * 100, i.rendimentoMes === null ? null : i.rendimentoMes * 100, i.vendido ? "Sim" : "Não (projeção)",
      ]),
    );
  } else if (tipo === "custos") {
    const rows = await prisma.custoLeilao.findMany({
      include: { imovel: { select: { codigo: true, descricao: true } } },
      orderBy: [{ imovel: { codigo: "asc" } }, { data: "asc" }],
    });
    nome = "custos-leilao";
    conteudo = csv(
      ["Código", "Imóvel", "Data", "Grupo", "Item", "Descrição", "CNPJ fornecedor", "Fornecedor", "NF", "Valor"],
      rows.map((c) => [
        c.imovel.codigo, c.imovel.descricao, dataBR(c.data), GRUPOS_CUSTO[c.grupo].label, c.categoria, c.descricao,
        c.fornecedorCnpj ? docMask(c.fornecedorCnpj) : null, c.fornecedorRazaoSocial, c.nfNumero, n(c.valor),
      ]),
    );
  } else if (tipo === "notas") {
    const linhas = await pesquisarNotas({ escopo: await getEscopo(), q: p.get("q"), de, ate, somenteNF: p.get("nf") === "1" });
    nome = "notas";
    conteudo = csv(
      ["Empresa", "Origem", "Data", "Classificação", "Descrição", "CNPJ", "Razão social", "NF", "Valor"],
      linhas.map((l) => [
        l.empresa === 1 ? "Empresa 1" : "Empresa 2", l.origem, dataBR(l.data), l.classificacao, l.descricao,
        l.cnpj ? docMask(l.cnpj) : null, l.razaoSocial, l.nf, l.valor,
      ]),
    );
  } else {
    return NextResponse.json({ error: "Tipo de exportação inválido" }, { status: 400 });
  }

  const data = new Date().toISOString().slice(0, 10);
  return new NextResponse(conteudo, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sass-${nome}-${data}.csv"`,
    },
  });
}
