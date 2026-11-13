"use client";

import Link from "next/link";
import { useState } from "react";
import { ActionForm, EmissorFields, MoneyInput, SubmitButton } from "@/components/forms";
import { GRUPOS_CUSTO, GRUPOS_ORDEM, type GrupoCusto } from "@/lib/constants";
import type { ActionState } from "@/lib/form";
import { hojeISO } from "@/lib/format";

export type CustoDefaults = {
  grupo: GrupoCusto;
  categoria: string;
  data: string;
  valor: string;
  descricao: string;
  nfNumero: string;
  fornecedorCnpj: string;
  fornecedorRazaoSocial: string;
};

export function CustoForm({
  action,
  emissores,
  d,
  cancelHref,
}: {
  action: (s: ActionState, fd: FormData) => Promise<ActionState>;
  emissores: { cnpj: string; razaoSocial: string }[];
  /** preenchido = edição de um custo existente */
  d?: CustoDefaults;
  cancelHref?: string;
}) {
  const [grupo, setGrupo] = useState<GrupoCusto>(d?.grupo ?? "AQUISICAO");
  // mantém um item fora da lista padrão (ex.: digitado em versão anterior) selecionável na edição
  const categorias = GRUPOS_CUSTO[grupo].categorias;
  const opcoes = d && grupo === d.grupo && !categorias.includes(d.categoria) ? [d.categoria, ...categorias] : categorias;
  return (
    <ActionForm action={action} resetOnSuccess={!d} className="grid gap-4 sm:grid-cols-6">
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
        <select name="categoria" key={grupo} required className="input" defaultValue={d && grupo === d.grupo ? d.categoria : undefined}>
          {opcoes.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Data</label>
        <input type="date" name="data" defaultValue={d ? d.data : hojeISO()} className="input" />
      </div>
      <div>
        <label className="label">Valor (R$) *</label>
        <MoneyInput name="valor" required defaultValue={d?.valor} />
      </div>
      <div className="sm:col-span-3">
        <label className="label">Descrição</label>
        <input name="descricao" defaultValue={d?.descricao} className="input" />
      </div>
      <div className="sm:col-span-3">
        <label className="label">Nº da nota fiscal / recibo</label>
        <input name="nfNumero" defaultValue={d?.nfNumero} className="input" />
      </div>
      <div className="grid gap-4 sm:col-span-6 sm:grid-cols-2">
        <EmissorFields
          emissores={emissores}
          cnpjName="fornecedorCnpj"
          razaoName="fornecedorRazaoSocial"
          labelCnpj="CNPJ/CPF do fornecedor"
          labelRazao="Fornecedor / razão social"
          defaultCnpj={d?.fornecedorCnpj}
          defaultRazao={d?.fornecedorRazaoSocial}
        />
      </div>
      <div className="flex gap-2 sm:col-span-6">
        <SubmitButton className="btn btn-e2">{d ? "Salvar alterações" : "+ Lançar custo"}</SubmitButton>
        {cancelHref && (
          <Link href={cancelHref} className="btn btn-secondary">
            Cancelar
          </Link>
        )}
      </div>
    </ActionForm>
  );
}
