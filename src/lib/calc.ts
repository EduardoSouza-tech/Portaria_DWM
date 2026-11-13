// Regras de cálculo (puras — usadas no servidor e no navegador)
import type { GrupoCusto } from "./constants";
import { mesesEntre } from "./format";

// ------------------------------------------------------------
// Empresa 1 — Obra
// ------------------------------------------------------------
export function calcObra(i: {
  custoPrevisto: number;
  totalAportes: number;
  vendaValor: number | null;
  totalCustosVenda: number;
}) {
  const saldoPrevisto = i.custoPrevisto - i.totalAportes;
  const execucao = i.custoPrevisto > 0 ? i.totalAportes / i.custoPrevisto : null;
  const vendaLiquida = i.vendaValor !== null ? i.vendaValor - i.totalCustosVenda : null;
  const resultadoVenda = vendaLiquida !== null ? vendaLiquida - i.totalAportes : null;
  const roiVenda = resultadoVenda !== null && i.totalAportes > 0 ? resultadoVenda / i.totalAportes : null;
  return { saldoPrevisto, execucao, vendaLiquida, resultadoVenda, roiVenda };
}

// ------------------------------------------------------------
// Empresa 2 — Imóvel de leilão (espelha a planilha de controle)
// ------------------------------------------------------------
export type CustoItem = { grupo: GrupoCusto; categoria: string; valor: number };

export function calcLeilao(
  imovel: {
    valorArrematacao: number | null;
    valorVenda: number | null;
    valorVendaEstimado: number | null;
    dataCompra: Date | null;
    dataVenda: Date | null;
  },
  custos: CustoItem[],
  hoje: Date = new Date(),
) {
  const porGrupo: Record<GrupoCusto, number> = { AQUISICAO: 0, REFORMA: 0, MANUTENCAO: 0, VENDA: 0 };
  const porCategoria: Record<GrupoCusto, Record<string, number>> = {
    AQUISICAO: {},
    REFORMA: {},
    MANUTENCAO: {},
    VENDA: {},
  };
  for (const c of custos) {
    porGrupo[c.grupo] += c.valor;
    porCategoria[c.grupo][c.categoria] = (porCategoria[c.grupo][c.categoria] ?? 0) + c.valor;
  }
  const arrematacao = imovel.valorArrematacao ?? 0;
  const totalAquisicao = arrematacao + porGrupo.AQUISICAO;
  const totalReforma = porGrupo.REFORMA;
  const totalManutencao = porGrupo.MANUTENCAO;
  const totalCustosVenda = porGrupo.VENDA;
  const custoTotal = totalAquisicao + totalReforma + totalManutencao;

  const vendido = imovel.valorVenda !== null;
  const venda = imovel.valorVenda ?? imovel.valorVendaEstimado ?? null;
  const vendaLiquida = venda !== null ? venda - totalCustosVenda : null;
  const resultado = vendaLiquida !== null ? vendaLiquida - custoTotal : null;
  const roi = resultado !== null && custoTotal > 0 ? resultado / custoTotal : null;
  const fim = imovel.dataVenda ?? (imovel.dataCompra ? hoje : null);
  const prazoMeses = mesesEntre(imovel.dataCompra, fim);
  const rendimentoMes = roi !== null && prazoMeses > 0 ? roi / prazoMeses : null;

  return {
    arrematacao,
    porGrupo,
    porCategoria,
    totalAquisicao,
    totalReforma,
    totalManutencao,
    totalCustosVenda,
    custoTotal,
    vendido,
    venda,
    vendaLiquida,
    resultado,
    roi,
    prazoMeses,
    rendimentoMes,
  };
}

// ------------------------------------------------------------
// Empresa 2 — Simulador de arremate (espelha a planilha de simulação)
// ------------------------------------------------------------
export type SimInput = {
  valorArremate: number;
  valorVendaEstimado: number;
  pctLeiloeiro: number;
  pctItbi: number;
  pctRegistro: number;
  pctIr: number;
  baseIr: "LUCRO" | "VENDA";
  pctComissaoVenda: number;
  advogado: number;
  pctReforma: number;
  debitosAto: number;
  custoMensal: number;
  prazoMeses: number;
};

export const SIM_PADRAO: SimInput = {
  valorArremate: 0,
  valorVendaEstimado: 0,
  pctLeiloeiro: 5,
  pctItbi: 3,
  pctRegistro: 1.5,
  pctIr: 15,
  baseIr: "LUCRO",
  pctComissaoVenda: 6,
  advogado: 3500,
  pctReforma: 7,
  debitosAto: 0,
  custoMensal: 0,
  prazoMeses: 12,
};

export function calcSimulacao(i: SimInput) {
  const comissaoLeiloeiro = (i.valorArremate * i.pctLeiloeiro) / 100;
  const itbi = (i.valorArremate * i.pctItbi) / 100;
  const registro = (i.valorArremate * i.pctRegistro) / 100;
  const reformas = (i.valorArremate * i.pctReforma) / 100;
  const comissaoVenda = (i.valorVendaEstimado * i.pctComissaoVenda) / 100;
  const custosPeriodo = i.debitosAto + i.custoMensal * i.prazoMeses;
  const custoAquisicao = i.valorArremate + comissaoLeiloeiro + itbi + registro + i.advogado;
  const investimento = custoAquisicao + reformas + custosPeriodo;
  const lucroAntesIr = i.valorVendaEstimado - comissaoVenda - investimento;
  const baseIrValor = i.baseIr === "VENDA" ? i.valorVendaEstimado : Math.max(0, lucroAntesIr);
  const impostoRenda = (baseIrValor * i.pctIr) / 100;
  const resultado = lucroAntesIr - impostoRenda;
  const roi = investimento > 0 ? resultado / investimento : null;
  const rendimentoMes = roi !== null && i.prazoMeses > 0 ? roi / i.prazoMeses : null;
  const rendimentoMesComposto =
    roi !== null && i.prazoMeses > 0 && roi > -1 ? Math.pow(1 + roi, 1 / i.prazoMeses) - 1 : null;

  return {
    comissaoLeiloeiro,
    itbi,
    registro,
    impostoRenda,
    comissaoVenda,
    advogado: i.advogado,
    reformas,
    custosPeriodo,
    custoAquisicao,
    investimento,
    lucroAntesIr,
    resultado,
    roi,
    rendimentoMes,
    rendimentoMesComposto,
  };
}

/** Maior valor de arremate que ainda entrega o ROI alvo (busca binária) */
export function lanceMaximo(i: SimInput, roiAlvo: number): number | null {
  if (i.valorVendaEstimado <= 0) return null;
  let lo = 0;
  let hi = i.valorVendaEstimado;
  const roiDe = (v: number) => calcSimulacao({ ...i, valorArremate: v }).roi ?? -Infinity;
  if (roiDe(lo) < roiAlvo) return null;
  for (let k = 0; k < 60; k++) {
    const mid = (lo + hi) / 2;
    if (roiDe(mid) >= roiAlvo) lo = mid;
    else hi = mid;
  }
  return Math.floor(lo * 100) / 100;
}
