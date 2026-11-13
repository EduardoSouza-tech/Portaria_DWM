"use client";

import { createContext, startTransition, useActionState, useContext, useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import type { ActionState } from "@/lib/form";
import { parseMoney } from "@/lib/form";

const PendingCtx = createContext(false);

type Action = (state: ActionState, fd: FormData) => Promise<ActionState>;

/**
 * Formulário ligado a uma server action. Mostra erros, mantém os dados digitados
 * em caso de erro e (opcionalmente) limpa os campos após salvar.
 */
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess = false,
}: {
  action: Action;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const ref = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(action, undefined);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    if (!state) return;
    setVisivel(true);
    if (state.ok && resetOnSuccess) ref.current?.reset();
    if (state.ok) {
      const t = setTimeout(() => setVisivel(false), 3500);
      return () => clearTimeout(t);
    }
  }, [state, resetOnSuccess]);

  return (
    <form
      ref={ref}
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => formAction(fd));
      }}
    >
      {visivel && state?.error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>
      )}
      {visivel && state?.ok && (
        <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.ok}</div>
      )}
      <PendingCtx.Provider value={pending}>{children}</PendingCtx.Provider>
    </form>
  );
}

export function SubmitButton({ children, className = "btn btn-primary" }: { children: ReactNode; className?: string }) {
  const pending = useContext(PendingCtx);
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? "Salvando…" : children}
    </button>
  );
}

/** Botão que executa uma server action (com confirmação opcional) */
export function ActionButton({
  action,
  children,
  confirmText,
  className = "btn btn-secondary btn-sm",
  title,
}: {
  action: () => Promise<ActionState | void>;
  children: ReactNode;
  confirmText?: string;
  className?: string;
  title?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      title={title}
      className={className}
      disabled={pending}
      onClick={() => {
        if (confirmText && !window.confirm(confirmText)) return;
        start(async () => {
          const r = await action();
          if (r && r.error) window.alert(r.error);
        });
      }}
    >
      {pending ? "…" : children}
    </button>
  );
}

export function DeleteButton({
  action,
  label = "Excluir",
  confirmText = "Confirma a exclusão? Esta ação não pode ser desfeita.",
}: {
  action: () => Promise<ActionState | void>;
  label?: string;
  confirmText?: string;
}) {
  return (
    <ActionButton action={action} confirmText={confirmText} className="btn btn-danger btn-sm">
      {label}
    </ActionButton>
  );
}

/** Campo de valor em R$ — aceita "1.234,56" e formata ao sair do campo */
export function MoneyInput({
  name,
  defaultValue,
  placeholder = "0,00",
  required,
  id,
  className = "",
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  id?: string;
  className?: string;
}) {
  return (
    <input
      id={id ?? name}
      name={name}
      defaultValue={defaultValue}
      inputMode="decimal"
      placeholder={placeholder}
      required={required}
      autoComplete="off"
      className={`input input-money ${className}`}
      onBlur={(e) => {
        const v = parseMoney(e.currentTarget.value);
        if (v !== null) {
          e.currentTarget.value = v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
      }}
    />
  );
}

/** CNPJ + Razão social do emissor com autocomplete dos já cadastrados */
export function EmissorFields({
  emissores,
  cnpjName,
  razaoName,
  defaultCnpj,
  defaultRazao,
  labelCnpj = "CNPJ do emissor",
  labelRazao = "Razão social do emissor",
}: {
  emissores: { cnpj: string; razaoSocial: string }[];
  cnpjName: string;
  razaoName: string;
  defaultCnpj?: string;
  defaultRazao?: string;
  labelCnpj?: string;
  labelRazao?: string;
}) {
  const razaoRef = useRef<HTMLInputElement>(null);
  const listId = `lst-${cnpjName}`;
  const listRazao = `lst-${razaoName}`;
  const mask = (d: string) =>
    d.length === 14 ? d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5") : d.length === 11 ? d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4") : d;
  return (
    <>
      <div>
        <label className="label" htmlFor={cnpjName}>
          {labelCnpj}
        </label>
        <input
          id={cnpjName}
          name={cnpjName}
          list={listId}
          defaultValue={defaultCnpj ? mask(defaultCnpj) : ""}
          placeholder="00.000.000/0000-00"
          autoComplete="off"
          className="input"
          onChange={(e) => {
            const d = e.currentTarget.value.replace(/\D/g, "");
            const hit = emissores.find((x) => x.cnpj === d);
            if (hit && razaoRef.current && !razaoRef.current.value) razaoRef.current.value = hit.razaoSocial;
          }}
          onBlur={(e) => {
            const d = e.currentTarget.value.replace(/\D/g, "");
            if (d.length === 14 || d.length === 11) e.currentTarget.value = mask(d);
          }}
        />
        <datalist id={listId}>
          {emissores.map((x) => (
            <option key={x.cnpj} value={mask(x.cnpj)}>
              {x.razaoSocial}
            </option>
          ))}
        </datalist>
      </div>
      <div>
        <label className="label" htmlFor={razaoName}>
          {labelRazao}
        </label>
        <input
          ref={razaoRef}
          id={razaoName}
          name={razaoName}
          list={listRazao}
          defaultValue={defaultRazao ?? ""}
          autoComplete="off"
          className="input"
        />
        <datalist id={listRazao}>
          {[...new Set(emissores.map((x) => x.razaoSocial).filter(Boolean))].map((r) => (
            <option key={r} value={r} />
          ))}
        </datalist>
      </div>
    </>
  );
}

export function PrintButton({ label = "Imprimir / PDF" }: { label?: string }) {
  return (
    <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
      {label}
    </button>
  );
}
