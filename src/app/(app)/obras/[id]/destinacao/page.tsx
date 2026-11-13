import Link from "next/link";
import { ActionButton, DeleteButton } from "@/components/forms";
import { Badge, Card, Empty, KV, Money } from "@/components/ui";
import { TIPO_LANC_LOCACAO } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { brl, dataBR, docMask, inputDate, inputMoney, n, pct } from "@/lib/format";
import { criarCustoVenda, criarLocacao, definirDestinacao, excluirCustoVenda, salvarVenda } from "../../actions";
import { CustoVendaForm, LocacaoForm, VendaForm } from "../../DestinacaoForms";
import { getObra, resumoObra } from "../data";

export default async function DestinacaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = await getObra(id);
  const r = resumoObra(o);

  const escolha = (
    <div className="grid gap-4 md:grid-cols-2">
      {(["VENDA", "ALUGUEL"] as const).map((d) => {
        const on = o.destinacao === d;
        return (
          <div key={d} className={`card p-5 ${on ? "ring-2 ring-e1" : ""}`}>
            <div className="mb-1 text-base font-semibold">{d === "VENDA" ? "Venda da unidade" : "Aluguel da unidade"}</div>
            <p className="mb-4 text-sm text-slate-500">
              {d === "VENDA"
                ? "Informe valor de venda e custos (impostos, comissão, etc.) para apurar o resultado do empreendimento."
                : "Cadastre inquilino, imobiliária e custos (comissão, IPTU, condomínio) para apurar o resultado por período."}
            </p>
            {on ? (
              <Badge tone="blue">Destinação atual</Badge>
            ) : (
              <ActionButton
                action={definirDestinacao.bind(null, o.id, d)}
                className="btn btn-secondary btn-sm"
                confirmText={o.destinacao ? "Alterar a destinação da obra?" : undefined}
              >
                Definir como {d === "VENDA" ? "venda" : "aluguel"}
              </ActionButton>
            )}
          </div>
        );
      })}
    </div>
  );

  if (o.destinacao === "VENDA") {
    return (
      <div className="space-y-6">
        {escolha}
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <Card title="Dados da venda">
              <VendaForm
                action={salvarVenda.bind(null, o.id)}
                d={{
                  vendaValor: inputMoney(o.vendaValor),
                  vendaData: inputDate(o.vendaData),
                  vendaComprador: o.vendaComprador ?? "",
                  vendaCompradorDoc: o.vendaCompradorDoc ? docMask(o.vendaCompradorDoc) : "",
                }}
              />
            </Card>
            <Card title="Custos de venda (impostos, comissão, etc.)">
              <CustoVendaForm action={criarCustoVenda.bind(null, o.id)} />
              {o.custosVenda.length > 0 && (
                <div className="table-wrap mt-5">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Tipo</th>
                        <th>Descrição</th>
                        <th>Data</th>
                        <th className="num">Valor</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {o.custosVenda.map((c) => (
                        <tr key={c.id}>
                          <td>{c.tipo}</td>
                          <td className="text-slate-600">{c.descricao ?? "—"}</td>
                          <td>{dataBR(c.data)}</td>
                          <td className="num">{brl(c.valor)}</td>
                          <td className="text-right">
                            <DeleteButton action={excluirCustoVenda.bind(null, o.id, c.id)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3}>Total custos de venda</td>
                        <td className="num">{brl(r.totalCustosVenda)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </Card>
          </div>
          <Card title="Resultado do empreendimento">
            <KV k="Valor da venda" v={<Money v={o.vendaValor === null ? null : n(o.vendaValor)} dash />} />
            <KV k="(−) Custos de venda" v={brl(r.totalCustosVenda)} />
            <KV k="(=) Venda líquida" v={<Money v={r.vendaLiquida} dash />} />
            <KV k="(−) Valor aportado (custo da unidade)" v={brl(r.totalAportes)} />
            <div className="mt-3 rounded-lg bg-slate-50 p-4">
              <div className="text-xs text-slate-500">Resultado</div>
              <div className="text-2xl font-semibold">
                <Money v={r.resultadoVenda} colored dash />
              </div>
              <div className="mt-1 text-sm text-slate-600">ROI: {pct(r.roiVenda)}</div>
              {o.vendaData && o.dataInicio && (
                <div className="text-xs text-slate-500">
                  Período: {dataBR(o.dataInicio)} a {dataBR(o.vendaData)}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (o.destinacao === "ALUGUEL") {
    const [inquilinos, imobiliarias] = await Promise.all([
      prisma.inquilino.findMany({ select: { id: true, nome: true }, orderBy: { nome: "asc" } }),
      prisma.imobiliaria.findMany({ select: { id: true, razaoSocial: true, comissaoPct: true }, orderBy: { razaoSocial: "asc" } }),
    ]);
    return (
      <div className="space-y-6">
        {escolha}
        <Card title="Contratos de locação" bodyClass="table-wrap">
          {o.locacoes.length === 0 ? (
            <div className="p-5">
              <Empty>Nenhum contrato cadastrado. Crie o primeiro abaixo.</Empty>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Inquilino</th>
                  <th>Imobiliária</th>
                  <th>Vigência</th>
                  <th className="num">Aluguel</th>
                  <th className="num">Receitas</th>
                  <th className="num">Despesas</th>
                  <th className="num">Resultado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {o.locacoes.map((l) => {
                  let rec = 0;
                  let desp = 0;
                  for (const x of l.lancamentos) {
                    if (x.status === "CANCELADO") continue;
                    if (TIPO_LANC_LOCACAO[x.tipo].receita) rec += n(x.valor);
                    else desp += n(x.valor);
                  }
                  return (
                    <tr key={l.id}>
                      <td>
                        <Link href={`/obras/${o.id}/destinacao/locacao/${l.id}`} className="link">
                          {l.inquilino.nome}
                        </Link>
                        {!l.ativo && (
                          <span className="ml-2">
                            <Badge>Encerrado</Badge>
                          </span>
                        )}
                      </td>
                      <td>{l.imobiliaria?.razaoSocial ?? "—"}</td>
                      <td className="whitespace-nowrap">
                        {dataBR(l.dataInicio)} – {l.dataFim ? dataBR(l.dataFim) : "indeterminado"}
                      </td>
                      <td className="num">{brl(l.valorAluguel)}</td>
                      <td className="num">{brl(rec)}</td>
                      <td className="num">{brl(desp)}</td>
                      <td className="num">
                        <Money v={rec - desp} colored />
                      </td>
                      <td className="text-right">
                        <Link href={`/obras/${o.id}/destinacao/locacao/${l.id}`} className="btn btn-secondary btn-sm">
                          Abrir
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>
        <Card title="Novo contrato de locação">
          <LocacaoForm
            action={criarLocacao.bind(null, o.id)}
            inquilinos={inquilinos}
            imobiliarias={imobiliarias.map((i) => ({ ...i, comissaoPct: i.comissaoPct === null ? null : n(i.comissaoPct) }))}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Ao finalizar a obra, escolha a destinação da unidade. Valor aportado até agora: <strong>{brl(r.totalAportes)}</strong>.
      </p>
      {escolha}
    </div>
  );
}
