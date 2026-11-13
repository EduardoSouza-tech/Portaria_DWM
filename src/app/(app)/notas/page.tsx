import Link from "next/link";
import { Card, EmpresaTag, Empty, PageHeader, Stat } from "@/components/ui";
import { getEscopo } from "@/lib/escopo";
import { parseDate } from "@/lib/form";
import { brl, dataBR, docMask } from "@/lib/format";
import { pesquisarNotas } from "@/lib/queries";

export const metadata = { title: "Pesquisa de notas" };

export default async function NotasPage({ searchParams }: { searchParams: Promise<{ q?: string; de?: string; ate?: string; nf?: string }> }) {
  const sp = await searchParams;
  const escopo = await getEscopo();
  const linhas = await pesquisarNotas({
    escopo,
    q: sp.q ?? null,
    de: parseDate(sp.de),
    ate: parseDate(sp.ate),
    somenteNF: sp.nf === "1",
  });
  const total = linhas.reduce((a, l) => a + l.valor, 0);
  const porFornecedor = new Map<string, { nome: string; cnpj: string | null; total: number; qtd: number; e1: number; e2: number }>();
  for (const l of linhas) {
    const k = l.cnpj || l.razaoSocial || "—";
    const f = porFornecedor.get(k) ?? { nome: l.razaoSocial ?? "Sem identificação", cnpj: l.cnpj, total: 0, qtd: 0, e1: 0, e2: 0 };
    f.total += l.valor;
    f.qtd++;
    if (l.empresa === 1) f.e1 += l.valor;
    else f.e2 += l.valor;
    porFornecedor.set(k, f);
  }
  const qs = new URLSearchParams(Object.entries(sp).filter(([, v]) => !!v) as [string, string][]).toString();

  return (
    <>
      <PageHeader
        empresa={escopo === "ambas" ? "ambas" : escopo === "1" ? 1 : 2}
        title="Pesquisa de notas e lançamentos"
        subtitle="Aportes das obras (E1) e custos dos imóveis de leilão (E2) por emissor, CNPJ, número da NF ou descrição."
        actions={
          <a href={`/api/export?tipo=notas&${qs}`} className="btn btn-secondary">
            Exportar CSV
          </a>
        }
      />

      <Card className="mb-6">
        <form className="flex flex-wrap items-end gap-3">
          <div className="min-w-64 flex-1">
            <label className="label">CNPJ, razão social, nº da NF, etapa ou descrição</label>
            <input name="q" defaultValue={sp.q} autoFocus className="input" />
          </div>
          <div>
            <label className="label">De</label>
            <input type="date" name="de" defaultValue={sp.de} className="input" />
          </div>
          <div>
            <label className="label">Até</label>
            <input type="date" name="ate" defaultValue={sp.ate} className="input" />
          </div>
          <label className="flex items-center gap-2 pb-2 text-sm">
            <input type="checkbox" name="nf" value="1" defaultChecked={sp.nf === "1"} className="h-4 w-4" /> Somente com NF
          </label>
          <button className="btn btn-primary">Pesquisar</button>
          {qs && (
            <Link href="/notas" className="btn btn-ghost">
              Limpar
            </Link>
          )}
        </form>
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat tone="brand" label="Total encontrado" value={brl(total)} hint={`${linhas.length} lançamento(s)`} />
        <Stat tone="e1" label="Empresa 1 (obras)" value={brl(linhas.filter((l) => l.empresa === 1).reduce((a, l) => a + l.valor, 0))} />
        <Stat tone="e2" label="Empresa 2 (leilão)" value={brl(linhas.filter((l) => l.empresa === 2).reduce((a, l) => a + l.valor, 0))} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card title="Por fornecedor / emissor" bodyClass="table-wrap">
          {porFornecedor.size === 0 ? (
            <div className="p-5">
              <Empty>Nada encontrado.</Empty>
            </div>
          ) : (
            <table className="table">
              <tbody>
                {[...porFornecedor.values()]
                  .sort((a, b) => b.total - a.total)
                  .slice(0, 30)
                  .map((f) => (
                    <tr key={(f.cnpj ?? "") + f.nome}>
                      <td>
                        <Link href={`/notas?q=${encodeURIComponent(f.cnpj ?? f.nome)}`} className="link">
                          {f.nome}
                        </Link>
                        {f.cnpj && <div className="text-xs text-slate-500">{docMask(f.cnpj)}</div>}
                      </td>
                      <td className="num">
                        {brl(f.total)}
                        <div className="text-[11px] text-slate-400">{f.qtd} lanç.</div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </Card>
        <Card title="Lançamentos" className="xl:col-span-2" bodyClass="table-wrap">
          {linhas.length === 0 ? (
            <div className="p-5">
              <Empty>Nenhum lançamento encontrado.</Empty>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Empresa</th>
                  <th>Origem</th>
                  <th>Classificação</th>
                  <th>Emissor</th>
                  <th>NF</th>
                  <th className="num">Valor</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <tr key={l.key}>
                    <td className="whitespace-nowrap">{dataBR(l.data)}</td>
                    <td>
                      <EmpresaTag empresa={l.empresa} />
                    </td>
                    <td>
                      <Link href={l.href} className="link">
                        {l.origem}
                      </Link>
                      {l.descricao && <div className="text-xs text-slate-500">{l.descricao}</div>}
                    </td>
                    <td>{l.classificacao}</td>
                    <td>
                      {l.razaoSocial ?? "—"}
                      {l.cnpj && <div className="text-xs text-slate-500">{docMask(l.cnpj)}</div>}
                    </td>
                    <td>{l.nf ?? "—"}</td>
                    <td className="num font-medium">{brl(l.valor)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={6}>Total</td>
                  <td className="num">{brl(total)}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </Card>
      </div>
    </>
  );
}
