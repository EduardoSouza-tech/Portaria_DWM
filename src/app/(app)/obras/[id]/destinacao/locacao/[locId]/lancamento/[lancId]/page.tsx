import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionButton, DeleteButton } from "@/components/forms";
import { Badge, Card, KV } from "@/components/ui";
import { diasAtraso, valorLanc } from "@/lib/calc";
import { STATUS_LANC, TIPO_LANC_LOCACAO } from "@/lib/constants";
import { brl, dataBR, hojeUTC, inputDate, inputMoney, inputMonth, mesBR, n, nn } from "@/lib/format";
import { alterarStatusLancamento, atualizarLancamento, baixarLancamento, estornarBaixa, excluirLancamento } from "../../../../../../actions";
import { BaixaForm, LancamentoEditForm } from "../../../../../../ManutencaoForms";
import { getObra } from "../../../../../data";

export default async function LancamentoPage({ params }: { params: Promise<{ id: string; locId: string; lancId: string }> }) {
  const { id, locId, lancId } = await params;
  const o = await getObra(id);
  const loc = o.locacoes.find((x) => x.id === Number(locId));
  const l = loc?.lancamentos.find((x) => x.id === Number(lancId));
  if (!loc || !l) notFound();

  const voltar = `/obras/${o.id}/destinacao/locacao/${loc.id}`;
  const tipo = TIPO_LANC_LOCACAO[l.tipo];
  const atraso = l.status === "PENDENTE" ? diasAtraso(l.vencimento, hojeUTC()) : 0;
  const pagoComAtraso = l.status === "PAGO" && l.dataPagamento ? diasAtraso(l.vencimento, l.dataPagamento) : 0;

  return (
    <div className="space-y-6">
      <div>
        <Link href={voltar} className="text-xs font-medium text-slate-500 hover:text-slate-800">
          ← Locação — {loc.inquilino.nome}
        </Link>
        <h2 className="flex flex-wrap items-center gap-2 text-lg font-semibold">
          <span className={tipo.receita ? "pos" : "neg"}>{tipo.receita ? "↑" : "↓"}</span>
          {l.descricao ?? tipo.label} — {mesBR(l.competencia)}
          <Badge tone={STATUS_LANC[l.status].tone}>{STATUS_LANC[l.status].label}</Badge>
          {atraso > 0 && <Badge tone="red">Vencido há {atraso} dia(s)</Badge>}
        </h2>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {l.status === "PENDENTE" && (
            <Card title={tipo.receita ? "Registrar recebimento" : "Registrar pagamento"}>
              <BaixaForm
                // remonta (e recalcula atraso/encargos) quando vencimento ou valor forem editados
                key={`${inputDate(l.vencimento)}|${n(l.valor)}`}
                action={baixarLancamento.bind(null, o.id, l.id)}
                valor={n(l.valor)}
                vencimento={l.vencimento ? inputDate(l.vencimento) : null}
                multaPct={tipo.receita ? nn(loc.multaAtrasoPct) : null}
                jurosMesPct={tipo.receita ? nn(loc.jurosMesPct) : null}
                receita={tipo.receita}
              />
            </Card>
          )}
          {l.status === "PAGO" && (
            <Card
              title="Baixa registrada"
              actions={
                <ActionButton
                  action={estornarBaixa.bind(null, o.id, l.id)}
                  confirmText="Estornar a baixa? O lançamento volta para pendente e os dados do pagamento são apagados."
                  className="btn btn-secondary btn-sm"
                >
                  Estornar baixa
                </ActionButton>
              }
            >
              <KV k={tipo.receita ? "Recebido em" : "Pago em"} v={`${dataBR(l.dataPagamento)}${pagoComAtraso ? ` (${pagoComAtraso} dia(s) de atraso)` : ""}`} />
              <KV k="Principal" v={brl(l.valor)} />
              <KV k="(+) Multa" v={l.multa ? brl(l.multa) : "—"} />
              <KV k="(+) Juros" v={l.juros ? brl(l.juros) : "—"} />
              <KV k="(−) Desconto" v={l.desconto ? brl(l.desconto) : "—"} />
              <KV k={<strong>Total {tipo.receita ? "recebido" : "pago"}</strong>} v={<strong>{brl(valorLanc(l))}</strong>} />
              <KV k="Forma" v={l.formaPagamento} />
              <KV k="Observação" v={l.obsPagamento} />
            </Card>
          )}
          {l.status === "CANCELADO" && (
            <Card title="Lançamento cancelado">
              <p className="mb-3 text-sm text-slate-600">Fica no histórico, mas não entra nos totais nem no resultado.</p>
              <ActionButton action={alterarStatusLancamento.bind(null, o.id, l.id, "PENDENTE")} className="btn btn-secondary btn-sm">
                Reativar (voltar para pendente)
              </ActionButton>
            </Card>
          )}
        </div>

        <Card title="Título">
          <KV k="Contrato" v={`${loc.inquilino.nome} · obra ${o.numero}`} />
          <KV k="Tipo" v={`${tipo.receita ? "Receita" : "Despesa"} — ${tipo.label}`} />
          <KV k="Competência" v={mesBR(l.competencia)} />
          <KV k="Vencimento" v={dataBR(l.vencimento)} />
          <KV k="Valor" v={brl(l.valor)} />
          <KV k="Situação" v={STATUS_LANC[l.status].label} />
          <KV k="Incluído em" v={dataBR(l.createdAt)} />
        </Card>
      </div>

      <Card title="Editar lançamento">
        {l.status === "PAGO" && (
          <p className="mb-3 text-xs text-slate-500">Este lançamento já foi baixado: alterar o valor muda o principal registrado na baixa.</p>
        )}
        <LancamentoEditForm
          action={atualizarLancamento.bind(null, o.id, l.id)}
          d={{
            competencia: inputMonth(l.competencia),
            tipo: l.tipo,
            descricao: l.descricao ?? "",
            valor: inputMoney(l.valor),
            vencimento: inputDate(l.vencimento),
          }}
        />
      </Card>

      <div className="no-print flex flex-wrap justify-end gap-2">
        {l.status === "PENDENTE" && (
          <ActionButton
            action={alterarStatusLancamento.bind(null, o.id, l.id, "CANCELADO")}
            confirmText="Cancelar este lançamento? Ele continua no histórico, fora dos totais."
            className="btn btn-secondary btn-sm"
          >
            Cancelar lançamento
          </ActionButton>
        )}
        <DeleteButton action={excluirLancamento.bind(null, o.id, l.id, voltar)} label="Excluir lançamento" />
      </div>
    </div>
  );
}
