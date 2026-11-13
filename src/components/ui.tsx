// Componentes de apresentação (server-safe)
import Link from "next/link";
import type { ReactNode } from "react";
import type { Tone } from "@/lib/constants";
import { brl } from "@/lib/format";

export function PageHeader({
  title,
  subtitle,
  actions,
  empresa,
  back,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  empresa?: 1 | 2 | "ambas";
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="no-print mb-1 inline-block text-xs font-medium text-slate-500 hover:text-slate-800">
            ← {back.label}
          </Link>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {empresa && <EmpresaTag empresa={empresa} />}
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        </div>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="no-print flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmpresaTag({ empresa }: { empresa: 1 | 2 | "ambas" }) {
  if (empresa === 1) return <span className="badge bg-e1-soft text-e1 ring-1 ring-blue-200">Empresa 1 · Obras</span>;
  if (empresa === 2) return <span className="badge bg-e2-soft text-e2 ring-1 ring-amber-200">Empresa 2 · Leilão</span>;
  return <span className="badge bg-teal-50 text-teal-700 ring-1 ring-teal-200">Consolidado</span>;
}

export function Card({
  title,
  actions,
  children,
  className = "",
  bodyClass = "card-body",
}: {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClass?: string;
}) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <div className="card-header">
          {title && <h2 className="card-title">{title}</h2>}
          {actions && <div className="no-print flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "e1" | "e2" | "pos" | "neg" | "brand";
}) {
  const bar =
    tone === "e1"
      ? "bg-e1"
      : tone === "e2"
        ? "bg-e2"
        : tone === "pos"
          ? "bg-emerald-500"
          : tone === "neg"
            ? "bg-red-500"
            : tone === "brand"
              ? "bg-brand"
              : "bg-slate-300";
  return (
    <div className="card relative overflow-hidden px-4 py-3.5">
      <span className={`absolute inset-y-0 left-0 w-1 ${bar}`} />
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums text-slate-900">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

export function Badge({ tone = "gray", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">{children}</div>;
}

export function Field({
  label,
  children,
  className = "",
  hint,
  htmlFor,
}: {
  label: ReactNode;
  children: ReactNode;
  className?: string;
  hint?: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className={className}>
      <label className="label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

/** Valor monetário com cor (positivo/negativo) */
export function Money({ v, colored = false, dash = false }: { v: number | null | undefined; colored?: boolean; dash?: boolean }) {
  if (v === null || v === undefined) return <span className="text-slate-400">{dash ? "—" : brl(0)}</span>;
  const cls = colored ? (v > 0 ? "pos" : v < 0 ? "neg" : "") : "";
  return <span className={`tabular-nums ${cls}`}>{brl(v)}</span>;
}

export function Tabs({ items, active }: { items: { href: string; label: string; key: string }[]; active: string }) {
  return (
    <nav className="no-print mb-6 flex gap-1 overflow-x-auto border-b border-slate-200">
      {items.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={`-mb-px whitespace-nowrap border-b-2 px-3.5 py-2 text-sm font-medium ${
            t.key === active ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

export function KV({ k, v }: { k: ReactNode; v: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-1.5 text-sm last:border-0">
      <span className="text-slate-500">{k}</span>
      <span className="text-right font-medium text-slate-800">{v ?? "—"}</span>
    </div>
  );
}
