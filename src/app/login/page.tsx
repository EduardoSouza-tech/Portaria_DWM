import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getSession()) redirect(next && next.startsWith("/") ? next : "/");

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-600/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-amber-500/25 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-amber-500 font-bold">S</div>
          <span className="text-lg font-semibold">SASS</span>
        </div>
        <div className="relative max-w-md">
          <h1 className="text-3xl font-semibold leading-tight">Gestão integrada de investimentos imobiliários</h1>
          <p className="mt-4 text-slate-300">
            Duas empresas, um painel: acompanhe obras por administração e imóveis de leilão — separadamente ou consolidados.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="mb-1 h-1.5 w-8 rounded bg-blue-500" />
              <div className="font-medium">Empresa 1</div>
              <div className="text-slate-400">Obras por administração, aportes, venda e aluguel</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="mb-1 h-1.5 w-8 rounded bg-amber-500" />
              <div className="font-medium">Empresa 2</div>
              <div className="text-slate-400">Leilão de imóveis, custos, simulação e ROI</div>
            </div>
          </div>
        </div>
        <div className="relative text-xs text-slate-500">© {new Date().getFullYear()} SASS</div>
      </div>
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Entrar</h2>
          <p className="mb-6 mt-1 text-sm text-slate-500">Acesse com seu e-mail e senha.</p>
          <LoginForm next={next} />
        </div>
      </div>
    </div>
  );
}
