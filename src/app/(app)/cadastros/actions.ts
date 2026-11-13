"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { FormError, parseMoney, str, toActionError, type ActionState } from "@/lib/form";
import { onlyDigits } from "@/lib/format";
import { CADASTROS, isTipo, type TipoCadastro } from "./config";
import { repos } from "./repo";

function dados(tipo: TipoCadastro, fd: FormData) {
  const out: Record<string, unknown> = {};
  for (const c of CADASTROS[tipo].campos) {
    const v = str(fd, c.name);
    if (c.required && !v) throw new FormError(`Informe o campo "${c.label}".`);
    if (c.type === "doc") out[c.name] = onlyDigits(v) || null;
    else if (c.type === "percent") out[c.name] = parseMoney(v);
    else if (c.type === "email") out[c.name] = v?.toLowerCase() ?? null;
    else out[c.name] = v;
  }
  return out;
}

export async function salvarCadastro(tipo: string, id: number | null, _: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  if (!isTipo(tipo)) return { error: "Cadastro inválido." };
  try {
    if (id) await repos[tipo].update(id, dados(tipo, fd));
    else await repos[tipo].create(dados(tipo, fd));
  } catch (e) {
    return toActionError(e);
  }
  revalidatePath(`/cadastros/${tipo}`);
  if (id) redirect(`/cadastros/${tipo}`);
  return { ok: `${CADASTROS[tipo].singular[0].toUpperCase()}${CADASTROS[tipo].singular.slice(1)} cadastrado(a).` };
}

export async function excluirCadastro(tipo: string, id: number): Promise<ActionState> {
  await requireUser();
  if (!isTipo(tipo)) return { error: "Cadastro inválido." };
  try {
    await repos[tipo].remove(id);
  } catch (e) {
    return toActionError(e);
  }
  revalidatePath(`/cadastros/${tipo}`);
}
