"use server";

import type { Prisma, StatusLancamento, StatusObra, TipoLancamentoLocacao } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { STATUS_OBRA, TIPO_LANC_LOCACAO } from "@/lib/constants";
import { prisma } from "@/lib/db";
import {
  FormError,
  bool,
  date,
  dateReq,
  int,
  money,
  moneyReq,
  parseMonth,
  req,
  str,
  toActionError,
  type ActionState,
} from "@/lib/form";
import { hojeUTC, onlyDigits } from "@/lib/format";

const revalidarObra = (obraId: number) => {
  revalidatePath(`/obras/${obraId}`, "layout");
  revalidatePath("/obras");
  revalidatePath("/");
};

// ============================================================
// Obra
// ============================================================
async function dadosObra(fd: FormData): Promise<Prisma.ObraUncheckedCreateInput> {
  const numero = int(fd, "numero");
  if (!numero || numero < 1) throw new FormError("Informe o número da obra (1, 2, 3…).");
  const status = (str(fd, "status") ?? "PLANEJAMENTO") as StatusObra;
  if (!(status in STATUS_OBRA)) throw new FormError("Status inválido.");

  let construtoraId = int(fd, "construtoraId");
  const novaConstrutora = str(fd, "novaConstrutora");
  if (!construtoraId && novaConstrutora) {
    const c = await prisma.construtora.create({
      data: { razaoSocial: novaConstrutora, cnpj: onlyDigits(str(fd, "novaConstrutoraCnpj")) || null },
    });
    construtoraId = c.id;
  }

  return {
    numero,
    nome: req(fd, "nome", "Identificação da unidade"),
    endereco: str(fd, "endereco"),
    bairro: str(fd, "bairro"),
    cidade: str(fd, "cidade"),
    uf: str(fd, "uf"),
    cep: str(fd, "cep"),
    matricula: str(fd, "matricula"),
    cartorio: str(fd, "cartorio"),
    inscricaoIptu: str(fd, "inscricaoIptu"),
    construtoraId: construtoraId ?? null,
    custoPrevisto: money(fd, "custoPrevisto") ?? 0,
    dataInicio: date(fd, "dataInicio"),
    dataTerminoPrevista: date(fd, "dataTerminoPrevista"),
    dataTermino: date(fd, "dataTermino"),
    status,
    observacoes: str(fd, "observacoes"),
  };
}

export async function criarObra(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  let id: number;
  try {
    id = (await prisma.obra.create({ data: await dadosObra(fd) })).id;
  } catch (e) {
    return toActionError(e);
  }
  revalidatePath("/obras");
  redirect(`/obras/${id}`);
}

export async function atualizarObra(id: number, _: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  try {
    await prisma.obra.update({ where: { id }, data: await dadosObra(fd) });
  } catch (e) {
    return toActionError(e);
  }
  revalidarObra(id);
  redirect(`/obras/${id}`);
}

export async function excluirObra(id: number): Promise<ActionState> {
  await requireUser();
  try {
    await prisma.obra.delete({ where: { id } });
  } catch (e) {
    return toActionError(e);
  }
  revalidatePath("/obras");
  redirect("/obras");
}

// ============================================================
// Aportes
// ============================================================
function dadosAporte(fd: FormData) {
  const valor = moneyReq(fd, "valor", "Valor");
  if (valor === 0) throw new FormError("O valor do aporte não pode ser zero.");
  return {
    data: dateReq(fd, "data", "Data"),
    valor,
    etapa: str(fd, "etapa"),
    descricao: str(fd, "descricao"),
    contrapartida: str(fd, "contrapartida"),
    formaPagamento: str(fd, "formaPagamento"),
    emissorCnpj: onlyDigits(str(fd, "emissorCnpj")) || null,
    emissorRazaoSocial: str(fd, "emissorRazaoSocial"),
    nfNumero: str(fd, "nfNumero"),
  };
}

export async function criarAporte(obraId: number, _: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  try {
    await prisma.aporte.create({ data: { obraId, ...dadosAporte(fd) } });
    const obra = await prisma.obra.findUnique({ where: { id: obraId }, select: { status: true } });
    if (obra?.status === "PLANEJAMENTO") await prisma.obra.update({ where: { id: obraId }, data: { status: "EM_ANDAMENTO" } });
  } catch (e) {
    return toActionError(e);
  }
  revalidarObra(obraId);
  revalidatePath("/aportes");
  return { ok: "Aporte lançado com sucesso." };
}

export async function atualizarAporte(obraId: number, aporteId: number, _: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  try {
    await prisma.aporte.update({ where: { id: aporteId, obraId }, data: dadosAporte(fd) });
  } catch (e) {
    return toActionError(e);
  }
  revalidarObra(obraId);
  revalidatePath("/aportes");
  redirect(`/obras/${obraId}/aportes`);
}

export async function excluirAporte(obraId: number, aporteId: number): Promise<ActionState | void> {
  await requireUser();
  await prisma.aporte.delete({ where: { id: aporteId, obraId } });
  revalidarObra(obraId);
  revalidatePath("/aportes");
}

// ============================================================
// Destinação: venda
// ============================================================
export async function definirDestinacao(obraId: number, destinacao: "VENDA" | "ALUGUEL" | null): Promise<ActionState | void> {
  await requireUser();
  await prisma.obra.update({ where: { id: obraId }, data: { destinacao } });
  revalidarObra(obraId);
}

export async function salvarVenda(obraId: number, _: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  try {
    const vendaValor = money(fd, "vendaValor");
    const vendaData = date(fd, "vendaData");
    const data: Prisma.ObraUncheckedUpdateInput = {
      destinacao: "VENDA",
      vendaValor,
      vendaData,
      vendaComprador: str(fd, "vendaComprador"),
      vendaCompradorDoc: onlyDigits(str(fd, "vendaCompradorDoc")) || null,
    };
    if (vendaValor !== null && vendaData) data.status = "VENDIDA";
    await prisma.obra.update({ where: { id: obraId }, data });
  } catch (e) {
    return toActionError(e);
  }
  revalidarObra(obraId);
  return { ok: "Dados da venda salvos." };
}

export async function criarCustoVenda(obraId: number, _: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  try {
    await prisma.custoVendaObra.create({
      data: {
        obraId,
        tipo: req(fd, "tipo", "Tipo"),
        descricao: str(fd, "descricao"),
        valor: moneyReq(fd, "valor", "Valor"),
        data: date(fd, "data"),
      },
    });
  } catch (e) {
    return toActionError(e);
  }
  revalidarObra(obraId);
  return { ok: "Custo de venda lançado." };
}

export async function excluirCustoVenda(obraId: number, id: number): Promise<ActionState | void> {
  await requireUser();
  await prisma.custoVendaObra.delete({ where: { id, obraId } });
  revalidarObra(obraId);
}

// ============================================================
// Destinação: aluguel (contratos e lançamentos)
// ============================================================
async function dadosLocacao(fd: FormData) {
  let inquilinoId = int(fd, "inquilinoId");
  const novoInquilino = str(fd, "novoInquilinoNome");
  if (!inquilinoId && novoInquilino) {
    const i = await prisma.inquilino.create({
      data: {
        nome: novoInquilino,
        cpfCnpj: onlyDigits(str(fd, "novoInquilinoDoc")) || null,
        telefone: str(fd, "novoInquilinoTelefone"),
        email: str(fd, "novoInquilinoEmail"),
      },
    });
    inquilinoId = i.id;
  }
  if (!inquilinoId) throw new FormError("Selecione o inquilino ou cadastre um novo.");

  let imobiliariaId = int(fd, "imobiliariaId");
  const novaImob = str(fd, "novaImobiliaria");
  if (!imobiliariaId && novaImob) {
    const i = await prisma.imobiliaria.create({ data: { razaoSocial: novaImob, comissaoPct: money(fd, "taxaAdministracaoPct") } });
    imobiliariaId = i.id;
  }

  const dia = int(fd, "diaVencimento") ?? 10;
  if (dia < 1 || dia > 31) throw new FormError("Dia de vencimento deve ser entre 1 e 31.");

  return {
    inquilinoId,
    imobiliariaId: imobiliariaId ?? null,
    valorAluguel: moneyReq(fd, "valorAluguel", "Valor do aluguel"),
    diaVencimento: dia,
    dataInicio: dateReq(fd, "dataInicio", "Início do contrato"),
    dataFim: date(fd, "dataFim"),
    taxaAdministracaoPct: money(fd, "taxaAdministracaoPct"),
    indiceReajuste: str(fd, "indiceReajuste"),
    garantia: str(fd, "garantia"),
    observacoes: str(fd, "observacoes"),
  };
}

export async function criarLocacao(obraId: number, _: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  let id: number;
  try {
    const dados = await dadosLocacao(fd);
    id = (await prisma.locacao.create({ data: { obraId, ...dados, ativo: true } })).id;
    await prisma.obra.update({ where: { id: obraId }, data: { destinacao: "ALUGUEL", status: "ALUGADA" } });
  } catch (e) {
    return toActionError(e);
  }
  revalidarObra(obraId);
  revalidatePath("/locacoes");
  redirect(`/obras/${obraId}/destinacao/locacao/${id}`);
}

export async function atualizarLocacao(obraId: number, locId: number, _: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  try {
    const dados = await dadosLocacao(fd);
    await prisma.locacao.update({ where: { id: locId, obraId }, data: { ...dados, ativo: bool(fd, "ativo") } });
  } catch (e) {
    return toActionError(e);
  }
  revalidarObra(obraId);
  revalidatePath("/locacoes");
  return { ok: "Contrato atualizado." };
}

export async function excluirLocacao(obraId: number, locId: number): Promise<ActionState> {
  await requireUser();
  await prisma.locacao.delete({ where: { id: locId, obraId } });
  revalidarObra(obraId);
  revalidatePath("/locacoes");
  redirect(`/obras/${obraId}/destinacao`);
}

function vencimentoNoMes(competencia: Date, dia: number): Date {
  const ano = competencia.getUTCFullYear();
  const mes = competencia.getUTCMonth();
  const ultimo = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();
  return new Date(Date.UTC(ano, mes, Math.min(dia, ultimo)));
}

/** Gera o aluguel do mês (e a comissão da imobiliária, se houver taxa) */
export async function gerarCompetencia(obraId: number, locId: number, _: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  try {
    const competencia = parseMonth(str(fd, "competencia"));
    if (!competencia) throw new FormError("Informe o mês de competência.");
    const meses = Math.min(24, Math.max(1, int(fd, "meses") ?? 1));
    const loc = await prisma.locacao.findUniqueOrThrow({ where: { id: locId, obraId } });
    let criados = 0;
    let pulados = 0;
    for (let k = 0; k < meses; k++) {
      const comp = new Date(Date.UTC(competencia.getUTCFullYear(), competencia.getUTCMonth() + k, 1));
      const existe = await prisma.lancamentoLocacao.findFirst({
        where: { locacaoId: locId, competencia: comp, tipo: "ALUGUEL", status: { not: "CANCELADO" } },
      });
      if (existe) {
        pulados++;
        continue;
      }
      const aluguel = Number(loc.valorAluguel);
      const venc = vencimentoNoMes(comp, loc.diaVencimento);
      await prisma.lancamentoLocacao.create({
        data: { locacaoId: locId, competencia: comp, tipo: "ALUGUEL", descricao: "Aluguel", valor: aluguel, vencimento: venc },
      });
      const taxa = loc.taxaAdministracaoPct ? Number(loc.taxaAdministracaoPct) : 0;
      if (taxa > 0) {
        await prisma.lancamentoLocacao.create({
          data: {
            locacaoId: locId,
            competencia: comp,
            tipo: "COMISSAO",
            descricao: `Taxa de administração (${taxa.toLocaleString("pt-BR")}%)`,
            valor: Math.round(aluguel * taxa) / 100,
            vencimento: venc,
          },
        });
      }
      criados++;
    }
    revalidarObra(obraId);
    revalidatePath("/locacoes");
    return {
      ok: `${criados} competência(s) gerada(s)${pulados ? `, ${pulados} já existente(s) ignorada(s)` : ""}.`,
    };
  } catch (e) {
    return toActionError(e);
  }
}

export async function criarLancamento(obraId: number, locId: number, _: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  try {
    const competencia = parseMonth(str(fd, "competencia"));
    if (!competencia) throw new FormError("Informe o mês de competência.");
    const tipo = req(fd, "tipo", "Tipo") as TipoLancamentoLocacao;
    if (!(tipo in TIPO_LANC_LOCACAO)) throw new FormError("Tipo inválido.");
    const status = (str(fd, "status") ?? "PENDENTE") as StatusLancamento;
    await prisma.lancamentoLocacao.create({
      data: {
        locacaoId: locId,
        competencia,
        tipo,
        descricao: str(fd, "descricao"),
        valor: moneyReq(fd, "valor", "Valor"),
        vencimento: date(fd, "vencimento"),
        status,
        dataPagamento: status === "PAGO" ? (date(fd, "dataPagamento") ?? hojeUTC()) : null,
      },
    });
  } catch (e) {
    return toActionError(e);
  }
  revalidarObra(obraId);
  revalidatePath("/locacoes");
  return { ok: "Lançamento incluído." };
}

export async function alterarStatusLancamento(
  obraId: number,
  lancId: number,
  status: "PENDENTE" | "PAGO" | "CANCELADO",
): Promise<ActionState | void> {
  await requireUser();
  await prisma.lancamentoLocacao.update({
    where: { id: lancId, locacao: { obraId } },
    data: { status, dataPagamento: status === "PAGO" ? hojeUTC() : null },
  });
  revalidarObra(obraId);
  revalidatePath("/locacoes");
}

export async function excluirLancamento(obraId: number, lancId: number): Promise<ActionState | void> {
  await requireUser();
  await prisma.lancamentoLocacao.delete({ where: { id: lancId, locacao: { obraId } } });
  revalidarObra(obraId);
  revalidatePath("/locacoes");
}
