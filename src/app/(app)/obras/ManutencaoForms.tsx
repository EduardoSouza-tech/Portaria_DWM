"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ActionForm, MoneyInput, SubmitButton } from "@/components/forms";
import { diasAtraso, encargosAtraso } from "@/lib/calc";
import { FORMAS_PAGAMENTO, TIPO_LANC_LOCACAO, type TipoLancLocacao } from "@/lib/constants";
import { parseDate, parseMoney, type ActionState } from "@/lib/form";
import { hojeISO } from "@/lib/format";

type Act = (s: ActionState, fd: FormData) => Promise<ActionState>;

const r2 = (v: number) => Math.round(v * 100) / 100;
const dec = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ------------------------------------------------------------
// Baixa manual (recebimento / pagamento)
// ------------------------------------------------------------
export function BaixaForm({
  action,
  valor,
  vencimento,
  multaPct,
  jurosMesPct,
  receita,
}: {
  action: Act;
  valor: number;
  /** "YYYY-MM-DD" */
  vencimento: string | null;
  multaPct: number | null;
  jurosMesPct: number | null;
  receita: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const tocados = useRef(new Set<string>());
  const [r, setR] = useState({ dias: 0, principal: valor, total: valor, saldo: 0 });
  const temRegra = (multaPct ?? 0) > 0 || (jurosMesPct ?? 0) > 0;

  const campo = (nome: string) => box.current?.querySelector<HTMLInputElement>(`[name="${nome}"]`) ?? null;
  const ler = (nome: string) => parseMoney(campo(nome)?.value) ?? 0;

  function recalcular(e?: FormEvent) {
    const nome = (e?.target as HTMLInputElement | undefined)?.name;
    if (nome === "multa" || nome === "juros") tocados.current.add(nome);
    const pagoEm = parseDate(campo("dataPagamento")?.value);
    const venc = parseDate(vencimento);
    const dias = pagoEm && venc ? diasAtraso(venc, pagoEm) : 0;
    const principal = ler("principal");
    // sugere multa/juros do contrato enquanto o usuário não digitar outro valor
    if (!nome || nome === "dataPagamento" || nome === "principal") {
      const enc = encargosAtraso(principal, dias, multaPct, jurosMesPct);
      for (const k of ["multa", "juros"] as const) {
        const el = campo(k);
        if (el && !tocados.current.has(k)) el.value = enc[k] ? dec(enc[k]) : "";
      }
    }
    const total = r2(principal + ler("multa") + ler("juros") - ler("desconto"));
    setR({ dias, principal, total, saldo: r2(valor - principal) });
  }

  useEffect(() => {
    recalcular();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verbo = receita ? "recebimento" : "pagamento";
  return (
    <ActionForm action={action} className="space-y-4">
      <div ref={box} onInput={recalcular} className="grid gap-3 sm:grid-cols-6">
        <div>
          <label className="label">Data do {verbo} *</label>
          <input type="date" name="dataPagamento" defaultValue={hojeISO()} required className="input" />
        </div>
        <div>
          <label className="label">Principal (R$) *</label>
          <MoneyInput name="principal" required defaultValue={dec(valor)} />
        </div>
        <div>
          <label className="label">Multa (R$)</label>
          <MoneyInput name="multa" />
        </div>
        <div>
          <label className="label">Juros (R$)</label>
          <MoneyInput name="juros" />
        </div>
        <div>
          <label className="label">Desconto (R$)</label>
          <MoneyInput name="desconto" />
        </div>
        <div>
          <label className="label">Forma</label>
          <select name="formaPagamento" defaultValue="PIX" className="input">
            {FORMAS_PAGAMENTO.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </div>
        <div className={r.saldo > 0 ? "sm:col-span-4" : "sm:col-span-6"}>
          <label className="label">Observação</label>
          <input name="obsPagamento" className="input" placeholder="Comprovante, conta, quem pagou…" />
        </div>
        {r.saldo > 0 && (
          <div className="sm:col-span-2">
            <label className="label">Vencimento do saldo</label>
            <input type="date" name="vencimentoSaldo" defaultValue={vencimento ?? ""} className="input" />
          </div>
        )}
      </div>

      <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span>
            {r.dias > 0 ? <strong className="text-red-600">{r.dias} dia(s) de atraso</strong> : "Pagamento em dia"}
            {r.dias > 0 &&
              (temRegra
                ? ` · multa de ${(multaPct ?? 0).toLocaleString("pt-BR")}% e juros de ${(jurosMesPct ?? 0).toLocaleString("pt-BR")}% a.m. do contrato`
                : " · cadastre multa e juros no contrato para o sistema sugerir os encargos")}
          </span>
          <span>
            Total {receita ? "recebido" : "pago"}: <strong className="text-base text-slate-900">{brl(r.total)}</strong>
          </span>
        </div>
        {r.saldo > 0 && (
          <div className="mt-1 text-amber-700">
            Baixa parcial: o saldo de {brl(r.saldo)} continua em aberto num novo lançamento.
          </div>
        )}
        {r.saldo < 0 && <div className="mt-1 text-red-600">O principal passou do valor do título. Lance o excedente como multa ou juros.</div>}
      </div>

      <SubmitButton className="btn btn-e1">Confirmar {verbo}</SubmitButton>
    </ActionForm>
  );
}

// ------------------------------------------------------------
// Edição do lançamento (correção / prorrogação de vencimento)
// ------------------------------------------------------------
export function LancamentoEditForm({
  action,
  d,
}: {
  action: Act;
  d: { competencia: string; tipo: TipoLancLocacao; descricao: string; valor: string; vencimento: string };
}) {
  return (
    <ActionForm action={action} className="grid gap-3 sm:grid-cols-6">
      <div>
        <label className="label">Competência *</label>
        <input type="month" name="competencia" defaultValue={d.competencia} required className="input" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Tipo *</label>
        <select name="tipo" required className="input" defaultValue={d.tipo}>
          {(Object.keys(TIPO_LANC_LOCACAO) as TipoLancLocacao[]).map((t) => (
            <option key={t} value={t}>
              {TIPO_LANC_LOCACAO[t].receita ? "↑ " : "↓ "}
              {TIPO_LANC_LOCACAO[t].label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Valor (R$) *</label>
        <MoneyInput name="valor" required defaultValue={d.valor} />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Vencimento</label>
        <input type="date" name="vencimento" defaultValue={d.vencimento} className="input" />
      </div>
      <div className="sm:col-span-6">
        <label className="label">Descrição</label>
        <input name="descricao" defaultValue={d.descricao} className="input" />
      </div>
      <div className="sm:col-span-6">
        <SubmitButton className="btn btn-secondary">Salvar alterações</SubmitButton>
      </div>
    </ActionForm>
  );
}

// ------------------------------------------------------------
// Reajuste do aluguel
// ------------------------------------------------------------
export function ReajusteForm({
  action,
  valorAtual,
  aPartirDe,
  indice,
}: {
  action: Act;
  valorAtual: number;
  /** "YYYY-MM" */
  aPartirDe: string;
  indice: string;
}) {
  const [pct, setPct] = useState<number | null>(null);
  const [novo, setNovo] = useState<number | null>(null);
  // após aplicar (ou desfazer), o valor atual muda e o formulário é limpo: zera a prévia
  useEffect(() => {
    setPct(null);
    setNovo(null);
  }, [valorAtual]);
  const previsto = novo ?? (pct !== null ? r2(valorAtual * (1 + pct / 100)) : null);
  return (
    <ActionForm action={action} resetOnSuccess className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-6">
        <div>
          <label className="label">A partir de *</label>
          <input type="month" name="aPartirDe" defaultValue={aPartirDe} required className="input" />
        </div>
        <div>
          <label className="label">Índice</label>
          <input name="indice" list="indices-reajuste" defaultValue={indice} className="input" />
          <datalist id="indices-reajuste">
            <option value="IGP-M" />
            <option value="IPCA" />
            <option value="INPC" />
            <option value="IVAR" />
            <option value="Acordo" />
          </datalist>
        </div>
        <div>
          <label className="label">Percentual (%)</label>
          <input
            name="percentual"
            inputMode="decimal"
            placeholder="Ex.: 4,5"
            className="input"
            onInput={(e) => setPct(parseMoney(e.currentTarget.value))}
          />
        </div>
        <div>
          <label className="label">…ou novo valor (R$)</label>
          <input
            name="valorNovo"
            inputMode="decimal"
            placeholder="0,00"
            className="input input-money"
            onInput={(e) => setNovo(parseMoney(e.currentTarget.value))}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Observação</label>
          <input name="observacoes" className="input" placeholder="Ex.: acumulado 12 meses" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="atualizarPendentes" defaultChecked className="h-4 w-4" />
        Atualizar os aluguéis pendentes dessa competência em diante (e a comissão da imobiliária)
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton className="btn btn-e1">Aplicar reajuste</SubmitButton>
        <span className="text-sm text-slate-500">
          Atual: {brl(valorAtual)}
          {previsto !== null && previsto > 0 && (
            <>
              {" "}
              → <strong className="text-slate-800">{brl(previsto)}</strong>
              {novo !== null && valorAtual > 0 && ` (${((novo / valorAtual - 1) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%)`}
            </>
          )}
        </span>
      </div>
    </ActionForm>
  );
}

// ------------------------------------------------------------
// Encerramento do contrato
// ------------------------------------------------------------
export function EncerrarForm({ action }: { action: Act }) {
  return (
    <ActionForm action={action} className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="label">Data de saída / encerramento *</label>
          <input type="date" name="dataFim" defaultValue={hojeISO()} required className="input" />
        </div>
        <SubmitButton className="btn btn-danger">Encerrar contrato</SubmitButton>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="cancelarPendentes" defaultChecked className="h-4 w-4" />
        Cancelar os lançamentos pendentes de competências posteriores ao mês de saída
      </label>
      <p className="text-xs text-slate-500">
        Aluguel proporcional do último mês: ajuste o valor do lançamento em “Editar”. Para reativar, marque “Contrato ativo” em Editar dados do contrato.
      </p>
    </ActionForm>
  );
}
