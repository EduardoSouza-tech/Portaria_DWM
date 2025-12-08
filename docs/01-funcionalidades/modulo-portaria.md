# 🛡️ Módulo da Portaria

## Visão Geral

Painel central de operação da portaria, projetado para máxima eficiência e facilidade de uso pelos porteiros, concentrando todas as funcionalidades necessárias para o dia a dia.

---

## 📋 Funcionalidades Detalhadas

### 1. Dashboard em Tempo Real

#### Visão Geral Instantânea
Tela principal mostra:
- **Total de pessoas dentro** do condomínio agora
  - Visitantes
  - Prestadores
  - Entregadores (se não saíram)
- **Autorizações pendentes** (aguardando morador)
- **Correspondências** recebidas hoje (não retiradas)
- **Veículos** estacionados (visitantes)
- **Alertas ativos** (permanência excessiva, eventos, etc.)

#### Cards Informativos
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ 👥 DENTRO AGORA │  │ ⏳ AGUARDANDO   │  │ 📦 ENCOMENDAS   │
│      12         │  │      3          │  │      8          │
│   pessoas       │  │  autorizações   │  │   pendentes     │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ 🚗 VEÍCULOS     │  │ ⚠️ ALERTAS      │  │ 📊 ACESSOS HOJE │
│      5          │  │      2          │  │     143         │
│   visitantes    │  │    ativos       │  │   entradas      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

#### Atualizações em Tempo Real
- **WebSocket** mantém dashboard atualizado automaticamente
- Sem necessidade de refresh manual
- Notificações visuais e sonoras para eventos importantes:
  - 🔔 Nova autorização pendente
  - 📦 Nova correspondência
  - ⚠️ Alerta de segurança
  - 🚨 Emergência

#### Turno do Porteiro
- Sistema identifica porteiro logado
- Mostra início do turno
- Contador de horas trabalhadas
- Resumo de atividades do turno:
  - Entradas registradas
  - Saídas registradas
  - Correspondências recebidas
  - Autorizações processadas

---

### 2. Registro Rápido de Entradas

#### Interface Otimizada
Design focado em **velocidade**:
- Botões grandes e espaçados
- Atalhos de teclado
- Workflow intuitivo em 3-5 cliques

#### Tipos de Entrada
Botões principais:
```
┌────────────────────────────────────────────────┐
│  👤 VISITANTE    📦 ENTREGADOR    🔧 PRESTADOR  │
│                                                 │
│  🏠 MORADOR      🚗 VEÍCULO       📝 OUTRO      │
└────────────────────────────────────────────────┘
```

#### Fluxo de Registro de Visitante
1. **Clicar em "Visitante"**
2. **Buscar** por:
   - Nome
   - CPF
   - QR Code (escanear)
   - Documento
3. **Se encontrado**: Exibe dados anteriores
4. **Se novo**: Formulário rápido
   - Nome (autocompletar enquanto digita)
   - Documento (validação automática)
   - Unidade de destino (busca rápida)
   - Foto (captura com 1 clique)
   - Veículo/Placa (opcional)
5. **Salvar e Solicitar Autorização**
6. **Aguardar morador** (ou liberar se pré-autorizado)
7. **Confirmar entrada**

#### Atalhos de Teclado
- `F1` - Novo visitante
- `F2` - Novo entregador
- `F3` - Novo prestador
- `F4` - Registrar saída
- `F5` - Buscar pessoa
- `F6` - Nova correspondência
- `Ctrl + S` - Salvar registro
- `ESC` - Cancelar

---

### 3. Monitoramento de Entradas e Saídas

#### Lista de Pessoas Dentro
Tabela em tempo real:
```
┌─────┬──────────────┬─────────┬───────────┬────────────┐
│ #   │ NOME         │ TIPO    │ UNIDADE   │ ENTRADA    │
├─────┼──────────────┼─────────┼───────────┼────────────┤
│ 🟢  │ João Silva   │ Visit.  │ 302       │ 14:30      │
│ 🟢  │ Maria Costa  │ Prest.  │ 105       │ 13:15 ⚠️   │
│ 🟢  │ iFood        │ Entreg. │ 501       │ 15:42      │
└─────┴──────────────┴─────────┴───────────┴────────────┘
```

**Legenda**:
- 🟢 - Dentro do condomínio
- ⚠️ - Permanência excessiva (alerta)
- 🔴 - Tempo crítico

#### Filtros Rápidos
- Todos
- Apenas visitantes
- Apenas prestadores
- Apenas entregadores
- Com alerta
- Por unidade específica

#### Ações Rápidas
- **Registrar Saída**: 1 clique
- **Ver Detalhes**: Expandir linha
- **Enviar Lembrete**: Notificar morador
- **Imprimir Protocolo**: Comprovante de presença

---

### 4. Consulta Rápida

#### Busca Universal
Campo de busca inteligente:
- Por **nome** (parcial)
- Por **CPF** (com ou sem formatação)
- Por **documento**
- Por **unidade**
- Por **placa de veículo**
- Por **empresa** (entregadores)

#### Resultados
Exibe:
- **Dados completos** da pessoa
- **Foto** (grande, clara)
- **Histórico de acessos** (últimos 10)
- **Autorizado por** qual morador
- **Status atual** (dentro/fora)
- **Observações** anteriores

#### Histórico de Acessos
```
┌────────────┬─────────┬─────────┬──────────────┐
│ DATA       │ ENTRADA │ SAÍDA   │ PERMANÊNCIA  │
├────────────┼─────────┼─────────┼──────────────┤
│ 07/12/2025 │ 14:30   │ 16:45   │ 2h15min      │
│ 05/12/2025 │ 10:15   │ 11:00   │ 45min        │
│ 01/12/2025 │ 19:20   │ 22:30   │ 3h10min      │
└────────────┴─────────┴─────────┴──────────────┘
```

#### Alertas na Busca
- 🚫 **Pessoa bloqueada** (lista negra)
- ⚠️ **Múltiplas recusas** de autorização
- 🔍 **Comportamento suspeito** (IA opcional)

---

### 5. Gestão de Autorizações Pendentes

#### Fila de Autorizações
Lista de visitantes aguardando:
```
┌─────────────────────────────────────────────────────┐
│ ⏳ AGUARDANDO AUTORIZAÇÃO (3)                       │
├─────────────────────────────────────────────────────┤
│ 👤 Carlos Mendes → Unidade 302                      │
│    Aguardando há: 00:45  [📞 Ligar] [❌ Cancelar]  │
├─────────────────────────────────────────────────────┤
│ 👤 Ana Paula → Unidade 105                          │
│    Aguardando há: 00:23  [📞 Ligar] [❌ Cancelar]  │
├─────────────────────────────────────────────────────┤
│ 📦 iFood → Unidade 501                              │
│    Aguardando há: 00:12  [📞 Ligar] [❌ Cancelar]  │
└─────────────────────────────────────────────────────┘
```

#### Ações do Porteiro
- **Aguardar**: Esperar resposta do morador
- **Ligar**: Telefone do morador (discagem automática)
- **Cancelar**: Negar entrada (com motivo)
- **Liberar Manualmente**: Em casos excepcionais (registra motivo)

#### Timeout Automático
- Após **2 minutos**: Sistema aciona ação configurável
  - Ligar automaticamente
  - Negar entrada
  - Liberar (condomínios permissivos)

#### Notificação Sonora
- Alerta sonoro quando nova autorização chega
- Volume ajustável
- Pode escolher som personalizado

---

### 6. Abertura de Portões (Integração IoT)

#### Controles de Acesso
Se condomínio possui automação:
- **Portão Principal** (pedestre)
- **Portão de Veículos**
- **Cancela da Garagem**
- **Porta de Acesso Secundário**

#### Interface de Controle
```
┌──────────────────────────────────────┐
│ 🚪 PORTÃO PEDESTRE                   │
│     [🟢 Abrir] Status: Fechado       │
├──────────────────────────────────────┤
│ 🚗 PORTÃO VEÍCULOS                   │
│     [🟢 Abrir] Status: Fechado       │
├──────────────────────────────────────┤
│ 🅿️ CANCELA GARAGEM                   │
│     [🟢 Abrir] Status: Fechada       │
└──────────────────────────────────────┘
```

#### Registro de Abertura
Cada abertura manual registra:
- Timestamp
- Porteiro responsável
- Motivo (entrada de visitante, saída de morador, etc.)
- Pessoa associada (se houver)

#### Abertura Automática
- Morador autorizado com QR Code: **Abre automaticamente**
- Visitante com QR válido: **Abre automaticamente**
- Veículo cadastrado (OCR): **Abre automaticamente**

#### Modo Emergência
- Botão vermelho: **Abre todos os portões**
- Usado em:
  - Incêndio
  - Evacuação
  - Emergência médica
- Registra no log como evento crítico

---

### 7. Registro Manual de Eventos

#### Tipos de Eventos
- 📝 Ocorrência
- 🚨 Incidente de Segurança
- 🔧 Manutenção Realizada
- 📦 Encomenda Recebida
- 🚗 Veículo Suspeito
- 👥 Reunião de Condomínio
- 🌧️ Evento Climático (alagamento, queda de árvore)
- 🔊 Ruído Excessivo (reclamação)
- 🐕 Animal Perdido
- Outro

#### Formulário de Evento
- **Tipo** (seleção rápida)
- **Data/Hora** (preenche automaticamente)
- **Unidade envolvida** (se aplicável)
- **Descrição** (texto livre)
- **Foto/Vídeo** (anexo opcional)
- **Gravidade**: Baixa, Média, Alta, Crítica
- **Notificar**: Síndico, Administração, Todos

#### Histórico de Eventos
- Lista cronológica de todos os eventos
- Filtro por tipo, data, gravidade
- Exportação para relatório
- Útil para reuniões de condomínio

---

### 8. Visualização de Câmeras

#### Integração com CFTV
Se condomínio possui câmeras IP:
- Visualização **ao vivo** de múltiplas câmeras
- Layout em grade (1, 4, 9, 16 câmeras)
- Zoom digital
- Gravação manual (clipe de 30s-5min)

#### Câmeras Estratégicas
- Portaria Principal
- Portão de Veículos
- Hall de Entrada
- Elevadores
- Garagem
- Áreas Comuns

#### Controle PTZ
Se câmera suporta:
- Pan (direita/esquerda)
- Tilt (cima/baixo)
- Zoom (aproximar/afastar)

#### Gravação de Incidente
- Porteiro pode **marcar momento** específico
- Sistema salva clipe automaticamente
- Vinculado a evento/ocorrência
- Útil para investigações

---

### 9. Comunicação com Moradores

#### Chat Rápido
- Porteiro pode **enviar mensagem** para morador específico
- Casos de uso:
  - "Sua encomenda chegou"
  - "Visitante aguardando autorização"
  - "Solicitação de informação"

#### Chamada Telefônica
- **Discagem direta** do sistema
- VoIP integrado (opcional)
- Registra ligação no histórico

#### Intercomunicador
- Se condomínio possui:
  - Sistema toca na unidade
  - Morador atende
  - Pode abrir portão remotamente

---

### 10. Correspondências

#### Registro Rápido
Desde a portaria:
- Foto da encomenda
- Unidade destinatária
- Tipo (pacote, carta, documento)
- Tamanho (P, M, G)
- Remetente (se visível)
- Código de rastreio (OCR automático)

#### Notificação Automática
- Morador recebe push notification
- E-mail com foto da encomenda
- WhatsApp (se configurado)

#### Retirada na Portaria
- Morador se apresenta
- Porteiro busca pendências
- Morador assina digitalmente (tablet)
- Sistema registra data/hora de retirada

---

## 🔧 Regras de Negócio

### RN-300: Turno Obrigatório
- Porteiro deve **iniciar turno** ao começar trabalho
- Sistema registra início e fim
- Todas as ações são vinculadas ao porteiro do turno

### RN-301: Autenticação
- Porteiro faz login com **usuário e senha**
- Opcionalmente: **Biometria ou PIN**
- Sessão expira após **8 horas** de inatividade

### RN-302: Logs Imutáveis
- **Todas as ações** do porteiro são registradas
- Não podem ser excluídas
- Auditoria completa

### RN-303: Fotos Obrigatórias
- Registro de visitante/entregador **exige foto**
- Sistema não permite salvar sem foto

### RN-304: Abertura Manual de Portão
- Exige **justificativa**
- Registra no log de segurança

### RN-305: Modo Emergência
- Apenas **porteiros autorizados** podem ativar
- Aciona alerta para administração
- Registra como evento crítico

---

## 💾 Campos do Banco de Dados

### Tabela: porteiros
```sql
id, uuid, nome_completo, cpf, telefone,
foto_url, usuario, senha_hash,
pin_acesso, biometria_hash,
status (ativo/inativo/ferias/afastado),
data_admissao, data_cadastro
```

### Tabela: turnos
```sql
id, uuid, porteiro_id,
data_inicio, hora_inicio, 
data_fim, hora_fim,
total_horas, observacoes,
status (em_andamento/finalizado)
```

### Tabela: eventos_portaria
```sql
id, uuid, porteiro_id, turno_id,
tipo (ocorrencia/incidente/manutencao/etc),
descricao, unidade_id, gravidade,
foto_url, video_url,
notificados (array de user_ids),
data_hora_evento, data_cadastro
```

### Tabela: acoes_porteiro
```sql
id, uuid, porteiro_id, turno_id,
acao (registro_entrada/registro_saida/abertura_portao/etc),
detalhes (jsonb),
visitante_id, morador_id, unidade_id,
timestamp, ip_address
```

---

## 🎯 Casos de Uso

### UC-300: Porteiro Inicia Turno
**Ator**: Porteiro  
**Fluxo**:
1. Porteiro chega à portaria
2. Faz login no sistema (usuário/senha)
3. Clica em "Iniciar Turno"
4. Sistema registra início com timestamp
5. Dashboard é exibido
6. Todas as ações a partir daqui ficam vinculadas ao turno

### UC-301: Visitante Chega e É Registrado
**Ator**: Porteiro, Visitante  
**Fluxo**:
1. Porteiro vê visitante chegando
2. Clica em "Novo Visitante" (F1)
3. Pergunta nome e documento
4. Digita nome (sistema busca se já existe)
5. Se novo: Preenche documento
6. Pergunta unidade de destino
7. Tira foto do visitante (câmera USB)
8. Clica em "Solicitar Autorização"
9. Sistema envia push ao morador
10. Porteiro aguarda (vendo fila de autorizações pendentes)
11. Morador autoriza
12. Sistema exibe "AUTORIZADO" em verde
13. Porteiro confirma entrada
14. Portão abre automaticamente
15. Visitante entra

### UC-302: Abertura Manual de Portão em Emergência
**Ator**: Porteiro, Ambulância  
**Fluxo**:
1. Ambulância chega à portaria
2. Porteiro identifica emergência
3. Clica em botão "🚨 EMERGÊNCIA"
4. Sistema pede confirmação
5. Porteiro confirma
6. Todos os portões abrem automaticamente
7. Sistema registra evento crítico
8. Notificação enviada à administração
9. Ambulância entra rapidamente
10. Portaria volta ao normal após 2 minutos

---

## 📊 Métricas e KPIs

- **Acessos por turno** (por porteiro)
- **Tempo médio de registro** (eficiência)
- **Taxa de autorizações aprovadas** vs. negadas
- **Eventos registrados** por período
- **Correspondências recebidas** por turno
- **Tempo médio de resposta** do morador
- **Aberturas manuais** de portão (auditoria)

---

## 🔐 Segurança

- ✅ **Autenticação forte** (senha + opcional biometria)
- ✅ **Logs imutáveis** de todas as ações
- ✅ **Gravação de tela** (opcional) durante turno
- ✅ **Auditoria completa** de acessos ao sistema
- ✅ **Controle de permissões** (nem todos podem ativar emergência)
- ✅ **Timeout de sessão** por inatividade

---

## 🚀 Melhorias Futuras

- [ ] App mobile para porteiro (tablet/smartphone)
- [ ] Reconhecimento de voz para comandos
- [ ] Chatbot para dúvidas frequentes
- [ ] Dashboard analytics em tempo real (gráficos)
- [ ] Integração com sistemas de alarme
- [ ] Modo offline (funcionamento sem internet)
- [ ] Treinamento interativo para novos porteiros
