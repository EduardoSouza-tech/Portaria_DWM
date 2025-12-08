# 📦 Entregadores e Prestadores de Serviço

## Visão Geral

Módulo especializado para gestão de entregadores (delivery, correios, transportadoras) e prestadores de serviço (encanadores, eletricistas, pintores, etc.), com fluxo otimizado para agilidade e rastreabilidade.

---

## 📋 Funcionalidades Detalhadas

### 1. Registro Rápido de Entregadores

#### Fluxo Simplificado
Entregadores geralmente têm **pouco tempo** de espera. O sistema oferece fluxo express:

**Tempo estimado: 30-60 segundos**

#### Dados Mínimos Necessários
- **Nome completo** (ou apenas primeiro nome se urgente)
- **Empresa/Plataforma**: 
  - Correios
  - iFood
  - Rappi
  - Amazon
  - Mercado Livre
  - Uber Eats
  - Transportadora (nome)
  - Outro
- **Foto facial** (obrigatória)
- **Unidade de destino**
- **Tipo de entrega**:
  - Encomenda/Pacote
  - Alimento (delivery)
  - Documento
  - Medicamento
  - Outro

#### Dados Opcionais (se tempo permitir)
- Telefone/WhatsApp
- Placa do veículo
- Documento (RG/CPF)
- Número do pedido/rastreio
- Foto do pacote/sacola

---

### 2. Identificação por Empresa

#### Cadastro de Empresas de Entrega
Sistema mantém base de empresas conhecidas:
- Logo da empresa
- Nome padrão
- Tipo de serviço
- Nível de confiança (baseado em histórico)

#### Entregadores Recorrentes
- Sistema identifica entregador que já visitou
- **Reconhecimento facial** (opcional)
- **Busca por nome + empresa**
- Agiliza entrada: Apenas confirma dados e unidade

#### Empresas Verificadas
- Parcerias com empresas de delivery (iFood, Rappi, etc.)
- Integração via API para validação automática
- Badge de "Empresa Verificada" no sistema

---

### 3. Fluxo de Autorização

#### Autorização Simplificada

**Opção 1: Autorização Prévia**
- Morador pré-autoriza entrega via app:
  - "Espero entrega do iFood às 12h"
  - "Aguardando Amazon hoje"
- Sistema libera automaticamente quando entregador identificar a empresa
- Morador recebe **notificação informativa** apenas

**Opção 2: Autorização Rápida**
- Porteiro registra entregador
- Sistema envia notificação push ao morador
- Morador tem **1 minuto** para responder (menos que visitante comum)
- Foto da entrega é mostrada na notificação

**Opção 3: Liberação Automática (Configurável)**
- Condomínio pode permitir entregas **sem autorização prévia**
- Apenas para empresas conhecidas (Correios, Amazon, iFood, etc.)
- Morador recebe notificação **após a entrega**

#### Casos Especiais
- **Medicamentos**: Autorização obrigatória sempre
- **Valores altos**: Exige autorização + assinatura
- **Noite/madrugada**: Sempre exige autorização

---

### 4. Foto Comprovante de Entrega

#### Captura Obrigatória
Toda entrega exige **foto do item**:
- Foto do pacote/sacola
- Foto do entregador (facial)
- Foto do protocolo (se houver)

#### Qualidade da Foto
- Sistema valida:
  - ✅ Resolução mínima
  - ✅ Objeto identificável
  - ✅ Iluminação adequada
- Porteiro pode tirar **múltiplas fotos** se necessário

#### Armazenamento
- Vinculado ao registro de entrega
- Morador pode visualizar no app
- Comprova que entrega foi feita
- Útil para contestações

#### OCR Automático (Opcional)
- Extração de dados do pacote:
  - Código de rastreio
  - Remetente
  - Destinatário
- Validação automática da unidade

---

### 5. Entrega na Portaria vs. Entrega Direta

#### Entrega na Portaria
**Fluxo**:
1. Entregador deixa item na portaria
2. Porteiro registra:
   - Foto do item
   - Dados do entregador
   - Hora de recebimento
3. Item vai para módulo de **Correspondências**
4. Morador é notificado
5. Entregador pode ir embora imediatamente

**Vantagens**:
- ✅ Agilidade máxima para entregador
- ✅ Sem espera de autorização
- ✅ Portaria assume responsabilidade

#### Entrega Direta ao Morador
**Fluxo**:
1. Morador pré-autoriza entrega direta
2. Entregador sobe à unidade
3. Sistema registra entrada
4. Entregador entrega ao morador
5. Retorna à portaria e registra saída

**Vantagens**:
- ✅ Morador recebe pessoalmente
- ✅ Sem intermediação da portaria
- ✅ Útil para itens frágeis/caros

#### Escolha do Método
- **Morador define** no pré-cadastro ou no app
- **Portaria sugere** baseado no tipo de item
- **Padrão configurável** por condomínio

---

### 6. Prestadores de Serviço

#### Tipos de Prestadores
- 🔧 Encanador
- ⚡ Eletricista
- 🎨 Pintor
- 🛠️ Marceneiro
- 🔌 Técnico (TV, internet, etc.)
- 🧹 Limpeza/Dedetização
- 🏗️ Obras/Reformas
- 🚚 Mudança
- 🌳 Jardineiro
- 🔒 Chaveiro
- Outros

#### Cadastro de Prestador
**Dados completos** (diferente de entregador):
- Nome completo
- CPF/RG (obrigatório)
- Empresa/Autônomo
- Telefone/WhatsApp
- Especialidade
- Foto facial
- Foto do veículo (se houver)
- Placa
- **Ferramentas/Equipamentos** que carrega

#### Autorização de Prestadores
- **Sempre exige autorização do morador**
- Não tem liberação automática
- Morador vê:
  - Foto do prestador
  - Nome e empresa
  - Especialidade
  - Motivo da visita
- Tempo de resposta: **2 minutos** (padrão)

#### Controle de Permanência
- Prestadores geralmente ficam **horas** no condomínio
- Sistema monitora:
  - Hora de entrada
  - Tempo de permanência
  - Alerta se exceder tempo esperado
- Morador pode definir **tempo estimado** no pré-cadastro

#### Pré-Cadastro de Prestadores
Morador pode pré-agendar serviço:
- Seleciona data e hora
- Informa especialidade e empresa
- Dados do prestador (se souber)
- Sistema gera autorização prévia
- No dia: Prestador entra automaticamente (dentro do horário)

---

### 7. Rastreabilidade e Histórico

#### Histórico de Entregas por Unidade
- Todas as entregas recebidas
- Filtro por:
  - Data/período
  - Empresa
  - Tipo de entrega
  - Entregue na portaria ou direto
- Foto de cada entrega

#### Histórico de Prestadores
- Todos os serviços realizados
- Filtro por:
  - Especialidade
  - Empresa
  - Período
- Útil para saber quem já trabalhou na unidade

#### Estatísticas
- **Empresa que mais entrega** para cada unidade
- **Horário de pico** de entregas
- **Tempo médio** de permanência de prestadores
- **Prestadores recorrentes**

---

### 8. Integração com Empresas de Delivery

#### APIs de Validação
Integração com plataformas:
- **iFood**: Validar código de pedido
- **Rappi**: Confirmar entregador ativo
- **Uber Eats**: Verificar corrida
- **Amazon**: Validar código de rastreio

#### Benefícios da Integração
- ✅ **Validação automática** do entregador
- ✅ **Dados pré-preenchidos** (nome, foto, pedido)
- ✅ **Menos fraudes**
- ✅ **Agilidade** (não precisa preencher manualmente)

#### Notificação Proativa
- Sistema detecta entregador via API
- Notifica morador **antes mesmo** do entregador chegar
- Morador pode pré-autorizar

---

### 9. Sistema Antifraude para Entregas

#### Validações
- ✅ **Foto obrigatória** de entregador e item
- ✅ **Comparação facial** com entregas anteriores
- ✅ **Validação de uniforme** (IA opcional)
- ✅ **Código de rastreio** (quando aplicável)
- ✅ **Tempo suspeito** (entregador não sai rapidamente)

#### Alertas
- 🚨 Entregador fica muito tempo dentro
- 🚨 Mesmo entregador com múltiplas empresas diferentes
- 🚨 Entrega sem pacote visível na foto
- 🚨 Unidade não esperava entrega

#### Lista Negra
- Entregadores problemáticos podem ser bloqueados
- Sistema alerta porteiro se entregador bloqueado tentar entrar

---

## 🔧 Regras de Negócio

### RN-200: Foto Obrigatória
- **Entrega só é registrada com foto** do item e do entregador
- Exceção: Emergências (configurável)

### RN-201: Empresas Conhecidas
- Sistema mantém **lista de empresas verificadas**
- Novas empresas são cadastradas dinamicamente

### RN-202: Tempo de Autorização
- Entregadores: **1 minuto** de espera máxima
- Prestadores: **2 minutos** de espera
- Após timeout: Ação configurável

### RN-203: Entrega na Portaria
- Itens deixados na portaria **viram correspondência**
- Registro transferido automaticamente

### RN-204: Saída Rápida de Entregador
- Entregador que deixa item **não precisa registrar saída**
- Saída registrada automaticamente após **5 minutos**

### RN-205: Prestador Deve Registrar Saída
- Prestadores **devem registrar saída** obrigatoriamente
- Alerta se não registrou após **1 hora** do horário previsto

### RN-206: Autorização de Prestador
- Prestadores **sempre exigem autorização**
- Não há liberação automática

### RN-207: Validação de Veículo
- Prestadores com veículos: **Placa obrigatória**
- Entregadores: Placa opcional

---

## 💾 Campos do Banco de Dados

### Tabela: entregadores
```sql
id, uuid, nome, empresa_delivery_id, 
telefone, foto_url, vetor_facial (jsonb),
placa_veiculo, tipo_veiculo (moto/carro/bike),
total_entregas, data_primeira_entrega, data_ultima_entrega,
status (ativo/bloqueado), motivo_bloqueio,
confiabilidade_score (0-100),
data_cadastro
```

### Tabela: empresas_delivery
```sql
id, nome, logo_url, tipo (delivery/correios/transportadora),
verificada (boolean), api_key (para integração),
nivel_confianca (alto/medio/baixo),
permite_liberacao_automatica (boolean),
data_cadastro
```

### Tabela: entregas
```sql
id, uuid, entregador_id, empresa_delivery_id,
unidade_id, morador_id,
tipo_entrega (encomenda/alimento/documento/medicamento),
codigo_rastreio, numero_pedido,
foto_pacote_url, foto_entregador_url,
local_entrega (portaria/direta),
data_hora_chegada, data_hora_saida,
tempo_permanencia (interval),
autorizado_previamente (boolean),
data_autorizacao, canal_autorizacao,
porteiro_registro_id,
observacoes, status (registrado/entregue/devolvido),
data_cadastro
```

### Tabela: prestadores
```sql
id, uuid, nome_completo, cpf, rg, telefone, whatsapp,
empresa, cnpj, tipo_prestador (autonomo/empresa),
especialidades (array), foto_url, vetor_facial (jsonb),
veiculo_placa, veiculo_modelo, veiculo_cor,
ferramentas_equipamentos (text),
total_servicos, data_primeiro_servico, data_ultimo_servico,
avaliacao_media (0-5), status,
data_cadastro
```

### Tabela: servicos_prestados
```sql
id, uuid, prestador_id, unidade_id, morador_id,
tipo_servico (encanador/eletricista/pintor/etc),
empresa, descricao_servico,
data_hora_entrada, data_hora_saida,
tempo_permanencia (interval),
foto_entrada_url, foto_saida_url,
autorizado_previamente (boolean),
tempo_estimado (interval), tempo_real (interval),
porteiro_entrada_id, porteiro_saida_id,
observacoes, avaliacao (1-5), comentario_avaliacao,
status, data_cadastro
```

---

## 🎯 Casos de Uso

### UC-200: Entregador iFood Chega ao Condomínio
**Ator**: Porteiro, Entregador, Morador  
**Fluxo**:
1. Entregador chega de moto com sacola iFood
2. Porteiro pergunta unidade de destino
3. Porteiro seleciona "Novo Entregador"
4. Escolhe empresa: iFood
5. Digita nome (ou só primeiro nome)
6. Tira foto do entregador
7. Tira foto da sacola
8. Sistema verifica se morador pré-autorizou
9. Se sim: Libera automaticamente
10. Se não: Envia notificação push ao morador
11. Morador autoriza em 30 segundos
12. Entregador sobe e entrega
13. Retorna e porteiro registra saída rápida

### UC-201: Pacote dos Correios para Portaria
**Ator**: Porteiro, Entregador Correios  
**Fluxo**:
1. Carteiro chega com encomenda
2. Porteiro registra: "Correios"
3. Tira foto do carteiro
4. Tira foto do pacote (com código de rastreio visível)
5. Sistema faz OCR do código (opcional)
6. Informa unidade (verificando etiqueta)
7. Porteiro recebe o pacote
8. Carteiro assina digitalmente no tablet
9. Sistema registra entrega na portaria
10. Item vai para módulo "Correspondências"
11. Morador recebe notificação: "Encomenda recebida"
12. Carteiro vai embora

### UC-202: Encanador Pré-Agendado
**Ator**: Morador, Porteiro, Prestador  
**Fluxo**:
1. Morador agenda serviço via app:
   - Data: 10/12 às 14h
   - Especialidade: Encanador
   - Empresa: HidroService
   - Nome: João Silva
   - Tempo estimado: 2 horas
2. Sistema gera autorização prévia
3. No dia 10/12, encanador chega às 13:55
4. Porteiro busca nome no sistema
5. Sistema mostra: "João Silva - AUTORIZADO"
6. Porteiro confirma documento
7. Tira foto
8. Registra entrada
9. Encanador sobe à unidade
10. Após 2h15min: Sistema alerta porteiro (excedeu tempo)
11. Encanador desce e registra saída às 16:30
12. Sistema pergunta ao morador: "Avaliar serviço?"

### UC-203: Amazon Integrada via API
**Ator**: Porteiro, Entregador Amazon, Morador  
**Fluxo**:
1. Sistema recebe webhook da Amazon:
   - Entrega prevista para unidade 302
   - Entregador: Carlos Mendes
   - Código de rastreio: BR123456789
2. Sistema notifica morador: "Entrega Amazon chegando"
3. Morador pré-autoriza com um clique
4. Entregador chega à portaria
5. Porteiro escaneia código de rastreio (QR Code)
6. Sistema valida via API Amazon
7. Confirma: Entregador correto, pedido correto
8. Libera automaticamente
9. Entregador entrega direto na unidade
10. Registra saída
11. Sistema confirma entrega à Amazon

---

## 📊 Métricas e KPIs

- **Total de entregas** por período
- **Empresa com mais entregas**
- **Horário de pico** de entregas
- **Tempo médio de permanência** de entregadores
- **Taxa de autorização prévia** (%)
- **Total de prestadores** únicos
- **Especialidade mais demandada**
- **Avaliação média** dos prestadores
- **Tempo médio de resposta** do morador

---

## 🔐 Segurança

- ✅ **Fotos obrigatórias** para rastreabilidade
- ✅ **Validação facial** de entregadores recorrentes
- ✅ **Integração com APIs** para validação em tempo real
- ✅ **Lista negra** de entregadores problemáticos
- ✅ **Alerta de permanência** excessiva
- ✅ **Logs imutáveis** de todas as entregas
- ✅ **OCR de códigos de rastreio** para validação

---

## 🚀 Melhorias Futuras

- [ ] Reconhecimento automático de uniformes (IA)
- [ ] Integração com mais plataformas (Loggi, Lalamove)
- [ ] Avaliação de prestadores pelo morador
- [ ] Marketplace de prestadores confiáveis
- [ ] Agendamento inteligente (sugere melhores horários)
- [ ] Notificação proativa: "Sua entrega está a 2km"
- [ ] QR Code para prestadores recorrentes
- [ ] Sistema de pagamento integrado (opcional)
