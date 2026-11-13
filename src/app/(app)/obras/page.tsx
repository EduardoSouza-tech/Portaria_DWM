import Link from "next/link";
import { Badge, Card, Empty, Money, PageHeader, Stat } from "@/components/ui";
import { DESTINACAO, STATUS_OBRA, type StatusObra } from "@/lib/constants";
import { brl, pct } from "@/lib/format";
import { linhasObras } from "@/lib/queries";

export const metadata = { title: "Obras" };

export default async function ObrasPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q, status } = await searchParams;
  const todas = await linhasObras();
  const termo = q?.trim().toLowerCase();
  const obras = todas.filter(
    (o) =>
      (!status || o.status === status) &&
      (!termo ||
        [o.nome, o.endereco, o.cidade, o.matricula, o.inscricaoIptu, o.construtora, String(o.numero)]
          .filter(Boolean)
          .some((x) => x!.toLowerCase().includes(termo))),
  );

  const tot = obras.reduce(
    (a, o) => ({
      previsto: a.previsto + o.custoPrevisto,
      aportado: a.aportado + o.totalAportes,
      resultado: a.resultado + (o.resultado ?? 0),
    }),
    { previsto: 0, aportado: 0, resultado: 0 },
  );

  return (
    <>
      <PageHeader
        empresa={1}
        title="Obras / unidades"
        subtitle="Participação em obras por administração — cadastro, custos previstos, aportes e destinação."
        actions={
          <Link href="/obras/nova" className="btn btn-e1">
            + Nova obra
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat tone="e1" label="Obras listadas" value={obras.length} />
        <Stat tone="e1" label="Custo previsto" value={brl(tot.previsto)} />
        <Stat tone="e1" label="Total aportado" value={brl(tot.aportado)} hint={`Execução: ${pct(tot.previsto ? tot.aportado / tot.previsto : null, 1)}`} />
        <Stat tone={tot.resultado >= 0 ? "pos" : "neg"} label="Resultado apurado" value={brl(tot.resultado)} hint="Vendas + aluguéis" />
      </div>

      <Card bodyClass="table-wrap">
        <form className="no-print flex flex-wrap items-end gap-3 border-b border-slate-100 p-4">
          <div className="min-w-56 flex-1">
            <label className="label">Pesquisar</label>
            <input name="q" defaultValue={q} placeholder="Nome, endereço, matrícula, IPTU, construtora…" className="input" />
          </div>
          <div className="w-48">
            <label className="label">Status</label>
            <select name="status" defaultValue={status ?? ""} className="input">
              <option value="">Todos</option>
              {(Object.keys(STATUS_OBRA) as StatusObra[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_OBRA[s].label}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-secondary">Filtrar</button>
          {(q || status) && (
            <Link href="/obras" className="btn btn-ghost">
              Limpar
            </Link>
          )}
        </form>

        {obras.length === 0 ? (
          <div className="p-5">
            <Empty>
              Nenhuma obra encontrada.{" "}
              <Link href="/obras/nova" className="link">
                Cadastrar obra
              </Link>
            </Empty>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nº</th>
                <th>Unidade</th>
                <th>Construtora</th>
                <th>Status</th>
                <th>Destinação</th>
                <th className="num">Previsto</th>
                <th className="num">Aportado</th>
                <th className="num">Execução</th>
                <th className="num">Resultado</th>
              </tr>
            </thead>
            <tbody>
              {obras.map((o) => (
                <tr key={o.id}>
                  <td className="font-semibold">{o.numero}</td>
                  <td>
                    <Link href={`/obras/${o.id}`} className="link">
                      {o.nome}
                    </Link>
                    <div className="text-xs text-slate-500">{[o.endereco, o.cidade && `${o.cidade}/${o.uf ?? ""}`].filter(Boolean).join(" · ")}</div>
                  </td>
                  <td className="text-slate-600">{o.construtora ?? "—"}</td>
                  <td>
                    <Badge tone={STATUS_OBRA[o.status].tone}>{STATUS_OBRA[o.status].label}</Badge>
                  </td>
                  <td>{o.destinacao ? DESTINACAO[o.destinacao] : <span className="text-slate-400">—</span>}</td>
                  <td className="num">{brl(o.custoPrevisto)}</td>
                  <td className="num">{brl(o.totalAportes)}</td>
                  <td className={`num ${o.execucao !== null && o.execucao > 1 ? "neg" : ""}`}>{pct(o.execucao, 1)}</td>
                  <td className="num">
                    <Money v={o.resultado} colored dash />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5}>Total</td>
                <td className="num">{brl(tot.previsto)}</td>
                <td className="num">{brl(tot.aportado)}</td>
                <td className="num">{pct(tot.previsto ? tot.aportado / tot.previsto : null, 1)}</td>
                <td className="num">
                  <Money v={tot.resultado} colored />
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </Card>
    </>
  );
}
