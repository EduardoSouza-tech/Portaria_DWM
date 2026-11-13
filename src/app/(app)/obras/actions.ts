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

function dadosCustoVenda(fd: FormData) {
  return {
    tipo: req(fd, "tipo", "Tipo"),
    descricao: str(fd, "descricao"),
    valor: moneyReq(fd, "valor", "Valor"),
    data: date(fd, "data"),
  };
}

export async function criarCustoVenda(obraId: number, _: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  try {
    await prisma.custoVendaObra.create({ data: { obraId, ...dadosCustoVenda(fd) } });
  } catch (e) {
    return toActionError(e);
  }
  revalidarObra(obraId);
  return { ok: "Custo de venda lançado." };
}

export async function atualizarCustoVenda(obraId: number, id: number, _: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  try {
    await prisma.custoVendaObra.update({ where: { id, obraId }, data: dadosCustoVenda(fd) });
  } catch (e) {
    return toActionError(e);
  }
  revalidarObra(obraId);
  redirect(`/obras/${obraId}/destinacao`);
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
    multaAtrasoPct: pctCampo(fd, "multaAtrasoPct", "Multa por atraso"),
    jurosMesPct: pctCampo(fd, "jurosMesPct", "Juros ao mês"),
    observacoes: str(fd, "observacoes"),
  };
}

function pctCampo(fd: FormData, key: string, label: string): number | null {
  const v = money(fd, key);
  if (v !== null && (v < 0 || v > 100)) throw new FormError(`"${label}" deve estar entre 0 e 100%.`);
  return v;
}

const r2 = (v: number) => Math.round(v * 100) / 100;
const comissaoSobre = (aluguel: number, taxaPct: number) => r2((aluguel * taxaPct) / 100);

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
    const ativo = bool(fd, "ativo");
    await prisma.locacao.update({ where: { id: locId, obraId }, data: { ...dados, ativo } });
    await sincronizarStatusAlugada(obraId);
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
  await sincronizarStatusAlugada(obraId);
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
            valor: comissaoSobre(aluguel, taxa),
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

// ------------------------------------------------------------
// Manutenção de lançamentos (títulos a receber / a pagar)
// ------------------------------------------------------------
const SEM_BAIXA = { dataPagamento: null, multa: null, juros: null, desconto: null, formaPagamento: null, obsPagamento: null };

const revalidarLocacoes = (obraId: number) => {
  revalidarObra(obraId);
  revalidatePath("/locacoes");
};

async function lancamentoDaObra(obraId: number, lancId: number) {
  const l = await prisma.lancamentoLocacao.findFirst({ where: { id: lancId, locacao: { obraId } } });
  if (!l) throw new FormError("Lançamento não encontrado.");
  return l;
}

/** Corrige competência, tipo, descrição, valor e vencimento (prorrogação) */
export async function atualizarLancamento(obraId: number, lancId: number, _: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  try {
    await lancamentoDaObra(obraId, lancId);
    const competencia = parseMonth(str(fd, "competencia"));
    if (!competencia) throw new FormError("Informe o mês de competência.");
    const tipo = req(fd, "tipo", "Tipo") as TipoLancamentoLocacao;
    if (!(tipo in TIPO_LANC_LOCACAO)) throw new FormError("Tipo inválido.");
    const valor = moneyReq(fd, "valor", "Valor");
    if (valor <= 0) throw new FormError("O valor deve ser maior que zero.");
    await prisma.lancamentoLocacao.update({
      where: { id: lancId },
      data: { competencia, tipo, descricao: str(fd, "descricao"), valor, vencimento: date(fd, "vencimento") },
    });
  } catch (e) {
    return toActionError(e);
  }
  revalidarLocacoes(obraId);
  return { ok: "Lançamento atualizado." };
}

/**
 * Baixa manual: data, multa, juros, desconto e forma de pagamento.
 * Se o principal recebido for menor que o valor do título, a baixa é parcial:
 * o título fica com o valor recebido e o saldo vira um novo lançamento em aberto.
 */
export async function baixarLancamento(obraId: number, lancId: number, _: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  let msg: string;
  try {
    const l = await lancamentoDaObra(obraId, lancId);
    if (l.status !== "PENDENTE") throw new FormError("Só é possível baixar lançamentos pendentes.");
    const dataPagamento = dateReq(fd, "dataPagamento", "Data do pagamento");
    const valor = Number(l.valor);
    const principal = moneyReq(fd, "principal", "Valor principal");
    const multa = money(fd, "multa") ?? 0;
    const juros = money(fd, "juros") ?? 0;
    const desconto = money(fd, "desconto") ?? 0;
    if (principal <= 0) throw new FormError("O valor principal deve ser maior que zero.");
    if (principal > valor + 0.005) {
      throw new FormError(`O principal não pode passar do valor do título (${valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}). Use multa/juros para acréscimos.`);
    }
    if (multa < 0 || juros < 0 || desconto < 0) throw new FormError("Multa, juros e desconto não podem ser negativos.");
    if (desconto > principal + multa + juros) throw new FormError("O desconto não pode ser maior que o total.");

    const saldo = r2(valor - principal);
    const baixa = {
      status: "PAGO" as const,
      dataPagamento,
      multa: multa || null,
      juros: juros || null,
      desconto: desconto || null,
      formaPagamento: str(fd, "formaPagamento"),
      obsPagamento: str(fd, "obsPagamento"),
    };
    if (saldo > 0) {
      const vencSaldo = date(fd, "vencimentoSaldo") ?? l.vencimento;
      await prisma.$transaction([
        prisma.lancamentoLocacao.update({ where: { id: l.id }, data: { ...baixa, valor: principal } }),
        prisma.lancamentoLocacao.create({
          data: {
            locacaoId: l.locacaoId,
            competencia: l.competencia,
            tipo: l.tipo,
            descricao: `Saldo — ${l.descricao ?? TIPO_LANC_LOCACAO[l.tipo].label}`,
            valor: saldo,
            vencimento: vencSaldo,
          },
        }),
      ]);
      msg = `Baixa parcial registrada. Saldo de ${saldo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} ficou em aberto.`;
    } else {
      await prisma.lancamentoLocacao.update({ where: { id: l.id }, data: baixa });
      msg = "Baixa registrada.";
    }
  } catch (e) {
    return toActionError(e);
  }
  revalidarLocacoes(obraId);
  return { ok: msg };
}

/** Desfaz a baixa: volta para pendente e limpa data, encargos e forma de pagamento */
export async function estornarBaixa(obraId: number, lancId: number): Promise<ActionState | void> {
  await requireUser();
  try {
    const l = await lancamentoDaObra(obraId, lancId);
    if (l.status !== "PAGO") return { error: "Este lançamento não está baixado." };
    await prisma.lancamentoLocacao.update({ where: { id: l.id }, data: { status: "PENDENTE", ...SEM_BAIXA } });
  } catch (e) {
    return toActionError(e);
  }
  revalidarLocacoes(obraId);
}

/** Cancela (mantém no histórico, fora dos totais) ou reativa um lançamento */
export async function alterarStatusLancamento(obraId: number, lancId: number, status: "PENDENTE" | "CANCELADO"): Promise<ActionState | void> {
  await requireUser();
  try {
    const l = await lancamentoDaObra(obraId, lancId);
    if (l.status === "PAGO") return { error: "Estorne a baixa antes de cancelar." };
    await prisma.lancamentoLocacao.update({ where: { id: l.id }, data: { status, ...SEM_BAIXA } });
  } catch (e) {
    return toActionError(e);
  }
  revalidarLocacoes(obraId);
}

export async function excluirLancamento(obraId: number, lancId: number, voltarPara?: string): Promise<ActionState | void> {
  await requireUser();
  await prisma.lancamentoLocacao.delete({ where: { id: lancId, locacao: { obraId } } });
  revalidarLocacoes(obraId);
  if (voltarPara) redirect(voltarPara);
}

/** Baixa em lote pelo valor do título (sem encargos) — tela de Locações */
export async function baixarEmLote(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  let qtd = 0;
  try {
    const ids = fd
      .getAll("ids")
      .map((v) => Number(v))
      .filter((v) => Number.isInteger(v) && v > 0);
    if (ids.length === 0) throw new FormError("Selecione ao menos um lançamento.");
    const dataPagamento = dateReq(fd, "dataPagamento", "Data do pagamento");
    const r = await prisma.lancamentoLocacao.updateMany({
      where: { id: { in: ids }, status: "PENDENTE" },
      data: { status: "PAGO", dataPagamento, formaPagamento: str(fd, "formaPagamento"), multa: null, juros: null, desconto: null },
    });
    qtd = r.count;
  } catch (e) {
    return toActionError(e);
  }
  revalidatePath("/", "layout");
  return { ok: `${qtd} lançamento(s) baixado(s).` };
}

// ------------------------------------------------------------
// Contrato: reajuste e encerramento
// ------------------------------------------------------------
async function sincronizarStatusAlugada(obraId: number) {
  const o = await prisma.obra.findUnique({
    where: { id: obraId },
    select: { status: true, locacoes: { where: { ativo: true }, select: { id: true } } },
  });
  if (!o) return;
  if (o.locacoes.length > 0 && o.status === "CONCLUIDA") await prisma.obra.update({ where: { id: obraId }, data: { status: "ALUGADA" } });
  if (o.locacoes.length === 0 && o.status === "ALUGADA") await prisma.obra.update({ where: { id: obraId }, data: { status: "CONCLUIDA" } });
}

/**
 * Reajusta o aluguel por percentual ou novo valor, a partir de uma competência.
 * Atualiza (opcionalmente) os aluguéis pendentes que ainda estão com o valor antigo
 * e a comissão da imobiliária correspondente.
 */
export async function reajustarAluguel(obraId: number, locId: number, _: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  let msg: string;
  try {
    const aPartirDe = parseMonth(str(fd, "aPartirDe"));
    if (!aPartirDe) throw new FormError("Informe a competência a partir da qual vale o novo valor.");
    const loc = await prisma.locacao.findFirst({ where: { id: locId, obraId } });
    if (!loc) throw new FormError("Contrato não encontrado.");
    const anterior = Number(loc.valorAluguel);
    const pctIn = money(fd, "percentual");
    const novoIn = money(fd, "valorNovo");
    let novo: number;
    let percentual: number | null;
    if (novoIn !== null) {
      novo = r2(novoIn);
      percentual = anterior > 0 ? Math.round((novo / anterior - 1) * 1_000_000) / 10_000 : null;
    } else if (pctIn !== null) {
      novo = r2(anterior * (1 + pctIn / 100));
      percentual = pctIn;
    } else {
      throw new FormError("Informe o percentual do reajuste ou o novo valor do aluguel.");
    }
    if (novo <= 0) throw new FormError("O novo valor do aluguel deve ser maior que zero.");
    if (novo === anterior) throw new FormError("O novo valor é igual ao valor atual.");
    const indice = str(fd, "indice") ?? loc.indiceReajuste;
    const taxa = loc.taxaAdministracaoPct ? Number(loc.taxaAdministracaoPct) : 0;
    const atualizar = bool(fd, "atualizarPendentes");

    const qtd = await prisma.$transaction(async (tx) => {
      let count = 0;
      if (atualizar) {
        const futuros = { locacaoId: locId, status: "PENDENTE" as const, competencia: { gte: aPartirDe } };
        count = (await tx.lancamentoLocacao.updateMany({ where: { ...futuros, tipo: "ALUGUEL", valor: anterior }, data: { valor: novo } })).count;
        if (taxa > 0) {
          await tx.lancamentoLocacao.updateMany({
            where: { ...futuros, tipo: "COMISSAO", valor: comissaoSobre(anterior, taxa) },
            data: { valor: comissaoSobre(novo, taxa) },
          });
        }
      }
      await tx.locacao.update({ where: { id: locId }, data: { valorAluguel: novo, indiceReajuste: indice } });
      await tx.reajusteLocacao.create({
        data: {
          locacaoId: locId,
          aPartirDe,
          indice,
          percentual,
          valorAnterior: anterior,
          valorNovo: novo,
          lancamentosAtualizados: count,
          observacoes: str(fd, "observacoes"),
        },
      });
      return count;
    });
    const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    msg = `Aluguel reajustado de ${fmt(anterior)} para ${fmt(novo)}${atualizar ? `; ${qtd} aluguel(is) pendente(s) atualizado(s)` : ""}.`;
  } catch (e) {
    return toActionError(e);
  }
  revalidarLocacoes(obraId);
  return { ok: msg };
}

/** Desfaz o último reajuste do contrato (volta o valor e os pendentes que ainda estão com o valor novo) */
export async function desfazerReajuste(obraId: number, locId: number, reajusteId: number): Promise<ActionState | void> {
  await requireUser();
  try {
    const loc = await prisma.locacao.findFirst({ where: { id: locId, obraId }, select: { taxaAdministracaoPct: true } });
    if (!loc) return { error: "Contrato não encontrado." };
    const ult = await prisma.reajusteLocacao.findFirst({ where: { locacaoId: locId }, orderBy: { id: "desc" } });
    if (!ult || ult.id !== reajusteId) return { error: "Só é possível desfazer o último reajuste." };
    const anterior = Number(ult.valorAnterior);
    const novo = Number(ult.valorNovo);
    const taxa = loc.taxaAdministracaoPct ? Number(loc.taxaAdministracaoPct) : 0;
    const futuros = { locacaoId: locId, status: "PENDENTE" as const, competencia: { gte: ult.aPartirDe } };
    await prisma.$transaction(async (tx) => {
      await tx.lancamentoLocacao.updateMany({ where: { ...futuros, tipo: "ALUGUEL", valor: novo }, data: { valor: anterior } });
      if (taxa > 0) {
        await tx.lancamentoLocacao.updateMany({
          where: { ...futuros, tipo: "COMISSAO", valor: comissaoSobre(novo, taxa) },
          data: { valor: comissaoSobre(anterior, taxa) },
        });
      }
      await tx.locacao.update({ where: { id: locId }, data: { valorAluguel: anterior } });
      await tx.reajusteLocacao.delete({ where: { id: ult.id } });
    });
  } catch (e) {
    return toActionError(e);
  }
  revalidarLocacoes(obraId);
}

/** Encerra o contrato: grava a data de saída e cancela os pendentes de competências posteriores */
export async function encerrarLocacao(obraId: number, locId: number, _: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  let msg: string;
  try {
    const loc = await prisma.locacao.findFirst({ where: { id: locId, obraId }, select: { dataInicio: true } });
    if (!loc) throw new FormError("Contrato não encontrado.");
    const dataFim = dateReq(fd, "dataFim", "Data de encerramento");
    if (dataFim < loc.dataInicio) throw new FormError("A data de encerramento é anterior ao início do contrato.");
    const ultimoMes = new Date(Date.UTC(dataFim.getUTCFullYear(), dataFim.getUTCMonth(), 1));
    const cancelar = bool(fd, "cancelarPendentes");
    const cancelados = await prisma.$transaction(async (tx) => {
      await tx.locacao.update({ where: { id: locId }, data: { ativo: false, dataFim } });
      if (!cancelar) return 0;
      const r = await tx.lancamentoLocacao.updateMany({
        where: { locacaoId: locId, status: "PENDENTE", competencia: { gt: ultimoMes } },
        data: { status: "CANCELADO" },
      });
      return r.count;
    });
    await sincronizarStatusAlugada(obraId);
    msg = `Contrato encerrado${cancelados ? `; ${cancelados} lançamento(s) futuro(s) cancelado(s)` : ""}.`;
  } catch (e) {
    return toActionError(e);
  }
  revalidarLocacoes(obraId);
  return { ok: msg };
}
