"use client";

import Link from "next/link";
import { ActionForm, SubmitButton } from "@/components/forms";
import type { ActionState } from "@/lib/form";
import type { Campo } from "./config";

const SPAN: Record<number, string> = {
  1: "sm:col-span-1",
  2: "sm:col-span-2",
  3: "sm:col-span-3",
  4: "sm:col-span-4",
  6: "sm:col-span-6",
};

export function CadastroForm({
  action,
  campos,
  d = {},
  edicao,
  cancelHref,
}: {
  action: (s: ActionState, fd: FormData) => Promise<ActionState>;
  campos: Campo[];
  d?: Record<string, string>;
  edicao: boolean;
  cancelHref: string;
}) {
  return (
    <ActionForm action={action} resetOnSuccess={!edicao} className="grid gap-4 sm:grid-cols-6">
      {campos.map((c) => (
        <div key={c.name} className={SPAN[c.span ?? 2]}>
          <label className="label" htmlFor={c.name}>
            {c.label}
            {c.required ? " *" : ""}
          </label>
          {c.type === "textarea" ? (
            <textarea id={c.name} name={c.name} defaultValue={d[c.name]} className="input" />
          ) : (
            <input
              id={c.name}
              name={c.name}
              type={c.type === "email" ? "email" : "text"}
              inputMode={c.type === "percent" ? "decimal" : undefined}
              required={c.required}
              defaultValue={d[c.name]}
              className="input"
            />
          )}
        </div>
      ))}
      <div className="flex gap-2 sm:col-span-6">
        <SubmitButton>{edicao ? "Salvar alterações" : "Cadastrar"}</SubmitButton>
        {edicao && (
          <Link href={cancelHref} className="btn btn-secondary">
            Cancelar
          </Link>
        )}
      </div>
    </ActionForm>
  );
}
