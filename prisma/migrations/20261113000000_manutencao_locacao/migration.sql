-- AlterTable
ALTER TABLE "Locacao" ADD COLUMN     "jurosMesPct" DECIMAL(6,2),
ADD COLUMN     "multaAtrasoPct" DECIMAL(6,2);

-- AlterTable
ALTER TABLE "LancamentoLocacao" ADD COLUMN     "desconto" DECIMAL(14,2),
ADD COLUMN     "formaPagamento" TEXT,
ADD COLUMN     "juros" DECIMAL(14,2),
ADD COLUMN     "multa" DECIMAL(14,2),
ADD COLUMN     "obsPagamento" TEXT;

-- CreateTable
CREATE TABLE "ReajusteLocacao" (
    "id" SERIAL NOT NULL,
    "locacaoId" INTEGER NOT NULL,
    "aPartirDe" DATE NOT NULL,
    "indice" TEXT,
    "percentual" DECIMAL(8,4),
    "valorAnterior" DECIMAL(14,2) NOT NULL,
    "valorNovo" DECIMAL(14,2) NOT NULL,
    "lancamentosAtualizados" INTEGER NOT NULL DEFAULT 0,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReajusteLocacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReajusteLocacao_locacaoId_idx" ON "ReajusteLocacao"("locacaoId");

-- CreateIndex
CREATE INDEX "LancamentoLocacao_status_vencimento_idx" ON "LancamentoLocacao"("status", "vencimento");

-- AddForeignKey
ALTER TABLE "ReajusteLocacao" ADD CONSTRAINT "ReajusteLocacao_locacaoId_fkey" FOREIGN KEY ("locacaoId") REFERENCES "Locacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
