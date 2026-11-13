import { NavTabs } from "@/components/NavTabs";
import { Badge, PageHeader } from "@/components/ui";
import { DESTINACAO, STATUS_OBRA } from "@/lib/constants";
import { getObra } from "./data";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const o = await getObra((await params).id);
  return { title: `Obra ${o.numero} · ${o.nome}` };
}

export default async function ObraLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = await getObra(id);
  const base = `/obras/${o.id}`;
  return (
    <>
      <PageHeader
        empresa={1}
        back={{ href: "/obras", label: "Obras" }}
        title={
          <>
            <span className="text-slate-400">Obra {o.numero} ·</span> {o.nome}
          </>
        }
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={STATUS_OBRA[o.status].tone}>{STATUS_OBRA[o.status].label}</Badge>
            {o.destinacao && <Badge tone="violet">Destinação: {DESTINACAO[o.destinacao]}</Badge>}
            {[o.endereco, o.bairro, o.cidade && `${o.cidade}/${o.uf ?? ""}`].filter(Boolean).join(" · ")}
          </span>
        }
      />
      <NavTabs
        items={[
          { href: base, label: "Resumo", exact: true },
          { href: `${base}/aportes`, label: `Aportes (${o.aportes.length})` },
          { href: `${base}/destinacao`, label: "Venda / Aluguel" },
          { href: `${base}/relatorio`, label: "Relatório completo" },
          { href: `${base}/editar`, label: "Editar cadastro" },
        ]}
      />
      {children}
    </>
  );
}
