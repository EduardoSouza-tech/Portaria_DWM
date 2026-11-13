import { notFound } from "next/navigation";
import { Card } from "@/components/ui";
import { inputDate, inputMoney } from "@/lib/format";
import { emissoresConhecidos } from "@/lib/queries";
import { atualizarAporte } from "../../../actions";
import { AporteForm } from "../../../AporteForm";
import { getObra } from "../../data";

export default async function EditarAporte({ params }: { params: Promise<{ id: string; aporteId: string }> }) {
  const { id, aporteId } = await params;
  const [o, emissores] = await Promise.all([getObra(id), emissoresConhecidos()]);
  const a = o.aportes.find((x) => x.id === Number(aporteId));
  if (!a) notFound();
  return (
    <Card title="Editar aporte">
      <AporteForm
        edicao
        action={atualizarAporte.bind(null, o.id, a.id)}
        emissores={emissores}
        cancelHref={`/obras/${o.id}/aportes`}
        d={{
          data: inputDate(a.data),
          valor: inputMoney(a.valor),
          etapa: a.etapa ?? "",
          descricao: a.descricao ?? "",
          contrapartida: a.contrapartida ?? "",
          formaPagamento: a.formaPagamento ?? "",
          emissorCnpj: a.emissorCnpj ?? "",
          emissorRazaoSocial: a.emissorRazaoSocial ?? "",
          nfNumero: a.nfNumero ?? "",
        }}
      />
    </Card>
  );
}
