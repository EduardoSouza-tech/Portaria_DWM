import { PrintButton } from "@/components/forms";
import { Card, KV, Money } from "@/components/ui";
import { somaLanc } from "@/lib/calc";
import { DESTINACAO, STATUS_OBRA } from "@/lib/constants";
import { brl, dataBR, docMask, n, pct } from "@/lib/format";
import { getObra, resumoObra } from "../data";

export default async function RelatorioObra({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = await getObra(id);
  const r = resumoObra(o);

  const grupos = new Map<string, typeof o.aportes>();
  for (const a of [...o.aportes].sort((x, y) => x.data.getTime() - y.data.getTime())) {
    const k = a.etapa || "Sem etapa";
    grupos.set(k, [...(grupos.get(k) ?? []), a]);
  }

  return (
    <div className="space-y-6">
      <div className="no-print flex justify-end gap-2">
        <a href={`/api/export?tipo=aportes&obra=${o.id}`} className="btn btn-secondary">
          Exportar aportes (CSV)
        </a>
        <PrintButton />
      </div>

      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-e1">Relatório completo da obra</div>
            <h2 className="text-2xl font-semibold">
              Obra nº {o.numero} — {o.nome}
            </h2>
            <div className="text-sm text-slate-500">
              {[o.endereco, o.bairro, o.cidade && `${o.cidade}/${o.uf ?? ""}`, o.cep].filter(Boolean).join(" · ")}
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">Emitido em {dataBR(new Date())}</div>
        </div>
        <div className="mt-4 grid gap-x-10 sm:grid-cols-2">
          <div>
            <KV k="Status" v={STATUS_OBRA[o.status].label} />
            <KV k="Matrícula / cartório" v={[o.matricula, o.cartorio].filter(Boolean).join(" — ") || null} />
            <KV k="Inscrição IPTU" v={o.inscricaoIptu} />
            <KV k="Conduzida por" v={o.construtora ? `${o.construtora.razaoSocial}${o.construtora.cnpj ? ` — ${docMask(o.construtora.cnpj)}` : ""}` : null} />
          </div>
          <div>
            <KV k="Início" v={dataBR(o.dataInicio)} />
            <KV k="Término previsto" v={dataBR(o.dataTerminoPrevista)} />
            <KV k="Término real" v={dataBR(o.dataTermino)} />
            <KV k="Destinação" v={o.destinacao ? DESTINACAO[o.destinacao] : "A definir"} />
          </div>
        </div>
      </div>

      <Card title="Resumo financeiro">
        <div className="grid gap-x-10 sm:grid-cols-2">
          <div>
            <KV k="Custo previsto" v={brl(r.custoPrevisto)} />
            <KV k="Valor aportado (valor final da unidade)" v={brl(r.totalAportes)} />
            <KV k="Diferença (previsto − aportado)" v={<Money v={r.saldoPrevisto} colored />} />
            <KV k="Execução financeira" v={pct(r.execucao, 1)} />
          </div>
          <div>
            {o.destinacao === "VENDA" && (
              <>
                <KV k="Valor da venda" v={<Money v={o.vendaValor === null ? null : n(o.vendaValor)} dash />} />
                <KV k="Custos de venda" v={brl(r.totalCustosVenda)} />
                <KV k="Resultado do empreendimento" v={<Money v={r.resultadoVenda} colored dash />} />
                <KV k="ROI" v={pct(r.roiVenda)} />
              </>
            )}
            {o.destinacao === "ALUGUEL" &&
              o.locacoes.map((l) => {
                const { receitas: rec, despesas: desp } = somaLanc(l.lancamentos);
                return (
                  <div key={l.id} className="mb-2">
                    <KV k={`Locação — ${l.inquilino.nome}`} v={`${brl(l.valorAluguel)}/mês`} />
                    <KV k="Receitas / despesas" v={`${brl(rec)} / ${brl(desp)}`} />
                    <KV k="Resultado acumulado" v={<Money v={rec - desp} colored />} />
                  </div>
                );
              })}
          </div>
        </div>
      </Card>

      <Card title="Aportes por etapa" bodyClass="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Etapa</th>
              <th className="num">Lançamentos</th>
              <th className="num">Valor</th>
              <th className="num">% do total</th>
            </tr>
          </thead>
          <tbody>
            {r.etapas.map((e) => (
              <tr key={e.etapa}>
                <td>{e.etapa}</td>
                <td className="num">{e.qtd}</td>
                <td className="num">{brl(e.total)}</td>
                <td className="num">{pct(r.totalAportes ? e.total / r.totalAportes : null, 1)}</td>
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
      </Card>

      <Card title="Detalhamento dos aportes" bodyClass="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Contrapartida</th>
              <th>Emissor</th>
              <th>CNPJ</th>
              <th>NF</th>
              <th className="num">Valor</th>
            </tr>
          </thead>
          {[...grupos.entries()].map(([etapa, itens]) => (
            <tbody key={etapa}>
              <tr>
                <td colSpan={7} className="bg-slate-100 font-semibold text-slate-700">
                  {etapa}
                </td>
              </tr>
              {itens.map((a) => (
                <tr key={a.id}>
                  <td>{dataBR(a.data)}</td>
                  <td>{a.descricao ?? "—"}</td>
                  <td>{a.contrapartida ?? "—"}</td>
                  <td>{a.emissorRazaoSocial ?? "—"}</td>
                  <td className="whitespace-nowrap">{a.emissorCnpj ? docMask(a.emissorCnpj) : "—"}</td>
                  <td>{a.nfNumero ?? "—"}</td>
                  <td className="num">{brl(a.valor)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={6} className="text-right text-xs font-semibold text-slate-500">
                  Subtotal {etapa}
                </td>
                <td className="num font-semibold">{brl(itens.reduce((s, a) => s + n(a.valor), 0))}</td>
              </tr>
            </tbody>
          ))}
          <tfoot>
            <tr>
              <td colSpan={6}>Total aportado</td>
              <td className="num">{brl(r.totalAportes)}</td>
            </tr>
          </tfoot>
        </table>
      </Card>
    </div>
  );
}
