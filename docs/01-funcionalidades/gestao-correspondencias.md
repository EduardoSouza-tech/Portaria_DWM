# 📦 Gestão de Correspondências

## Visão Geral

Sistema completo para controle de encomendas, cartas, documentos e pacotes recebidos na portaria, garantindo rastreabilidade, segurança e notificação automática aos moradores.

---

## 📋 Funcionalidades Detalhadas

### 1. Registro de Correspondências

#### Tipos de Correspondência
- 📦 **Encomenda/Pacote**: Compras online, presentes
- ✉️ **Carta**: Correspondência comum
- 📄 **Documento**: Contratos, notificações judiciais, multas
- 📰 **Revista/Jornal**: Assinaturas periódicas
- 💳 **Cartão**: Cartões de crédito, documentos bancários
- 🎁 **Presente/Flores**: Itens especiais
- 📦 **Caixa Grande**: Pacotes volumosos
- ❄️ **Perecível**: Necessita refrigeração
- 💎 **Valor Alto**: AR (Aviso de Recebimento) ou declarado

#### Dados do Registro
**Informações Obrigatórias**:
- **Foto da embalagem** (frontal e laterais se necessário)
- **Unidade destinatária**
- **Tipo de correspondência**
- **Tamanho**: P (pequeno), M (médio), G (grande), GG (extra grande)
- **Data/hora de recebimento**
- **Porteiro que recebeu**

**Informações Opcionais**:
- **Remetente** (se visível)
- **Código de rastreio** (extraído por OCR ou digitado)
- **Transportadora** (Correios, Jadlog, Total Express, etc.)
- **Protocolo de entrega**
- **Observações** (ex: "frágil", "urgente", "retirar até DD/MM")
- **Valor declarado** (se houver)

---

### 2. Captura Fotográfica

#### Sistema de Fotos
**Múltiplas fotos por correspondência**:
- Foto frontal (obrigatória)
- Foto lateral (opcional)
- Foto do código de rastreio (zoom)
- Foto do protocolo de entrega
- Foto de avarias (se houver)

#### Qualidade e Validação
Sistema garante:
- ✅ Resolução mínima: 800x600
- ✅ Iluminação adequada
- ✅ Código de rastreio legível (se capturado)
- ✅ Compressão com qualidade preservada

#### OCR Automático
**Extração automática** de dados da foto:
- **Código de rastreio**: Leitura via OCR
- **Destinatário**: Nome ou número da unidade
- **Remetente**: Nome da loja/empresa
- **CEP**: Validação do endereço

Sistema sugere dados para porteiro confirmar

#### Armazenamento
- Fotos em servidor seguro (S3/MinIO)
- Backup automático diário
- Retenção configur ável (ex: 90 dias após retirada)
- Thumbnails para visualização rápida

---

### 3. Notificação Automática ao Morador

#### Canais de Notificação
1. **Push Notification** (app mobile) - Principal
2. **E-mail** com foto da encomenda
3. **WhatsApp** (via API Business)
4. **SMS** (opcional, para casos específicos)

#### Conteúdo da Notificação
```
📦 Nova encomenda recebida!

Unidade: 302
Tipo: Pacote (M)
Remetente: Amazon
Código: BR123456789AA
Recebido: 07/12/2025 14:35

[Ver Foto] [Autorizar Retirada]
```

#### Personalização
Morador pode configurar:
- Quais tipos de correspondência notificar
- Canais preferidos
- Horário para não receber (modo silencioso)
- Notificação apenas para pacotes grandes

#### Confirmação de Recebimento
Morador pode:
- ✅ **Confirmar recebimento**: "Ok, vou retirar"
- ❓ **Questionar**: "Não pedi nada, verificar"
- 🚫 **Recusar**: "Não é meu, devolver"
- 👤 **Autorizar terceiro**: "Fulano pode retirar por mim"

---

### 4. Controle de Retirada

#### Processo de Retirada
1. **Morador vai à portaria**
2. **Porteiro busca** correspondências pendentes da unidade
3. **Sistema lista** todas as encomendas não retiradas
4. **Morador seleciona** o que vai retirar
5. **Assinatura digital** (tablet/smartphone)
6. **Registro de retirada** com timestamp
7. **Status atualizado** para "Retirado"

#### Assinatura Digital
- Captura via tela touch (tablet)
- Ou via celular (link enviado por QR Code)
- Assinatura armazenada como imagem
- Vinculada ao registro de retirada

#### Identificação do Retirador
Sistema registra:
- **Quem retirou**: Morador, familiar, terceiro autorizado
- **Documento**: CPF/RG (se terceiro)
- **Relação**: Próprio morador, cônjuge, filho, autorizado
- **Data/hora exata**
- **Porteiro que entregou**

#### Autorização de Terceiros
Morador pode **pré-autorizar** alguém a retirar:
- Nome completo
- CPF/RG
- Foto (opcional)
- Validade (única vez, período, permanente)
- Quais tipos de correspondência (todas, apenas pacotes, etc.)

Sistema valida na hora:
- Porteiro informa que João vai retirar para unidade 302
- Sistema verifica se João está autorizado
- Se sim: Libera com registro
- Se não: Bloqueia e notifica morador

---

### 5. Correspondências Pendentes

#### Painel de Pendências
**Por unidade**:
```
┌─────────────────────────────────────────────────┐
│ 📦 UNIDADE 302 - 3 CORRESPONDÊNCIAS PENDENTES   │
├─────────────────────────────────────────────────┤
│ [📦] Pacote (M) - Amazon - 05/12 14:30          │
│      Código: BR123456789AA  [Ver Foto]          │
├─────────────────────────────────────────────────┤
│ [✉️] Carta - Banco Itaú - 06/12 10:15           │
│      [Ver Foto]                                 │
├─────────────────────────────────────────────────┤
│ [📄] Documento - Tribunal - 07/12 09:00  ⚠️     │
│      URGENTE  [Ver Foto]                        │
└─────────────────────────────────────────────────┘
```

#### Alertas Automáticos
- ⚠️ **Correspondência há mais de 7 dias**: Lembrete ao morador
- 🚨 **Correspondência urgente**: Notificação prioritária
- ❄️ **Perecível**: Retirada imediata
- 📦 **Acumulando pacotes**: Alerta de espaço na portaria

#### Relatório de Pendências
Administração pode ver:
- Total de correspondências não retiradas
- Unidades com mais pendências
- Tempo médio de retirada
- Correspondências abandonadas

---

### 6. Correspondências Abandonadas

#### Definição
Correspondência considerada **abandonada** após:
- **30 dias** sem retirada (configurável)
- Múltiplas tentativas de notificação
- Morador não responde

#### Procedimento
1. Sistema marca como "Abandonada"
2. Notificação final ao morador (72h para retirar)
3. Se não retirado:
   - Cartas: Devolvidas ao remetente
   - Pacotes: Devolvidos à transportadora (com foto comprovante)
   - Documentos: Encaminhados à administração
4. Registro fotográfico da devolução
5. Cobrança de taxa de armazenamento (se regulamento permitir)

#### Histórico
- Sistema mantém registro de correspondências devolvidas
- Útil para auditorias e esclarecimentos

---

### 7. Espaço de Armazenamento

#### Gestão do Espaço
Sistema controla:
- **Quantidade de correspondências** na portaria
- **Espaço ocupado** (estimativa por tamanho)
- **Capacidade máxima** (configurável)
- **Alerta de lotação** (80% da capacidade)

#### Organização Física
Sistema sugere:
- Número da prateleira/compartimento
- Organização por unidade
- Separação por tamanho
- Área para perecíveis (refrigerada)

#### Etiquetagem
Sistema pode gerar **etiqueta** para impressão:
```
┌─────────────────────────────┐
│  UNIDADE: 302               │
│  DATA: 07/12/2025           │
│  TIPO: Pacote (M)           │
│  CÓDIGO: BR123456789AA      │
│  PRATELEIRA: A-15           │
└─────────────────────────────┘
```

---

### 8. Correspondências com Valor Alto

#### Tratamento Especial
Para itens de **alto valor**:
- 💎 Marcação especial no sistema
- 🔒 Armazenamento em cofre/área segura
- 📸 Foto adicional (todos os ângulos)
- ✍️ Protocolo de entrega (entregador assina)
- 📞 Ligação para morador (além de push)
- 🔔 Notificação prioritária

#### Validação na Retirada
- **Documento obrigatório** (CPF/RG)
- **Foto do morador** retirando
- **Assinatura em formulário físico** (opcional)
- **Testemunha** (outro porteiro ou morador)

#### Seguro
- Sistema pode registrar valor declarado
- Termo de responsabilidade
- Útil para contestações

---

### 9. Integração com Transportadoras

#### APIs de Rastreio
Integração com:
- **Correios** (API oficial)
- **Jadlog**
- **Total Express**
- **Azul Cargo**
- **Latam Cargo**
- **FedEx/DHL** (internacional)

#### Rastreamento Automático
1. Porteiro registra código de rastreio (ou OCR captura)
2. Sistema consulta API da transportadora
3. Obtém:
   - Status da entrega
   - Remetente
   - Conteúdo declarado
   - Peso
   - Origem
4. Dados preenchem automaticamente o cadastro

#### Atualização de Status
- Sistema pode **monitorar automaticamente** encomendas
- Notifica morador: "Sua encomenda saiu para entrega"
- Útil para morador saber quando chega

---

### 10. Relatórios e Estatísticas

#### Relatório Gerencial
**Por período**:
- Total de correspondências recebidas
- Média por dia
- Tipos mais comuns
- Tempo médio de retirada
- Correspondências pendentes
- Correspondências abandonadas

**Por unidade**:
- Total recebido
- Tempo médio de retirada
- Pendências atuais
- Histórico completo

#### Gráficos
- 📊 Correspondências por dia (linha)
- 📊 Tipos de correspondência (pizza)
- 📊 Unidades que mais recebem (barras)
- 📊 Horário de pico de entregas (heatmap)

#### Exportação
- CSV
- Excel
- PDF
- Google Sheets (integração)

---

## 🔧 Regras de Negócio

### RN-400: Foto Obrigatória
- Toda correspondência **exige foto**
- Sem foto, registro não é salvo

### RN-401: Notificação Imediata
- Sistema notifica morador **imediatamente** após registro
- Máximo 1 minuto de delay

### RN-402: Assinatura na Retirada
- Retirada sem assinatura apenas para cartas simples
- Pacotes/documentos: **Assinatura obrigatória**

### RN-403: Terceiro Autorizado
- Apenas com **autorização prévia** do morador
- Ou **ligação telefônica** confirmando

### RN-404: Correspondência Urgente
- Documentos judiciais/multas: **Notificação prioritária**
- Ligação telefônica automática

### RN-405: Perecível
- Marcação especial no sistema
- Morador tem **24h** para retirar
- Após isso: Descartado com registro fotográfico

### RN-406: Abandonada
- Correspondência não retirada em **30 dias**
- Sistema inicia processo de devolução

### RN-407: Logs Imutáveis
- Registros de correspondência **não podem ser excluídos**
- Apenas desativação lógica

---

## 💾 Campos do Banco de Dados

### Tabela: correspondencias
```sql
id, uuid, unidade_id,
tipo (encomenda/carta/documento/revista/cartao/presente/perec ivel),
tamanho (P/M/G/GG), peso_estimado,
remetente, codigo_rastreio, transportadora,
foto_frontal_url, foto_lateral_url, foto_rastreio_url,
foto_protocolo_url, foto_avaria_url,
data_hora_recebimento, porteiro_recebimento_id,
data_hora_retirada, retirado_por_nome, retirado_por_cpf,
retirado_por_relacao (morador/conjuge/filho/autorizado/outro),
assinatura_digital_url, porteiro_entrega_id,
status (pendente/retirado/devolvido/abandonado),
prateleira_localizacao, observacoes,
valor_declarado, urgente (boolean),
notificacao_enviada (boolean), data_notificacao,
data_cadastro, data_atualizacao
```

### Tabela: autorizados_retirada
```sql
id, uuid, unidade_id, morador_autorizador_id,
nome_autorizado, cpf_autorizado, rg_autorizado,
foto_url, parentesco_relacao,
tipo_autorizacao (unica_vez/temporaria/permanente),
data_inicio_validade, data_fim_validade,
tipos_correspondencia_permitidos (array),
status, data_cadastro
```

### Tabela: devolucoes_correspondencias
```sql
id, correspondencia_id, motivo (abandonada/recusada/erro),
data_devolucao, porteiro_id,
foto_comprovante_url, protocolo_devolucao,
transportadora, codigo_rastreio_devolucao,
observacoes, data_cadastro
```

---

## 🎯 Casos de Uso

### UC-400: Registrar Encomenda Recebida
**Ator**: Porteiro, Entregador  
**Fluxo**:
1. Entregador entrega pacote na portaria
2. Porteiro abre módulo "Correspondências"
3. Clica em "Nova Correspondência"
4. Seleciona tipo: "Encomenda"
5. Tira foto do pacote (frontal)
6. Sistema faz OCR do código de rastreio
7. Sugere: "BR123456789AA"
8. Porteiro confirma
9. Sistema consulta API Correios
10. Retorna: Remetente "Amazon", Peso "500g"
11. Porteiro informa unidade: 302
12. Seleciona tamanho: M
13. Salva
14. Sistema envia notificação push ao morador
15. E-mail com foto também enviado

### UC-401: Morador Retira Correspondência
**Ator**: Morador, Porteiro  
**Fluxo**:
1. Morador chega à portaria
2. Informa: "Vim retirar encomenda, unidade 302"
3. Porteiro busca pendências da unidade 302
4. Sistema lista: 2 pacotes e 1 carta
5. Morador: "Vou levar tudo"
6. Porteiro seleciona os 3 itens
7. Sistema exibe tablet para assinatura
8. Morador assina digitalmente
9. Sistema registra retirada com timestamp
10. Status muda para "Retirado"
11. Morador recebe confirmação por e-mail

### UC-402: Terceiro Autorizado Retira
**Ator**: Porteiro, Terceiro, Morador (remoto)  
**Fluxo**:
1. João chega à portaria
2. "Vim retirar encomenda da unidade 302"
3. Porteiro: "Documento, por favor"
4. João apresenta RG
5. Porteiro busca autorizados da unidade 302
6. Sistema mostra: João Silva (CPF 123.456.789-00) - AUTORIZADO
7. Porteiro confirma identidade
8. Lista pendências
9. João escolhe 1 pacote
10. Assina digitalmente
11. Sistema registra: "Retirado por João Silva (Autorizado)"
12. Morador recebe notificação: "João retirou sua encomenda"

### UC-403: Correspondência Urgente
**Ator**: Porteiro, Morador  
**Fluxo**:
1. Carta do Tribunal de Justiça chega
2. Porteiro identifica: Documento oficial
3. Registra no sistema
4. Marca como "Urgente"
5. Tira foto frontal e verso
6. Informa unidade
7. Sistema detecta: "Tribunal" → Prioridade alta
8. Envia notificação push PRIORITÁRIA
9. Sistema também envia SMS
10. E realiza ligação automática para morador
11. Morador recebe múltiplos alertas
12. Retira no mesmo dia

---

## 📊 Métricas e KPIs

- **Total de correspondências** por período
- **Média por unidade** por mês
- **Tempo médio de retirada**
- **Taxa de correspondências pendentes** (%)
- **Correspondências abandonadas** por mês
- **Tipo mais comum** de correspondência
- **Horário de pico** de entregas
- **Unidade que mais recebe**
- **Transportadora mais usada**

---

## 🔐 Segurança

- ✅ **Fotos obrigatórias** para rastreabilidade
- ✅ **Assinatura digital** com timestamp
- ✅ **Logs imutáveis** de retiradas
- ✅ **Autorização validada** para terceiros
- ✅ **Notificação ao morador** em toda retirada
- ✅ **Backup automático** de fotos
- ✅ **Criptografia** de dados sensíveis

---

## 🚀 Melhorias Futuras

- [ ] Armários inteligentes (lockers) com QR Code
- [ ] Integração com Amazon Hub / Pickup Points
- [ ] OCR avançado (ler remetente e destinatário completos)
- [ ] Reconhecimento facial na retirada (sem documento)
- [ ] App para morador ver fotos das encomendas pendentes
- [ ] Agendamento de retirada (morador informa quando vai)
- [ ] Taxa de armazenamento automática (cobrada após X dias)
- [ ] Integração com sistemas de pagamento para taxas
- [ ] Alerta de Black Friday (preparação para volume alto)
