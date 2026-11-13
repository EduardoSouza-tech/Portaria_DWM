import { prisma } from "@/lib/db";
import { inputDate, inputMoney } from "@/lib/format";
import { atualizarObra } from "../../actions";
import { ObraForm } from "../../ObraForm";
import { getObra } from "../data";

export default async function EditarObra({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = await getObra(id);
  const construtoras = await prisma.construtora.findMany({ select: { id: true, razaoSocial: true }, orderBy: { razaoSocial: "asc" } });
  return (
    <ObraForm
      action={atualizarObra.bind(null, o.id)}
      construtoras={construtoras}
      cancelHref={`/obras/${o.id}`}
      d={{
        numero: o.numero,
        nome: o.nome,
        endereco: o.endereco ?? "",
        bairro: o.bairro ?? "",
        cidade: o.cidade ?? "",
        uf: o.uf ?? "",
        cep: o.cep ?? "",
        matricula: o.matricula ?? "",
        cartorio: o.cartorio ?? "",
        inscricaoIptu: o.inscricaoIptu ?? "",
        construtoraId: o.construtoraId,
        custoPrevisto: inputMoney(o.custoPrevisto),
        dataInicio: inputDate(o.dataInicio),
        dataTerminoPrevista: inputDate(o.dataTerminoPrevista),
        dataTermino: inputDate(o.dataTermino),
        status: o.status,
        observacoes: o.observacoes ?? "",
      }}
    />
  );
}
