import Link from "next/link";
import { PrintButton } from "@/components/forms";
import { Badge, Card, Empty, Money, PageHeader } from "@/components/ui";
import { DESTINACAO, STATUS_LEILAO, STATUS_OBRA } from "@/lib/constants";
import { getEscopo, incluiE1, incluiE2 } from "@/lib/escopo";
import { parseDate } from "@/lib/form";
import { brl, dataBR, pct } from "@/lib/format";
import { fluxoMensal, linhasLeilao, linhasObras } from "@/lib/queries";

export const metadata = { title: "Relatórios" };

type R = "consolidado" | "obras" | "leilao" | "fluxo";

export default async function RelatoriosPage({ searchParams }: { searchParams: Promise<{ r?: string; de?: string; ate?: string }> }) {
  const sp = await searchParams;
  const escopo = await getEscopo();
  const e1 = incluiE1(escopo);
  const e2 = incluiE2(escopo);
  const disponiveis: { key: R; label: string }[] = [
    { key: "consolidado", label: "Consolidado" },
    ...(e1 ? [{ key: "obras" as R, label: "Obras (Empresa 1)" }] : []),
    ...(e2 ? [{ key: "leilao" as R, label: "Leilão (Empresa 2)" }] : []),
    { key: "fluxo", label: "Fluxo mensal" },
  ];
  const r: R = disponiveis.some((d) => d.key === sp.r) ? (sp.r as R) : "consolidado";
  const periodo = { de: parseDate(sp.de), ate: parseDate(sp.ate) };

  const [obras, imoveis, fluxo] = await Promise.all([
    e1 ? linhasObras(periodo) : Promise.resolve([]),
    e2 ? linhasLeilao() : Promise.resolve([]),
    r === "fluxo" ? fluxoMensal(escopo, 24) : Promise.resolve([]),
  ]);

  const exportBase = `/api/export?${new URLSearchParams(Object.entries({ de: sp.de ?? "", ate: sp.ate ?? "" }).filter(([, v]) => v)).toString()}`;

  return (
    <>
      <PageHeader
        empresa={escopo === "ambas" ? "ambas" : escopo === "1" ? 1 : 2}
        title="Relatórios"
        subtitle={`Dados de: ${escopo === "ambas" ? "Empresa 1 e Empresa 2" : `Empresa ${escopo}`} — altere no seletor do topo.`}
        actions={<PrintButton />}
      />

      <nav className="no-print mb-4 flex flex-wrap gap-1 border-b border-slate-200">
        {disponiveis.map((d) => (
          <Link
            key={d.key}
            href={`/relatorios?r=${d.key}${sp.de ? `&de=${sp.de}` : ""}${sp.ate ? `&ate=${sp.ate}` : ""}`}
            className={`-mb-px border-b-2 px-3.5 py-2 text-sm font-medium ${
              r === d.key ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {d.label}
          </Link>
        ))}
      </nav>

      {(r === "consolidado" || r === "obras") && (
        <form className="no-print mb-6 flex flex-wrap items-end gap-3">
          <input type="hidden" name="r" value={r} />
          <div>
            <label className="label">Resultado de aluguéis de</label>
            <input type="date" name="de" defaultValue={sp.de} className="input" />
          </div>
          <div>
            <label className="label">até</label>
            <input type="date" name="ate" defaultValue={sp.ate} className="input" />
          </div>
          <button className="btn btn-secondary">Aplicar período</button>
        </form>
      )}

      {r === "consolidado" && <Consolidado obras={obras} imoveis={imoveis} e1={e1} e2={e2} />}

      {r === "obras" && (
        <Card
          title="Relatório de obras — por número"
          bodyClass="table-wrap"
          actions={
            <a href={`${exportBase}&tipo=obras`} className="btn btn-secondary btn-sm">
              Exportar CSV
            </a>
          }
        >
          {obras.length === 0 ? (
            <div className="p-5">
              <Empty>Nenhuma obra.</Empty>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Unidade</th>
                  <th>Construtora</th>
                  <th>Status</th>
                  <th>Início</th>
                  <th>Término</th>
                  <th className="num">Previsto</th>
                  <th className="num">Aportado</th>
                  <th className="num">Exec.</th>
                  <th>Destinação</th>
                  <th className="num">Venda / Receitas</th>
                  <th className="num">Custos venda / Despesas</th>
                  <th className="num">Resultado</th>
                  <th className="num">ROI</th>
                </tr>
              </thead>
              <tbody>
                {obras.map((o) => (
                  <tr key={o.id}>
                    <td className="font-semibold">{o.numero}</td>
                    <td>
                      <Link href={`/obras/${o.id}/relatorio`} className="link">
                        {o.nome}
                      </Link>
                    </td>
                    <td className="text-slate-600">{o.construtora ?? "—"}</td>
                    <td>
                      <Badge tone={STATUS_OBRA[o.status].tone}>{STATUS_OBRA[o.status].label}</Badge>
                    </td>
                    <td>{dataBR(o.dataInicio)}</td>
                    <td>{dataBR(o.dataTermino ?? o.dataTerminoPrevista)}</td>
                    <td className="num">{brl(o.custoPrevisto)}</td>
                    <td className="num">{brl(o.totalAportes)}</td>
                    <td className="num">{pct(o.execucao, 0)}</td>
                    <td>{o.destinacao ? DESTINACAO[o.destinacao] : "—"}</td>
                    <td className="num">
                      {o.destinacao === "VENDA" ? <Money v={o.vendaValor} dash /> : o.destinacao === "ALUGUEL" ? brl(o.receitasLocacao) : "—"}
                    </td>
                    <td className="num">
                      {o.destinacao === "VENDA" ? brl(o.totalCustosVenda) : o.destinacao === "ALUGUEL" ? brl(o.despesasLocacao) : "—"}
                    </td>
                    <td className="num">
                      <Money v={o.resultado} colored dash />
                    </td>
                    <td className="num">{o.destinacao === "VENDA" ? pct(o.roiVenda) : o.destinacao === "ALUGUEL" && o.totalAportes ? pct(o.resultadoLocacao / o.totalAportes) : "—"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={6}>Total ({obras.length})</td>
                  <td className="num">{brl(obras.reduce((a, o) => a + o.custoPrevisto, 0))}</td>
                  <td className="num">{brl(obras.reduce((a, o) => a + o.totalAportes, 0))}</td>
                  <td colSpan={4} />
                  <td className="num">
                    <Money v={obras.reduce((a, o) => a + (o.resultado ?? 0), 0)} colored />
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          )}
        </Card>
      )}

      {r === "leilao" && (
        <Card
          title="Relatório de leilão — apuração por imóvel"
          bodyClass="table-wrap"
          actions={
            <a href="/api/export?tipo=leilao" className="btn btn-secondary btn-sm">
              Exportar CSV
            </a>
          }
        >
          {imoveis.length === 0 ? (
            <div className="p-5">
              <Empty>Nenhum imóvel.</Empty>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Cód.</th>
                  <th>Imóvel</th>
                  <th>Status</th>
                  <th>Compra</th>
                  <th>Venda</th>
                  <th className="num">Meses</th>
                  <th className="num">Aquisição</th>
                  <th className="num">Reforma</th>
                  <th className="num">Até a venda</th>
                  <th className="num">Custo total</th>
                  <th className="num">Venda líquida</th>
                  <th className="num">Resultado</th>
                  <th className="num">ROI</th>
                  <th className="num">Rend./mês</th>
                </tr>
              </thead>
              <tbody>
                {imoveis.map((i) => (
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
                    <td>{dataBR(i.dataCompra)}</td>
                    <td>{dataBR(i.dataVenda)}</td>
                    <td className="num">{i.prazoMeses.toLocaleString("pt-BR")}</td>
                    <td className="num">{brl(i.totalAquisicao)}</td>
                    <td className="num">{brl(i.totalReforma)}</td>
                    <td className="num">{brl(i.totalManutencao)}</td>
                    <td className="num font-medium">{brl(i.custoTotal)}</td>
                    <td className="num">
                      <Money v={i.vendaLiquida} dash />
                      {!i.vendido && i.vendaLiquida !== null && <div className="text-[10px] text-slate-400">projeção</div>}
                    </td>
                    <td className="num">
                      <Money v={i.resultado} colored dash />
                    </td>
                    <td className="num">{pct(i.roi)}</td>
                    <td className="num">{pct(i.rendimentoMes)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={6}>Total ({imoveis.length})</td>
                  <td className="num">{brl(imoveis.reduce((a, i) => a + i.totalAquisicao, 0))}</td>
                  <td className="num">{brl(imoveis.reduce((a, i) => a + i.totalReforma, 0))}</td>
                  <td className="num">{brl(imoveis.reduce((a, i) => a + i.totalManutencao, 0))}</td>
                  <td className="num">{brl(imoveis.reduce((a, i) => a + i.custoTotal, 0))}</td>
                  <td />
                  <td className="num">
                    <Money v={imoveis.reduce((a, i) => a + (i.resultado ?? 0), 0)} colored />
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          )}
        </Card>
      )}

      {r === "fluxo" && (
        <Card title="Fluxo mensal — últimos 24 meses" bodyClass="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Mês</th>
                {e1 && <th className="num">E1 · Saídas</th>}
                {e1 && <th className="num">E1 · Entradas</th>}
                {e2 && <th className="num">E2 · Saídas</th>}
                {e2 && <th className="num">E2 · Entradas</th>}
                <th className="num">Saldo do mês</th>
                <th className="num">Saldo acumulado</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let acc = 0;
                return fluxo.map((m) => {
                  const saldo = m.e1Entrada + m.e2Entrada - m.e1Saida - m.e2Saida;
                  acc += saldo;
                  return (
                    <tr key={m.mes}>
                      <td>{m.label}</td>
                      {e1 && <td className="num">{brl(m.e1Saida)}</td>}
                      {e1 && <td className="num">{brl(m.e1Entrada)}</td>}
                      {e2 && <td className="num">{brl(m.e2Saida)}</td>}
                      {e2 && <td className="num">{brl(m.e2Entrada)}</td>}
                      <td className="num">
                        <Money v={saldo} colored />
                      </td>
                      <td className="num">
                        <Money v={acc} colored />
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}

function Consolidado({
  obras,
  imoveis,
  e1,
  e2,
}: {
  obras: Awaited<ReturnType<typeof linhasObras>>;
  imoveis: Awaited<ReturnType<typeof linhasLeilao>>;
  e1: boolean;
  e2: boolean;
}) {
  const E1 = {
    ativos: obras.length,
    investido: obras.reduce((a, o) => a + o.totalAportes, 0),
    retorno: obras.reduce((a, o) => a + (o.vendaLiquida ?? 0) + o.receitasLocacao - o.despesasLocacao, 0),
    realizado: obras.reduce((a, o) => a + (o.resultadoVenda ?? 0) + o.resultadoLocacao, 0),
    projetado: 0,
  };
  const vend = imoveis.filter((i) => i.vendido);
  const E2 = {
    ativos: imoveis.length,
    investido: imoveis.reduce((a, i) => a + i.custoTotal, 0),
    retorno: vend.reduce((a, i) => a + (i.vendaLiquida ?? 0), 0),
    realizado: vend.reduce((a, i) => a + (i.resultado ?? 0), 0),
    projetado: imoveis.filter((i) => !i.vendido).reduce((a, i) => a + (i.resultado ?? 0), 0),
  };
  const colunas = [...(e1 ? [{ k: "Empresa 1 · Obras", v: E1 }] : []), ...(e2 ? [{ k: "Empresa 2 · Leilão", v: E2 }] : [])];
  const total = colunas.reduce(
    (a, c) => ({
      ativos: a.ativos + c.v.ativos,
      investido: a.investido + c.v.investido,
      retorno: a.retorno + c.v.retorno,
      realizado: a.realizado + c.v.realizado,
      projetado: a.projetado + c.v.projetado,
    }),
    { ativos: 0, investido: 0, retorno: 0, realizado: 0, projetado: 0 },
  );
  const linhas: { label: string; f: (x: typeof E1) => React.ReactNode }[] = [
    { label: "Empreendimentos / imóveis", f: (x) => x.ativos },
    { label: "Capital investido (aportes / custos)", f: (x) => brl(x.investido) },
    { label: "Retorno líquido (vendas líquidas + aluguéis apurados)", f: (x) => brl(x.retorno) },
    { label: "Resultado realizado", f: (x) => <Money v={x.realizado} colored /> },
    { label: "Resultado projetado (carteira com venda estimada)", f: (x) => <Money v={x.projetado} colored /> },
    { label: "Resultado realizado ÷ capital investido", f: (x) => pct(x.investido ? x.realizado / x.investido : null) },
  ];
  return (
    <Card title="Quadro consolidado" bodyClass="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Indicador</th>
            {colunas.map((c) => (
              <th key={c.k} className="num">
                {c.k}
              </th>
            ))}
            {colunas.length > 1 && <th className="num">Total</th>}
          </tr>
        </thead>
        <tbody>
          {linhas.map((l) => (
            <tr key={l.label}>
              <td>{l.label}</td>
              {colunas.map((c) => (
                <td key={c.k} className="num">
                  {l.f(c.v)}
                </td>
              ))}
              {colunas.length > 1 && <td className="num font-semibold">{l.f(total)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
