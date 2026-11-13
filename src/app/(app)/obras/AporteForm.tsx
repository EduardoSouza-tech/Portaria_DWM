"use client";

import Link from "next/link";
import { ActionForm, EmissorFields, MoneyInput, SubmitButton } from "@/components/forms";
import { ETAPAS_OBRA, FORMAS_PAGAMENTO } from "@/lib/constants";
import type { ActionState } from "@/lib/form";
import { hojeISO } from "@/lib/format";

export type AporteDefaults = {
  data?: string;
  valor?: string;
  etapa?: string;
  descricao?: string;
  contrapartida?: string;
  formaPagamento?: string;
  emissorCnpj?: string;
  emissorRazaoSocial?: string;
  nfNumero?: string;
};

export function AporteForm({
  action,
  d = {},
  emissores,
  etapasUsadas = [],
  edicao = false,
  cancelHref,
}: {
  action: (s: ActionState, fd: FormData) => Promise<ActionState>;
  d?: AporteDefaults;
  emissores: { cnpj: string; razaoSocial: string }[];
  etapasUsadas?: string[];
  edicao?: boolean;
  cancelHref?: string;
}) {
  const etapas = [...new Set([...ETAPAS_OBRA, ...etapasUsadas])];
  return (
    <ActionForm action={action} resetOnSuccess={!edicao} className="grid gap-4 sm:grid-cols-6">
      <div className="sm:col-span-1">
        <label className="label">Data *</label>
        <input name="data" type="date" required defaultValue={d.data ?? hojeISO()} className="input" />
      </div>
      <div className="sm:col-span-1">
        <label className="label">Valor (R$) *</label>
        <MoneyInput name="valor" required defaultValue={d.valor} />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Etapa da obra</label>
        <input name="etapa" list="etapas-obra" defaultValue={d.etapa} placeholder="Ex.: Fundação" className="input" autoComplete="off" />
        <datalist id="etapas-obra">
          {etapas.map((e) => (
            <option key={e} value={e} />
          ))}
        </datalist>
      </div>
      <div className="sm:col-span-2">
        <label className="label">Contrapartida</label>
        <input
          name="contrapartida"
          defaultValue={d.contrapartida}
          placeholder="Conta / sócio / origem do recurso"
          className="input"
        />
      </div>
      <div className="sm:col-span-3">
        <label className="label">Descrição</label>
        <input name="descricao" defaultValue={d.descricao} placeholder="Ex.: Concreto usinado 12 m³" className="input" />
      </div>
      <div className="sm:col-span-1">
        <label className="label">Forma de pagamento</label>
        <select name="formaPagamento" defaultValue={d.formaPagamento ?? ""} className="input">
          <option value="">—</option>
          {FORMAS_PAGAMENTO.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="label">Nº da nota fiscal</label>
        <input name="nfNumero" defaultValue={d.nfNumero} className="input" />
      </div>
      <div className="grid gap-4 sm:col-span-6 sm:grid-cols-2">
        <EmissorFields
          emissores={emissores}
          cnpjName="emissorCnpj"
          razaoName="emissorRazaoSocial"
          defaultCnpj={d.emissorCnpj}
          defaultRazao={d.emissorRazaoSocial}
        />
      </div>
      <div className="flex gap-2 sm:col-span-6">
        <SubmitButton className="btn btn-e1">{edicao ? "Salvar alterações" : "Lançar aporte"}</SubmitButton>
        {cancelHref && (
          <Link href={cancelHref} className="btn btn-secondary">
            Cancelar
          </Link>
        )}
      </div>
    </ActionForm>
  );
}
