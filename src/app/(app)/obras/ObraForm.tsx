"use client";

import Link from "next/link";
import { ActionForm, MoneyInput, SubmitButton } from "@/components/forms";
import { STATUS_OBRA, UFS, type StatusObra } from "@/lib/constants";
import type { ActionState } from "@/lib/form";

export type ObraDefaults = {
  numero?: number;
  nome?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  matricula?: string;
  cartorio?: string;
  inscricaoIptu?: string;
  construtoraId?: number | null;
  custoPrevisto?: string;
  dataInicio?: string;
  dataTerminoPrevista?: string;
  dataTermino?: string;
  status?: StatusObra;
  observacoes?: string;
};

export function ObraForm({
  action,
  d = {},
  construtoras,
  cancelHref,
}: {
  action: (s: ActionState, fd: FormData) => Promise<ActionState>;
  d?: ObraDefaults;
  construtoras: { id: number; razaoSocial: string }[];
  cancelHref: string;
}) {
  return (
    <ActionForm action={action} className="space-y-6">
      <section className="card">
        <div className="card-header">
          <h2 className="card-title">Identificação da unidade</h2>
        </div>
        <div className="card-body grid gap-4 sm:grid-cols-6">
          <div className="sm:col-span-1">
            <label className="label">Nº da obra *</label>
            <input name="numero" type="number" min={1} required defaultValue={d.numero} className="input" />
          </div>
          <div className="sm:col-span-3">
            <label className="label">Identificação / nome da unidade *</label>
            <input name="nome" required defaultValue={d.nome} placeholder="Ex.: Residencial Aurora — Casa 02" className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Status</label>
            <select name="status" defaultValue={d.status ?? "PLANEJAMENTO"} className="input">
              {(Object.keys(STATUS_OBRA) as StatusObra[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_OBRA[s].label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-4">
            <label className="label">Endereço</label>
            <input name="endereco" defaultValue={d.endereco} placeholder="Rua, número, complemento" className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Bairro</label>
            <input name="bairro" defaultValue={d.bairro} className="input" />
          </div>
          <div className="sm:col-span-3">
            <label className="label">Cidade</label>
            <input name="cidade" defaultValue={d.cidade} className="input" />
          </div>
          <div className="sm:col-span-1">
            <label className="label">UF</label>
            <select name="uf" defaultValue={d.uf ?? ""} className="input">
              <option value="">—</option>
              {UFS.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">CEP</label>
            <input name="cep" defaultValue={d.cep} placeholder="00000-000" className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Matrícula</label>
            <input name="matricula" defaultValue={d.matricula} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Cartório de registro</label>
            <input name="cartorio" defaultValue={d.cartorio} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Inscrição do IPTU</label>
            <input name="inscricaoIptu" defaultValue={d.inscricaoIptu} className="input" />
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <h2 className="card-title">Condução da obra, custo e prazos</h2>
        </div>
        <div className="card-body grid gap-4 sm:grid-cols-6">
          <div className="sm:col-span-2">
            <label className="label">Empresa que conduz a obra</label>
            <select name="construtoraId" defaultValue={d.construtoraId ?? ""} className="input">
              <option value="">— selecione —</option>
              {construtoras.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.razaoSocial}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">…ou cadastre uma nova (razão social)</label>
            <input name="novaConstrutora" placeholder="Nova construtora" className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">CNPJ da nova construtora</label>
            <input name="novaConstrutoraCnpj" placeholder="00.000.000/0000-00" className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Custo previsto (R$)</label>
            <MoneyInput name="custoPrevisto" defaultValue={d.custoPrevisto} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Data de início</label>
            <input name="dataInicio" type="date" defaultValue={d.dataInicio} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Término previsto</label>
            <input name="dataTerminoPrevista" type="date" defaultValue={d.dataTerminoPrevista} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Data de término (real)</label>
            <input name="dataTermino" type="date" defaultValue={d.dataTermino} className="input" />
          </div>
          <div className="sm:col-span-4">
            <label className="label">Observações</label>
            <textarea name="observacoes" defaultValue={d.observacoes} className="input" />
          </div>
        </div>
      </section>

      <div className="flex gap-2">
        <SubmitButton className="btn btn-e1">Salvar obra</SubmitButton>
        <Link href={cancelHref} className="btn btn-secondary">
          Cancelar
        </Link>
      </div>
    </ActionForm>
  );
}
