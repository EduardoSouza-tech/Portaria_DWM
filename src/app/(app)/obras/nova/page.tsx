import { PageHeader } from "@/components/ui";
import { prisma } from "@/lib/db";
import { criarObra } from "../actions";
import { ObraForm } from "../ObraForm";

export const metadata = { title: "Nova obra" };

export default async function NovaObraPage() {
  const [construtoras, ultima] = await Promise.all([
    prisma.construtora.findMany({ select: { id: true, razaoSocial: true }, orderBy: { razaoSocial: "asc" } }),
    prisma.obra.findFirst({ orderBy: { numero: "desc" }, select: { numero: true } }),
  ]);
  return (
    <>
      <PageHeader empresa={1} title="Nova obra" back={{ href: "/obras", label: "Obras" }} />
      <ObraForm action={criarObra} construtoras={construtoras} d={{ numero: (ultima?.numero ?? 0) + 1 }} cancelHref="/obras" />
    </>
  );
}
