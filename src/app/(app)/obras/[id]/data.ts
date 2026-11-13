import { notFound } from "next/navigation";
import { cache } from "react";
import { calcObra } from "@/lib/calc";
import { prisma } from "@/lib/db";
import { n, nn } from "@/lib/format";

export const getObra = cache(async (idParam: string) => {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const obra = await prisma.obra.findUnique({
    where: { id },
    include: {
      construtora: true,
      aportes: { orderBy: [{ data: "desc" }, { id: "desc" }] },
      custosVenda: { orderBy: { id: "asc" } },
      locacoes: {
        include: { inquilino: true, imobiliaria: true, lancamentos: true },
        orderBy: { dataInicio: "desc" },
      },
    },
  });
  if (!obra) notFound();
  return obra;
});

export type ObraCompleta = Awaited<ReturnType<typeof getObra>>;

export function resumoObra(o: ObraCompleta) {
  const totalAportes = o.aportes.reduce((a, x) => a + n(x.valor), 0);
  const totalCustosVenda = o.custosVenda.reduce((a, x) => a + n(x.valor), 0);
  const calc = calcObra({ custoPrevisto: n(o.custoPrevisto), totalAportes, vendaValor: nn(o.vendaValor), totalCustosVenda });

  const porEtapa = new Map<string, { total: number; qtd: number }>();
  for (const a of o.aportes) {
    const k = a.etapa || "Sem etapa";
    const e = porEtapa.get(k) ?? { total: 0, qtd: 0 };
    e.total += n(a.valor);
    e.qtd++;
    porEtapa.set(k, e);
  }
  const etapas = [...porEtapa.entries()].map(([etapa, v]) => ({ etapa, ...v })).sort((a, b) => b.total - a.total);

  return { totalAportes, totalCustosVenda, custoPrevisto: n(o.custoPrevisto), etapas, ...calc };
}
