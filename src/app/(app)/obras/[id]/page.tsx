import Link from "next/link";
import { BarrasH } from "@/components/Charts";
import { DeleteButton } from "@/components/forms";
import { Card, Empty, KV, Money, Stat } from "@/components/ui";
import { CORES, DESTINACAO } from "@/lib/constants";
import { brl, dataBR, docMask, n, pct } from "@/lib/format";
import { excluirObra } from "../actions";
import { getObra, resumoObra } from "./data";

export default async function ObraResumo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = await getObra(id);
  const r = resumoObra(o);

  let receitas = 0;
  let despesas = 0;
  for (const l of o.locacoes.flatMap((x) => x.lancamentos)) {
    if (l.status === "CANCELADO") continue;
    if (["ALUGUEL", "OUTRA_RECEITA"].includes(l.tipo)) receitas += n(l.valor);
    else despesas += n(l.valor);
  }
  const aluguelMensal = o.locacoes.filter((l) => l.ativo).reduce((a, l) => a + n(l.valorAluguel), 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat tone="e1" label="Custo previsto" value={brl(r.custoPrevisto)} />
        <Stat tone="e1" label="Valor aportado (custo da unidade)" value={brl(r.totalAportes)} hint={`${o.aportes.length} lançamento(s)`} />
        <Stat
          tone={r.saldoPrevisto >= 0 ? "e1" : "neg"}
          label={r.saldoPrevisto >= 0 ? "Saldo a aportar (previsto)" : "Estouro sobre o previsto"}
          value={brl(Math.abs(r.saldoPrevisto))}
        />
        <Stat tone="e1" label="Execução financeira" value={pct(r.execucao, 1)} hint="Aportado ÷ previsto" />
      </div>

      {o.destinacao === "VENDA" && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Valor de venda" value={<Money v={o.vendaValor === null ? null : n(o.vendaValor)} dash />} hint={dataBR(o.vendaData)} />
          <Stat label="Custos de venda" value={brl(r.totalCustosVenda)} />
          <Stat
            tone={(r.resultadoVenda ?? 0) >= 0 ? "pos" : "neg"}
            label="Resultado do empreendimento"
            value={<Money v={r.resultadoVenda} colored dash />}
          />
          <Stat label="ROI" value={pct(r.roiVenda)} hint="Resultado ÷ valor aportado" />
        </div>
      )}
      {o.destinacao === "ALUGUEL" && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Aluguel contratado" value={`${brl(aluguelMensal)}/mês`} hint={`${o.locacoes.filter((l) => l.ativo).length} contrato(s) ativo(s)`} />
          <Stat label="Receitas lançadas" value={brl(receitas)} />
          <Stat label="Despesas lançadas" value={brl(despesas)} />
          <Stat
            tone={receitas - despesas >= 0 ? "pos" : "neg"}
            label="Resultado acumulado"
            value={brl(receitas - despesas)}
            hint={`Yield bruto: ${pct(r.totalAportes > 0 ? (aluguelMensal * 12) / r.totalAportes : null)} a.a.`}
          />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <Card
          title="Valor aportado por etapa"
          className="xl:col-span-2"
          actions={
            <Link href={`/obras/${o.id}/aportes`} className="btn btn-e1 btn-sm">
              + Lançar aporte
            </Link>
          }
        >
          {r.etapas.length === 0 ? (
            <Empty>Nenhum aporte lançado.</Empty>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <table className="table">
                <thead>
                  <tr>
                    <th>Etapa</th>
                    <th className="num">Qtd</th>
                    <th className="num">Valor</th>
                    <th className="num">%</th>
                  </tr>
                </thead>
                <tbody>
                  {r.etapas.map((e) => (
                    <tr key={e.etapa}>
                      <td>
                        <Link href={`/obras/${o.id}/aportes?etapa=${encodeURIComponent(e.etapa)}`} className="link">
                          {e.etapa}
                        </Link>
                      </td>
                      <td className="num">{e.qtd}</td>
                      <td className="num">{brl(e.total)}</td>
                      <td className="num text-slate-500">{pct(r.totalAportes ? e.total / r.totalAportes : null, 1)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total</td>
                    <td className="num">{o.aportes.length}</td>
                    <td className="num">{brl(r.totalAportes)}</td>
                    <td className="num">100%</td>
                  </tr>
                </tfoot>
              </table>
              <BarrasH data={r.etapas.slice(0, 10).map((e) => ({ nome: e.etapa, valor: e.total }))} cor={CORES.e1} />
            </div>
          )}
        </Card>

        <Card title="Dados da unidade">
          <KV k="Nº da obra" v={o.numero} />
          <KV k="Matrícula" v={o.matricula} />
          <KV k="Cartório" v={o.cartorio} />
          <KV k="Inscrição IPTU" v={o.inscricaoIptu} />
          <KV k="CEP" v={o.cep} />
          <KV
            k="Conduzida por"
            v={o.construtora ? `${o.construtora.razaoSocial}${o.construtora.cnpj ? ` (${docMask(o.construtora.cnpj)})` : ""}` : null}
          />
          <KV k="Início" v={dataBR(o.dataInicio)} />
          <KV k="Término previsto" v={dataBR(o.dataTerminoPrevista)} />
          <KV k="Término real" v={dataBR(o.dataTermino)} />
          <KV k="Destinação" v={o.destinacao ? DESTINACAO[o.destinacao] : "A definir"} />
          {o.observacoes && <p className="mt-3 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{o.observacoes}</p>}
        </Card>
      </div>

      <Card
        title="Últimos aportes"
        bodyClass="table-wrap"
        actions={
          <Link href={`/obras/${o.id}/aportes`} className="btn btn-ghost btn-sm">
            Ver todos →
          </Link>
        }
      >
        {o.aportes.length === 0 ? (
          <div className="p-5">
            <Empty>Sem aportes.</Empty>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Etapa</th>
                <th>Descrição</th>
                <th>Emissor</th>
                <th>NF</th>
                <th className="num">Valor</th>
              </tr>
            </thead>
            <tbody>
              {o.aportes.slice(0, 8).map((a) => (
                <tr key={a.id}>
                  <td>{dataBR(a.data)}</td>
                  <td>{a.etapa ?? "—"}</td>
                  <td className="text-slate-600">{a.descricao ?? "—"}</td>
                  <td>
                    {a.emissorRazaoSocial ?? "—"}
                    {a.emissorCnpj && <div className="text-xs text-slate-500">{docMask(a.emissorCnpj)}</div>}
                  </td>
                  <td>{a.nfNumero ?? "—"}</td>
                  <td className="num">{brl(a.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <div className="no-print flex justify-end">
        <DeleteButton
          action={excluirObra.bind(null, o.id)}
          label="Excluir obra"
          confirmText={`Excluir a obra ${o.numero} e TODOS os aportes, custos e contratos vinculados?`}
        />
      </div>
    </div>
  );
}
