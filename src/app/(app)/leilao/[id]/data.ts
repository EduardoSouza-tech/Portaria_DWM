import { notFound } from "next/navigation";
import { cache } from "react";
import { calcLeilao } from "@/lib/calc";
import type { GrupoCusto } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { hojeUTC, n, nn } from "@/lib/format";

export const getImovel = cache(async (idParam: string) => {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const im = await prisma.imovelLeilao.findUnique({
    where: { id },
    include: { custos: { orderBy: [{ data: "asc" }, { id: "asc" }] }, simulacoes: { select: { id: true, nome: true } } },
  });
  if (!im) notFound();
  return im;
});

export type ImovelCompleto = Awaited<ReturnType<typeof getImovel>>;

export function resumoImovel(im: ImovelCompleto) {
  return calcLeilao(
    {
      valorArrematacao: nn(im.valorArrematacao),
      valorVenda: nn(im.valorVenda),
      valorVendaEstimado: nn(im.valorVendaEstimado),
      dataCompra: im.dataCompra,
      dataVenda: im.dataVenda,
    },
    im.custos.map((c) => ({ grupo: c.grupo as GrupoCusto, categoria: c.categoria, valor: n(c.valor) })),
    hojeUTC(),
  );
}
