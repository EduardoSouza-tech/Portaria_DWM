-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USUARIO');

-- CreateEnum
CREATE TYPE "StatusObra" AS ENUM ('PLANEJAMENTO', 'EM_ANDAMENTO', 'CONCLUIDA', 'VENDIDA', 'ALUGADA');

-- CreateEnum
CREATE TYPE "Destinacao" AS ENUM ('VENDA', 'ALUGUEL');

-- CreateEnum
CREATE TYPE "TipoLancamentoLocacao" AS ENUM ('ALUGUEL', 'OUTRA_RECEITA', 'COMISSAO', 'IPTU', 'CONDOMINIO', 'MANUTENCAO', 'SEGURO', 'OUTRA_DESPESA');

-- CreateEnum
CREATE TYPE "StatusLancamento" AS ENUM ('PENDENTE', 'PAGO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "StatusLeilao" AS ENUM ('ANALISE', 'LANCE_DADO', 'ARREMATADO', 'EM_REFORMA', 'A_VENDA', 'VENDIDO', 'NAO_ARREMATADO');

-- CreateEnum
CREATE TYPE "GrupoCustoLeilao" AS ENUM ('AQUISICAO', 'REFORMA', 'MANUTENCAO', 'VENDA');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USUARIO',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "descricao" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Construtora" (
    "id" SERIAL NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "cnpj" TEXT,
    "responsavel" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Construtora_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Imobiliaria" (
    "id" SERIAL NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "cnpj" TEXT,
    "creci" TEXT,
    "contato" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "comissaoPct" DECIMAL(6,2),
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Imobiliaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inquilino" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cpfCnpj" TEXT,
    "rg" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "endereco" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inquilino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Obra" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "endereco" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "uf" TEXT,
    "cep" TEXT,
    "matricula" TEXT,
    "cartorio" TEXT,
    "inscricaoIptu" TEXT,
    "construtoraId" INTEGER,
    "custoPrevisto" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "dataInicio" DATE,
    "dataTerminoPrevista" DATE,
    "dataTermino" DATE,
    "status" "StatusObra" NOT NULL DEFAULT 'PLANEJAMENTO',
    "destinacao" "Destinacao",
    "vendaValor" DECIMAL(14,2),
    "vendaData" DATE,
    "vendaComprador" TEXT,
    "vendaCompradorDoc" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Obra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aporte" (
    "id" SERIAL NOT NULL,
    "obraId" INTEGER NOT NULL,
    "data" DATE NOT NULL,
    "valor" DECIMAL(14,2) NOT NULL,
    "etapa" TEXT,
    "descricao" TEXT,
    "contrapartida" TEXT,
    "formaPagamento" TEXT,
    "emissorCnpj" TEXT,
    "emissorRazaoSocial" TEXT,
    "nfNumero" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Aporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustoVendaObra" (
    "id" SERIAL NOT NULL,
    "obraId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT,
    "valor" DECIMAL(14,2) NOT NULL,
    "data" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustoVendaObra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Locacao" (
    "id" SERIAL NOT NULL,
    "obraId" INTEGER NOT NULL,
    "inquilinoId" INTEGER NOT NULL,
    "imobiliariaId" INTEGER,
    "valorAluguel" DECIMAL(14,2) NOT NULL,
    "diaVencimento" INTEGER NOT NULL DEFAULT 10,
    "dataInicio" DATE NOT NULL,
    "dataFim" DATE,
    "taxaAdministracaoPct" DECIMAL(6,2),
    "indiceReajuste" TEXT,
    "garantia" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Locacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LancamentoLocacao" (
    "id" SERIAL NOT NULL,
    "locacaoId" INTEGER NOT NULL,
    "competencia" DATE NOT NULL,
    "tipo" "TipoLancamentoLocacao" NOT NULL,
    "descricao" TEXT,
    "valor" DECIMAL(14,2) NOT NULL,
    "vencimento" DATE,
    "dataPagamento" DATE,
    "status" "StatusLancamento" NOT NULL DEFAULT 'PENDENTE',
    "nossoNumero" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LancamentoLocacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImovelLeilao" (
    "id" SERIAL NOT NULL,
    "codigo" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipoImovel" TEXT,
    "endereco" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "uf" TEXT,
    "cep" TEXT,
    "matricula" TEXT,
    "inscricaoIptu" TEXT,
    "modalidade" TEXT,
    "leiloeiro" TEXT,
    "processo" TEXT,
    "dataLeilao" DATE,
    "ocupado" BOOLEAN NOT NULL DEFAULT false,
    "valorAvaliacao" DECIMAL(14,2),
    "valorLance" DECIMAL(14,2),
    "valorArrematacao" DECIMAL(14,2),
    "dataCompra" DATE,
    "valorVendaEstimado" DECIMAL(14,2),
    "valorVenda" DECIMAL(14,2),
    "dataVenda" DATE,
    "comprador" TEXT,
    "status" "StatusLeilao" NOT NULL DEFAULT 'ANALISE',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImovelLeilao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustoLeilao" (
    "id" SERIAL NOT NULL,
    "imovelId" INTEGER NOT NULL,
    "grupo" "GrupoCustoLeilao" NOT NULL,
    "categoria" TEXT NOT NULL,
    "descricao" TEXT,
    "valor" DECIMAL(14,2) NOT NULL,
    "data" DATE,
    "fornecedorCnpj" TEXT,
    "fornecedorRazaoSocial" TEXT,
    "nfNumero" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustoLeilao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulacaoLeilao" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "valorArremate" DECIMAL(14,2) NOT NULL,
    "valorVendaEstimado" DECIMAL(14,2) NOT NULL,
    "pctLeiloeiro" DECIMAL(6,2) NOT NULL,
    "pctItbi" DECIMAL(6,2) NOT NULL,
    "pctRegistro" DECIMAL(6,2) NOT NULL,
    "pctIr" DECIMAL(6,2) NOT NULL,
    "baseIr" TEXT NOT NULL DEFAULT 'LUCRO',
    "pctComissaoVenda" DECIMAL(6,2) NOT NULL,
    "advogado" DECIMAL(14,2) NOT NULL,
    "pctReforma" DECIMAL(6,2) NOT NULL,
    "debitosAto" DECIMAL(14,2) NOT NULL,
    "custoMensal" DECIMAL(14,2) NOT NULL,
    "prazoMeses" INTEGER NOT NULL,
    "observacoes" TEXT,
    "imovelId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SimulacaoLeilao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Obra_numero_key" ON "Obra"("numero");

-- CreateIndex
CREATE INDEX "Aporte_obraId_idx" ON "Aporte"("obraId");

-- CreateIndex
CREATE INDEX "Aporte_emissorCnpj_idx" ON "Aporte"("emissorCnpj");

-- CreateIndex
CREATE INDEX "Aporte_nfNumero_idx" ON "Aporte"("nfNumero");

-- CreateIndex
CREATE INDEX "Aporte_data_idx" ON "Aporte"("data");

-- CreateIndex
CREATE INDEX "CustoVendaObra_obraId_idx" ON "CustoVendaObra"("obraId");

-- CreateIndex
CREATE INDEX "Locacao_obraId_idx" ON "Locacao"("obraId");

-- CreateIndex
CREATE INDEX "LancamentoLocacao_locacaoId_competencia_idx" ON "LancamentoLocacao"("locacaoId", "competencia");

-- CreateIndex
CREATE UNIQUE INDEX "ImovelLeilao_codigo_key" ON "ImovelLeilao"("codigo");

-- CreateIndex
CREATE INDEX "CustoLeilao_imovelId_idx" ON "CustoLeilao"("imovelId");

-- CreateIndex
CREATE INDEX "CustoLeilao_fornecedorCnpj_idx" ON "CustoLeilao"("fornecedorCnpj");

-- CreateIndex
CREATE INDEX "CustoLeilao_nfNumero_idx" ON "CustoLeilao"("nfNumero");

-- AddForeignKey
ALTER TABLE "Obra" ADD CONSTRAINT "Obra_construtoraId_fkey" FOREIGN KEY ("construtoraId") REFERENCES "Construtora"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aporte" ADD CONSTRAINT "Aporte_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustoVendaObra" ADD CONSTRAINT "CustoVendaObra_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Locacao" ADD CONSTRAINT "Locacao_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Locacao" ADD CONSTRAINT "Locacao_inquilinoId_fkey" FOREIGN KEY ("inquilinoId") REFERENCES "Inquilino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Locacao" ADD CONSTRAINT "Locacao_imobiliariaId_fkey" FOREIGN KEY ("imobiliariaId") REFERENCES "Imobiliaria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LancamentoLocacao" ADD CONSTRAINT "LancamentoLocacao_locacaoId_fkey" FOREIGN KEY ("locacaoId") REFERENCES "Locacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustoLeilao" ADD CONSTRAINT "CustoLeilao_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "ImovelLeilao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulacaoLeilao" ADD CONSTRAINT "SimulacaoLeilao_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "ImovelLeilao"("id") ON DELETE SET NULL ON UPDATE CASCADE;
