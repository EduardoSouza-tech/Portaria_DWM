"use client";

import { ActionForm, SubmitButton } from "@/components/forms";
import { entrar } from "./actions";

export function LoginForm({ next }: { next?: string }) {
  return (
    <ActionForm action={entrar} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <div>
        <label className="label" htmlFor="email">
          E-mail
        </label>
        <input id="email" name="email" type="email" required autoFocus autoComplete="username" className="input" />
      </div>
      <div>
        <label className="label" htmlFor="senha">
          Senha
        </label>
        <input id="senha" name="senha" type="password" required autoComplete="current-password" className="input" />
      </div>
      <SubmitButton className="btn btn-primary w-full py-2.5">Entrar</SubmitButton>
    </ActionForm>
  );
}
