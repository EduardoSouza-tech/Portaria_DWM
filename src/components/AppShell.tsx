"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { logout, setEscopo } from "@/app/actions";
import type { Escopo } from "@/lib/escopo";

type Item = { href: string; label: string; icon: string; exact?: boolean };
type Grupo = { titulo: string; cor?: string; itens: Item[] };

export function AppShell({
  children,
  empresas,
  usuario,
  escopo,
}: {
  children: ReactNode;
  empresas: { e1: string; e2: string };
  usuario: { nome: string; role: string };
  escopo: Escopo;
}) {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  const grupos: Grupo[] = [
    { titulo: "Visão geral", itens: [{ href: "/", label: "Painel consolidado", icon: "◧", exact: true }] },
    {
      titulo: empresas.e1,
      cor: "bg-e1",
      itens: [
        { href: "/obras", label: "Obras / unidades", icon: "▦" },
        { href: "/aportes", label: "Aportes e NFs", icon: "≡" },
        { href: "/locacoes", label: "Locações", icon: "⌂" },
      ],
    },
    {
      titulo: empresas.e2,
      cor: "bg-e2",
      itens: [
        { href: "/leilao", label: "Imóveis de leilão", icon: "⚑", exact: true },
        { href: "/leilao/simulador", label: "Simulador de arremate", icon: "∑" },
      ],
    },
    {
      titulo: "Consolidado",
      cor: "bg-brand",
      itens: [
        { href: "/relatorios", label: "Relatórios", icon: "▤" },
        { href: "/notas", label: "Pesquisa de notas", icon: "⌕" },
      ],
    },
    {
      titulo: "Cadastros",
      itens: [
        { href: "/cadastros/construtoras", label: "Construtoras", icon: "▣" },
        { href: "/cadastros/imobiliarias", label: "Imobiliárias", icon: "▣" },
        { href: "/cadastros/inquilinos", label: "Inquilinos", icon: "▣" },
        { href: "/configuracoes", label: "Configurações", icon: "⚙" },
      ],
    },
  ];

  const ativo = (i: Item) =>
    i.exact ? pathname === i.href : pathname === i.href || pathname.startsWith(i.href + "/");
  // /leilao/[id] deve marcar "Imóveis de leilão"
  const leilaoDetalhe = /^\/leilao\/(?!simulador)/.test(pathname);

  return (
    <div className="min-h-screen">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 text-slate-300 transition-transform lg:translate-x-0 ${
          aberto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-amber-500 text-sm font-bold text-white">
            S
          </div>
          <div>
            <div className="text-sm font-semibold text-white">SASS</div>
            <div className="text-[11px] text-slate-400">Gestão imobiliária</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {grupos.map((g) => (
            <div key={g.titulo} className="mb-5">
              <div className="mb-1.5 flex items-center gap-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {g.cor && <span className={`h-2 w-2 rounded-full ${g.cor}`} />}
                <span className="truncate">{g.titulo}</span>
              </div>
              {g.itens.map((i) => {
                const on = ativo(i) || (i.href === "/leilao" && leilaoDetalhe);
                return (
                  <Link
                    key={i.href}
                    href={i.href}
                    onClick={() => setAberto(false)}
                    className={`mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm ${
                      on ? "bg-white/10 font-medium text-white" : "hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="w-4 text-center text-slate-400">{i.icon}</span>
                    {i.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="border-t border-white/10 px-4 py-3">
          <div className="truncate text-sm font-medium text-white">{usuario.nome}</div>
          <div className="mb-2 text-xs text-slate-400">{usuario.role === "ADMIN" ? "Administrador" : "Usuário"}</div>
          <form action={logout}>
            <button className="text-xs font-medium text-slate-400 hover:text-white" type="submit">
              Sair do sistema →
            </button>
          </form>
        </div>
      </aside>

      {aberto && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setAberto(false)} />}

      <div className="print-full lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <button className="btn btn-ghost lg:hidden" onClick={() => setAberto(true)} aria-label="Abrir menu">
            ☰
          </button>
          <div className="flex-1" />
          <EscopoSelector escopo={escopo} empresas={empresas} />
        </header>
        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function EscopoSelector({ escopo, empresas }: { escopo: Escopo; empresas: { e1: string; e2: string } }) {
  const [pending, start] = useTransition();
  const opcoes: { v: Escopo; label: string; title: string; on: string }[] = [
    { v: "1", label: "Empresa 1", title: empresas.e1, on: "bg-e1 text-white" },
    { v: "2", label: "Empresa 2", title: empresas.e2, on: "bg-e2 text-white" },
    { v: "ambas", label: "Ambas", title: "Dados consolidados", on: "bg-slate-900 text-white" },
  ];
  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs font-medium text-slate-500 sm:inline">Dados de:</span>
      <div className={`inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 ${pending ? "opacity-60" : ""}`}>
        {opcoes.map((o) => (
          <button
            key={o.v}
            title={o.title}
            disabled={pending}
            onClick={() => start(() => setEscopo(o.v))}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              escopo === o.v ? o.on + " shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
