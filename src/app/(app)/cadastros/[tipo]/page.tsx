import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/forms";
import { Card, Empty, PageHeader } from "@/components/ui";
import { docMask, n } from "@/lib/format";
import { excluirCadastro, salvarCadastro } from "../actions";
import { CadastroForm } from "../CadastroForm";
import { CADASTROS, isTipo, type Campo } from "../config";
import { repos } from "../repo";

function exibir(c: Campo | undefined, v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (c?.type === "doc") return docMask(String(v));
  if (c?.type === "percent") return `${n(v).toLocaleString("pt-BR")}%`;
  return String(v);
}

function paraInput(c: Campo, v: unknown): string {
  if (v === null || v === undefined) return "";
  if (c.type === "doc") return docMask(String(v));
  if (c.type === "percent") return n(v).toLocaleString("pt-BR");
  return String(v);
}

export default async function CadastroPage({
  params,
  searchParams,
}: {
  params: Promise<{ tipo: string }>;
  searchParams: Promise<{ edit?: string; q?: string }>;
}) {
  const { tipo } = await params;
  const { edit, q } = await searchParams;
  if (!isTipo(tipo)) notFound();
  const cfg = CADASTROS[tipo];
  const campos: Campo[] = cfg.campos;
  const todos = await repos[tipo].list();
  const termo = q?.toLowerCase().trim();
  const lista = termo ? todos.filter((r) => campos.some((c) => String(r[c.name] ?? "").toLowerCase().includes(termo))) : todos;
  const editando = edit ? todos.find((r) => r.id === Number(edit)) : undefined;
  const defaults = editando ? Object.fromEntries(campos.map((c) => [c.name, paraInput(c, editando[c.name])])) : {};

  return (
    <>
      <PageHeader title={cfg.titulo} subtitle={cfg.descricao} />
      <Card title={editando ? `Editar ${cfg.singular}` : `Nova ${cfg.singular}`.replace("Nova inquilino", "Novo inquilino")} className="mb-6">
        <CadastroForm
          key={editando?.id ?? "novo"}
          action={salvarCadastro.bind(null, tipo, editando?.id ?? null)}
          campos={campos}
          d={defaults}
          edicao={!!editando}
          cancelHref={`/cadastros/${tipo}`}
        />
      </Card>
      <Card title={`${cfg.titulo} (${lista.length})`} bodyClass="table-wrap">
        <form className="flex gap-3 border-b border-slate-100 p-4">
          <input name="q" defaultValue={q} placeholder="Pesquisar…" className="input max-w-sm" />
          <button className="btn btn-secondary">Pesquisar</button>
        </form>
        {lista.length === 0 ? (
          <div className="p-5">
            <Empty>Nenhum registro.</Empty>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                {cfg.colunas.map((k) => (
                  <th key={k}>{campos.find((c) => c.name === k)?.label ?? k}</th>
                ))}
                <th className="num">Uso</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {lista.map((r) => (
                <tr key={r.id} className={editando?.id === r.id ? "bg-amber-50" : ""}>
                  {cfg.colunas.map((k, i) => (
                    <td key={k} className={i === 0 ? "font-medium" : "text-slate-600"}>
                      {exibir(
                        campos.find((c) => c.name === k),
                        r[k],
                      )}
                    </td>
                  ))}
                  <td className="num text-slate-500">
                    {r.uso} {cfg.uso}
                  </td>
                  <td className="whitespace-nowrap text-right">
                    <Link href={`/cadastros/${tipo}?edit=${r.id}`} className="btn btn-ghost btn-sm">
                      Editar
                    </Link>
                    <DeleteButton action={excluirCadastro.bind(null, tipo, r.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
