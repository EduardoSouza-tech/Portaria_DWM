import { PageHeader } from "@/components/ui";
import { inputDate, inputMoney } from "@/lib/format";
import { atualizarImovel } from "../../actions";
import { ImovelForm } from "../../ImovelForm";
import { getImovel } from "../data";

export default async function EditarImovel({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const im = await getImovel(id);
  return (
    <>
      <PageHeader empresa={2} title={`Editar imóvel #${im.codigo}`} back={{ href: `/leilao/${im.id}`, label: im.descricao }} />
      <ImovelForm
        action={atualizarImovel.bind(null, im.id)}
        cancelHref={`/leilao/${im.id}`}
        d={{
          codigo: im.codigo,
          descricao: im.descricao,
          tipoImovel: im.tipoImovel ?? "",
          endereco: im.endereco ?? "",
          bairro: im.bairro ?? "",
          cidade: im.cidade ?? "",
          uf: im.uf ?? "",
          cep: im.cep ?? "",
          matricula: im.matricula ?? "",
          inscricaoIptu: im.inscricaoIptu ?? "",
          modalidade: im.modalidade ?? "",
          leiloeiro: im.leiloeiro ?? "",
          processo: im.processo ?? "",
          dataLeilao: inputDate(im.dataLeilao),
          ocupado: im.ocupado,
          valorAvaliacao: inputMoney(im.valorAvaliacao),
          valorLance: inputMoney(im.valorLance),
          valorArrematacao: inputMoney(im.valorArrematacao),
          dataCompra: inputDate(im.dataCompra),
          valorVendaEstimado: inputMoney(im.valorVendaEstimado),
          valorVenda: inputMoney(im.valorVenda),
          dataVenda: inputDate(im.dataVenda),
          comprador: im.comprador ?? "",
          status: im.status,
          observacoes: im.observacoes ?? "",
        }}
      />
    </>
  );
}
