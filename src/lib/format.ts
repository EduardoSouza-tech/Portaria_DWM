// Formatação pt-BR (seguro para client e server)

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const numero = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dataFmt = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** Converte Decimal/string/null em number */
export function n(v: unknown): number {
  if (v === null || v === undefined || v === "") return 0;
  const x = typeof v === "number" ? v : Number(v as never);
  return Number.isFinite(x) ? x : 0;
}

/** Converte Decimal em number preservando null */
export function nn(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  return n(v);
}

export function brl(v: unknown): string {
  return moeda.format(n(v));
}

export function dec(v: unknown): string {
  return numero.format(n(v));
}

export function pct(v: number | null | undefined, digits = 2): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return "—";
  return (v * 100).toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits }) + "%";
}

export function dataBR(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const dt = typeof d === "string" ? new Date(d) : d;
  return Number.isNaN(dt.getTime()) ? "—" : dataFmt.format(dt);
}

/** "nov/2026" */
export function mesBR(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const dt = typeof d === "string" ? new Date(d) : d;
  return `${MESES[dt.getUTCMonth()]}/${dt.getUTCFullYear()}`;
}

/** Date -> "YYYY-MM-DD" para <input type="date"> */
export function inputDate(d: Date | null | undefined): string {
  return d ? d.toISOString().slice(0, 10) : "";
}

/** Date -> "YYYY-MM" para <input type="month"> */
export function inputMonth(d: Date | null | undefined): string {
  return d ? d.toISOString().slice(0, 7) : "";
}

/** number -> "1.234,56" para inputs de valor */
export function inputMoney(v: unknown): string {
  if (v === null || v === undefined || v === "") return "";
  return numero.format(n(v));
}

export function onlyDigits(s: string | null | undefined): string {
  return (s ?? "").replace(/\D/g, "");
}

export function docMask(s: string | null | undefined): string {
  const d = onlyDigits(s);
  if (d.length === 14) return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  if (d.length === 11) return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  return s ?? "";
}

/** Meses decorridos entre duas datas (1 casa decimal) */
export function mesesEntre(a: Date | null | undefined, b: Date | null | undefined): number {
  if (!a || !b) return 0;
  const dias = (b.getTime() - a.getTime()) / 86_400_000;
  return Math.max(0, Math.round((dias / 30.4375) * 10) / 10);
}

const hojeFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Data de hoje no Brasil, "YYYY-MM-DD" (igual no servidor e no navegador) */
export function hojeISO(): string {
  return hojeFmt.format(new Date());
}

/** Data de hoje no Brasil como Date (meia-noite UTC, padrão dos campos @db.Date) */
export function hojeUTC(): Date {
  const [a, m, d] = hojeISO().split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d));
}

export function mesKey(d: Date): string {
  return d.toISOString().slice(0, 7);
}
