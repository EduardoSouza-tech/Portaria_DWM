import { PageHeader } from "@/components/ui";
import { prisma } from "@/lib/db";
import { criarImovel } from "../actions";
import { ImovelForm } from "../ImovelForm";

export const metadata = { title: "Novo imóvel de leilão" };

export default async function NovoImovelPage() {
  const ultimo = await prisma.imovelLeilao.findFirst({ orderBy: { codigo: "desc" }, select: { codigo: true } });
  return (
    <>
      <PageHeader empresa={2} title="Novo imóvel de leilão" back={{ href: "/leilao", label: "Imóveis de leilão" }} />
      <ImovelForm action={criarImovel} d={{ codigo: (ultimo?.codigo ?? 0) + 1 }} cancelHref="/leilao" />
    </>
  );
}
