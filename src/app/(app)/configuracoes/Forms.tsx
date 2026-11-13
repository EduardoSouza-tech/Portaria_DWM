"use client";

import { ActionForm, SubmitButton } from "@/components/forms";
import type { ActionState } from "@/lib/form";

type Act = (s: ActionState, fd: FormData) => Promise<ActionState>;

export function EmpresaForm({ action, d, cor }: { action: Act; d: { nome: string; cnpj: string; descricao: string }; cor: string }) {
  return (
    <ActionForm action={action} className="space-y-3">
      <div>
        <label className="label">Nome de exibição *</label>
        <input name="nome" required defaultValue={d.nome} className="input" />
      </div>
      <div>
        <label className="label">CNPJ</label>
        <input name="cnpj" defaultValue={d.cnpj} className="input" />
      </div>
      <div>
        <label className="label">Descrição / atividade</label>
        <input name="descricao" defaultValue={d.descricao} className="input" />
      </div>
      <SubmitButton className={`btn ${cor}`}>Salvar</SubmitButton>
    </ActionForm>
  );
}

export function SenhaForm({ action }: { action: Act }) {
  return (
    <ActionForm action={action} resetOnSuccess className="space-y-3">
      <div>
        <label className="label">Senha atual</label>
        <input name="atual" type="password" required className="input" autoComplete="current-password" />
      </div>
      <div>
        <label className="label">Nova senha</label>
        <input name="nova" type="password" required minLength={6} className="input" autoComplete="new-password" />
      </div>
      <div>
        <label className="label">Confirmar nova senha</label>
        <input name="confirma" type="password" required minLength={6} className="input" autoComplete="new-password" />
      </div>
      <SubmitButton>Alterar senha</SubmitButton>
    </ActionForm>
  );
}

export function UsuarioForm({ action }: { action: Act }) {
  return (
    <ActionForm action={action} resetOnSuccess className="grid gap-3 sm:grid-cols-5">
      <div className="sm:col-span-1">
        <label className="label">Nome *</label>
        <input name="nome" required className="input" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">E-mail *</label>
        <input name="email" type="email" required className="input" />
      </div>
      <div>
        <label className="label">Senha inicial *</label>
        <input name="senha" type="password" required minLength={6} className="input" autoComplete="new-password" />
      </div>
      <div>
        <label className="label">Perfil</label>
        <select name="role" className="input">
          <option value="USUARIO">Usuário</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </div>
      <div className="sm:col-span-5">
        <SubmitButton>+ Criar usuário</SubmitButton>
      </div>
    </ActionForm>
  );
}

export function ResetSenhaForm({ action }: { action: Act }) {
  return (
    <ActionForm action={action} resetOnSuccess className="flex items-center gap-2">
      <input name="senha" type="password" required minLength={6} placeholder="Nova senha" className="input w-36 py-1 text-xs" autoComplete="new-password" />
      <SubmitButton className="btn btn-secondary btn-sm">Redefinir</SubmitButton>
    </ActionForm>
  );
}
