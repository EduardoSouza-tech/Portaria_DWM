"use client";

import { ActionForm, MoneyInput, SubmitButton } from "@/components/forms";
import { TIPOS_CUSTO_VENDA_OBRA, TIPO_LANC_LOCACAO, type TipoLancLocacao } from "@/lib/constants";
import type { ActionState } from "@/lib/form";

type Act = (s: ActionState, fd: FormData) => Promise<ActionState>;

export function VendaForm({
  action,
  d,
}: {
  action: Act;
  d: { vendaValor: string; vendaData: string; vendaComprador: string; vendaCompradorDoc: string };
}) {
  return (
    <ActionForm action={action} className="grid gap-4 sm:grid-cols-4">
      <div>
        <label className="label">Valor da venda (R$)</label>
        <MoneyInput name="vendaValor" defaultValue={d.vendaValor} />
      </div>
      <div>
        <label className="label">Data da venda</label>
        <input type="date" name="vendaData" defaultValue={d.vendaData} className="input" />
      </div>
      <div>
        <label className="label">Comprador</label>
        <input name="vendaComprador" defaultValue={d.vendaComprador} className="input" />
      </div>
      <div>
        <label className="label">CPF/CNPJ do comprador</label>
        <input name="vendaCompradorDoc" defaultValue={d.vendaCompradorDoc} className="input" />
      </div>
      <div className="sm:col-span-4">
        <SubmitButton className="btn btn-e1">Salvar venda</SubmitButton>
        <span className="ml-3 text-xs text-slate-500">Com valor e data preenchidos, a obra passa para o status “Vendida”.</span>
      </div>
    </ActionForm>
  );
}

export function CustoVendaForm({ action }: { action: Act }) {
  return (
    <ActionForm action={action} resetOnSuccess className="grid gap-3 sm:grid-cols-6">
      <div className="sm:col-span-2">
        <label className="label">Tipo *</label>
        <input name="tipo" list="tipos-custo-venda" required className="input" placeholder="Imposto, comissão…" autoComplete="off" />
        <datalist id="tipos-custo-venda">
          {TIPOS_CUSTO_VENDA_OBRA.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </div>
      <div className="sm:col-span-2">
        <label className="label">Descrição</label>
        <input name="descricao" className="input" />
      </div>
      <div>
        <label className="label">Data</label>
        <input type="date" name="data" className="input" />
      </div>
      <div>
        <label className="label">Valor (R$) *</label>
        <MoneyInput name="valor" required />
      </div>
      <div className="sm:col-span-6">
        <SubmitButton className="btn btn-secondary">+ Adicionar custo de venda</SubmitButton>
      </div>
    </ActionForm>
  );
}

export type LocacaoDefaults = {
  inquilinoId?: number;
  imobiliariaId?: number | null;
  valorAluguel?: string;
  diaVencimento?: number;
  dataInicio?: string;
  dataFim?: string;
  taxaAdministracaoPct?: string;
  indiceReajuste?: string;
  garantia?: string;
  observacoes?: string;
  ativo?: boolean;
};

export function LocacaoForm({
  action,
  d = {},
  inquilinos,
  imobiliarias,
  edicao = false,
}: {
  action: Act;
  d?: LocacaoDefaults;
  inquilinos: { id: number; nome: string }[];
  imobiliarias: { id: number; razaoSocial: string; comissaoPct: number | null }[];
  edicao?: boolean;
}) {
  return (
    <ActionForm action={action} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-6">
        <div className="sm:col-span-2">
          <label className="label">Inquilino</label>
          <select name="inquilinoId" defaultValue={d.inquilinoId ?? ""} className="input">
            <option value="">— novo inquilino —</option>
            {inquilinos.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nome}
              </option>
            ))}
          </select>
        </div>
        {!edicao && (
          <>
            <div className="sm:col-span-2">
              <label className="label">Novo inquilino — nome</label>
              <input name="novoInquilinoNome" className="input" />
            </div>
            <div>
              <label className="label">CPF/CNPJ</label>
              <input name="novoInquilinoDoc" className="input" />
            </div>
            <div>
              <label className="label">Telefone</label>
              <input name="novoInquilinoTelefone" className="input" />
            </div>
          </>
        )}
        <div className="sm:col-span-2">
          <label className="label">Imobiliária</label>
          <select
            name="imobiliariaId"
            defaultValue={d.imobiliariaId ?? ""}
            className="input"
            onChange={(e) => {
              const im = imobiliarias.find((x) => String(x.id) === e.currentTarget.value);
              const taxa = e.currentTarget.form?.elements.namedItem("taxaAdministracaoPct") as HTMLInputElement | null;
              if (im?.comissaoPct != null && taxa && !taxa.value) taxa.value = im.comissaoPct.toLocaleString("pt-BR");
            }}
          >
            <option value="">— sem imobiliária / nova —</option>
            {imobiliarias.map((i) => (
              <option key={i.id} value={i.id}>
                {i.razaoSocial}
              </option>
            ))}
          </select>
        </div>
        {!edicao && (
          <div className="sm:col-span-2">
            <label className="label">…ou nova imobiliária (razão social)</label>
            <input name="novaImobiliaria" className="input" />
          </div>
        )}
        <div className="sm:col-span-2">
          <label className="label">Taxa de administração / comissão (%)</label>
          <input name="taxaAdministracaoPct" inputMode="decimal" defaultValue={d.taxaAdministracaoPct} placeholder="Ex.: 10" className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Valor do aluguel (R$) *</label>
          <MoneyInput name="valorAluguel" required defaultValue={d.valorAluguel} />
        </div>
        <div>
          <label className="label">Dia de vencimento</label>
          <input name="diaVencimento" type="number" min={1} max={31} defaultValue={d.diaVencimento ?? 10} className="input" />
        </div>
        <div>
          <label className="label">Início *</label>
          <input name="dataInicio" type="date" required defaultValue={d.dataInicio} className="input" />
        </div>
        <div>
          <label className="label">Fim</label>
          <input name="dataFim" type="date" defaultValue={d.dataFim} className="input" />
        </div>
        <div>
          <label className="label">Índice de reajuste</label>
          <input name="indiceReajuste" list="indices" defaultValue={d.indiceReajuste} className="input" />
          <datalist id="indices">
            <option value="IGP-M" />
            <option value="IPCA" />
            <option value="INPC" />
            <option value="IVAR" />
          </datalist>
        </div>
        <div className="sm:col-span-2">
          <label className="label">Garantia</label>
          <input name="garantia" defaultValue={d.garantia} placeholder="Caução, fiador, seguro fiança…" className="input" />
        </div>
        <div className="sm:col-span-4">
          <label className="label">Observações</label>
          <input name="observacoes" defaultValue={d.observacoes} className="input" />
        </div>
        {edicao && (
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" name="ativo" defaultChecked={d.ativo} className="h-4 w-4" /> Contrato ativo
          </label>
        )}
      </div>
      <SubmitButton className="btn btn-e1">{edicao ? "Salvar contrato" : "Criar contrato de locação"}</SubmitButton>
    </ActionForm>
  );
}

export function GerarCompetenciaForm({ action, mesAtual }: { action: Act; mesAtual: string }) {
  return (
    <ActionForm action={action} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="label">A partir da competência</label>
        <input type="month" name="competencia" defaultValue={mesAtual} required className="input" />
      </div>
      <div className="w-28">
        <label className="label">Qtd. meses</label>
        <input type="number" name="meses" min={1} max={24} defaultValue={1} className="input" />
      </div>
      <SubmitButton className="btn btn-e1">Gerar aluguel + comissão</SubmitButton>
    </ActionForm>
  );
}

export function LancamentoForm({ action, mesAtual }: { action: Act; mesAtual: string }) {
  return (
    <ActionForm action={action} resetOnSuccess className="grid gap-3 sm:grid-cols-6">
      <div>
        <label className="label">Competência *</label>
        <input type="month" name="competencia" defaultValue={mesAtual} required className="input" />
      </div>
      <div>
        <label className="label">Tipo *</label>
        <select name="tipo" required className="input" defaultValue="CONDOMINIO">
          {(Object.keys(TIPO_LANC_LOCACAO) as TipoLancLocacao[]).map((t) => (
            <option key={t} value={t}>
              {TIPO_LANC_LOCACAO[t].receita ? "↑ " : "↓ "}
              {TIPO_LANC_LOCACAO[t].label}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="label">Descrição</label>
        <input name="descricao" className="input" />
      </div>
      <div>
        <label className="label">Valor (R$) *</label>
        <MoneyInput name="valor" required />
      </div>
      <div>
        <label className="label">Vencimento</label>
        <input type="date" name="vencimento" className="input" />
      </div>
      <div>
        <label className="label">Situação</label>
        <select name="status" className="input" defaultValue="PENDENTE">
          <option value="PENDENTE">Pendente</option>
          <option value="PAGO">Pago</option>
        </select>
      </div>
      <div>
        <label className="label">Data pagamento</label>
        <input type="date" name="dataPagamento" className="input" />
      </div>
      <div className="flex items-end sm:col-span-4">
        <SubmitButton className="btn btn-secondary">+ Incluir lançamento</SubmitButton>
      </div>
    </ActionForm>
  );
}
