import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionButton, DeleteButton, PrintButton } from "@/components/forms";
import { Badge, Card, Empty, KV, Money, Stat } from "@/components/ui";
import { diasAtraso, proximoReajuste, somaLanc, valorLanc } from "@/lib/calc";
import { STATUS_LANC, TIPO_LANC_LOCACAO, type TipoLancLocacao } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { parseMonth } from "@/lib/form";
import { brl, dataBR, docMask, hojeISO, hojeUTC, inputDate, inputMoney, mesBR, mesKey, n, pct } from "@/lib/format";
import {
  atualizarLocacao,
  criarLancamento,
  desfazerReajuste,
  encerrarLocacao,
  estornarBaixa,
  excluirLocacao,
  gerarCompetencia,
  reajustarAluguel,
} from "../../../../actions";
import { GerarCompetenciaForm, LancamentoForm, LocacaoForm } from "../../../../DestinacaoForms";
import { EncerrarForm, ReajusteForm } from "../../../../ManutencaoForms";
import { getObra } from "../../../data";

const COLS: { label: string; tipos: TipoLancLocacao[] }[] = [
  { label: "Comissão", tipos: ["COMISSAO"] },
  { label: "IPTU", tipos: ["IPTU"] },
  { label: "Condomínio", tipos: ["CONDOMINIO"] },
  { label: "Outras desp.", tipos: ["MANUTENCAO", "SEGURO", "OUTRA_DESPESA"] },
];

const pctBR = (v: unknown) => `${n(v).toLocaleString("pt-BR")}%`;

export default async function LocacaoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; locId: string }>;
  searchParams: Promise<{ de?: string; ate?: string }>;
}) {
  const { id, locId } = await params;
  const f = await searchParams;
  const o = await getObra(id);
  const loc = o.locacoes.find((l) => l.id === Number(locId));
  if (!loc) notFound();

  const [inquilinos, imobiliarias] = await Promise.all([
    prisma.inquilino.findMany({ select: { id: true, nome: true }, orderBy: { nome: "asc" } }),
    prisma.imobiliaria.findMany({ select: { id: true, razaoSocial: true, comissaoPct: true }, orderBy: { razaoSocial: "asc" } }),
  ]);

  const hoje = hojeUTC();
  const de = parseMonth(f.de);
  const ate = parseMonth(f.ate);
  const lancs = loc.lancamentos
    .filter((l) => (!de || l.competencia >= de) && (!ate || l.competencia <= ate))
    .sort((a, b) => b.competencia.getTime() - a.competencia.getTime() || a.tipo.localeCompare(b.tipo) || a.id - b.id);

  // Resultado por período (competência) — valores efetivos (com multa/juros/desconto das baixas)
  type Linha = { comp: Date; receitas: number; cols: number[]; despesas: number };
  const porMes = new Map<string, Linha>();
  for (const l of lancs) {
    if (l.status === "CANCELADO") continue;
    const k = mesKey(l.competencia);
    const row = porMes.get(k) ?? { comp: l.competencia, receitas: 0, cols: COLS.map(() => 0), despesas: 0 };
    const v = valorLanc(l);
    if (TIPO_LANC_LOCACAO[l.tipo].receita) row.receitas += v;
    else {
      row.despesas += v;
      const ci = COLS.findIndex((c) => c.tipos.includes(l.tipo));
      if (ci >= 0) row.cols[ci] += v;
    }
    porMes.set(k, row);
  }
  const meses = [...porMes.values()].sort((a, b) => a.comp.getTime() - b.comp.getTime());
  const colsTot = COLS.map((_, i) => meses.reduce((a, m) => a + m.cols[i], 0));
  const tot = somaLanc(lancs);
  const vencidos = lancs.filter((l) => l.status === "PENDENTE" && TIPO_LANC_LOCACAO[l.tipo].receita && diasAtraso(l.vencimento, hoje) > 0);
  const totVencido = vencidos.reduce((a, l) => a + n(l.valor), 0);
  const aportado = o.aportes.reduce((a, x) => a + n(x.valor), 0);
  const mesAtual = hojeISO().slice(0, 7);
  const base = `/obras/${o.id}/destinacao/locacao/${loc.id}`;

  const ultimoReajuste = loc.reajustes[0] ?? null;
  const proxReajuste = proximoReajuste(loc.dataInicio, ultimoReajuste?.aPartirDe ?? null);
  const reajusteDevido = loc.ativo && mesKey(proxReajuste) <= mesAtual;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href={`/obras/${o.id}/destinacao`} className="no-print text-xs font-medium text-slate-500 hover:text-slate-800">
            ← Contratos da obra
          </Link>
          <h2 className="text-lg font-semibold">
            Locação — {loc.inquilino.nome} {!loc.ativo && <Badge>Encerrado</Badge>}
          </h2>
        </div>
        <div className="no-print flex gap-2">
          <PrintButton />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat tone="e1" label="Aluguel" value={`${brl(loc.valorAluguel)}/mês`} hint={`Vence todo dia ${loc.diaVencimento}`} />
        <Stat
          tone="e1"
          label="Receitas no período"
          value={brl(tot.receitas)}
          hint={`Recebido: ${brl(tot.recebido)} · A receber: ${brl(tot.aReceber)}`}
        />
        <Stat tone="e1" label="Despesas no período" value={brl(tot.despesas)} hint={tot.aPagar ? `A pagar: ${brl(tot.aPagar)}` : undefined} />
        <Stat
          tone={tot.resultado >= 0 ? "pos" : "neg"}
          label="Resultado no período"
          value={brl(tot.resultado)}
          hint={`Sobre o aportado: ${pct(aportado > 0 ? tot.resultado / aportado : null)}`}
        />
      </div>

      {(vencidos.length > 0 || reajusteDevido) && (
        <div className="no-print space-y-2">
          {vencidos.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {vencidos.length} recebimento(s) vencido(s), somando {brl(totVencido)}. Abra o lançamento para dar baixa com multa e juros.
            </div>
          )}
          {reajusteDevido && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
              Reajuste anual previsto para {mesBR(proxReajuste)}
              {loc.indiceReajuste ? ` (${loc.indiceReajuste})` : ""}. Aplique em “Reajuste do aluguel” abaixo.
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <Card title="Resultado por período (competência)" className="xl:col-span-2" bodyClass="table-wrap">
          <form className="no-print flex flex-wrap items-end gap-3 border-b border-slate-100 p-4">
            <div>
              <label className="label">De</label>
              <input type="month" name="de" defaultValue={f.de} className="input" />
            </div>
            <div>
              <label className="label">Até</label>
              <input type="month" name="ate" defaultValue={f.ate} className="input" />
            </div>
            <button className="btn btn-secondary">Aplicar</button>
            {(f.de || f.ate) && (
              <Link href={base} className="btn btn-ghost">
                Todo o período
              </Link>
            )}
          </form>
          {meses.length === 0 ? (
            <div className="p-5">
              <Empty>Nenhum lançamento no período. Gere as competências abaixo.</Empty>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Competência</th>
                  <th className="num">Receitas</th>
                  {COLS.map((c) => (
                    <th key={c.label} className="num">
                      {c.label}
                    </th>
                  ))}
                  <th className="num">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {meses.map((m) => (
                  <tr key={mesKey(m.comp)}>
                    <td className="font-medium">{mesBR(m.comp)}</td>
                    <td className="num">{brl(m.receitas)}</td>
                    {m.cols.map((c, i) => (
                      <td key={i} className="num text-slate-600">
                        {c ? brl(c) : "—"}
                      </td>
                    ))}
                    <td className="num">
                      <Money v={m.receitas - m.despesas} colored />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total</td>
                  <td className="num">{brl(tot.receitas)}</td>
                  {colsTot.map((c, i) => (
                    <td key={i} className="num">
                      {brl(c)}
                    </td>
                  ))}
                  <td className="num">
                    <Money v={tot.resultado} colored />
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </Card>

        <Card title="Contrato">
          <KV k="Inquilino" v={loc.inquilino.nome} />
          <KV k="CPF/CNPJ" v={loc.inquilino.cpfCnpj ? docMask(loc.inquilino.cpfCnpj) : null} />
          <KV k="Contato" v={[loc.inquilino.telefone, loc.inquilino.email].filter(Boolean).join(" · ") || null} />
          <KV k="Imobiliária" v={loc.imobiliaria?.razaoSocial} />
          <KV k="Taxa adm./comissão" v={loc.taxaAdministracaoPct !== null ? pctBR(loc.taxaAdministracaoPct) : null} />
          <KV k="Vigência" v={`${dataBR(loc.dataInicio)} – ${loc.dataFim ? dataBR(loc.dataFim) : "indeterminado"}`} />
          <KV k="Reajuste" v={loc.indiceReajuste} />
          <KV k="Próximo reajuste" v={loc.ativo ? mesBR(proxReajuste) : null} />
          <KV
            k="Multa / juros por atraso"
            v={
              loc.multaAtrasoPct !== null || loc.jurosMesPct !== null
                ? `${pctBR(loc.multaAtrasoPct)} + ${pctBR(loc.jurosMesPct)} a.m.`
                : null
            }
          />
          <KV k="Garantia" v={loc.garantia} />
        </Card>
      </div>

      <Card title="Gerar competências">
        <GerarCompetenciaForm action={gerarCompetencia.bind(null, o.id, loc.id)} mesAtual={mesAtual} />
        <p className="mt-2 text-xs text-slate-500">
          Cria o lançamento de aluguel de cada mês{n(loc.taxaAdministracaoPct) > 0 ? " e a comissão da imobiliária" : ""}. Competências já geradas são ignoradas.
        </p>
      </Card>

      <Card title="Incluir lançamento avulso (IPTU, condomínio, manutenção…)">
        <LancamentoForm action={criarLancamento.bind(null, o.id, loc.id)} mesAtual={mesAtual} />
      </Card>

      <Card title={`Lançamentos (${lancs.length})`} bodyClass="table-wrap">
        {lancs.length === 0 ? (
          <div className="p-5">
            <Empty>Nenhum lançamento.</Empty>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Competência</th>
                <th>Tipo</th>
                <th>Descrição</th>
                <th>Vencimento</th>
                <th>Situação</th>
                <th className="num">Valor</th>
                <th className="no-print" />
              </tr>
            </thead>
            <tbody>
              {lancs.map((l) => {
                const rec = TIPO_LANC_LOCACAO[l.tipo].receita;
                const atraso = l.status === "PENDENTE" ? diasAtraso(l.vencimento, hoje) : 0;
                const efetivo = valorLanc(l);
                const href = `${base}/lancamento/${l.id}`;
                return (
                  <tr key={l.id} className={l.status === "CANCELADO" ? "opacity-50" : ""}>
                    <td>{mesBR(l.competencia)}</td>
                    <td>
                      <span className={rec ? "pos" : "neg"}>{rec ? "↑" : "↓"}</span> {TIPO_LANC_LOCACAO[l.tipo].label}
                    </td>
                    <td className="text-slate-600">{l.descricao ?? "—"}</td>
                    <td className={atraso > 0 ? "text-red-600" : ""}>
                      {dataBR(l.vencimento)}
                      {atraso > 0 && <div className="text-xs">vencido há {atraso} dia(s)</div>}
                    </td>
                    <td>
                      <Badge tone={STATUS_LANC[l.status].tone}>{STATUS_LANC[l.status].label}</Badge>
                      {l.dataPagamento && (
                        <div className="text-xs text-slate-400">
                          {dataBR(l.dataPagamento)}
                          {l.formaPagamento ? ` · ${l.formaPagamento}` : ""}
                        </div>
                      )}
                    </td>
                    <td className={`num font-medium ${rec ? "" : "text-slate-600"}`}>
                      {rec ? "" : "−"}
                      {brl(l.valor)}
                      {l.status === "PAGO" && efetivo !== n(l.valor) && (
                        <div className="text-xs font-normal text-slate-500">
                          {rec ? "recebido" : "pago"} {brl(efetivo)}
                        </div>
                      )}
                    </td>
                    <td className="no-print whitespace-nowrap text-right">
                      {l.status === "PENDENTE" && (
                        <Link href={href} className="btn btn-secondary btn-sm">
                          {rec ? "Receber" : "Pagar"}
                        </Link>
                      )}
                      {l.status === "PAGO" && (
                        <ActionButton
                          action={estornarBaixa.bind(null, o.id, l.id)}
                          confirmText="Estornar a baixa? O lançamento volta para pendente."
                          className="btn btn-ghost btn-sm"
                        >
                          Estornar
                        </ActionButton>
                      )}
                      <Link href={href} className="btn btn-ghost btn-sm">
                        Editar
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      <Card title="Reajuste do aluguel" className="no-print">
        {loc.ativo ? (
          <ReajusteForm
            action={reajustarAluguel.bind(null, o.id, loc.id)}
            valorAtual={n(loc.valorAluguel)}
            aPartirDe={mesKey(proxReajuste)}
            indice={loc.indiceReajuste ?? ""}
          />
        ) : (
          <p className="text-sm text-slate-500">Contrato encerrado.</p>
        )}
        {loc.reajustes.length > 0 && (
          <div className="table-wrap mt-5">
            <table className="table">
              <thead>
                <tr>
                  <th>A partir de</th>
                  <th>Índice</th>
                  <th className="num">%</th>
                  <th className="num">De</th>
                  <th className="num">Para</th>
                  <th className="num">Pendentes atualiz.</th>
                  <th>Observação</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {loc.reajustes.map((r, i) => (
                  <tr key={r.id}>
                    <td>{mesBR(r.aPartirDe)}</td>
                    <td>{r.indice ?? "—"}</td>
                    <td className="num">{r.percentual !== null ? `${n(r.percentual).toLocaleString("pt-BR", { maximumFractionDigits: 4 })}%` : "—"}</td>
                    <td className="num">{brl(r.valorAnterior)}</td>
                    <td className="num font-medium">{brl(r.valorNovo)}</td>
                    <td className="num">{r.lancamentosAtualizados}</td>
                    <td className="text-slate-600">{r.observacoes ?? "—"}</td>
                    <td className="text-right">
                      {i === 0 && (
                        <ActionButton
                          action={desfazerReajuste.bind(null, o.id, loc.id, r.id)}
                          confirmText={`Desfazer este reajuste? O aluguel volta para ${brl(r.valorAnterior)} e os pendentes com o valor novo também.`}
                          className="btn btn-ghost btn-sm"
                        >
                          Desfazer
                        </ActionButton>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <details className="card no-print">
        <summary className="cursor-pointer px-5 py-3.5 text-sm font-semibold">Editar dados do contrato</summary>
        <div className="card-body border-t border-slate-100">
          <LocacaoForm
            edicao
            action={atualizarLocacao.bind(null, o.id, loc.id)}
            inquilinos={inquilinos}
            imobiliarias={imobiliarias.map((i) => ({ ...i, comissaoPct: i.comissaoPct === null ? null : n(i.comissaoPct) }))}
            d={{
              inquilinoId: loc.inquilinoId,
              imobiliariaId: loc.imobiliariaId,
              valorAluguel: inputMoney(loc.valorAluguel),
              diaVencimento: loc.diaVencimento,
              dataInicio: inputDate(loc.dataInicio),
              dataFim: inputDate(loc.dataFim),
              taxaAdministracaoPct: loc.taxaAdministracaoPct === null ? "" : n(loc.taxaAdministracaoPct).toLocaleString("pt-BR"),
              indiceReajuste: loc.indiceReajuste ?? "",
              garantia: loc.garantia ?? "",
              multaAtrasoPct: loc.multaAtrasoPct === null ? "" : n(loc.multaAtrasoPct).toLocaleString("pt-BR"),
              jurosMesPct: loc.jurosMesPct === null ? "" : n(loc.jurosMesPct).toLocaleString("pt-BR"),
              observacoes: loc.observacoes ?? "",
              ativo: loc.ativo,
            }}
          />
          <p className="mt-2 text-xs text-slate-500">
            Alterar o valor aqui não mexe nos lançamentos já gerados. Para reajuste com histórico, use “Reajuste do aluguel”.
          </p>
          {loc.ativo && (
            <div className="mt-6 border-t border-slate-100 pt-4">
              <h3 className="mb-3 text-sm font-semibold">Encerrar contrato</h3>
              <EncerrarForm action={encerrarLocacao.bind(null, o.id, loc.id)} />
            </div>
          )}
          <div className="mt-6 border-t border-slate-100 pt-4">
            <DeleteButton
              action={excluirLocacao.bind(null, o.id, loc.id)}
              label="Excluir contrato"
              confirmText="Excluir este contrato e todos os seus lançamentos?"
            />
          </div>
        </div>
      </details>
    </div>
  );
}
