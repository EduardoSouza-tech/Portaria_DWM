import Link from "next/link";
import { Badge, Card, Empty, Money, PageHeader, Stat } from "@/components/ui";
import { TIPO_LANC_LOCACAO } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { parseMonth } from "@/lib/form";
import { brl, dataBR, mesBR, mesKey, n } from "@/lib/format";

export const metadata = { title: "Locações" };

export default async function LocacoesPage({ searchParams }: { searchParams: Promise<{ de?: string; ate?: string }> }) {
  const f = await searchParams;
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
    },
    orderBy: [{ ativo: "desc" }, { dataInicio: "desc" }],
  });

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
      const v = n(x.valor);
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
          <button className="btn btn-e1">Apurar</button>
        </form>
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat tone="e1" label="Aluguel contratado" value={`${brl(contratado)}/mês`} hint={`${locacoes.filter((l) => l.ativo).length} contrato(s) ativo(s)`} />
        <Stat tone="e1" label="Receitas no período" value={brl(totRec)} hint={`A receber: ${brl(aReceber)}`} />
        <Stat tone="e1" label="Despesas no período" value={brl(totDesp)} />
        <Stat tone={totRec - totDesp >= 0 ? "pos" : "neg"} label="Resultado no período" value={brl(totRec - totDesp)} />
      </div>

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
