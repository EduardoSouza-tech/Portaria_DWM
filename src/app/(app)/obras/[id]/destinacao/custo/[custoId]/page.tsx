import { notFound } from "next/navigation";
import { Card } from "@/components/ui";
import { inputDate, inputMoney } from "@/lib/format";
import { atualizarCustoVenda } from "../../../../actions";
import { CustoVendaForm } from "../../../../DestinacaoForms";
import { getObra } from "../../../data";

export default async function EditarCustoVenda({ params }: { params: Promise<{ id: string; custoId: string }> }) {
  const { id, custoId } = await params;
  const o = await getObra(id);
  const c = o.custosVenda.find((x) => x.id === Number(custoId));
  if (!c) notFound();
  return (
    <Card title="Editar custo de venda">
      <CustoVendaForm
        action={atualizarCustoVenda.bind(null, o.id, c.id)}
        cancelHref={`/obras/${o.id}/destinacao`}
        d={{ tipo: c.tipo, descricao: c.descricao ?? "", data: inputDate(c.data), valor: inputMoney(c.valor) }}
      />
    </Card>
  );
}
