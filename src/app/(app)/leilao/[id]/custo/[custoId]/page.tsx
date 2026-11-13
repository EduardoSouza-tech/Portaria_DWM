import { notFound } from "next/navigation";
import { Card, PageHeader } from "@/components/ui";
import type { GrupoCusto } from "@/lib/constants";
import { inputDate, inputMoney } from "@/lib/format";
import { emissoresConhecidos } from "@/lib/queries";
import { atualizarCusto } from "../../../actions";
import { CustoForm } from "../../../CustoForm";
import { getImovel } from "../../data";

export const metadata = { title: "Editar custo" };

export default async function EditarCusto({ params }: { params: Promise<{ id: string; custoId: string }> }) {
  const { id, custoId } = await params;
  const [im, emissores] = await Promise.all([getImovel(id), emissoresConhecidos()]);
  const c = im.custos.find((x) => x.id === Number(custoId));
  if (!c) notFound();
  return (
    <>
      <PageHeader empresa={2} title={`Editar custo — imóvel #${im.codigo}`} back={{ href: `/leilao/${im.id}`, label: im.descricao }} />
      <Card title="Lançamento de custo">
        <CustoForm
          action={atualizarCusto.bind(null, im.id, c.id)}
          emissores={emissores}
          cancelHref={`/leilao/${im.id}`}
          d={{
            grupo: c.grupo as GrupoCusto,
            categoria: c.categoria,
            data: inputDate(c.data),
            valor: inputMoney(c.valor),
            descricao: c.descricao ?? "",
            nfNumero: c.nfNumero ?? "",
            fornecedorCnpj: c.fornecedorCnpj ?? "",
            fornecedorRazaoSocial: c.fornecedorRazaoSocial ?? "",
          }}
        />
      </Card>
    </>
  );
}
