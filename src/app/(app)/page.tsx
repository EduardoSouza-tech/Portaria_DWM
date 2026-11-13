import Link from "next/link";
import { BarrasH, FluxoChart } from "@/components/Charts";
import { Badge, Card, Empty, Money, PageHeader, Stat } from "@/components/ui";
import { CORES, STATUS_LEILAO, STATUS_OBRA, TIPO_LANC_LOCACAO, type TipoLancLocacao } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { getEscopo, incluiE1, incluiE2 } from "@/lib/escopo";
import { brl, hojeISO, hojeUTC, pct } from "@/lib/format";
import { fluxoMensal, linhasLeilao, linhasObras } from "@/lib/queries";

export const metadata = { title: "Painel" };

export default async function Painel() {
  const escopo = await getEscopo();
  const e1 = incluiE1(escopo);
  const e2 = incluiE2(escopo);
  const receitas = (Object.keys(TIPO_LANC_LOCACAO) as TipoLancLocacao[]).filter((t) => TIPO_LANC_LOCACAO[t].receita);
  const [obras, imoveis, fluxo, vencidos] = await Promise.all([
    e1 ? linhasObras() : Promise.resolve([]),
    e2 ? linhasLeilao() : Promise.resolve([]),
    fluxoMensal(escopo, 12),
    e1
      ? prisma.lancamentoLocacao.aggregate({
          where: { status: "PENDENTE", tipo: { in: receitas }, vencimento: { lt: hojeUTC() } },
          _count: true,
          _sum: { valor: true },
        })
      : Promise.resolve(null),
  ]);

  // ---- Empresa 1
  const obrasAtivas = obras.filter((o) => o.status === "EM_ANDAMENTO" || o.status === "PLANEJAMENTO");
  const aportado = obras.reduce((a, o) => a + o.totalAportes, 0);
  const previsto = obras.reduce((a, o) => a + o.custoPrevisto, 0);
  const vendidas = obras.filter((o) => o.resultadoVenda !== null);
  const resultadoVendasE1 = vendidas.reduce((a, o) => a + (o.resultadoVenda ?? 0), 0);
  const resultadoAluguelE1 = obras.reduce((a, o) => a + o.resultadoLocacao, 0);
  const aluguelMensal = obras.reduce((a, o) => a + o.aluguelMensal, 0);

  // ---- Empresa 2
  const carteira = imoveis.filter((i) => !["VENDIDO", "NAO_ARREMATADO", "ANALISE", "LANCE_DADO"].includes(i.status));
  const vendidos = imoveis.filter((i) => i.vendido);
  const investidoE2 = imoveis.reduce((a, i) => a + i.custoTotal, 0);
  const emCarteiraE2 = carteira.reduce((a, i) => a + i.custoTotal, 0);
  const resultadoE2 = vendidos.reduce((a, i) => a + (i.resultado ?? 0), 0);
  const custoVendidos = vendidos.reduce((a, i) => a + i.custoTotal, 0);
  const projetadoE2 = carteira.reduce((a, i) => a + (i.resultado ?? 0), 0);

  const investidoTotal = (e1 ? aportado : 0) + (e2 ? investidoE2 : 0);
  const realizadoTotal = (e1 ? resultadoVendasE1 + resultadoAluguelE1 : 0) + (e2 ? resultadoE2 : 0);

  const resultados = [
    ...(e1
      ? obras.filter((o) => o.resultado !== null && o.resultado !== 0).map((o) => ({ nome: `Obra ${o.numero} · ${o.nome}`, valor: o.resultado ?? 0 }))
      : []),
    ...(e2
      ? imoveis.filter((i) => i.resultado !== null && i.custoTotal > 0).map((i) => ({ nome: `Leilão ${i.codigo} · ${i.descricao}`, valor: i.resultado ?? 0 }))
      : []),
  ]
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 12)
    .map((r) => ({ ...r, nome: r.nome.length > 34 ? r.nome.slice(0, 33) + "…" : r.nome }));

  return (
    <>
      <PageHeader
        empresa={escopo === "ambas" ? "ambas" : escopo === "1" ? 1 : 2}
        title="Painel"
        subtitle="Visão geral dos investimentos. Use o seletor no topo para alternar entre Empresa 1, Empresa 2 ou ambas."
        actions={
          <>
            {e1 && (
              <Link href="/obras/nova" className="btn btn-e1">
                + Nova obra
              </Link>
            )}
            {e2 && (
              <Link href="/leilao/novo" className="btn btn-e2">
                + Novo imóvel
              </Link>
            )}
          </>
        }
      />

      {vencidos && vencidos._count > 0 && (
        <Link
          href={`/locacoes?tipo=rec&venc=${hojeISO()}`}
          className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 hover:bg-red-100"
        >
          <span>
            <strong>{vencidos._count} recebimento(s) de aluguel vencido(s)</strong>, somando {brl(vencidos._sum.valor)}.
          </span>
          <span className="font-medium">Ver e dar baixa →</span>
        </Link>
      )}

      {escopo === "ambas" && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat tone="brand" label="Capital total investido" value={brl(investidoTotal)} hint="Aportes (E1) + custos de leilão (E2)" />
          <Stat
            tone={realizadoTotal >= 0 ? "pos" : "neg"}
            label="Resultado realizado"
            value={brl(realizadoTotal)}
            hint="Vendas concluídas + resultado de aluguéis"
          />
          <Stat label="Resultado projetado (carteira E2)" value={brl(projetadoE2)} hint="Com base no valor de venda estimado" />
          <Stat label="Receita de aluguel contratada" value={`${brl(aluguelMensal)}/mês`} hint="Contratos ativos (E1)" />
        </div>
      )}

      {e1 && (
        <div className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span className="h-2.5 w-2.5 rounded-full bg-e1" /> Empresa 1 · Obras por administração
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <Stat tone="e1" label="Obras" value={obras.length} hint={`${obrasAtivas.length} em planejamento/andamento`} />
            <Stat tone="e1" label="Capital aportado" value={brl(aportado)} hint={`Previsto: ${brl(previsto)}`} />
            <Stat
              tone="e1"
              label="Execução financeira"
              value={pct(previsto > 0 ? aportado / previsto : null, 1)}
              hint="Aportado ÷ custo previsto"
            />
            <Stat
              tone={resultadoVendasE1 >= 0 ? "pos" : "neg"}
              label="Resultado de vendas"
              value={brl(resultadoVendasE1)}
              hint={`${vendidas.length} unidade(s) vendida(s)`}
            />
            <Stat
              tone={resultadoAluguelE1 >= 0 ? "pos" : "neg"}
              label="Resultado de aluguéis"
              value={brl(resultadoAluguelE1)}
              hint={`${brl(aluguelMensal)}/mês contratado`}
            />
          </div>
        </div>
      )}

      {e2 && (
        <div className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span className="h-2.5 w-2.5 rounded-full bg-e2" /> Empresa 2 · Leilão de imóveis
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <Stat tone="e2" label="Imóveis cadastrados" value={imoveis.length} hint={`${carteira.length} em carteira`} />
            <Stat tone="e2" label="Capital investido" value={brl(investidoE2)} hint={`Em carteira: ${brl(emCarteiraE2)}`} />
            <Stat
              tone={resultadoE2 >= 0 ? "pos" : "neg"}
              label="Resultado realizado"
              value={brl(resultadoE2)}
              hint={`${vendidos.length} imóvel(is) vendido(s)`}
            />
            <Stat tone="e2" label="ROI realizado" value={pct(custoVendidos > 0 ? resultadoE2 / custoVendidos : null)} hint="Resultado ÷ custo dos vendidos" />
            <Stat tone="e2" label="Resultado projetado" value={brl(projetadoE2)} hint="Carteira atual" />
          </div>
        </div>
      )}

      <div className="mb-6 grid gap-6 xl:grid-cols-3">
        <Card title="Fluxo mensal — últimos 12 meses" className="xl:col-span-2">
          <FluxoChart data={fluxo} e1={e1} e2={e2} />
        </Card>
        <Card title="Resultado por empreendimento">
          {resultados.length ? (
            <BarrasH data={resultados} colorirSinal />
          ) : (
            <Empty>Nenhum resultado apurado ainda.</Empty>
          )}
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {e1 && (
          <Card
            title="Obras"
            bodyClass="table-wrap"
            actions={
              <Link href="/obras" className="btn btn-ghost btn-sm">
                Ver todas →
              </Link>
            }
          >
            {obras.length ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Nº</th>
                    <th>Unidade</th>
                    <th>Status</th>
                    <th className="num">Aportado</th>
                    <th className="num">Execução</th>
                  </tr>
                </thead>
                <tbody>
                  {obras.slice(0, 8).map((o) => (
                    <tr key={o.id}>
                      <td className="font-semibold">{o.numero}</td>
                      <td>
                        <Link href={`/obras/${o.id}`} className="link">
                          {o.nome}
                        </Link>
                      </td>
                      <td>
                        <Badge tone={STATUS_OBRA[o.status].tone}>{STATUS_OBRA[o.status].label}</Badge>
                      </td>
                      <td className="num">{brl(o.totalAportes)}</td>
                      <td className="num">
                        <Progress v={o.execucao} cor={CORES.e1} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-5">
                <Empty>
                  Nenhuma obra cadastrada. <Link href="/obras/nova" className="link">Cadastrar a primeira</Link>
                </Empty>
              </div>
            )}
          </Card>
        )}
        {e2 && (
          <Card
            title="Imóveis de leilão"
            bodyClass="table-wrap"
            actions={
              <Link href="/leilao" className="btn btn-ghost btn-sm">
                Ver todos →
              </Link>
            }
          >
            {imoveis.length ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Cód.</th>
                    <th>Imóvel</th>
                    <th>Status</th>
                    <th className="num">Custo total</th>
                    <th className="num">Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {imoveis.slice(0, 8).map((i) => (
                    <tr key={i.id}>
                      <td className="font-semibold">{i.codigo}</td>
                      <td>
                        <Link href={`/leilao/${i.id}`} className="link">
                          {i.descricao}
                        </Link>
                      </td>
                      <td>
                        <Badge tone={STATUS_LEILAO[i.status].tone}>{STATUS_LEILAO[i.status].label}</Badge>
                      </td>
                      <td className="num">{brl(i.custoTotal)}</td>
                      <td className="num">
                        <Money v={i.resultado} colored dash />
                        {!i.vendido && i.resultado !== null && <span className="ml-1 text-[10px] text-slate-400">proj.</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-5">
                <Empty>
                  Nenhum imóvel cadastrado. <Link href="/leilao/novo" className="link">Cadastrar o primeiro</Link>
                </Empty>
              </div>
            )}
          </Card>
        )}
      </div>
    </>
  );
}

function Progress({ v, cor }: { v: number | null; cor: string }) {
  if (v === null) return <span className="text-slate-400">—</span>;
  const w = Math.min(100, Math.max(0, v * 100));
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full" style={{ width: `${w}%`, background: v > 1 ? CORES.neg : cor }} />
      </div>
      <span className="w-12 text-xs tabular-nums">{pct(v, 0)}</span>
    </div>
  );
}
