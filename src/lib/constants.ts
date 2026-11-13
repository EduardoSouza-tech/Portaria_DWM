// Rótulos e listas do domínio (seguro para client e server)

export type Tone = "gray" | "blue" | "amber" | "green" | "red" | "violet" | "teal";

export type StatusObra = "PLANEJAMENTO" | "EM_ANDAMENTO" | "CONCLUIDA" | "VENDIDA" | "ALUGADA";
export type DestinacaoObra = "VENDA" | "ALUGUEL";
export type StatusLeilao =
  | "ANALISE"
  | "LANCE_DADO"
  | "ARREMATADO"
  | "EM_REFORMA"
  | "A_VENDA"
  | "VENDIDO"
  | "NAO_ARREMATADO";
export type GrupoCusto = "AQUISICAO" | "REFORMA" | "MANUTENCAO" | "VENDA";
export type TipoLancLocacao =
  | "ALUGUEL"
  | "OUTRA_RECEITA"
  | "COMISSAO"
  | "IPTU"
  | "CONDOMINIO"
  | "MANUTENCAO"
  | "SEGURO"
  | "OUTRA_DESPESA";
export type StatusLanc = "PENDENTE" | "PAGO" | "CANCELADO";

export const STATUS_OBRA: Record<StatusObra, { label: string; tone: Tone }> = {
  PLANEJAMENTO: { label: "Planejamento", tone: "gray" },
  EM_ANDAMENTO: { label: "Em andamento", tone: "blue" },
  CONCLUIDA: { label: "Concluída", tone: "teal" },
  VENDIDA: { label: "Vendida", tone: "green" },
  ALUGADA: { label: "Alugada", tone: "violet" },
};

export const DESTINACAO: Record<DestinacaoObra, string> = {
  VENDA: "Venda",
  ALUGUEL: "Aluguel",
};

export const ETAPAS_OBRA = [
  "Projetos e aprovações",
  "Terreno / documentação",
  "Serviços preliminares",
  "Fundação",
  "Estrutura",
  "Alvenaria",
  "Cobertura / telhado",
  "Instalações elétricas",
  "Instalações hidráulicas",
  "Esquadrias",
  "Revestimentos",
  "Pisos",
  "Pintura",
  "Louças e metais",
  "Acabamentos",
  "Paisagismo",
  "Limpeza final",
  "Mão de obra",
  "Taxa de administração",
  "Outros",
];

export const FORMAS_PAGAMENTO = ["PIX", "TED / Transferência", "Boleto", "Cartão", "Dinheiro", "Cheque", "Outros"];

export const TIPOS_CUSTO_VENDA_OBRA = [
  "Imposto de renda (ganho de capital)",
  "Outros impostos",
  "Comissão de corretagem",
  "ITBI",
  "Escritura / registro",
  "Certidões / despachante",
  "Marketing",
  "Outros",
];

export const TIPO_LANC_LOCACAO: Record<TipoLancLocacao, { label: string; receita: boolean }> = {
  ALUGUEL: { label: "Aluguel", receita: true },
  OUTRA_RECEITA: { label: "Outra receita", receita: true },
  COMISSAO: { label: "Comissão / taxa adm. imobiliária", receita: false },
  IPTU: { label: "IPTU", receita: false },
  CONDOMINIO: { label: "Condomínio", receita: false },
  MANUTENCAO: { label: "Manutenção", receita: false },
  SEGURO: { label: "Seguro", receita: false },
  OUTRA_DESPESA: { label: "Outra despesa", receita: false },
};

export const STATUS_LANC: Record<StatusLanc, { label: string; tone: Tone }> = {
  PENDENTE: { label: "Pendente", tone: "amber" },
  PAGO: { label: "Pago", tone: "green" },
  CANCELADO: { label: "Cancelado", tone: "gray" },
};

export const STATUS_LEILAO: Record<StatusLeilao, { label: string; tone: Tone }> = {
  ANALISE: { label: "Em análise", tone: "gray" },
  LANCE_DADO: { label: "Lance dado", tone: "blue" },
  ARREMATADO: { label: "Arrematado", tone: "teal" },
  EM_REFORMA: { label: "Em reforma", tone: "amber" },
  A_VENDA: { label: "À venda", tone: "violet" },
  VENDIDO: { label: "Vendido", tone: "green" },
  NAO_ARREMATADO: { label: "Não arrematado", tone: "red" },
};

export const GRUPOS_CUSTO: Record<GrupoCusto, { label: string; categorias: string[] }> = {
  AQUISICAO: {
    label: "Aquisição",
    categorias: [
      "Comissão Leiloeiro",
      "ITBI",
      "Carta de Arrematação",
      "Oficial de Justiça",
      "Chaveiro",
      "Registro",
      "Acordo (ocupação)",
      "Advogado",
      "Outros",
    ],
  },
  REFORMA: {
    label: "Reparos / Reforma",
    categorias: ["Pintor", "Marcenaria", "Vidros", "Fechadura", "Pedreiro", "Elétrica", "Hidráulica", "Material", "Outros"],
  },
  MANUTENCAO: {
    label: "Custos até a venda",
    categorias: ["IPTU", "Condomínio", "Faxina", "Extras"],
  },
  VENDA: {
    label: "Custos da venda",
    categorias: ["Comissão do Corretor", "Imposto de Renda", "Outros"],
  },
};

export const GRUPOS_ORDEM: GrupoCusto[] = ["AQUISICAO", "REFORMA", "MANUTENCAO", "VENDA"];

export const MODALIDADES_LEILAO = [
  "Judicial",
  "Extrajudicial",
  "Banco / instituição financeira",
  "Venda direta",
  "Outros",
];

export const TIPOS_IMOVEL = ["Apartamento", "Casa", "Terreno", "Sala comercial", "Loja", "Galpão", "Rural", "Outros"];

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

export const CORES = { e1: "#2563eb", e1Claro: "#93c5fd", e2: "#d97706", e2Claro: "#fcd34d", pos: "#059669", neg: "#dc2626" };
