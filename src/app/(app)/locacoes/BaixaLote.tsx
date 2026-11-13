"use client";

import Link from "next/link";
import { useState } from "react";
import { ActionForm, SubmitButton } from "@/components/forms";
import { Badge } from "@/components/ui";
import { FORMAS_PAGAMENTO } from "@/lib/constants";
import type { ActionState } from "@/lib/form";
import { hojeISO } from "@/lib/format";

export type TituloAberto = {
  id: number;
  href: string;
  contrato: string;
  obra: string;
  competencia: string;
  tipo: string;
  receita: boolean;
  descricao: string | null;
  vencimento: string;
  valor: number;
  atraso: number;
};

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Lista de títulos pendentes com seleção e baixa em lote (valor do título, sem encargos) */
export function BaixaLote({ action, titulos }: { action: (s: ActionState, fd: FormData) => Promise<ActionState>; titulos: TituloAberto[] }) {
  const [sel, setSel] = useState<Set<number>>(new Set());
  const marcar = (id: number, on: boolean) =>
    setSel((s) => {
      const n = new Set(s);
      if (on) n.add(id);
      else n.delete(id);
      return n;
    });
  const escolhidos = titulos.filter((t) => sel.has(t.id));
  const liquido = escolhidos.reduce((a, t) => a + (t.receita ? t.valor : -t.valor), 0);
  const todos = titulos.length > 0 && escolhidos.length === titulos.length;

  return (
    <ActionForm action={action}>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th className="w-8">
                <input
                  type="checkbox"
                  aria-label="Selecionar todos"
                  className="h-4 w-4"
                  checked={todos}
                  onChange={(e) => setSel(e.currentTarget.checked ? new Set(titulos.map((t) => t.id)) : new Set())}
                />
              </th>
              <th>Vencimento</th>
              <th>Contrato</th>
              <th>Competência</th>
              <th>Tipo</th>
              <th className="num">Valor</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {titulos.map((t) => (
              <tr key={t.id} className={sel.has(t.id) ? "bg-blue-50/60" : ""}>
                <td>
                  <input
                    type="checkbox"
                    name="ids"
                    value={t.id}
                    aria-label={`Selecionar ${t.tipo} ${t.competencia} de ${t.contrato}`}
                    className="h-4 w-4"
                    checked={sel.has(t.id)}
                    onChange={(e) => marcar(t.id, e.currentTarget.checked)}
                  />
                </td>
                <td className="whitespace-nowrap">
                  {t.vencimento}
                  {t.atraso > 0 && (
                    <div>
                      <Badge tone="red">{t.atraso} dia(s)</Badge>
                    </div>
                  )}
                </td>
                <td>
                  {t.contrato}
                  <div className="text-xs text-slate-500">{t.obra}</div>
                </td>
                <td>{t.competencia}</td>
                <td>
                  <span className={t.receita ? "pos" : "neg"}>{t.receita ? "↑" : "↓"}</span> {t.tipo}
                  {t.descricao && <div className="text-xs text-slate-500">{t.descricao}</div>}
                </td>
                <td className="num font-medium">
                  {t.receita ? "" : "−"}
                  {brl(t.valor)}
                </td>
                <td className="text-right">
                  <Link href={t.href} className="btn btn-ghost btn-sm" title="Baixa com multa, juros, desconto ou pagamento parcial">
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-end gap-3 border-t border-slate-100 p-4">
        <div>
          <label className="label">Data do pagamento *</label>
          <input type="date" name="dataPagamento" defaultValue={hojeISO()} required className="input" />
        </div>
        <div>
          <label className="label">Forma</label>
          <select name="formaPagamento" defaultValue="PIX" className="input">
            {FORMAS_PAGAMENTO.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </div>
        <SubmitButton className="btn btn-e1">Baixar selecionados ({escolhidos.length})</SubmitButton>
        {escolhidos.length > 0 && (
          <span className="text-sm text-slate-600">
            Líquido selecionado: <strong>{brl(liquido)}</strong>
          </span>
        )}
      </div>
      <p className="px-4 pb-4 text-xs text-slate-500">
        A baixa em lote usa o valor de cada título, sem encargos. Para multa, juros, desconto ou pagamento parcial, abra o lançamento.
      </p>
    </ActionForm>
  );
}
