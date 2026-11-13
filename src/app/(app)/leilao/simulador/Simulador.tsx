"use client";

import { useMemo, useState } from "react";
import { ActionForm, SubmitButton } from "@/components/forms";
import { calcSimulacao, lanceMaximo, type SimInput } from "@/lib/calc";
import type { ActionState } from "@/lib/form";
import { parseMoney } from "@/lib/form";

const fmt = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const pct = (v: number | null) =>
  v === null || !Number.isFinite(v) ? "—" : (v * 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%";

type Campos = Record<Exclude<keyof SimInput, "baseIr">, string>;

export function Simulador({
  action,
  inicial,
  id,
  nome,
  observacoes,
}: {
  action: (s: ActionState, fd: FormData) => Promise<ActionState>;
  inicial: SimInput;
  id?: number;
  nome?: string;
  observacoes?: string;
}) {
  const [c, setC] = useState<Campos>(() => ({
    valorArremate: inicial.valorArremate ? fmt(inicial.valorArremate) : "",
    valorVendaEstimado: inicial.valorVendaEstimado ? fmt(inicial.valorVendaEstimado) : "",
    pctLeiloeiro: String(inicial.pctLeiloeiro).replace(".", ","),
    pctItbi: String(inicial.pctItbi).replace(".", ","),
    pctRegistro: String(inicial.pctRegistro).replace(".", ","),
    pctIr: String(inicial.pctIr).replace(".", ","),
    pctComissaoVenda: String(inicial.pctComissaoVenda).replace(".", ","),
    advogado: fmt(inicial.advogado),
    pctReforma: String(inicial.pctReforma).replace(".", ","),
    debitosAto: inicial.debitosAto ? fmt(inicial.debitosAto) : "",
    custoMensal: inicial.custoMensal ? fmt(inicial.custoMensal) : "",
    prazoMeses: String(inicial.prazoMeses),
  }));
  const [baseIr, setBaseIr] = useState<"LUCRO" | "VENDA">(inicial.baseIr);
  const [roiAlvo, setRoiAlvo] = useState("20");

  const input: SimInput = useMemo(() => {
    const p = (k: keyof Campos) => parseMoney(c[k]) ?? 0;
    return {
      valorArremate: p("valorArremate"),
      valorVendaEstimado: p("valorVendaEstimado"),
      pctLeiloeiro: p("pctLeiloeiro"),
      pctItbi: p("pctItbi"),
      pctRegistro: p("pctRegistro"),
      pctIr: p("pctIr"),
      baseIr,
      pctComissaoVenda: p("pctComissaoVenda"),
      advogado: p("advogado"),
      pctReforma: p("pctReforma"),
      debitosAto: p("debitosAto"),
      custoMensal: p("custoMensal"),
      prazoMeses: Math.max(0, Math.round(p("prazoMeses"))),
    };
  }, [c, baseIr]);

  const r = calcSimulacao(input);
  const alvo = (parseMoney(roiAlvo) ?? 0) / 100;
  const lance = lanceMaximo(input, alvo);

  const set = (k: keyof Campos) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.currentTarget.value;
    setC((s) => ({ ...s, [k]: v }));
  };
  const blurMoney = (k: keyof Campos) => () => {
    const v = parseMoney(c[k]);
    if (v !== null) setC((s) => ({ ...s, [k]: fmt(v) }));
  };

  const money = (k: keyof Campos, extra?: Partial<React.InputHTMLAttributes<HTMLInputElement>>) => (
    <input name={k} value={c[k]} onChange={set(k)} onBlur={blurMoney(k)} inputMode="decimal" placeholder="0,00" className="input input-money py-1.5" {...extra} />
  );
  const perc = (k: keyof Campos) => (
    <div className="relative">
      <input name={k} value={c[k]} onChange={set(k)} inputMode="decimal" className="input input-money py-1.5 pr-7" />
      <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-xs text-slate-400">%</span>
    </div>
  );

  return (
    <ActionForm action={action} className="grid gap-6 xl:grid-cols-5">
      {id && <input type="hidden" name="id" value={id} />}
      <input type="hidden" name="baseIr" value={baseIr} />

      <section className="card xl:col-span-3">
        <div className="card-header">
          <h2 className="card-title">Parâmetros da simulação</h2>
          <span className="text-xs text-slate-500">percentuais editáveis</span>
        </div>
        <div className="card-body">
          <Linha label="Valor de arremate">{money("valorArremate")}</Linha>
          <Linha label="Valor da venda estimado">{money("valorVendaEstimado")}</Linha>
          <div className="h-3" />
          <Linha label="Comissão do leiloeiro" valor={r.comissaoLeiloeiro}>
            {perc("pctLeiloeiro")}
          </Linha>
          <Linha label="ITBI" valor={r.itbi}>
            {perc("pctItbi")}
          </Linha>
          <Linha label="Registro" valor={r.registro}>
            {perc("pctRegistro")}
          </Linha>
          <Linha
            label={
              <span>
                Imposto de renda
                <select value={baseIr} onChange={(e) => setBaseIr(e.currentTarget.value as "LUCRO" | "VENDA")} className="ml-2 rounded border border-slate-300 px-1 py-0.5 text-xs">
                  <option value="LUCRO">sobre o lucro</option>
                  <option value="VENDA">sobre a venda</option>
                </select>
              </span>
            }
            valor={r.impostoRenda}
          >
            {perc("pctIr")}
          </Linha>
          <Linha label="Comissão de venda" valor={r.comissaoVenda}>
            {perc("pctComissaoVenda")}
          </Linha>
          <Linha label="Advogado" valor={r.advogado}>
            {money("advogado")}
          </Linha>
          <div className="h-3" />
          <Linha label="Reformas (média sobre o arremate)" valor={r.reformas}>
            {perc("pctReforma")}
          </Linha>
          <Linha label="Custos (Cond./IPTU)* — débitos no ato">{money("debitosAto")}</Linha>
          <Linha label="Custos (Cond./IPTU)* — previsão mensal" valor={r.custosPeriodo}>
            {money("custoMensal")}
          </Linha>
          <div className="h-3" />
          <Linha label="Prazo estimado para venda (meses)">
            <input name="prazoMeses" value={c.prazoMeses} onChange={set("prazoMeses")} inputMode="numeric" className="input input-money py-1.5" />
          </Linha>
          <p className="mt-4 text-xs text-slate-500">
            * Lançar custos como IPTU e condomínio que devem ser pagos no ato do arremate, se for o caso. Lançar previsão de pagamento
            para um prazo de venda em até 12 meses (a previsão mensal é multiplicada pelo prazo).
          </p>
        </div>
      </section>

      <div className="space-y-6 xl:col-span-2">
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Resultado</h2>
          </div>
          <div className="card-body space-y-1.5 text-sm">
            <Row k="Custo de aquisição" v={brl(r.custoAquisicao)} />
            <Row k="Reformas" v={brl(r.reformas)} />
            <Row k="Custos até a venda (Cond./IPTU)" v={brl(r.custosPeriodo)} />
            <Row k="Investimento total" v={brl(r.investimento)} forte />
            <Row k="Venda estimada" v={brl(input.valorVendaEstimado)} />
            <Row k="(−) Comissão de venda" v={brl(r.comissaoVenda)} />
            <Row k="Lucro antes do IR" v={brl(r.lucroAntesIr)} />
            <Row k="(−) Imposto de renda" v={brl(r.impostoRenda)} />
            <div className="mt-3 rounded-lg bg-slate-900 p-4 text-white">
              <div className="text-xs text-slate-400">Resultado</div>
              <div className={`text-3xl font-semibold tabular-nums ${r.resultado < 0 ? "text-red-300" : "text-emerald-300"}`}>{brl(r.resultado)}</div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-400">ROI</div>
                  <div className="text-lg font-semibold">{pct(r.roi)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Rendimento ao mês</div>
                  <div className="text-lg font-semibold">{pct(r.rendimentoMes)}</div>
                  <div className="text-[11px] text-slate-400">composto: {pct(r.rendimentoMesComposto)}</div>
                </div>
              </div>
            </div>
            <p className="pt-1 text-[11px] text-slate-400">ROI = resultado ÷ investimento total. Rendimento ao mês = ROI ÷ prazo.</p>
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Lance máximo</h2>
          </div>
          <div className="card-body">
            <div className="flex items-end gap-3">
              <div className="w-32">
                <label className="label">ROI alvo</label>
                <div className="relative">
                  <input value={roiAlvo} onChange={(e) => setRoiAlvo(e.currentTarget.value)} inputMode="decimal" className="input input-money pr-7" />
                  <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-xs text-slate-400">%</span>
                </div>
              </div>
              <div className="flex-1 text-right">
                <div className="text-xs text-slate-500">Arremate máximo para atingir o ROI</div>
                <div className="text-xl font-semibold tabular-nums">{lance === null ? "—" : brl(lance)}</div>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">Mantém os demais parâmetros e calcula o maior arremate que ainda entrega o ROI informado.</p>
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <h2 className="card-title">{id ? "Atualizar simulação" : "Salvar simulação"}</h2>
          </div>
          <div className="card-body space-y-3">
            <div>
              <label className="label">Nome *</label>
              <input name="nome" required defaultValue={nome} placeholder="Ex.: Apto Centro — leilão 15/12" className="input" />
            </div>
            <div>
              <label className="label">Observações</label>
              <textarea name="observacoes" defaultValue={observacoes} className="input" />
            </div>
            <SubmitButton className="btn btn-e2">{id ? "Salvar alterações" : "Salvar simulação"}</SubmitButton>
          </div>
        </section>
      </div>
    </ActionForm>
  );
}

function Linha({ label, children, valor }: { label: React.ReactNode; children?: React.ReactNode; valor?: number }) {
  return (
    <div className="grid grid-cols-[1fr_8rem] items-center gap-x-3 gap-y-1 border-b border-dashed border-slate-200 py-2 text-sm sm:grid-cols-[1fr_9rem_9rem]">
      <span className="col-span-2 text-slate-700 sm:col-span-1">{label}</span>
      <span>{children}</span>
      <span className="text-right tabular-nums">{valor !== undefined ? brl(valor) : ""}</span>
    </div>
  );
}

function Row({ k, v, forte }: { k: string; v: string; forte?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 ${forte ? "border-t border-slate-200 pt-1.5 font-semibold" : ""}`}>
      <span className="text-slate-500">{k}</span>
      <span className="tabular-nums">{v}</span>
    </div>
  );
}
