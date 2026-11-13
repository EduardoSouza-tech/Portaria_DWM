import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { Badge, Card, Empty, Money, PageHeader, Stat } from "@/components/ui";
import { diasAtraso, proximoReajuste, valorLanc } from "@/lib/calc";
import { TIPO_LANC_LOCACAO, type TipoLancLocacao } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { parseDate, parseMonth } from "@/lib/form";
import { brl, dataBR, hojeISO, hojeUTC, mesBR, mesKey, n } from "@/lib/format";
import { baixarEmLote } from "../obras/actions";
import { BaixaLote, type TituloAberto } from "./BaixaLote";

const TIPOS_RECEITA = (Object.keys(TIPO_LANC_LOCACAO) as TipoLancLocacao[]).filter((t) => TIPO_LANC_LOCACAO[t].receita);

export const metadata = { title: "Locações" };

export default async function LocacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ de?: string; ate?: string; venc?: string; tipo?: string }>;
}) {
  const f = await searchParams;
  const hojeBR = hojeUTC();
  const mesAtual = hojeISO().slice(0, 7);
  // títulos em aberto: por padrão, vencidos ou vencendo até o fim do mês corrente
  const fimDoMes = new Date(Date.UTC(hojeBR.getUTCFullYear(), hojeBR.getUTCMonth() + 1, 0));
  const vencAte = parseDate(f.venc) ?? fimDoMes;
  const filtroTipo = f.tipo === "rec" || f.tipo === "desp" ? f.tipo : "";
  const hoje = new Date();
  const padraoDe = `${hoje.getFullYear()}-01`;
  const padraoAte = `${hoje.getFullYear()}-12`;
  const de = parseMonth(f.de ?? padraoDe);
  const ate = parseMonth(f.ate ?? padraoAte);

  const locacoes = await prisma.locacao.findMany({
    include: {
      obra: { select: { id: true, numero: true, nome: true } },
      inquilino: { select: { nome: true } },
      imobiliaria: { select: { razaoSocial: true } },
      lancamentos: true,
      reajustes: { orderBy: { id: "desc" }, take: 1, select: { aPartirDe: true } },
    },
    orderBy: [{ ativo: "desc" }, { dataInicio: "desc" }],
  });

  const whereAbertos: Prisma.LancamentoLocacaoWhereInput = {
    status: "PENDENTE",
    OR: [{ vencimento: { lte: vencAte } }, { vencimento: null }],
  };
  if (filtroTipo) whereAbertos.tipo = filtroTipo === "rec" ? { in: TIPOS_RECEITA } : { notIn: TIPOS_RECEITA };
  const abertos = await prisma.lancamentoLocacao.findMany({
    where: whereAbertos,
    include: { locacao: { select: { id: true, inquilino: { select: { nome: true } }, obra: { select: { id: true, numero: true, nome: true } } } } },
    orderBy: [{ vencimento: { sort: "asc", nulls: "last" } }, { id: "asc" }],
    take: 500,
  });
  const titulos: TituloAberto[] = abertos.map((t) => ({
    id: t.id,
    href: `/obras/${t.locacao.obra.id}/destinacao/locacao/${t.locacao.id}/lancamento/${t.id}`,
    contrato: t.locacao.inquilino.nome,
    obra: `Obra ${t.locacao.obra.numero} — ${t.locacao.obra.nome}`,
    competencia: mesBR(t.competencia),
    tipo: TIPO_LANC_LOCACAO[t.tipo].label,
    receita: TIPO_LANC_LOCACAO[t.tipo].receita,
    descricao: t.descricao,
    vencimento: dataBR(t.vencimento),
    valor: n(t.valor),
    atraso: diasAtraso(t.vencimento, hojeBR),
  }));
  const abertosRec = titulos.filter((t) => t.receita).reduce((a, t) => a + t.valor, 0);
  const abertosDesp = titulos.filter((t) => !t.receita).reduce((a, t) => a + t.valor, 0);
  const vencidosRec = titulos.filter((t) => t.receita && t.atraso > 0);

  const porMes = new Map<string, { comp: Date; rec: number; desp: number }>();
  let totRec = 0;
  let totDesp = 0;
  let aReceber = 0;
  const linhas = locacoes.map((l) => {
    let rec = 0;
    let desp = 0;
    for (const x of l.lancamentos) {
      if (x.status === "CANCELADO") continue;
      if ((de && x.competencia < de) || (ate && x.competencia > ate)) continue;
      const v = valorLanc(x);
      const receita = TIPO_LANC_LOCACAO[x.tipo].receita;
      if (receita) rec += v;
      else desp += v;
      if (receita && x.status === "PENDENTE") aReceber += v;
      const k = mesKey(x.competencia);
      const m = porMes.get(k) ?? { comp: x.competencia, rec: 0, desp: 0 };
      if (receita) m.rec += v;
      else m.desp += v;
      porMes.set(k, m);
    }
    totRec += rec;
    totDesp += desp;
    return { l, rec, desp };
  });
  const meses = [...porMes.values()].sort((a, b) => a.comp.getTime() - b.comp.getTime());
  const contratado = locacoes.filter((l) => l.ativo).reduce((a, l) => a + n(l.valorAluguel), 0);

  return (
    <>
      <PageHeader
        empresa={1}
        title="Locações"
        subtitle="Todas as unidades alugadas — resultado por período (receitas − comissão, IPTU, condomínio e demais custos)."
      />

      <Card className="mb-6">
        <form className="flex flex-wrap items-end gap-3">
          <div>
            <label className="label">Competência de</label>
            <input type="month" name="de" defaultValue={f.de ?? padraoDe} className="input" />
          </div>
          <div>
            <label className="label">até</label>
            <input type="month" name="ate" defaultValue={f.ate ?? padraoAte} className="input" />
          </div>
          {f.venc && <input type="hidden" name="venc" value={f.venc} />}
          {filtroTipo && <input type="hidden" name="tipo" value={filtroTipo} />}
          <button className="btn btn-e1">Apurar</button>
        </form>
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat tone="e1" label="Aluguel contratado" value={`${brl(contratado)}/mês`} hint={`${locacoes.filter((l) => l.ativo).length} contrato(s) ativo(s)`} />
        <Stat tone="e1" label="Receitas no período" value={brl(totRec)} hint={`A receber: ${brl(aReceber)}`} />
        <Stat tone="e1" label="Despesas no período" value={brl(totDesp)} />
        <Stat tone={totRec - totDesp >= 0 ? "pos" : "neg"} label="Resultado no período" value={brl(totRec - totDesp)} />
      </div>

      <Card
        className="no-print mb-6"
        title={
          <>
            Títulos em aberto até {dataBR(vencAte)}
            <span className="ml-2 font-normal text-slate-500">
              a receber {brl(abertosRec)} · a pagar {brl(abertosDesp)}
              {vencidosRec.length > 0 && (
                <span className="ml-2">
                  <Badge tone="red">{vencidosRec.length} recebimento(s) vencido(s)</Badge>
                </span>
              )}
            </span>
          </>
        }
        bodyClass=""
      >
        <form className="flex flex-wrap items-end gap-3 border-b border-slate-100 p-4">
          <div>
            <label className="label">Vencimento até</label>
            <input type="date" name="venc" defaultValue={f.venc ?? fimDoMes.toISOString().slice(0, 10)} className="input" />
          </div>
          <div>
            <label className="label">Tipo</label>
            <select name="tipo" defaultValue={filtroTipo} className="input">
              <option value="">Receitas e despesas</option>
              <option value="rec">Só a receber</option>
              <option value="desp">Só a pagar</option>
            </select>
          </div>
          {f.de && <input type="hidden" name="de" value={f.de} />}
          {f.ate && <input type="hidden" name="ate" value={f.ate} />}
          <button className="btn btn-secondary">Filtrar</button>
        </form>
        {titulos.length === 0 ? (
          <div className="p-5">
            <Empty>Nenhum título em aberto até essa data.</Empty>
          </div>
        ) : (
          <BaixaLote action={baixarEmLote} titulos={titulos} />
        )}
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card title="Contratos" className="xl:col-span-2" bodyClass="table-wrap">
          {linhas.length === 0 ? (
            <div className="p-5">
              <Empty>Nenhum contrato. Defina a destinação “Aluguel” em uma obra para cadastrar.</Empty>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Obra</th>
                  <th>Inquilino</th>
                  <th>Imobiliária</th>
                  <th>Início</th>
                  <th>Próx. reajuste</th>
                  <th className="num">Aluguel</th>
                  <th className="num">Receitas</th>
                  <th className="num">Despesas</th>
                  <th className="num">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map(({ l, rec, desp }) => (
                  <tr key={l.id}>
                    <td>
                      {l.obra.numero} — {l.obra.nome}
                    </td>
                    <td>
                      <Link href={`/obras/${l.obra.id}/destinacao/locacao/${l.id}`} className="link">
                        {l.inquilino.nome}
                      </Link>
                      {!l.ativo && (
                        <span className="ml-2">
                          <Badge>Encerrado</Badge>
                        </span>
                      )}
                    </td>
                    <td>{l.imobiliaria?.razaoSocial ?? "—"}</td>
                    <td>{dataBR(l.dataInicio)}</td>
                    <td className="whitespace-nowrap">
                      {l.ativo ? (
                        (() => {
                          const prox = proximoReajuste(l.dataInicio, l.reajustes[0]?.aPartirDe ?? null);
                          const devido = mesKey(prox) <= mesAtual;
                          return devido ? <Badge tone="amber">{mesBR(prox)}</Badge> : mesBR(prox);
                        })()
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="num">{brl(l.valorAluguel)}</td>
                    <td className="num">{brl(rec)}</td>
                    <td className="num">{brl(desp)}</td>
                    <td className="num">
                      <Money v={rec - desp} colored />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
        <Card title="Resultado mensal consolidado" bodyClass="table-wrap">
          {meses.length === 0 ? (
            <div className="p-5">
              <Empty>Sem lançamentos no período.</Empty>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Mês</th>
                  <th className="num">Receitas</th>
                  <th className="num">Despesas</th>
                  <th className="num">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {meses.map((m) => (
                  <tr key={mesKey(m.comp)}>
                    <td>{mesBR(m.comp)}</td>
                    <td className="num">{brl(m.rec)}</td>
                    <td className="num">{brl(m.desp)}</td>
                    <td className="num">
                      <Money v={m.rec - m.desp} colored />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total</td>
                  <td className="num">{brl(totRec)}</td>
                  <td className="num">{brl(totDesp)}</td>
                  <td className="num">
                    <Money v={totRec - totDesp} colored />
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </Card>
      </div>
    </>
  );
}
