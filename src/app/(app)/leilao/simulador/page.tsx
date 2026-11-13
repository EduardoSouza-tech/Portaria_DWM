import Link from "next/link";
import { ActionButton, DeleteButton } from "@/components/forms";
import { Card, Empty, Money, PageHeader } from "@/components/ui";
import { SIM_PADRAO, calcSimulacao, type SimInput } from "@/lib/calc";
import { prisma } from "@/lib/db";
import { brl, dataBR, n, pct } from "@/lib/format";
import { converterSimulacao, excluirSimulacao, salvarSimulacao } from "../actions";
import { Simulador } from "./Simulador";

export const metadata = { title: "Simulador de arremate" };

type Sim = Awaited<ReturnType<typeof prisma.simulacaoLeilao.findMany>>[number];

function toInput(s: Sim): SimInput {
  return {
    valorArremate: n(s.valorArremate),
    valorVendaEstimado: n(s.valorVendaEstimado),
    pctLeiloeiro: n(s.pctLeiloeiro),
    pctItbi: n(s.pctItbi),
    pctRegistro: n(s.pctRegistro),
    pctIr: n(s.pctIr),
    baseIr: s.baseIr === "VENDA" ? "VENDA" : "LUCRO",
    pctComissaoVenda: n(s.pctComissaoVenda),
    advogado: n(s.advogado),
    pctReforma: n(s.pctReforma),
    debitosAto: n(s.debitosAto),
    custoMensal: n(s.custoMensal),
    prazoMeses: s.prazoMeses,
  };
}

export default async function SimuladorPage({ searchParams }: { searchParams: Promise<{ id?: string; salvo?: string }> }) {
  const { id, salvo } = await searchParams;
  const sims = await prisma.simulacaoLeilao.findMany({ orderBy: { updatedAt: "desc" } });
  const atual = id ? sims.find((s) => s.id === Number(id)) : undefined;

  return (
    <>
      <PageHeader
        empresa={2}
        title="Simulador de arremate"
        subtitle="Estime custos, resultado, ROI e rendimento mensal antes de dar o lance."
        actions={
          atual ? (
            <Link href="/leilao/simulador" className="btn btn-secondary">
              + Nova simulação
            </Link>
          ) : undefined
        }
      />
      {salvo && atual && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Simulação “{atual.nome}” salva.
        </div>
      )}

      <Simulador
        key={atual?.id ?? "nova"}
        action={salvarSimulacao}
        inicial={atual ? toInput(atual) : SIM_PADRAO}
        id={atual?.id}
        nome={atual?.nome}
        observacoes={atual?.observacoes ?? ""}
      />

      <Card title="Simulações salvas" className="mt-6" bodyClass="table-wrap">
        {sims.length === 0 ? (
          <div className="p-5">
            <Empty>Nenhuma simulação salva.</Empty>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Atualizada</th>
                <th className="num">Arremate</th>
                <th className="num">Venda est.</th>
                <th className="num">Investimento</th>
                <th className="num">Resultado</th>
                <th className="num">ROI</th>
                <th className="num">Rend./mês</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sims.map((s) => {
                const r = calcSimulacao(toInput(s));
                return (
                  <tr key={s.id} className={atual?.id === s.id ? "bg-amber-50/60" : ""}>
                    <td>
                      <Link href={`/leilao/simulador?id=${s.id}`} className="link">
                        {s.nome}
                      </Link>
                    </td>
                    <td>{dataBR(s.updatedAt)}</td>
                    <td className="num">{brl(s.valorArremate)}</td>
                    <td className="num">{brl(s.valorVendaEstimado)}</td>
                    <td className="num">{brl(r.investimento)}</td>
                    <td className="num">
                      <Money v={r.resultado} colored />
                    </td>
                    <td className="num">{pct(r.roi)}</td>
                    <td className="num">{pct(r.rendimentoMes)}</td>
                    <td className="whitespace-nowrap text-right">
                      {s.imovelId ? (
                        <Link href={`/leilao/${s.imovelId}`} className="btn btn-ghost btn-sm">
                          Ver imóvel
                        </Link>
                      ) : (
                        <ActionButton
                          action={converterSimulacao.bind(null, s.id)}
                          className="btn btn-secondary btn-sm"
                          confirmText="Criar um imóvel (em análise) a partir desta simulação?"
                        >
                          Criar imóvel
                        </ActionButton>
                      )}
                      <DeleteButton action={excluirSimulacao.bind(null, s.id)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
