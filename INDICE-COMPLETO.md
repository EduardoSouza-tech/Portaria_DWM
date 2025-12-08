# 📚 Índice Completo da Documentação

## Sistema de Portaria Inteligente para Condomínios

**Versão**: 1.0.0  
**Data**: Dezembro 2025  
**Status**: Documentação Completa

---

## 🎯 Início Rápido

- **[README Principal](./README.md)** - Visão geral do sistema
- **[Sumário Executivo](./SUMARIO-EXECUTIVO.md)** - Apresentação comercial e estratégica
- **[Guia de Implementação](./docs/guia-implementacao.md)** - Como colocar em produção

---

## 📂 Estrutura da Documentação

### 01. Funcionalidades Principais

#### [Gestão de Moradores](./docs/01-funcionalidades/gestao-moradores.md)
- Cadastro completo de moradores
- Associação com unidades
- Dependentes e familiares
- Controle de veículos
- Permissões e restrições
- Histórico de acessos completo

**Tópicos abordados**:
- Dados pessoais e biometria
- Múltiplas unidades por morador
- Gestão de dependentes menores
- Notificações configuráveis
- Integração com outros módulos
- Regras de negócio (RN-001 a RN-008)

---

#### [Controle de Visitantes](./docs/01-funcionalidades/controle-visitantes.md)
- Pré-cadastro via app do morador
- QR Code temporário antifraude
- Autorização em tempo real
- Visitantes recorrentes
- Lista negra e bloqueios
- Registro fotográfico obrigatório

**Tópicos abordados**:
- Fluxo de pré-cadastro
- Geração e validação de QR Code
- Métodos de identificação (documento, facial, QR)
- Autorização via push, WhatsApp, SMS
- Visitantes recorrentes (diaristas, personal trainers)
- Sistema antifraude em QR Codes
- Regras de negócio (RN-100 a RN-107)

---

#### [Entregadores e Prestadores](./docs/01-funcionalidades/entregadores-prestadores.md)
- Registro rápido de entregadores (30-60 segundos)
- Integração com plataformas (iFood, Rappi, Amazon)
- Foto comprovante de entrega
- Prestadores de serviço (encanador, eletricista, etc.)
- Rastreamento de permanência
- Autorização simplificada

**Tópicos abordados**:
- Empresas de delivery verificadas
- Entrega na portaria vs. direta ao morador
- Prestadores com autorização prévia
- OCR de códigos de rastreio
- Sistema antifraude para entregas
- Regras de negócio (RN-200 a RN-207)

---

#### [Módulo da Portaria](./docs/01-funcionalidades/modulo-portaria.md)
- Dashboard em tempo real
- Registro rápido de entradas/saídas
- Monitoramento de quem está dentro
- Consulta universal (nome, CPF, placa)
- Gestão de autorizações pendentes
- Abertura de portões (integração IoT)
- Registro de eventos e ocorrências
- Visualização de câmeras (CFTV)
- Chat com moradores

**Tópicos abordados**:
- Interface otimizada para velocidade
- Atalhos de teclado (F1-F6)
- Filtros e buscas avançadas
- Controles de acesso (portões, cancelas)
- Modo emergência
- Turnos de porteiros
- Regras de negócio (RN-300 a RN-305)

---

#### [Gestão de Correspondências](./docs/01-funcionalidades/gestao-correspondencias.md)
- Registro com foto obrigatória
- Notificação automática ao morador
- Assinatura digital na retirada
- Autorização de terceiros
- Correspondências pendentes
- Correspondências abandonadas (30 dias)
- Integração com transportadoras
- OCR de códigos de rastreio

**Tópicos abordados**:
- Tipos de correspondência (encomenda, carta, documento, etc.)
- Captura fotográfica com validação
- Entrega na portaria vs. direta
- Gestão do espaço de armazenamento
- Correspondências com valor alto
- Rastreamento automático (API Correios, Jadlog, etc.)
- Regras de negócio (RN-400 a RN-407)

---

#### [Controle de Veículos](./docs/01-funcionalidades/controle-veiculos.md)
- Cadastro de veículos por unidade
- Placas Mercosul e formato antigo
- Registro automático de entrada/saída
- Gestão de vagas (fixas e rotativas)
- Controle de visitantes motorizados
- OCR de placas (opcional)
- Histórico completo de acessos
- Alertas e notificações

**Tópicos abordados**:
- Múltiplos veículos por unidade
- Veículos temporários (aluguel, empréstimo)
- OCR automático com fallback manual
- Vagas PcD, idoso, motos, carga/descarga
- Integração com Detran (validação de placas)
- Relatórios de movimentação veicular
- Regras de negócio (RN-500 a RN-507)

---

### 02. Arquitetura Técnica

#### [Stack Tecnológico](./docs/02-arquitetura/stack-tecnologico.md)
**Backend**:
- Node.js 20+ LTS com TypeScript
- Framework: NestJS (Clean Architecture + DDD)
- Autenticação: JWT + Refresh Token + MFA
- Real-time: Socket.io (WebSockets)
- Queue: Bull (Redis)
- Storage: AWS S3 / MinIO

**Frontend**:
- Web: React 18+ com TypeScript
- Mobile: React Native ou Flutter
- State: Redux Toolkit / Zustand
- UI: Material-UI / Ant Design

**Banco de Dados**:
- Principal: PostgreSQL 15+
- Cache: Redis 7+
- Busca: Elasticsearch 8+ (opcional)

**Infraestrutura**:
- Containerização: Docker + Docker Compose
- Orquestração: Kubernetes ou Docker Swarm
- CI/CD: GitHub Actions
- Monitoramento: Prometheus + Grafana
- Logs: ELK Stack

**Notificações**:
- Push: Firebase Cloud Messaging
- E-mail: AWS SES / SendGrid
- SMS: Twilio
- WhatsApp: Meta Business API

**Processamento**:
- Imagens: Sharp (Node.js)
- OCR: Tesseract.js, OpenALPR, Google Vision API
- Reconhecimento Facial: Face-api.js, AWS Rekognition

---

### 03. Banco de Dados

#### [Schema Completo](./docs/03-banco-dados/database-schema.sql)
**Tabelas Principais** (24 tabelas):
- `condominios` - Dados dos condomínios
- `unidades` - Apartamentos/casas
- `usuarios` - Sistema de login
- `moradores` - Residentes
- `morador_unidade` - Relacionamento N:N
- `dependentes` - Menores e agregados
- `visitantes` - Cadastro de visitantes
- `visitas` - Registros de acesso
- `visitantes_recorrentes` - Diaristas, personal trainers
- `correspondencias` - Encomendas e cartas
- `autorizados_retirada` - Terceiros autorizados
- `veiculos` - Cadastro de veículos
- `veiculo_unidade` - Associação veículo-unidade
- `acessos_veiculares` - Entrada/saída de veículos
- `porteiros` - Funcionários da portaria
- `turnos` - Controle de jornada
- `eventos_portaria` - Ocorrências
- `logs_auditoria` - Auditoria com blockchain-style
- `empresas_delivery` - iFood, Rappi, etc.
- `entregadores` - Profissionais de delivery
- `entregas` - Registros de entregas
- `prestadores` - Encanadores, eletricistas, etc.
- `servicos_prestados` - Histórico de serviços
- `vagas` - Estacionamento

**Recursos**:
- ENUMs customizados (tipos, status)
- Índices otimizados (GIN, BTREE)
- Triggers para atualização automática
- Views para consultas comuns
- Constraints e validações
- Função de integridade de logs (blockchain)

---

### 04. APIs REST

#### Especificação OpenAPI/Swagger
**Principais Endpoints**:

**Autenticação**:
- `POST /auth/login` - Login com e-mail/senha
- `POST /auth/refresh` - Renovar token
- `POST /auth/logout` - Logout
- `POST /auth/mfa/enable` - Habilitar MFA
- `POST /auth/mfa/verify` - Verificar código MFA

**Moradores**:
- `GET /moradores` - Listar moradores
- `POST /moradores` - Criar morador
- `GET /moradores/:id` - Buscar morador
- `PUT /moradores/:id` - Atualizar morador
- `DELETE /moradores/:id` - Desativar morador
- `POST /moradores/:id/foto` - Upload de foto
- `GET /moradores/:id/historico` - Histórico de acessos

**Visitantes**:
- `GET /visitantes` - Listar visitantes
- `POST /visitantes` - Criar visitante
- `POST /visitantes/pre-cadastro` - Pré-cadastrar com QR Code
- `GET /visitantes/:id/qrcode` - Gerar QR Code
- `POST /visitas` - Registrar visita
- `PUT /visitas/:id/entrada` - Registrar entrada
- `PUT /visitas/:id/saida` - Registrar saída
- `GET /visitas/dentro` - Quem está dentro agora

**Autorizações**:
- `POST /autorizacoes` - Solicitar autorização
- `PUT /autorizacoes/:id/autorizar` - Aprovar
- `PUT /autorizacoes/:id/negar` - Negar
- `GET /autorizacoes/pendentes` - Listar pendentes

**Correspondências**:
- `GET /correspondencias` - Listar correspondências
- `POST /correspondencias` - Registrar nova
- `POST /correspondencias/:id/foto` - Upload de foto
- `PUT /correspondencias/:id/retirada` - Marcar como retirada
- `GET /correspondencias/pendentes` - Pendentes de retirada

**Veículos**:
- `GET /veiculos` - Listar veículos
- `POST /veiculos` - Cadastrar veículo
- `GET /veiculos/:placa` - Buscar por placa
- `POST /acessos-veiculares` - Registrar entrada/saída
- `GET /acessos-veiculares/historico` - Histórico

**Eventos**:
- `GET /eventos` - Listar eventos da portaria
- `POST /eventos` - Registrar evento
- `GET /eventos/:id` - Detalhes do evento

**Relatórios**:
- `GET /relatorios/acessos` - Relatório de acessos
- `GET /relatorios/correspondencias` - Relatório de entregas
- `GET /relatorios/veiculos` - Relatório veicular
- `POST /relatorios/exportar` - Exportar CSV/PDF

**WebSockets**:
- `/ws` - Conexão WebSocket para eventos em tempo real

---

### 05. Fluxos de Negócio

#### [Fluxo: Visitante Completo](./docs/05-fluxos/fluxo-visitante.md)
**Cenários cobertos**:
1. **Visitante com pré-cadastro**: QR Code gerado previamente
2. **Visitante sem pré-cadastro**: Autorização em tempo real
3. **Visitante recorrente**: Entrada automática em horários/dias específicos

**Passos detalhados** (12 etapas):
1. Morador pré-cadastra visitante
2. Sistema gera QR Code com assinatura digital
3. QR Code enviado por WhatsApp/E-mail
4. Visitante chega e apresenta QR Code
5. Porteiro escaneia e sistema valida
6. Morador recebe notificação informativa
7. Sistema registra entrada com timestamp
8. Portão abre automaticamente
9. Visitante entra
10. Sistema monitora permanência
11. Visitante retorna e registra saída
12. Morador notificado da saída

**Exceções tratadas**:
- QR Code falsificado (detecção de fraude)
- Visitante em lista negra (bloqueio)
- Morador cancela autorização
- Sistema offline (modo fallback)

---

### 06. Interfaces de Usuário

#### [App do Morador](./docs/06-interfaces/app-morador.md)
**Telas principais** (7 telas detalhadas):

1. **Login / Onboarding**:
   - Login com e-mail/senha
   - OAuth (Google, Apple, Facebook)
   - Biometria (Face ID, Touch ID)
   - Tutorial de primeiro acesso

2. **Home / Dashboard**:
   - Resumo de atividades (entregas, visitas)
   - Feed de eventos recentes
   - Ações rápidas (novo visitante, abrir portão, chat)
   - Notificações (badge counter)

3. **Visitantes**:
   - Pré-cadastrar novo visitante
   - Autorizar/negar em tempo real
   - Ver quem está dentro agora (WebSocket)
   - Gerenciar pré-cadastrados (QR Codes)
   - Visitantes recorrentes
   - Histórico completo

4. **Correspondências**:
   - Pendentes de retirada (com fotos)
   - Ver foto em alta resolução
   - Autorizar terceiro a retirar
   - Histórico de retiradas
   - Rastreamento de encomendas

5. **Veículos**:
   - Listar veículos cadastrados
   - Ver status (dentro/fora)
   - Histórico de acessos
   - Cadastrar veículo temporário
   - Relatórios de movimentação

6. **Chat com Portaria**:
   - Mensagens em tempo real (WebSocket)
   - Envio de imagens
   - Histórico de conversas
   - Respostas rápidas

7. **Configurações**:
   - Editar perfil
   - Gerenciar notificações
   - Segurança (MFA, biometria, senha)
   - Tema claro/escuro
   - Privacidade e termos

**Sistema de Notificações**:
- Prioritária: Visitante aguardando (com ações)
- Informativa: Visitante entrou/saiu
- Entregas: Nova correspondência
- Veículos: Entrada/saída de veículo

**Widgets** (iOS/Android):
- Resumo de entregas e visitas
- Ações rápidas (novo visitante, abrir portão)

---

### 07. Módulos Extras (Premium/Enterprise)

#### Reconhecimento Facial
- **Tecnologia**: Face-api.js, AWS Rekognition, Azure Face API
- **Precisão**: 99.5%+
- **Casos de uso**:
  - Entrada de moradores sem QR Code
  - Validação de visitantes recorrentes
  - Detecção de intrusos
- **Privacidade**: Consentimento LGPD, dados criptografados

#### OCR de Placas (ANPR/ALPR)
- **Tecnologia**: OpenALPR, Tesseract, PlateRecognizer API
- **Taxa de acerto**: 95-98%
- **Funcionalidades**:
  - Abertura automática de cancela
  - Registro de entrada/saída sem porteiro
  - Alerta de veículo não cadastrado
  - Validação de vaga fixa
- **Fallback**: Porteiro confirma manualmente se OCR falhar

#### Integração com Câmeras IP
- **Protocolos**: RTSP, ONVIF, HTTP
- **Funcionalidades**:
  - Visualização ao vivo (1, 4, 9, 16 câmeras)
  - Controle PTZ (Pan-Tilt-Zoom)
  - Gravação de clipes (30s-5min)
  - Detecção de movimento
  - Análise com IA (pessoas, veículos, objetos)

#### Integração com Fechaduras Inteligentes
- **Compatibilidade**: Zigbee, Z-Wave, Wi-Fi
- **Marcas**: Yale, August, Schlage, Samsung
- **Casos de uso**:
  - Abertura remota via app
  - Código temporário para visitante
  - Log de acessos à porta

#### Integração com Sistemas de Alarme
- **Protocolos**: Contact ID, SIA
- **Eventos sincronizados**:
  - Alarme disparado → Notificar segurança
  - Modo emergência → Desativar alarme
  - Visitante autorizado → Desarmar temporariamente

---

### 08. Diferenciais Competitivos

#### [Sistema Antifraude](./docs/08-diferenciais/sistema-antifraude.md)

**1. QR Code Antifraude**:
- Assinatura digital SHA-256 com chave secreta
- Nonce único (previne replicação)
- Timestamp dinâmico (validade temporal)
- Uso único para entrada single
- QR Code rotativo opcional (TOTP, muda a cada 30s)
- Geolocalização (só válido dentro do condomínio)

**Como funciona**:
```javascript
// Payload do QR Code
{
  "visitor_id": "uuid",
  "unit_id": "uuid",
  "valid_until": "2025-12-07T23:59:59Z",
  "nonce": "random-unique-value",
  "signature": "sha256(dados + chave_secreta + nonce)"
}

// Validação no servidor
const signature_calculada = sha256(dados + chave_secreta + nonce);
if (signature_calculada !== qr_code.signature) {
  return "QR CODE FALSIFICADO";
}
```

**2. Logs Imutáveis (Blockchain-Style)**:
- Cada log contém hash do log anterior
- Hash SHA-256 do próprio registro
- Cadeia de hashes impossível de adulterar
- Validação de integridade automática

**Estrutura**:
```
Log #1: hash_anterior=null, hash_atual=a3f5...
Log #2: hash_anterior=a3f5..., hash_atual=7d2e...
Log #3: hash_anterior=7d2e..., hash_atual=c4b8...
```

**Benefícios**:
- ✅ Auditoria 100% confiável
- ✅ Prova legal em disputas
- ✅ Compliance com regulamentações
- ✅ Impossível adulterar sem detecção

**3. Auditoria Completa**:
- Todas as ações registradas (login, CRUD, autorizações, etc.)
- Dados armazenados: usuário, ação, recurso, IP, timestamp, resultado
- Interface de auditoria para administradores
- Alertas automáticos (tentativas de fraude, acessos suspeitos)

**4. Acesso Offline**:
- Cache local de moradores e visitantes pré-cadastrados
- Validação offline de QR Codes
- Registro offline com sincronização automática
- Service Worker para PWA

**5. Modo Emergência**:
- Ativação com confirmação
- Abre todos os portões/catracas
- Notifica administração e bombeiros
- Registro em log como evento crítico
- Desativação apenas por administrador

**6. Painel do Síndico**:
- Dashboard executivo com métricas
- Relatórios avançados (financeiro, uso de áreas, ocorrências)
- Aprovações especiais (bloqueio de inadimplentes, obras)
- Compliance e auditoria

---

## 🛠️ Implementação e Deploy

### [Guia Completo](./docs/guia-implementacao.md)

**Fases de Implementação**:
- **Fase 1 - MVP**: 3 meses (backend + painel portaria + app morador)
- **Fase 2 - Avançado**: 2 meses (correspondências, veículos, integrações)
- **Fase 3 - Produção**: 1 mês (testes, otimização, deploy)

**Setup Local** (passo a passo):
1. Instalar pré-requisitos (Node.js, Docker, Git)
2. Clonar repositório
3. Configurar variáveis de ambiente (.env)
4. Subir containers (Docker Compose)
5. Rodar migrações do banco
6. Popular dados iniciais (seed)
7. Iniciar servidores (backend, frontend, mobile)

**Docker Compose** (completo):
- PostgreSQL 15
- Redis 7
- MinIO (S3-compatible)
- API Backend (NestJS)
- Nginx (reverse proxy)

**Deploy em AWS**:
- Arquitetura: Route 53 → CloudFront → ALB → ECS/EKS → RDS + ElastiCache
- Custos estimados: R$ 110-370/mês (dependendo do tamanho)
- CI/CD com GitHub Actions
- Monitoramento: Prometheus + Grafana
- Logs: ELK Stack

**Checklist de Segurança** (15 itens):
- ✅ Senhas fortes e únicas
- ✅ HTTPS obrigatório (SSL/TLS)
- ✅ CORS configurado
- ✅ Rate limiting ativado
- ✅ SQL Injection protegido
- ✅ XSS protegido
- ✅ Backup automático
- ✅ Monitoramento ativo
- ✅ Testes de penetração
- E mais...

**Licenciamento e Preços**:
- **SaaS**: Freemium (até 20 unidades) → Enterprise (999+/mês)
- **On-Premise**: Licença perpétua a partir de R$ 15.000
- **White Label**: Setup R$ 10k + R$ 2k/mês

---

## 📈 Estratégia de Negócio

### [Sumário Executivo](./SUMARIO-EXECUTIVO.md)

**Proposta de Valor**:
- Segurança 10x maior (QR Code antifraude, logs imutáveis, reconhecimento facial)
- Produtividade +300% (autorização em 5 segundos, processos automatizados)
- Satisfação do morador (app intuitivo, notificações em tempo real)
- Redução de custos (menos incidentes, otimização de recursos)

**Mercado**:
- TAM: R$ 2,5 bilhões/ano (250 mil condomínios no Brasil)
- SAM: R$ 500 milhões/ano (20% do TAM)
- SOM: R$ 50 milhões/ano (10% do SAM em 3 anos)

**Modelo de Negócio**:
- **SaaS** com 4 planos (Freemium, Starter, Professional, Enterprise)
- **Receitas adicionais**: Setup, hardware, módulos premium, suporte 24/7, white label
- **Margens**: 75-85%
- **LTV/CAC**: 7.5x (excelente)

**Projeção Financeira**:
- Ano 1: 50 clientes, ARR R$ 300k, Lucro R$ 120k
- Ano 2: 200 clientes, ARR R$ 1,2M, Lucro R$ 600k
- Ano 3: 500 clientes, ARR R$ 3M, Lucro R$ 1,8M

**Go-to-Market**:
1. Validação com 2 pilotos
2. Early adopters (10 clientes)
3. Crescimento (50 clientes)
4. Escala nacional (200+ clientes)

**Canais**:
- Inbound marketing (SEO, blog, webinars) - 40%
- Outbound sales (cold calling, LinkedIn) - 30%
- Parcerias (administradoras, construtoras) - 20%
- Referral (programa de indicação) - 10%

**Roadmap**:
- Q1 2026: MVP com 2 pilotos
- Q2 2026: Reconhecimento facial, OCR, 10 clientes
- Q3-Q4 2026: White label, APIs públicas, 50+ clientes
- 2027+: IA, smart home, expansão LATAM, 500+ clientes

**Visão de Futuro**:
- Plataforma #1 de gestão condominial no Brasil
- 10.000+ condomínios até 2030
- Expansão de produto (portaria 360°, áreas comuns, financeiro, assembleia digital)
- Expansão geográfica (LATAM)

---

## 📞 Contato e Suporte

**Para mais informações**:
- Website: www.portariainteligente.com.br
- E-mail: contato@portariainteligente.com.br
- Telefone: (11) 9.9999-9999
- WhatsApp: (11) 9.8888-8888

**Demonstração**:
- Agende uma demo ao vivo em 5 minutos
- Teste grátis por 30 dias (sem compromisso)

**Para Desenvolvedores**:
- Documentação técnica completa em `/docs`
- API Reference (Swagger): `https://api.portaria.com/docs`
- GitHub: github.com/empresa/portaria-inteligente
- Suporte técnico: dev@portariainteligente.com.br

---

## ✅ Status do Projeto

| Módulo | Especificação | Desenvolvimento | Testes | Produção |
|---|---|---|---|---|
| Gestão de Moradores | ✅ 100% | ⏳ 0% | ⏳ 0% | ⏳ 0% |
| Controle de Visitantes | ✅ 100% | ⏳ 0% | ⏳ 0% | ⏳ 0% |
| Correspondências | ✅ 100% | ⏳ 0% | ⏳ 0% | ⏳ 0% |
| Veículos | ✅ 100% | ⏳ 0% | ⏳ 0% | ⏳ 0% |
| Portaria Digital | ✅ 100% | ⏳ 0% | ⏳ 0% | ⏳ 0% |
| App Morador | ✅ 100% | ⏳ 0% | ⏳ 0% | ⏳ 0% |
| Reconhecimento Facial | ✅ 100% | ⏳ 0% | ⏳ 0% | ⏳ 0% |
| OCR de Placas | ✅ 100% | ⏳ 0% | ⏳ 0% | ⏳ 0% |

**Legenda**:
- ✅ Completo
- 🚧 Em andamento
- ⏳ Não iniciado

---

## 🎓 Recursos Adicionais

### Tutoriais em Vídeo (Planejados)
- [ ] Setup do ambiente de desenvolvimento (15 min)
- [ ] Primeiros passos com a API (20 min)
- [ ] Criando seu primeiro app mobile conectado (30 min)
- [ ] Implementando reconhecimento facial (25 min)
- [ ] Deploy em produção na AWS (40 min)

### Artigos do Blog (Planejados)
- [ ] "Por que QR Codes tradicionais são inseguros?"
- [ ] "Como implementar logs imutáveis com blockchain"
- [ ] "5 erros comuns na gestão de portaria"
- [ ] "Reconhecimento facial: mitos e verdades"
- [ ] "LGPD na prática: checklist para condomínios"

### Webinars (Planejados)
- [ ] "Portaria Inteligente: Demonstração ao vivo"
- [ ] "Como reduzir custos com automação"
- [ ] "Segurança em condomínios: tendências 2026"

---

## 📜 Licença e Direitos

**Propriedade Intelectual**:
- © 2025 Portaria Inteligente
- Todos os direitos reservados
- Código-fonte proprietário
- Documentação: Creative Commons BY-NC-SA 4.0

**Uso desta Documentação**:
- ✅ Consulta interna
- ✅ Apresentação para investidores (sob NDA)
- ✅ Desenvolvimento do produto
- ❌ Redistribuição pública
- ❌ Uso comercial por terceiros sem autorização

---

## 🚀 Próximos Passos

1. **Revisão da documentação** por stakeholders
2. **Aprovação do escopo** e orçamento
3. **Formação da equipe** (4-5 desenvolvedores)
4. **Setup do projeto** (repositório, infraestrutura)
5. **Sprint 0**: Arquitetura e ferramentas
6. **Desenvolvimento do MVP**: 12 semanas
7. **Beta testing**: 2 condomínios pilotos
8. **Launch**: Marketing e vendas

---

**Documentação gerada em**: Dezembro 2025  
**Versão**: 1.0.0  
**Status**: Completa e pronta para desenvolvimento  
**Total de páginas**: 150+ (equivalente)  
**Palavras**: ~100.000

---

## 🙏 Agradecimentos

Documentação criada com dedicação para ser a base de um sistema robusto, seguro e inovador que vai transformar a gestão de portaria em condomínios.

**Próximo passo**: Começar a codificar! 💻🚀
