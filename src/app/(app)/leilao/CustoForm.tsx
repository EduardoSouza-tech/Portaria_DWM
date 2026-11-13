"use client";

import { useState } from "react";
import { ActionForm, EmissorFields, MoneyInput, SubmitButton } from "@/components/forms";
import { GRUPOS_CUSTO, GRUPOS_ORDEM, type GrupoCusto } from "@/lib/constants";
import type { ActionState } from "@/lib/form";
import { hojeISO } from "@/lib/format";

export function CustoForm({
  action,
  emissores,
}: {
  action: (s: ActionState, fd: FormData) => Promise<ActionState>;
  emissores: { cnpj: string; razaoSocial: string }[];
}) {
  const [grupo, setGrupo] = useState<GrupoCusto>("AQUISICAO");
  return (
    <ActionForm action={action} resetOnSuccess className="grid gap-4 sm:grid-cols-6">
      <div className="sm:col-span-2">
        <label className="label">Grupo *</label>
        <select name="grupo" value={grupo} onChange={(e) => setGrupo(e.currentTarget.value as GrupoCusto)} className="input">
          {GRUPOS_ORDEM.map((g) => (
            <option key={g} value={g}>
              {GRUPOS_CUSTO[g].label}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="label">Item *</label>
        <select name="categoria" key={grupo} required className="input">
          {GRUPOS_CUSTO[grupo].categorias.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Data</label>
        <input type="date" name="data" defaultValue={hojeISO()} className="input" />
      </div>
      <div>
        <label className="label">Valor (R$) *</label>
        <MoneyInput name="valor" required />
      </div>
      <div className="sm:col-span-3">
        <label className="label">Descrição</label>
        <input name="descricao" className="input" />
      </div>
      <div className="sm:col-span-3">
        <label className="label">Nº da nota fiscal / recibo</label>
        <input name="nfNumero" className="input" />
      </div>
      <div className="grid gap-4 sm:col-span-6 sm:grid-cols-2">
        <EmissorFields
          emissores={emissores}
          cnpjName="fornecedorCnpj"
          razaoName="fornecedorRazaoSocial"
          labelCnpj="CNPJ/CPF do fornecedor"
          labelRazao="Fornecedor / razão social"
        />
      </div>
      <div className="sm:col-span-6">
        <SubmitButton className="btn btn-e2">+ Lançar custo</SubmitButton>
      </div>
    </ActionForm>
  );
}
