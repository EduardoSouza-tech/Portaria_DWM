"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const compacto = (v: number) =>
  Math.abs(v) >= 1_000_000
    ? `${(v / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`
    : Math.abs(v) >= 1_000
      ? `${(v / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} mil`
      : String(Math.round(v));

import { CORES } from "@/lib/constants";

export type SerieFluxo = { label: string; e1Saida: number; e1Entrada: number; e2Saida: number; e2Entrada: number };

export function FluxoChart({ data, e1, e2 }: { data: SerieFluxo[]; e1: boolean; e2: boolean }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={compacto} tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} width={56} />
          <Tooltip formatter={(v) => brl(Number(v))} cursor={{ fill: "#f1f5f9" }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {e1 && <Bar dataKey="e1Saida" name="E1 · Aportes/custos" stackId="s" fill={CORES.e1} radius={[0, 0, 0, 0]} />}
          {e2 && <Bar dataKey="e2Saida" name="E2 · Arremates/custos" stackId="s" fill={CORES.e2} />}
          {e1 && <Bar dataKey="e1Entrada" name="E1 · Vendas/aluguéis" stackId="e" fill={CORES.e1Claro} />}
          {e2 && <Bar dataKey="e2Entrada" name="E2 · Vendas" stackId="e" fill={CORES.e2Claro} />}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Barras horizontais (ex.: aportes por etapa, resultado por empreendimento) */
export function BarrasH({
  data,
  cor = CORES.e1,
  colorirSinal = false,
  altura,
}: {
  data: { nome: string; valor: number }[];
  cor?: string;
  colorirSinal?: boolean;
  altura?: number;
}) {
  const h = altura ?? Math.max(160, data.length * 34 + 30);
  return (
    <div className="w-full" style={{ height: h }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <XAxis type="number" tickFormatter={compacto} tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="nome"
            width={150}
            tick={{ fontSize: 11, fill: "#334155" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip formatter={(v) => brl(Number(v))} cursor={{ fill: "#f1f5f9" }} />
          <Bar dataKey="valor" name="Valor" radius={[0, 4, 4, 0]} fill={cor}>
            {data.map((d, i) => (
              <Cell key={i} fill={colorirSinal ? (d.valor >= 0 ? CORES.pos : CORES.neg) : cor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
