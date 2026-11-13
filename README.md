# SASS — Gestão de investimentos imobiliários

Sistema com **dois módulos que conversam entre si**, como duas empresas. Em todo o sistema é possível ver os dados da **Empresa 1**, da **Empresa 2** ou de **ambas** (seletor no topo da tela).

## Empresa 1 — Participação em obras por administração
- Cadastro da unidade: nº da obra, endereço, matrícula, cartório, inscrição do IPTU, empresa (construtora) que conduz a obra
- Custo previsto, datas de início, término previsto e término real
- **Aportes** com data, valor, etapa, contrapartida, forma de pagamento e **emissor da NF (CNPJ, razão social, nº da NF)** — pesquisa detalhada por etapa, emissor e NF
- Valor final da unidade = soma dos aportes, comparado ao custo previsto (execução financeira)
- Ao finalizar a obra, **destinação**:
  - **Venda**: valor, data, comprador, custos de venda (impostos, comissão, etc.) → resultado e ROI do empreendimento
  - **Aluguel**: contrato com inquilino e imobiliária, taxa de administração, geração mensal de aluguel e comissão, lançamentos de IPTU, condomínio etc. → **resultado por período**
  - Campo “nosso número” já preparado para a futura remessa/retorno bancário (CNAB)
- Relatório completo por obra (imprimível/PDF)

## Empresa 2 — Leilão de imóveis
- Cadastro do imóvel, modalidade, leiloeiro, processo, valor do imóvel (avaliação), valor do lance, arrematação
- Planilha de controle igual à do Excel: **Aquisição** (arrematação, comissão do leiloeiro, ITBI, carta de arrematação, oficial de justiça, chaveiro, registro, acordo), **Reparos/Reforma** (pintor, marcenaria, vidros, fechadura, pedreiro, elétrica), **Custos até a venda** (IPTU, condomínio, faxina, extras), **Venda** (comissão do corretor, IR, venda líquida) → custo total, resultado, ROI, prazo em meses e rendimento ao mês
- **Simulador de arremate** (planilha de simulação): leiloeiro 5%, ITBI 3%, registro 1,5%, IR 15%, comissão de venda 6%, advogado, reformas 7%, custos Cond./IPTU e prazo — com cálculo de **lance máximo** para um ROI alvo, simulações salvas e conversão em imóvel

## Consolidado
- Painel com indicadores de cada empresa e consolidados, fluxo mensal e resultado por empreendimento
- Relatórios (consolidado, obras, leilão, fluxo mensal), exportação CSV (Excel) e impressão
- Pesquisa de notas fiscais nas duas empresas
- Cadastros de construtoras, imobiliárias e inquilinos; usuários e permissões

## Tecnologia
Next.js 15 (App Router, Server Actions) · TypeScript · Prisma 6 · PostgreSQL · Tailwind CSS 4 · Recharts

## Rodando localmente
```bash
cp .env.example .env        # ajuste DATABASE_URL e AUTH_SECRET
npm install
npx prisma migrate deploy
npm run db:seed             # cria as empresas e o usuário admin (ADMIN_EMAIL / ADMIN_PASSWORD)
npm run dev
```

## Deploy (Railway)
O projeto usa `Dockerfile` (detectado automaticamente pelo Railway). No serviço, configure o healthcheck em `/api/health` e as variáveis:
- `DATABASE_URL` → referência ao Postgres (`${{Postgres.DATABASE_URL}}`)
- `AUTH_SECRET` → segredo longo e aleatório
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` → usuário administrador criado no primeiro start

No start, o container roda `prisma migrate deploy`, o seed e sobe o Next.js. Healthcheck em `/api/health`.
