"use client";

import Link from "next/link";
import { ActionForm, MoneyInput, SubmitButton } from "@/components/forms";
import { MODALIDADES_LEILAO, STATUS_LEILAO, TIPOS_IMOVEL, UFS, type StatusLeilao } from "@/lib/constants";
import type { ActionState } from "@/lib/form";

export type ImovelDefaults = Partial<{
  codigo: number;
  descricao: string;
  tipoImovel: string;
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  matricula: string;
  inscricaoIptu: string;
  modalidade: string;
  leiloeiro: string;
  processo: string;
  dataLeilao: string;
  ocupado: boolean;
  valorAvaliacao: string;
  valorLance: string;
  valorArrematacao: string;
  dataCompra: string;
  valorVendaEstimado: string;
  valorVenda: string;
  dataVenda: string;
  comprador: string;
  status: StatusLeilao;
  observacoes: string;
}>;

export function ImovelForm({
  action,
  d = {},
  cancelHref,
}: {
  action: (s: ActionState, fd: FormData) => Promise<ActionState>;
  d?: ImovelDefaults;
  cancelHref: string;
}) {
  return (
    <ActionForm action={action} className="space-y-6">
      <section className="card">
        <div className="card-header">
          <h2 className="card-title">Cadastro do imóvel</h2>
        </div>
        <div className="card-body grid gap-4 sm:grid-cols-6">
          <div>
            <label className="label">Código *</label>
            <input name="codigo" type="number" min={1} required defaultValue={d.codigo} className="input" />
          </div>
          <div className="sm:col-span-3">
            <label className="label">Descrição *</label>
            <input name="descricao" required defaultValue={d.descricao} placeholder="Ex.: Apto 302 — Ed. Solar" className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Status</label>
            <select name="status" defaultValue={d.status ?? "ANALISE"} className="input">
              {(Object.keys(STATUS_LEILAO) as StatusLeilao[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LEILAO[s].label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Tipo de imóvel</label>
            <select name="tipoImovel" defaultValue={d.tipoImovel ?? ""} className="input">
              <option value="">—</option>
              {TIPOS_IMOVEL.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-4">
            <label className="label">Endereço</label>
            <input name="endereco" defaultValue={d.endereco} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Bairro</label>
            <input name="bairro" defaultValue={d.bairro} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Cidade</label>
            <input name="cidade" defaultValue={d.cidade} className="input" />
          </div>
          <div>
            <label className="label">UF</label>
            <select name="uf" defaultValue={d.uf ?? ""} className="input">
              <option value="">—</option>
              {UFS.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">CEP</label>
            <input name="cep" defaultValue={d.cep} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Matrícula</label>
            <input name="matricula" defaultValue={d.matricula} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Inscrição IPTU</label>
            <input name="inscricaoIptu" defaultValue={d.inscricaoIptu} className="input" />
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <h2 className="card-title">Leilão e arrematação</h2>
        </div>
        <div className="card-body grid gap-4 sm:grid-cols-6">
          <div className="sm:col-span-2">
            <label className="label">Modalidade</label>
            <select name="modalidade" defaultValue={d.modalidade ?? ""} className="input">
              <option value="">—</option>
              {MODALIDADES_LEILAO.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Leiloeiro</label>
            <input name="leiloeiro" defaultValue={d.leiloeiro} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Processo / edital</label>
            <input name="processo" defaultValue={d.processo} className="input" />
          </div>
          <div>
            <label className="label">Data do leilão</label>
            <input name="dataLeilao" type="date" defaultValue={d.dataLeilao} className="input" />
          </div>
          <div>
            <label className="label">Valor do imóvel (avaliação)</label>
            <MoneyInput name="valorAvaliacao" defaultValue={d.valorAvaliacao} />
          </div>
          <div>
            <label className="label">Valor do lance</label>
            <MoneyInput name="valorLance" defaultValue={d.valorLance} />
          </div>
          <div>
            <label className="label">Valor da arrematação</label>
            <MoneyInput name="valorArrematacao" defaultValue={d.valorArrematacao} />
          </div>
          <div>
            <label className="label">Data da compra</label>
            <input name="dataCompra" type="date" defaultValue={d.dataCompra} className="input" />
          </div>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input type="checkbox" name="ocupado" defaultChecked={d.ocupado} className="h-4 w-4" /> Imóvel ocupado
          </label>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <h2 className="card-title">Venda</h2>
        </div>
        <div className="card-body grid gap-4 sm:grid-cols-6">
          <div>
            <label className="label">Venda estimada</label>
            <MoneyInput name="valorVendaEstimado" defaultValue={d.valorVendaEstimado} />
          </div>
          <div>
            <label className="label">Valor da venda</label>
            <MoneyInput name="valorVenda" defaultValue={d.valorVenda} />
          </div>
          <div>
            <label className="label">Data da venda</label>
            <input name="dataVenda" type="date" defaultValue={d.dataVenda} className="input" />
          </div>
          <div className="sm:col-span-3">
            <label className="label">Comprador</label>
            <input name="comprador" defaultValue={d.comprador} className="input" />
          </div>
          <div className="sm:col-span-6">
            <label className="label">Observações</label>
            <textarea name="observacoes" defaultValue={d.observacoes} className="input" />
          </div>
        </div>
      </section>

      <div className="flex gap-2">
        <SubmitButton className="btn btn-e2">Salvar imóvel</SubmitButton>
        <Link href={cancelHref} className="btn btn-secondary">
          Cancelar
        </Link>
      </div>
    </ActionForm>
  );
}
