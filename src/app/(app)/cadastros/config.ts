export type Campo = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "percent" | "doc" | "email";
  required?: boolean;
  span?: 1 | 2 | 3 | 4 | 6;
};

export type ConfigCadastro = {
  titulo: string;
  singular: string;
  descricao: string;
  principal: string;
  campos: Campo[];
  colunas: string[];
  uso: string;
};

export const CADASTROS = {
  construtoras: {
    titulo: "Construtoras",
    singular: "construtora",
    descricao: "Empresas que conduzem as obras por administração (Empresa 1).",
    principal: "razaoSocial",
    uso: "obra(s)",
    campos: [
      { name: "razaoSocial", label: "Razão social", required: true, span: 3 },
      { name: "nomeFantasia", label: "Nome fantasia", span: 3 },
      { name: "cnpj", label: "CNPJ", type: "doc", span: 2 },
      { name: "responsavel", label: "Responsável técnico / contato", span: 2 },
      { name: "telefone", label: "Telefone", span: 2 },
      { name: "email", label: "E-mail", type: "email", span: 3 },
      { name: "observacoes", label: "Observações", type: "textarea", span: 6 },
    ],
    colunas: ["razaoSocial", "cnpj", "responsavel", "telefone", "email"],
  },
  imobiliarias: {
    titulo: "Imobiliárias",
    singular: "imobiliária",
    descricao: "Imobiliárias que administram as locações (Empresa 1).",
    principal: "razaoSocial",
    uso: "locação(ões)",
    campos: [
      { name: "razaoSocial", label: "Razão social", required: true, span: 3 },
      { name: "cnpj", label: "CNPJ", type: "doc", span: 2 },
      { name: "creci", label: "CRECI", span: 1 },
      { name: "contato", label: "Contato", span: 2 },
      { name: "telefone", label: "Telefone", span: 2 },
      { name: "email", label: "E-mail", type: "email", span: 2 },
      { name: "comissaoPct", label: "Taxa de administração padrão (%)", type: "percent", span: 2 },
      { name: "observacoes", label: "Observações", type: "textarea", span: 6 },
    ],
    colunas: ["razaoSocial", "cnpj", "creci", "contato", "telefone", "comissaoPct"],
  },
  inquilinos: {
    titulo: "Inquilinos",
    singular: "inquilino",
    descricao: "Locatários das unidades alugadas (Empresa 1).",
    principal: "nome",
    uso: "locação(ões)",
    campos: [
      { name: "nome", label: "Nome / razão social", required: true, span: 3 },
      { name: "cpfCnpj", label: "CPF/CNPJ", type: "doc", span: 2 },
      { name: "rg", label: "RG", span: 1 },
      { name: "telefone", label: "Telefone", span: 2 },
      { name: "email", label: "E-mail", type: "email", span: 2 },
      { name: "endereco", label: "Endereço", span: 2 },
      { name: "observacoes", label: "Observações", type: "textarea", span: 6 },
    ],
    colunas: ["nome", "cpfCnpj", "telefone", "email"],
  },
} satisfies Record<string, ConfigCadastro>;

export type TipoCadastro = keyof typeof CADASTROS;

export function isTipo(t: string): t is TipoCadastro {
  return t in CADASTROS;
}
