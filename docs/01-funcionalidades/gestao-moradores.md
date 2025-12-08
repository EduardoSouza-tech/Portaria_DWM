# 👥 Gestão de Moradores

## Visão Geral

Módulo completo para cadastro, gerenciamento e controle de moradores do condomínio, incluindo dependentes, veículos e histórico de acessos.

---

## 📋 Funcionalidades Detalhadas

### 1. Cadastro Completo de Moradores

#### Dados Pessoais
- **Nome completo**
- **CPF** (validação automática)
- **RG** (número e órgão emissor)
- **Data de nascimento**
- **Foto 3x4** (captura via câmera ou upload)
- **E-mail** (validação de formato)
- **Telefone/Celular** (com DDD)
- **WhatsApp** (para notificações)

#### Dados de Acesso
- **Unidade(s) associada(s)** (proprietário ou inquilino)
- **Tipo de vínculo**: Proprietário, Inquilino, Familiar
- **Data de início** do vínculo
- **Data de término** (para inquilinos temporários)
- **Status**: Ativo, Inativo, Bloqueado, Suspenso

#### Biometria e Reconhecimento
- **Foto facial** (alta resolução)
- **Múltiplas fotos** para reconhecimento facial
- **Digital biométrica** (opcional)
- **Iris** (opcional - módulo premium)

#### Credenciais de Acesso
- **QR Code permanente** (gerado automaticamente)
- **PIN de acesso** (numérico, 4-6 dígitos)
- **Cartão RFID** (código único)
- **Tag NFC** (para smartphones)

---

### 2. Associação de Unidades

#### Múltiplas Unidades
- Morador pode estar vinculado a **múltiplas unidades**
- Tipos de vínculo:
  - **Proprietário**: Dono legal da unidade
  - **Inquilino**: Aluguel com prazo determinado
  - **Morador Secundário**: Familiar ou autorizado
  - **Comodato**: Uso temporário gratuito

#### Permissões por Unidade
- **Autorização de visitantes**
- **Recebimento de correspondências**
- **Uso de áreas comuns**
- **Acesso a garagem**
- **Cadastro de veículos**
- **Inclusão de dependentes**

#### Histórico de Unidades
- Registro completo de todas as unidades já ocupadas
- Datas de início e término
- Motivo da mudança
- Transferência de dados entre unidades

---

### 3. Gestão de Familiares e Dependentes

#### Tipos de Dependentes
- **Cônjuge/Companheiro(a)**
- **Filhos**
- **Pais/Avós**
- **Outros familiares**
- **Agregados**

#### Dados do Dependente
- Nome completo
- Parentesco
- Idade/Data de nascimento
- Foto
- CPF (obrigatório para maiores de 18 anos)
- Permissões de acesso

#### Controle de Menores
- **Restrição de saída** sem autorização
- **Alerta automático** ao responsável
- **Horários permitidos** para circulação sozinho
- **Autorização de busca** (pessoas autorizadas)

#### Dependentes Temporários
- Hóspedes com prazo determinado
- Cuidadores/Empregados domésticos temporários
- Validade de acesso configurável

---

### 4. Controle de Veículos

#### Cadastro de Veículos
- **Placa** (validação Mercosul)
- **Marca/Modelo**
- **Cor**
- **Ano**
- **Tipo**: Carro, Moto, Bicicleta, Outros
- **Foto do veículo** (frontal e lateral)
- **Vaga fixa** (se houver)

#### Veículos por Morador
- Múltiplos veículos por unidade
- Proprietário vs. Usuário autorizado
- Veículos temporários (aluguel, empréstimo)
- Histórico de veículos anteriores

#### Controle de Acesso Veicular
- Registro automático de entrada/saída
- Associação automática ao morador
- Alerta de veículo não cadastrado
- Tempo de permanência
- Relatório de utilização de vaga

---

### 5. Permissões e Controles

#### Níveis de Permissão
- **Morador Principal**: Todas as permissões
- **Morador Secundário**: Permissões limitadas
- **Dependente Maior**: Permissões configuráveis
- **Dependente Menor**: Permissões restritas

#### Permissões Configuráveis
- ✅ Autorizar visitantes
- ✅ Pré-cadastrar convidados
- ✅ Retirar correspondências
- ✅ Acessar áreas comuns
- ✅ Reservar espaços
- ✅ Visualizar câmeras (se permitido)
- ✅ Abrir portões remotamente
- ✅ Comunicar-se com portaria
- ✅ Visualizar histórico da unidade
- ✅ Cadastrar veículos temporários

#### Restrições Temporárias
- Bloqueio de acesso por inadimplência
- Suspensão por descumprimento de normas
- Restrição de horário
- Acesso apenas com autorização prévia

---

### 6. Histórico de Acessos

#### Registro Completo
Cada acesso registra:
- **Data e hora** (timestamp preciso)
- **Tipo de acesso**: Entrada ou Saída
- **Método**: QR Code, Facial, RFID, PIN, Manual
- **Portão/Cancela** utilizado
- **Porteiro** responsável pelo registro
- **Foto do momento** (se disponível)
- **Veículo** utilizado (se houver)
- **Acompanhantes** (visitantes junto)

#### Consultas e Filtros
- Por período (data/hora)
- Por unidade
- Por morador específico
- Por tipo de acesso
- Por método de identificação
- Por porteiro responsável

#### Relatórios
- **Frequência de acesso** por morador
- **Horários de pico** por unidade
- **Tempo médio de permanência**
- **Acessos fora do padrão**
- **Exportação** em CSV/PDF/Excel

---

### 7. Notificações ao Morador

#### Tipos de Notificação
- 🔔 **Visitante aguardando** autorização
- 📦 **Correspondência recebida**
- 🚗 **Veículo entrou/saiu** sem o morador
- 👤 **Dependente acessou** o condomínio
- ⚠️ **Tentativa de acesso negada**
- 🔓 **Portão aberto remotamente**
- 📸 **Novo acesso registrado**

#### Canais de Notificação
- **Push notification** (app mobile)
- **E-mail**
- **SMS** (opcional)
- **WhatsApp** (via API Business)
- **Notificação web** (PWA)

#### Configurações
- Escolher tipos de notificação
- Horários permitidos para envio
- Prioridade de canais
- Modo silencioso temporário

---

### 8. Integração com Outros Módulos

#### Visitantes
- Autorização automática de visitantes pré-cadastrados
- Notificação de chegada de visitantes
- Histórico de visitantes autorizados

#### Correspondências
- Notificação de encomenda recebida
- Autorização para terceiros retirarem
- Histórico de retiradas

#### Veículos
- Validação automática na entrada
- Alerta de veículo não autorizado
- Relatório de uso de vagas

#### Áreas Comuns
- Reservas vinculadas à unidade
- Histórico de utilização
- Controle de inadimplência

---

## 🔧 Regras de Negócio

### RN-001: CPF Único
- Cada CPF só pode estar cadastrado **uma vez** no sistema
- Pode estar vinculado a **múltiplas unidades**

### RN-002: Unidade Obrigatória
- Todo morador deve estar associado a **pelo menos uma unidade**

### RN-003: Responsável por Menores
- Menores de 18 anos devem ter **responsável cadastrado**
- Responsável deve ser morador principal da mesma unidade

### RN-004: Bloqueio por Inadimplência
- Sistema pode **bloquear automaticamente** acesso de unidades inadimplentes
- Configurável pela administração

### RN-005: Validade de QR Code
- QR Code permanente do morador **não expira**
- QR Code pode ser **revogado** pela administração

### RN-006: Limite de Veículos
- Limite de veículos por unidade **configurável**
- Default: 2 veículos por vaga

### RN-007: Histórico Imutável
- Logs de acesso **não podem ser excluídos**
- Apenas **desativação lógica**

### RN-008: Foto Obrigatória
- Cadastro só é finalizado com **foto facial**
- Foto deve ter **qualidade mínima** configurável

---

## 💾 Campos do Banco de Dados

### Tabela: moradores
```sql
id, uuid, nome_completo, cpf, rg, orgao_emissor, 
data_nascimento, email, telefone, whatsapp, 
foto_url, foto_facial_1_url, foto_facial_2_url, 
pin_acesso, qr_code_hash, rfid_code, 
status (ativo/inativo/bloqueado/suspenso),
data_cadastro, data_atualizacao, 
cadastrado_por (user_id)
```

### Tabela: morador_unidade
```sql
id, morador_id, unidade_id,
tipo_vinculo (proprietario/inquilino/familiar/comodato),
data_inicio, data_termino,
pode_autorizar_visitantes (boolean),
pode_receber_correspondencias (boolean),
pode_cadastrar_veiculos (boolean),
status, data_cadastro
```

### Tabela: dependentes
```sql
id, morador_responsavel_id, unidade_id,
nome, parentesco, data_nascimento, cpf, foto_url,
restringe_saida_sem_autorizacao (boolean),
horario_inicio_permitido, horario_fim_permitido,
status, data_cadastro
```

---

## 🎯 Casos de Uso

### UC-001: Cadastrar Novo Morador
**Ator**: Administrador, Síndico  
**Fluxo**:
1. Acessa módulo de moradores
2. Clica em "Novo Morador"
3. Preenche dados pessoais
4. Captura/faz upload de foto
5. Associa à unidade com tipo de vínculo
6. Define permissões
7. Sistema gera QR Code automático
8. Envia credenciais por e-mail

### UC-002: Morador Acessa Portaria
**Ator**: Morador  
**Fluxo**:
1. Morador apresenta QR Code ao porteiro
2. Porteiro escaneia código
3. Sistema valida e exibe dados do morador
4. Sistema registra entrada com timestamp
5. Portão liberado automaticamente
6. Registro salvo no histórico

### UC-003: Autorizar Dependente Menor
**Ator**: Morador Principal  
**Fluxo**:
1. Acessa app do morador
2. Vai em "Dependentes"
3. Seleciona menor de idade
4. Define horários permitidos
5. Configura restrição de saída
6. Sistema alerta portaria
7. Notificação ao responsável em cada acesso

---

## 📊 Métricas e KPIs

- **Total de moradores ativos** por condomínio
- **Taxa de ocupação** (unidades com moradores)
- **Média de moradores** por unidade
- **Taxa de inadimplência** (se integrado)
- **Frequência de acesso** por morador
- **Tempo médio de permanência**
- **Pico de acessos** (horário)
- **Método de acesso mais usado** (QR, facial, PIN)

---

## 🔐 Segurança e Privacidade

- ✅ **LGPD Compliance**: Consentimento explícito para coleta de dados
- ✅ **Criptografia**: Dados sensíveis (CPF, RG) criptografados no banco
- ✅ **Auditoria**: Todo acesso aos dados é registrado
- ✅ **Retenção**: Dados inativos são anonimizados após período configurável
- ✅ **Direito ao esquecimento**: Morador pode solicitar exclusão de dados
- ✅ **Acesso controlado**: Apenas usuários autorizados acessam dados pessoais

---

## 🚀 Melhorias Futuras

- [ ] Importação em massa via CSV/Excel
- [ ] Integração com cartório para validação de documentos
- [ ] Reconhecimento facial automático no cadastro
- [ ] Chatbot para suporte ao morador
- [ ] Análise comportamental (IA)
- [ ] Integração com CRM para síndicos
