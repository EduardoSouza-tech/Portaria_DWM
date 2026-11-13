import Link from "next/link";
import { Badge, Card, Empty, Money, PageHeader, Stat } from "@/components/ui";
import { STATUS_LEILAO, type StatusLeilao } from "@/lib/constants";
import { brl, dataBR, pct } from "@/lib/format";
import { linhasLeilao } from "@/lib/queries";

export const metadata = { title: "Leilão de imóveis" };

export default async function LeilaoPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q, status } = await searchParams;
  const todos = await linhasLeilao();
  const termo = q?.trim().toLowerCase();
  const imoveis = todos.filter(
    (i) =>
      (!status || i.status === status) &&
      (!termo ||
        [i.descricao, i.endereco, i.cidade, i.modalidade, i.tipoImovel, String(i.codigo)]
          .filter(Boolean)
          .some((x) => x!.toLowerCase().includes(termo))),
  );
  const vendidos = imoveis.filter((i) => i.vendido);
  const tot = imoveis.reduce(
    (a, i) => ({
      arrematacao: a.arrematacao + i.arrematacao,
      custo: a.custo + i.custoTotal,
      venda: a.venda + (i.vendido ? (i.venda ?? 0) : 0),
      resultado: a.resultado + (i.vendido ? (i.resultado ?? 0) : 0),
    }),
    { arrematacao: 0, custo: 0, venda: 0, resultado: 0 },
  );
  const custoVendidos = vendidos.reduce((a, i) => a + i.custoTotal, 0);

  return (
    <>
      <PageHeader
        empresa={2}
        title="Imóveis de leilão"
        subtitle="Cadastro do imóvel, lance, arrematação, custos, venda e apuração do resultado."
        actions={
          <>
            <Link href="/leilao/simulador" className="btn btn-secondary">
              Simulador
            </Link>
            <Link href="/leilao/novo" className="btn btn-e2">
              + Novo imóvel
            </Link>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat tone="e2" label="Imóveis" value={imoveis.length} hint={`${vendidos.length} vendido(s)`} />
        <Stat tone="e2" label="Custo total investido" value={brl(tot.custo)} hint={`Arrematações: ${brl(tot.arrematacao)}`} />
        <Stat tone={tot.resultado >= 0 ? "pos" : "neg"} label="Resultado realizado" value={brl(tot.resultado)} hint={`Vendas: ${brl(tot.venda)}`} />
        <Stat tone="e2" label="ROI realizado" value={pct(custoVendidos ? tot.resultado / custoVendidos : null)} />
      </div>

      <Card bodyClass="table-wrap">
        <form className="no-print flex flex-wrap items-end gap-3 border-b border-slate-100 p-4">
          <div className="min-w-56 flex-1">
            <label className="label">Pesquisar</label>
            <input name="q" defaultValue={q} placeholder="Descrição, endereço, cidade, modalidade…" className="input" />
          </div>
          <div className="w-48">
            <label className="label">Status</label>
            <select name="status" defaultValue={status ?? ""} className="input">
              <option value="">Todos</option>
              {(Object.keys(STATUS_LEILAO) as StatusLeilao[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LEILAO[s].label}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-secondary">Filtrar</button>
          {(q || status) && (
            <Link href="/leilao" className="btn btn-ghost">
              Limpar
            </Link>
          )}
        </form>
        {imoveis.length === 0 ? (
          <div className="p-5">
            <Empty>
              Nenhum imóvel encontrado.{" "}
              <Link href="/leilao/novo" className="link">
                Cadastrar imóvel
              </Link>
            </Empty>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Cód.</th>
                <th>Imóvel</th>
                <th>Status</th>
                <th>Compra</th>
                <th className="num">Arrematação</th>
                <th className="num">Custo total</th>
                <th className="num">Venda</th>
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
                    <div className="text-xs text-slate-500">
                      {[i.tipoImovel, i.cidade && `${i.cidade}/${i.uf ?? ""}`, i.modalidade].filter(Boolean).join(" · ")}
                    </div>
                  </td>
                  <td>
                    <Badge tone={STATUS_LEILAO[i.status].tone}>{STATUS_LEILAO[i.status].label}</Badge>
                  </td>
                  <td className="whitespace-nowrap">{dataBR(i.dataCompra)}</td>
                  <td className="num">{brl(i.arrematacao)}</td>
                  <td className="num">{brl(i.custoTotal)}</td>
                  <td className="num">
                    {i.venda !== null ? (
                      <>
                        {brl(i.venda)}
                        {!i.vendido && <div className="text-[10px] text-slate-400">estimado</div>}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="num">
                    <Money v={i.resultado} colored dash />
                  </td>
                  <td className="num">{pct(i.roi)}</td>
                  <td className="num">{pct(i.rendimentoMes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
