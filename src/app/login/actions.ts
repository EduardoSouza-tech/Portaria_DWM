"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { str, type ActionState } from "@/lib/form";

export async function entrar(_: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email")?.toLowerCase();
  const senha = str(fd, "senha");
  if (!email || !senha) return { error: "Informe e-mail e senha." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.ativo || !(await bcrypt.compare(senha, user.senhaHash))) {
    return { error: "E-mail ou senha inválidos." };
  }
  await createSession({ uid: user.id, nome: user.nome, email: user.email, role: user.role });
  const next = str(fd, "next");
  redirect(next && next.startsWith("/") && !next.startsWith("//") ? next : "/");
}
