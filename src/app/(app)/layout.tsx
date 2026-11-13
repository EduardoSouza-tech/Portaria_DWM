import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEscopo } from "@/lib/escopo";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const sessao = await requireUser();
  const [empresas, escopo] = await Promise.all([prisma.empresa.findMany(), getEscopo()]);
  const e1 = empresas.find((e) => e.id === 1)?.nome ?? "Empresa 1";
  const e2 = empresas.find((e) => e.id === 2)?.nome ?? "Empresa 2";

  return (
    <AppShell empresas={{ e1, e2 }} usuario={{ nome: sessao.nome, role: sessao.role }} escopo={escopo}>
      {children}
    </AppShell>
  );
}
