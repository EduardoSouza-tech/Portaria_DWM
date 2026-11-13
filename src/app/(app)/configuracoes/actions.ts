"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { FormError, req, str, toActionError, type ActionState } from "@/lib/form";
import { onlyDigits } from "@/lib/format";

export async function salvarEmpresa(id: 1 | 2, _: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    await prisma.empresa.upsert({
      where: { id },
      update: { nome: req(fd, "nome", "Nome"), cnpj: onlyDigits(str(fd, "cnpj")) || null, descricao: str(fd, "descricao") },
      create: { id, nome: req(fd, "nome", "Nome"), cnpj: onlyDigits(str(fd, "cnpj")) || null, descricao: str(fd, "descricao") },
    });
  } catch (e) {
    return toActionError(e);
  }
  revalidatePath("/", "layout");
  return { ok: "Empresa atualizada." };
}

export async function alterarSenha(_: ActionState, fd: FormData): Promise<ActionState> {
  const s = await requireUser();
  try {
    const atual = req(fd, "atual", "Senha atual");
    const nova = req(fd, "nova", "Nova senha");
    if (nova.length < 6) throw new FormError("A nova senha deve ter ao menos 6 caracteres.");
    if (nova !== str(fd, "confirma")) throw new FormError("A confirmação não confere.");
    const u = await prisma.user.findUniqueOrThrow({ where: { id: s.uid } });
    if (!(await bcrypt.compare(atual, u.senhaHash))) throw new FormError("Senha atual incorreta.");
    await prisma.user.update({ where: { id: u.id }, data: { senhaHash: await bcrypt.hash(nova, 10) } });
  } catch (e) {
    return toActionError(e);
  }
  return { ok: "Senha alterada." };
}

export async function criarUsuario(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const senha = req(fd, "senha", "Senha");
    if (senha.length < 6) throw new FormError("A senha deve ter ao menos 6 caracteres.");
    await prisma.user.create({
      data: {
        nome: req(fd, "nome", "Nome"),
        email: req(fd, "email", "E-mail").toLowerCase(),
        senhaHash: await bcrypt.hash(senha, 10),
        role: str(fd, "role") === "ADMIN" ? "ADMIN" : "USUARIO",
      },
    });
  } catch (e) {
    return toActionError(e);
  }
  revalidatePath("/configuracoes");
  return { ok: "Usuário criado." };
}

export async function alternarUsuario(id: number): Promise<ActionState> {
  const s = await requireAdmin();
  if (id === s.uid) return { error: "Você não pode desativar o próprio usuário." };
  const u = await prisma.user.findUnique({ where: { id } });
  if (!u) return { error: "Usuário não encontrado." };
  await prisma.user.update({ where: { id }, data: { ativo: !u.ativo } });
  revalidatePath("/configuracoes");
}

export async function redefinirSenha(id: number, _: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const senha = req(fd, "senha", "Nova senha");
    if (senha.length < 6) throw new FormError("A senha deve ter ao menos 6 caracteres.");
    await prisma.user.update({ where: { id }, data: { senhaHash: await bcrypt.hash(senha, 10) } });
  } catch (e) {
    return toActionError(e);
  }
  return { ok: "Senha redefinida." };
}
