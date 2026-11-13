import Link from "next/link";
import { DeleteButton } from "@/components/forms";
import { Card, Empty } from "@/components/ui";
import { parseDate } from "@/lib/form";
import { brl, dataBR, docMask, n, onlyDigits } from "@/lib/format";
import { emissoresConhecidos } from "@/lib/queries";
import { criarAporte, excluirAporte } from "../../actions";
import { AporteForm } from "../../AporteForm";
import { getObra } from "../data";

export default async function AportesObra({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ etapa?: string; q?: string; de?: string; ate?: string }>;
}) {
  const { id } = await params;
  const f = await searchParams;
  const [o, emissores] = await Promise.all([getObra(id), emissoresConhecidos()]);

  const de = parseDate(f.de);
  const ate = parseDate(f.ate);
  const termo = f.q?.trim().toLowerCase();
  const dig = onlyDigits(f.q);
  const aportes = o.aportes.filter(
    (a) =>
      (!f.etapa || (a.etapa ?? "Sem etapa") === f.etapa) &&
      (!de || a.data >= de) &&
      (!ate || a.data <= ate) &&
      (!termo ||
        [a.emissorRazaoSocial, a.nfNumero, a.descricao, a.contrapartida].some((x) => x?.toLowerCase().includes(termo)) ||
        (dig.length >= 3 && a.emissorCnpj?.includes(dig))),
  );
  const total = aportes.reduce((s, a) => s + n(a.valor), 0);
  const etapasUsadas = [...new Set(o.aportes.map((a) => a.etapa).filter((x): x is string => !!x))];
  const filtrado = !!(f.etapa || f.q || f.de || f.ate);

  return (
    <div className="space-y-6">
      <Card title="Lançar aporte">
        <AporteForm action={criarAporte.bind(null, o.id)} emissores={emissores} etapasUsadas={etapasUsadas} />
      </Card>

      <Card
        title={`Aportes lançados — ${brl(total)}`}
        bodyClass="table-wrap"
        actions={
          <a href={`/api/export?tipo=aportes&obra=${o.id}`} className="btn btn-secondary btn-sm">
            Exportar CSV
          </a>
        }
      >
        <form className="no-print flex flex-wrap items-end gap-3 border-b border-slate-100 p-4">
          <div className="w-56">
            <label className="label">Etapa</label>
            <select name="etapa" defaultValue={f.etapa ?? ""} className="input">
              <option value="">Todas</option>
              {[...new Set(o.aportes.map((a) => a.etapa ?? "Sem etapa"))].sort().map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>
          </div>
          <div className="min-w-56 flex-1">
            <label className="label">Emissor, CNPJ, NF, descrição</label>
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
          <button className="btn btn-secondary">Filtrar</button>
          {filtrado && (
            <Link href={`/obras/${o.id}/aportes`} className="btn btn-ghost">
              Limpar
            </Link>
          )}
        </form>
        {aportes.length === 0 ? (
          <div className="p-5">
            <Empty>Nenhum aporte encontrado.</Empty>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Etapa</th>
                <th>Descrição</th>
                <th>Contrapartida</th>
                <th>Emissor da NF</th>
                <th>NF</th>
                <th className="num">Valor</th>
                <th className="no-print" />
              </tr>
            </thead>
            <tbody>
              {aportes.map((a) => (
                <tr key={a.id}>
                  <td className="whitespace-nowrap">{dataBR(a.data)}</td>
                  <td>{a.etapa ?? "—"}</td>
                  <td className="text-slate-600">
                    {a.descricao ?? "—"}
                    {a.formaPagamento && <div className="text-xs text-slate-400">{a.formaPagamento}</div>}
                  </td>
                  <td className="text-slate-600">{a.contrapartida ?? "—"}</td>
                  <td>
                    {a.emissorRazaoSocial ?? "—"}
                    {a.emissorCnpj && <div className="text-xs text-slate-500">{docMask(a.emissorCnpj)}</div>}
                  </td>
                  <td>{a.nfNumero ?? "—"}</td>
                  <td className="num font-medium">{brl(a.valor)}</td>
                  <td className="no-print whitespace-nowrap text-right">
                    <Link href={`/obras/${o.id}/aportes/${a.id}`} className="btn btn-ghost btn-sm">
                      Editar
                    </Link>
                    <DeleteButton action={excluirAporte.bind(null, o.id, a.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={6}>
                  Total {filtrado ? "filtrado" : ""} ({aportes.length})
                </td>
                <td className="num">{brl(total)}</td>
                <td className="no-print" />
              </tr>
            </tfoot>
          </table>
        )}
      </Card>
    </div>
  );
}
