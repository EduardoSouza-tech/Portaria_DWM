"use server";

import type { GrupoCustoLeilao, Prisma, StatusLeilao } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { SIM_PADRAO } from "@/lib/calc";
import { GRUPOS_CUSTO, STATUS_LEILAO } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { FormError, bool, date, int, money, moneyReq, req, str, toActionError, type ActionState } from "@/lib/form";
import { onlyDigits } from "@/lib/format";

const revalidar = (id?: number) => {
  if (id) revalidatePath(`/leilao/${id}`, "layout");
  revalidatePath("/leilao");
  revalidatePath("/");
};

// ============================================================
// Imóvel
// ============================================================
function dadosImovel(fd: FormData): Prisma.ImovelLeilaoUncheckedCreateInput {
  const codigo = int(fd, "codigo");
  if (!codigo || codigo < 1) throw new FormError("Informe o código do imóvel.");
  const status = (str(fd, "status") ?? "ANALISE") as StatusLeilao;
  if (!(status in STATUS_LEILAO)) throw new FormError("Status inválido.");
  const valorVenda = money(fd, "valorVenda");
  return {
    codigo,
    descricao: req(fd, "descricao", "Descrição"),
    tipoImovel: str(fd, "tipoImovel"),
    endereco: str(fd, "endereco"),
    bairro: str(fd, "bairro"),
    cidade: str(fd, "cidade"),
    uf: str(fd, "uf"),
    cep: str(fd, "cep"),
    matricula: str(fd, "matricula"),
    inscricaoIptu: str(fd, "inscricaoIptu"),
    modalidade: str(fd, "modalidade"),
    leiloeiro: str(fd, "leiloeiro"),
    processo: str(fd, "processo"),
    dataLeilao: date(fd, "dataLeilao"),
    ocupado: bool(fd, "ocupado"),
    valorAvaliacao: money(fd, "valorAvaliacao"),
    valorLance: money(fd, "valorLance"),
    valorArrematacao: money(fd, "valorArrematacao"),
    dataCompra: date(fd, "dataCompra"),
    valorVendaEstimado: money(fd, "valorVendaEstimado"),
    valorVenda,
    dataVenda: date(fd, "dataVenda"),
    comprador: str(fd, "comprador"),
    status: valorVenda !== null && status !== "VENDIDO" && date(fd, "dataVenda") ? "VENDIDO" : status,
    observacoes: str(fd, "observacoes"),
  };
}

export async function criarImovel(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  let id: number;
  try {
    id = (await prisma.imovelLeilao.create({ data: dadosImovel(fd) })).id;
  } catch (e) {
    return toActionError(e);
  }
  revalidar();
  redirect(`/leilao/${id}`);
}

export async function atualizarImovel(id: number, _: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  try {
    await prisma.imovelLeilao.update({ where: { id }, data: dadosImovel(fd) });
  } catch (e) {
    return toActionError(e);
  }
  revalidar(id);
  redirect(`/leilao/${id}`);
}

export async function excluirImovel(id: number): Promise<ActionState> {
  await requireUser();
  await prisma.imovelLeilao.delete({ where: { id } });
  revalidar();
  redirect("/leilao");
}

// ============================================================
// Custos (lançamentos da planilha)
// ============================================================
export async function criarCusto(imovelId: number, _: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  try {
    const grupo = req(fd, "grupo", "Grupo") as GrupoCustoLeilao;
    if (!(grupo in GRUPOS_CUSTO)) throw new FormError("Grupo inválido.");
    await prisma.custoLeilao.create({
      data: {
        imovelId,
        grupo,
        categoria: req(fd, "categoria", "Categoria"),
        descricao: str(fd, "descricao"),
        valor: moneyReq(fd, "valor", "Valor"),
        data: date(fd, "data"),
        fornecedorCnpj: onlyDigits(str(fd, "fornecedorCnpj")) || null,
        fornecedorRazaoSocial: str(fd, "fornecedorRazaoSocial"),
        nfNumero: str(fd, "nfNumero"),
      },
    });
  } catch (e) {
    return toActionError(e);
  }
  revalidar(imovelId);
  return { ok: "Custo lançado." };
}

export async function excluirCusto(imovelId: number, id: number): Promise<ActionState | void> {
  await requireUser();
  await prisma.custoLeilao.delete({ where: { id, imovelId } });
  revalidar(imovelId);
}

/** Lança comissão do leiloeiro (5%), ITBI (3%) e registro (1,5%) sobre a arrematação, se ainda não lançados */
export async function lancarCustosPadrao(imovelId: number): Promise<ActionState> {
  await requireUser();
  const im = await prisma.imovelLeilao.findUnique({ where: { id: imovelId }, include: { custos: true } });
  if (!im) return { error: "Imóvel não encontrado." };
  const arr = im.valorArrematacao ? Number(im.valorArrematacao) : 0;
  if (arr <= 0) return { error: "Informe o valor de arrematação no cadastro do imóvel." };
  const padroes: { categoria: string; pct: number }[] = [
    { categoria: "Comissão Leiloeiro", pct: SIM_PADRAO.pctLeiloeiro },
    { categoria: "ITBI", pct: SIM_PADRAO.pctItbi },
    { categoria: "Registro", pct: SIM_PADRAO.pctRegistro },
  ];
  const novos = padroes.filter((p) => !im.custos.some((c) => c.grupo === "AQUISICAO" && c.categoria === p.categoria));
  if (!novos.length) return { error: "Comissão do leiloeiro, ITBI e registro já foram lançados." };
  await prisma.custoLeilao.createMany({
    data: novos.map((p) => ({
      imovelId,
      grupo: "AQUISICAO" as const,
      categoria: p.categoria,
      descricao: `${p.pct.toLocaleString("pt-BR")}% sobre a arrematação (estimado)`,
      valor: Math.round(arr * p.pct) / 100,
      data: im.dataCompra,
    })),
  });
  revalidar(imovelId);
}

// ============================================================
// Simulações
// ============================================================
function dadosSimulacao(fd: FormData) {
  const pct = (k: string) => money(fd, k) ?? 0;
  const baseIr = str(fd, "baseIr") === "VENDA" ? "VENDA" : "LUCRO";
  return {
    nome: req(fd, "nome", "Nome da simulação"),
    valorArremate: money(fd, "valorArremate") ?? 0,
    valorVendaEstimado: money(fd, "valorVendaEstimado") ?? 0,
    pctLeiloeiro: pct("pctLeiloeiro"),
    pctItbi: pct("pctItbi"),
    pctRegistro: pct("pctRegistro"),
    pctIr: pct("pctIr"),
    baseIr,
    pctComissaoVenda: pct("pctComissaoVenda"),
    advogado: money(fd, "advogado") ?? 0,
    pctReforma: pct("pctReforma"),
    debitosAto: money(fd, "debitosAto") ?? 0,
    custoMensal: money(fd, "custoMensal") ?? 0,
    prazoMeses: Math.max(0, int(fd, "prazoMeses") ?? 12),
    observacoes: str(fd, "observacoes"),
  };
}

export async function salvarSimulacao(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  let id: number;
  try {
    const dados = dadosSimulacao(fd);
    const existente = int(fd, "id");
    if (existente) {
      await prisma.simulacaoLeilao.update({ where: { id: existente }, data: dados });
      id = existente;
    } else {
      id = (await prisma.simulacaoLeilao.create({ data: dados })).id;
    }
  } catch (e) {
    return toActionError(e);
  }
  revalidatePath("/leilao/simulador");
  redirect(`/leilao/simulador?id=${id}&salvo=1`);
}

export async function excluirSimulacao(id: number): Promise<ActionState | void> {
  await requireUser();
  await prisma.simulacaoLeilao.delete({ where: { id } });
  revalidatePath("/leilao/simulador");
}

/** Cria um imóvel (em análise) a partir da simulação */
export async function converterSimulacao(id: number): Promise<ActionState> {
  await requireUser();
  const s = await prisma.simulacaoLeilao.findUnique({ where: { id } });
  if (!s) return { error: "Simulação não encontrada." };
  if (s.imovelId) redirect(`/leilao/${s.imovelId}`);
  const ultimo = await prisma.imovelLeilao.findFirst({ orderBy: { codigo: "desc" }, select: { codigo: true } });
  const im = await prisma.imovelLeilao.create({
    data: {
      codigo: (ultimo?.codigo ?? 0) + 1,
      descricao: s.nome,
      status: "ANALISE",
      valorLance: s.valorArremate,
      valorVendaEstimado: s.valorVendaEstimado,
      observacoes: `Criado a partir da simulação "${s.nome}".${s.observacoes ? `\n${s.observacoes}` : ""}`,
    },
  });
  await prisma.simulacaoLeilao.update({ where: { id }, data: { imovelId: im.id } });
  revalidar();
  revalidatePath("/leilao/simulador");
  redirect(`/leilao/${im.id}`);
}
