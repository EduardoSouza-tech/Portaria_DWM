import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { Card, Empty, PageHeader, Stat } from "@/components/ui";
import { prisma } from "@/lib/db";
import { parseDate } from "@/lib/form";
import { brl, dataBR, docMask, n, onlyDigits } from "@/lib/format";

export const metadata = { title: "Aportes" };

type SP = { obra?: string; etapa?: string; q?: string; de?: string; ate?: string };

export default async function AportesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const f = await searchParams;
  const where: Prisma.AporteWhereInput = { AND: [] };
  const and = where.AND as Prisma.AporteWhereInput[];
  if (f.obra) and.push({ obraId: Number(f.obra) });
  if (f.etapa) and.push({ etapa: { contains: f.etapa, mode: "insensitive" } });
  if (f.q) {
    const dig = onlyDigits(f.q);
    and.push({
      OR: [
        { emissorRazaoSocial: { contains: f.q, mode: "insensitive" } },
        { nfNumero: { contains: f.q, mode: "insensitive" } },
        { descricao: { contains: f.q, mode: "insensitive" } },
        { contrapartida: { contains: f.q, mode: "insensitive" } },
        ...(dig.length >= 3 ? [{ emissorCnpj: { contains: dig } }] : []),
      ],
    });
  }
  const de = parseDate(f.de);
  const ate = parseDate(f.ate);
  if (de) and.push({ data: { gte: de } });
  if (ate) and.push({ data: { lte: ate } });

  const [aportes, obras] = await Promise.all([
    prisma.aporte.findMany({
      where,
      include: { obra: { select: { id: true, numero: true, nome: true } } },
      orderBy: [{ data: "desc" }, { id: "desc" }],
      take: 2000,
    }),
    prisma.obra.findMany({ select: { id: true, numero: true, nome: true }, orderBy: { numero: "asc" } }),
  ]);

  const total = aportes.reduce((s, a) => s + n(a.valor), 0);
  const porEtapa = new Map<string, number>();
  const porEmissor = new Map<string, { nome: string; cnpj: string | null; total: number; qtd: number }>();
  for (const a of aportes) {
    const e = a.etapa || "Sem etapa";
    porEtapa.set(e, (porEtapa.get(e) ?? 0) + n(a.valor));
    const k = a.emissorCnpj || a.emissorRazaoSocial || "—";
    const em = porEmissor.get(k) ?? { nome: a.emissorRazaoSocial ?? "Sem emissor", cnpj: a.emissorCnpj, total: 0, qtd: 0 };
    em.total += n(a.valor);
    em.qtd++;
    porEmissor.set(k, em);
  }
  const qs = new URLSearchParams(Object.entries(f).filter(([, v]) => !!v) as [string, string][]).toString();

  return (
    <>
      <PageHeader
        empresa={1}
        title="Aportes e notas fiscais"
        subtitle="Pesquisa detalhada dos valores aportados por obra, etapa, emissor e nota fiscal."
        actions={
          <a href={`/api/export?tipo=aportes&${qs}`} className="btn btn-secondary">
            Exportar CSV
          </a>
        }
      />

      <Card className="mb-6">
        <form className="flex flex-wrap items-end gap-3">
          <div className="w-64">
            <label className="label">Obra</label>
            <select name="obra" defaultValue={f.obra ?? ""} className="input">
              <option value="">Todas</option>
              {obras.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.numero} — {o.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="w-48">
            <label className="label">Etapa</label>
            <input name="etapa" defaultValue={f.etapa} className="input" />
          </div>
          <div className="min-w-56 flex-1">
            <label className="label">Emissor, CNPJ, NF, descrição, contrapartida</label>
            <input name="q" defaultValue={f.q} className="input" />
          </div>
          <div>
            <label className="label">De</label>
            <input type="date" name="de" defaultValue={f.de} className="input" />
          </div>
          <div>
            <label className="label">Até</label>
            <input type="date" name="ate" defaultValue={f.ate} className="input" />
          </div>
          <button className="btn btn-e1">Pesquisar</button>
          {qs && (
            <Link href="/aportes" className="btn btn-ghost">
              Limpar
            </Link>
          )}
        </form>
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat tone="e1" label="Total encontrado" value={brl(total)} hint={`${aportes.length} lançamento(s)`} />
        <Stat tone="e1" label="Etapas" value={porEtapa.size} />
        <Stat tone="e1" label="Emissores distintos" value={porEmissor.size} />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card title="Total por etapa" bodyClass="table-wrap">
          <table className="table">
            <tbody>
              {[...porEtapa.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([e, v]) => (
                  <tr key={e}>
                    <td>{e}</td>
                    <td className="num">{brl(v)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </Card>
        <Card title="Total por emissor" bodyClass="table-wrap">
          <table className="table">
            <tbody>
              {[...porEmissor.values()]
                .sort((a, b) => b.total - a.total)
                .slice(0, 20)
                .map((e) => (
                  <tr key={(e.cnpj ?? "") + e.nome}>
                    <td>
                      {e.nome}
                      {e.cnpj && <div className="text-xs text-slate-500">{docMask(e.cnpj)}</div>}
                    </td>
                    <td className="num text-slate-500">{e.qtd}x</td>
                    <td className="num">{brl(e.total)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Card title="Lançamentos" bodyClass="table-wrap">
        {aportes.length === 0 ? (
          <div className="p-5">
            <Empty>Nenhum aporte encontrado.</Empty>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Obra</th>
                <th>Etapa</th>
                <th>Descrição</th>
                <th>Contrapartida</th>
                <th>Emissor</th>
                <th>NF</th>
                <th className="num">Valor</th>
              </tr>
            </thead>
            <tbody>
              {aportes.map((a) => (
                <tr key={a.id}>
                  <td className="whitespace-nowrap">{dataBR(a.data)}</td>
                  <td>
                    <Link href={`/obras/${a.obra.id}/aportes`} className="link">
                      {a.obra.numero} — {a.obra.nome}
                    </Link>
                  </td>
                  <td>{a.etapa ?? "—"}</td>
                  <td className="text-slate-600">{a.descricao ?? "—"}</td>
                  <td className="text-slate-600">{a.contrapartida ?? "—"}</td>
                  <td>
                    {a.emissorRazaoSocial ?? "—"}
                    {a.emissorCnpj && <div className="text-xs text-slate-500">{docMask(a.emissorCnpj)}</div>}
                  </td>
                  <td>{a.nfNumero ?? "—"}</td>
                  <td className="num font-medium">{brl(a.valor)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={7}>Total</td>
                <td className="num">{brl(total)}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </Card>
    </>
  );
}
