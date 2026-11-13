// Leitura e validação de campos de formulário (server actions)

export class FormError extends Error {}

export type ActionState = { error?: string; ok?: string } | undefined;

export function str(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

export function req(fd: FormData, key: string, label: string): string {
  const v = str(fd, key);
  if (!v) throw new FormError(`Informe o campo "${label}".`);
  return v;
}

/** Aceita "1.234,56", "1234,56", "1234.56", "R$ 1.234,56" */
export function parseMoney(raw: string | null | undefined): number | null {
  if (raw === null || raw === undefined) return null;
  let s = String(raw).replace(/R\$|\s|%/g, "").trim();
  if (s === "") return null;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  const v = Number(s);
  return Number.isFinite(v) ? v : null;
}

export function money(fd: FormData, key: string): number | null {
  return parseMoney(str(fd, key));
}

export function moneyReq(fd: FormData, key: string, label: string): number {
  const v = money(fd, key);
  if (v === null) throw new FormError(`Informe um valor válido em "${label}".`);
  return v;
}

export function int(fd: FormData, key: string): number | null {
  const v = str(fd, key);
  if (v === null) return null;
  const x = parseInt(v, 10);
  return Number.isFinite(x) ? x : null;
}

export function parseDate(v: string | null | undefined): Date | null {
  if (!v) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v.trim());
  if (!m) return null;
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
}

export function date(fd: FormData, key: string): Date | null {
  return parseDate(str(fd, key));
}

export function dateReq(fd: FormData, key: string, label: string): Date {
  const d = date(fd, key);
  if (!d) throw new FormError(`Informe uma data válida em "${label}".`);
  return d;
}

/** "YYYY-MM" -> primeiro dia do mês (UTC) */
export function parseMonth(v: string | null | undefined): Date | null {
  if (!v) return null;
  const m = /^(\d{4})-(\d{2})/.exec(v.trim());
  if (!m) return null;
  return new Date(Date.UTC(+m[1], +m[2] - 1, 1));
}

export function bool(fd: FormData, key: string): boolean {
  const v = fd.get(key);
  return v === "on" || v === "true" || v === "1";
}

/** Converte exceções em mensagem amigável para o formulário */
export function toActionError(e: unknown): ActionState {
  if (e instanceof FormError) return { error: e.message };
  // redirect()/notFound() do Next precisam propagar
  if (e && typeof e === "object" && "digest" in e && String((e as { digest: unknown }).digest).startsWith("NEXT_")) {
    throw e;
  }
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.includes("Unique constraint")) return { error: "Já existe um registro com este número/código/e-mail." };
  if (msg.includes("Foreign key constraint") || msg.includes("violates RESTRICT") || msg.includes("P2003")) {
    return { error: "Este registro está vinculado a outros lançamentos e não pode ser excluído." };
  }
  console.error(e);
  return { error: "Não foi possível salvar. Verifique os dados e tente novamente." };
}
