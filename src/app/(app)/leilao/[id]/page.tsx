import Link from "next/link";
import { ActionButton, DeleteButton, PrintButton } from "@/components/forms";
import { Badge, Card, Empty, KV, Money, PageHeader } from "@/components/ui";
import { GRUPOS_CUSTO, STATUS_LEILAO, type GrupoCusto } from "@/lib/constants";
import { brl, dataBR, docMask, pct } from "@/lib/format";
import { emissoresConhecidos } from "@/lib/queries";
import { criarCusto, excluirCusto, excluirImovel, lancarCustosPadrao } from "../actions";
import { CustoForm } from "../CustoForm";
import { getImovel, resumoImovel } from "./data";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const im = await getImovel((await params).id);
  return { title: `Leilão #${im.codigo} · ${im.descricao}` };
}

export default async function ImovelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [im, emissores] = await Promise.all([getImovel(id), emissoresConhecidos()]);
  const r = resumoImovel(im);

  /** Bloco da planilha: categorias fixas + categorias extras lançadas */
  const Bloco = ({ grupo, extraTopo }: { grupo: GrupoCusto; extraTopo?: React.ReactNode }) => {
    const fixas = grupo === "AQUISICAO" ? GRUPOS_CUSTO.AQUISICAO.categorias.filter((c) => c !== "Advogado" && c !== "Outros") : grupo === "REFORMA" ? GRUPOS_CUSTO.REFORMA.categorias.slice(0, 6) : GRUPOS_CUSTO[grupo].categorias;
    const extras = Object.keys(r.porCategoria[grupo]).filter((c) => !fixas.includes(c));
    const total = grupo === "AQUISICAO" ? r.totalAquisicao : r.porGrupo[grupo];
    return (
      <div>
        {extraTopo}
        {[...fixas, ...extras].map((c) => (
          <div key={c} className="sheet-row">
            <span className="text-slate-600">{c === "Acordo (ocupação)" ? "Acordo (em casos de ocupação)" : c}</span>
            <span className="tabular-nums">{brl(r.porCategoria[grupo][c] ?? 0)}</span>
          </div>
        ))}
        <div className="sheet-total">
          <span>TOTAL:</span>
          <span className="tabular-nums">{brl(total)}</span>
        </div>
      </div>
    );
  };

  return (
    <>
      <PageHeader
        empresa={2}
        back={{ href: "/leilao", label: "Imóveis de leilão" }}
        title={
          <>
            <span className="text-slate-400">#{im.codigo} ·</span> {im.descricao}
          </>
        }
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={STATUS_LEILAO[im.status].tone}>{STATUS_LEILAO[im.status].label}</Badge>
            {im.ocupado && <Badge tone="red">Ocupado</Badge>}
            {[im.tipoImovel, im.endereco, im.cidade && `${im.cidade}/${im.uf ?? ""}`].filter(Boolean).join(" · ")}
          </span>
        }
        actions={
          <>
            <PrintButton />
            <Link href={`/leilao/${im.id}/editar`} className="btn btn-secondary">
              Editar cadastro
            </Link>
          </>
        }
      />

      {/* ---------- Planilha ---------- */}
      <div className="mb-6 grid gap-6 xl:grid-cols-3">
        <div className="grid content-start gap-6 md:grid-cols-3 xl:col-span-2">
          <Card title="Aquisição">
            <Bloco
              grupo="AQUISICAO"
              extraTopo={
                <div className="sheet-row font-medium">
                  <span>Arrematação</span>
                  <span className="tabular-nums">{brl(r.arrematacao)}</span>
                </div>
              }
            />
          </Card>
          <Card title="Reparos / Reforma">
            <Bloco grupo="REFORMA" />
          </Card>
          <Card title="Custos até a venda">
            <Bloco grupo="MANUTENCAO" />
          </Card>
          <div className="card flex items-center justify-between bg-slate-900 px-5 py-4 text-white md:col-span-3">
            <span className="text-sm font-medium text-slate-300">Custo Total</span>
            <span className="text-2xl font-semibold tabular-nums">{brl(r.custoTotal)}</span>
          </div>
        </div>

        <Card title={r.vendido ? "Venda" : "Venda (projeção)"}>
          <KV k="Venda" v={<Money v={r.venda} dash />} />
          {!r.vendido && r.venda !== null && <p className="-mt-1 mb-1 text-right text-[11px] text-slate-400">usando o valor de venda estimado</p>}
          <KV k="Data da compra" v={dataBR(im.dataCompra)} />
          <KV k="Data da venda" v={dataBR(im.dataVenda)} />
          <KV k="Prazo / meses" v={r.prazoMeses.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} />
          <KV k="Comissão do corretor" v={brl(r.porCategoria.VENDA["Comissão do Corretor"] ?? 0)} />
          <KV k="Imposto de renda" v={brl(r.porCategoria.VENDA["Imposto de Renda"] ?? 0)} />
          {(r.porCategoria.VENDA["Outros"] ?? 0) > 0 && <KV k="Outros custos de venda" v={brl(r.porCategoria.VENDA["Outros"])} />}
          <KV k="Venda líquida" v={<Money v={r.vendaLiquida} dash />} />
          <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-slate-500">Resultado</span>
              <span className="text-2xl font-semibold">
                <Money v={r.resultado} colored dash />
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">ROI</span>
              <span className="font-semibold">{pct(r.roi)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Rendimento ao mês</span>
              <span className="font-semibold">{pct(r.rendimentoMes)}</span>
            </div>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3">
            <KV k="Valor do imóvel (avaliação)" v={<Money v={im.valorAvaliacao === null ? null : Number(im.valorAvaliacao)} dash />} />
            <KV k="Lance" v={<Money v={im.valorLance === null ? null : Number(im.valorLance)} dash />} />
            <KV k="Modalidade" v={im.modalidade} />
            <KV k="Leiloeiro" v={im.leiloeiro} />
            <KV k="Processo / edital" v={im.processo} />
            <KV k="Data do leilão" v={dataBR(im.dataLeilao)} />
            <KV k="Matrícula" v={im.matricula} />
            <KV k="IPTU" v={im.inscricaoIptu} />
            {im.simulacoes.length > 0 && (
              <KV
                k="Simulação de origem"
                v={im.simulacoes.map((s) => (
                  <Link key={s.id} href={`/leilao/simulador?id=${s.id}`} className="link">
                    {s.nome}
                  </Link>
                ))}
              />
            )}
          </div>
        </Card>
      </div>

      {/* ---------- Lançamentos ---------- */}
      <Card
        title="Lançar custo"
        className="no-print mb-6"
        actions={
          <ActionButton
            action={lancarCustosPadrao.bind(null, im.id)}
            className="btn btn-secondary btn-sm"
            title="Comissão do leiloeiro 5%, ITBI 3% e registro 1,5% sobre a arrematação"
          >
            Calcular leiloeiro / ITBI / registro
          </ActionButton>
        }
      >
        <CustoForm action={criarCusto.bind(null, im.id)} emissores={emissores} />
      </Card>

      <Card title={`Lançamentos de custos (${im.custos.length})`} bodyClass="table-wrap">
        {im.custos.length === 0 ? (
          <div className="p-5">
            <Empty>Nenhum custo lançado.</Empty>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Grupo</th>
                <th>Item</th>
                <th>Descrição</th>
                <th>Fornecedor</th>
                <th>NF</th>
                <th className="num">Valor</th>
                <th className="no-print" />
              </tr>
            </thead>
            <tbody>
              {im.custos.map((c) => (
                <tr key={c.id}>
                  <td className="whitespace-nowrap">{dataBR(c.data)}</td>
                  <td className="text-slate-500">{GRUPOS_CUSTO[c.grupo].label}</td>
                  <td>{c.categoria}</td>
                  <td className="text-slate-600">{c.descricao ?? "—"}</td>
                  <td>
                    {c.fornecedorRazaoSocial ?? "—"}
                    {c.fornecedorCnpj && <div className="text-xs text-slate-500">{docMask(c.fornecedorCnpj)}</div>}
                  </td>
                  <td>{c.nfNumero ?? "—"}</td>
                  <td className="num font-medium">{brl(c.valor)}</td>
                  <td className="no-print whitespace-nowrap text-right">
                    <Link href={`/leilao/${im.id}/custo/${c.id}`} className="btn btn-ghost btn-sm">
                      Editar
                    </Link>
                    <DeleteButton action={excluirCusto.bind(null, im.id, c.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {im.observacoes && (
        <Card title="Observações" className="mt-6">
          <p className="whitespace-pre-line text-sm text-slate-600">{im.observacoes}</p>
        </Card>
      )}

      <div className="no-print mt-6 flex justify-end">
        <DeleteButton
          action={excluirImovel.bind(null, im.id)}
          label="Excluir imóvel"
          confirmText={`Excluir o imóvel #${im.codigo} e todos os custos lançados?`}
        />
      </div>
    </>
  );
}
