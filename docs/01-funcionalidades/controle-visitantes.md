# 🚪 Controle de Visitantes

## Visão Geral

Sistema completo para gestão de visitantes, desde o pré-cadastro até o registro de saída, garantindo segurança e agilidade no acesso ao condomínio.

---

## 📋 Funcionalidades Detalhadas

### 1. Pré-Cadastro via App do Morador

#### Como Funciona
O morador pode cadastrar visitantes **antes mesmo deles chegarem** ao condomínio, agilizando a entrada e aumentando a segurança.

#### Dados do Pré-Cadastro
- **Nome completo** do visitante
- **CPF** (opcional, mas recomendado)
- **RG/Documento**
- **Foto** (upload ou captura)
- **Telefone/WhatsApp**
- **Placa do veículo** (se vier de carro)
- **Data/hora prevista** de chegada
- **Validade do pré-cadastro** (única visita, período específico, recorrente)
- **Observações** (ex: "Entregador da Amazon")

#### Tipos de Pré-Cadastro
1. **Visita Única**: Válido apenas para uma entrada
2. **Visita com Período**: Válido de DD/MM às HH:MM até DD/MM às HH:MM
3. **Visitante Recorrente**: Válido para múltiplas entradas (ex: diarista, personal trainer)
4. **Lista VIP**: Entrada automática sem nova autorização

#### Validação do Pré-Cadastro
- Sistema gera **QR Code temporário** enviado ao visitante por:
  - WhatsApp
  - E-mail
  - SMS
- QR Code contém:
  - Nome do visitante
  - Unidade de destino
  - Validade
  - Assinatura digital (antifraude)

---

### 2. Identificação na Portaria

#### Métodos de Identificação
1. **QR Code** (pré-cadastrado pelo morador)
2. **Documento físico** (RG, CNH, passaporte)
3. **Busca por nome** no sistema
4. **Reconhecimento facial** (se já visitou antes)

#### Fluxo de Identificação
1. Visitante chega à portaria
2. Porteiro solicita identificação
3. Opções:
   - **Com QR Code**: Escaneia e valida automaticamente
   - **Sem QR Code**: Porteiro coleta documento e busca no sistema
4. Sistema verifica se já existe cadastro anterior
5. Se sim: Reutiliza dados e foto anterior
6. Se não: Novo cadastro é iniciado

---

### 3. Registro Fotográfico

#### Captura Obrigatória
- **Foto facial** do visitante é **obrigatória**
- Captura via:
  - Webcam da portaria
  - Câmera IP integrada
  - Tablet/smartphone do porteiro

#### Qualidade e Validação
- Sistema valida:
  - ✅ Resolução mínima (640x480)
  - ✅ Rosto detectável (IA)
  - ✅ Iluminação adequada
  - ✅ Face frontal (não de perfil)
- Foto rejeitada se não atender critérios
- Porteiro deve tentar novamente

#### Armazenamento
- Foto vinculada ao registro de acesso
- Armazenada em servidor seguro (S3/MinIO)
- Thumbnail gerado para visualização rápida
- Compressão automática (preservando qualidade)

#### Biometria Facial
- Sistema pode **armazenar vetores faciais** (opcional)
- Reconhecimento automático em visitas futuras
- Alerta se mesmo visitante usar documentos diferentes

---

### 4. Autorização pelo Morador

#### Fluxo de Autorização em Tempo Real

**Quando visitante NÃO está pré-cadastrado:**
1. Porteiro registra visitante no sistema
2. Sistema identifica unidade de destino
3. **Notificação push** enviada ao morador:
   - Nome do visitante
   - Foto capturada
   - Documento apresentado
   - Botões: ✅ Autorizar | ❌ Negar
4. Morador responde em até **2 minutos** (configurável)
5. Se autorizado: Sistema libera QR Code temporário
6. Se negado: Visitante é impedido de entrar
7. Se não responder: Ação configurável (libera, nega ou liga para morador)

**Quando visitante está pré-cadastrado:**
- Sistema valida QR Code automaticamente
- **Não precisa** de nova autorização
- Morador recebe **notificação informativa** da entrada
- Entrada liberada imediatamente

#### Canais de Autorização
1. **App Mobile** (principal)
   - Push notification instantânea
   - Visualização de foto e dados
   - Autorização com um toque
2. **WhatsApp Business API**
   - Mensagem com foto e dados
   - Resposta via botões interativos
3. **SMS** (fallback)
   - Mensagem com código
   - Resposta via SMS
4. **Ligação telefônica**
   - Porteiro liga se nenhum canal anterior funcionou

#### Autorização Retroativa
- Morador pode **autorizar posteriormente**
- Casos de uso:
  - Esqueceu de pré-cadastrar
  - Não viu notificação a tempo
  - Visitante é conhecido

---

### 5. Geração de QR Code Temporário

#### Características do QR Code
- **Único** por visitante/visita
- **Temporário**: Validade configurável
- **Assinado digitalmente**: Antifraude
- **Dados inclusos**:
  - ID do visitante
  - Unidade de destino
  - Timestamp de geração
  - Hash de validação (SHA-256)
  - Validade (data/hora de expiração)

#### Tipos de Validade
1. **Entrada única**: Válido apenas para uma entrada
2. **Período fixo**: Ex: válido das 14h às 18h
3. **24 horas**: Válido até o final do dia
4. **Recorrente**: Válido para múltiplas entradas em dias específicos

#### Formato do QR Code
```json
{
  "version": "1.0",
  "visitor_id": "uuid-v4",
  "unit_id": "uuid-v4",
  "valid_from": "2025-12-07T14:00:00Z",
  "valid_until": "2025-12-07T22:00:00Z",
  "entry_type": "single|multiple",
  "signature": "sha256-hash",
  "timestamp": "2025-12-07T13:55:00Z"
}
```

#### Distribuição
- QR Code enviado ao visitante via:
  - WhatsApp (imagem PNG)
  - E-mail (anexo + incorporado)
  - SMS (link para visualização)
- Morador também recebe cópia
- QR Code pode ser **reimpresso** pelo porteiro

#### Validação do QR Code
1. Porteiro escaneia QR Code
2. Sistema verifica:
   - ✅ Assinatura digital válida
   - ✅ Dentro do período de validade
   - ✅ Não foi revogado
   - ✅ Número de entradas não excedido
3. Se válido: Libera entrada
4. Se inválido: Exibe motivo e bloqueia

---

### 6. Registro de Entrada e Saída

#### Registro de Entrada
Cada entrada registra:
- **Timestamp** preciso (data/hora)
- **Visitante** (ID e dados)
- **Unidade de destino**
- **Morador que autorizou**
- **Foto do momento** da entrada
- **Método de identificação** (QR Code, documento, facial)
- **Porteiro responsável**
- **Veículo** (se houver)
- **Placa** (capturada ou digitada)
- **Observações** (campo livre)

#### Registro de Saída
- Porteiro registra saída manualmente **OU**
- Sistema detecta saída automaticamente (se tiver cancela integrada)
- Dados registrados:
  - Timestamp de saída
  - Tempo de permanência
  - Mesmo porteiro ou diferente
  - Observações (se houver)

#### Visitante Dentro do Condomínio
- Dashboard mostra **visitantes atualmente dentro**
- Lista filtrada por:
  - Unidade
  - Tempo de permanência
  - Nome do visitante
- Alerta de **permanência excessiva** (ex: mais de 4 horas)
- Porteiro pode enviar **lembrete de saída**

---

### 7. Visitantes Recorrentes

#### Cadastro de Visitante Frequente
Morador pode marcar visitante como **recorrente**:
- **Diarista**
- **Personal trainer**
- **Professor particular**
- **Cuidador(a)**
- **Entregador fixo**

#### Permissões Especiais
- Entrada **sem autorização prévia** em cada visita
- Validade configurável:
  - Dias da semana específicos (ex: segunda e quinta)
  - Horário permitido (ex: 8h às 18h)
  - Data de expiração (ex: válido até 31/12/2025)
- Morador recebe **notificação informativa** (não bloqueante)

#### Renovação Automática
- Sistema pode **solicitar renovação** ao morador
- Notificação 7 dias antes de expirar
- Morador pode renovar com um clique

---

### 8. Lista Negra e Restrições

#### Bloqueio de Visitante
- Morador pode **bloquear permanentemente** um visitante
- Motivos:
  - Comportamento inadequado
  - Não é mais autorizado
  - Segurança
- Visitante bloqueado:
  - **Não pode receber novo QR Code** para aquela unidade
  - Sistema alerta porteiro se tentar entrar
  - Fica registrado no histórico

#### Lista Negra Global
- **Administração** pode bloquear visitante para **todo o condomínio**
- Motivos:
  - Incidente de segurança
  - Furto
  - Ordem judicial
- Sistema impede qualquer entrada, mesmo com autorização de morador

#### Alerta de Visitante Problemático
- Visitante com múltiplas **recusas de entrada**
- Sistema sinaliza ao porteiro para **atenção redobrada**

---

## 🔧 Regras de Negócio

### RN-100: Foto Obrigatória
- **Toda entrada de visitante** exige foto
- Exceção apenas para **emergências** (modo configurável)

### RN-101: Autorização Obrigatória
- Visitante sem pré-cadastro **precisa de autorização do morador**
- Exceção: Visitantes recorrentes com autorização prévia ativa

### RN-102: Validade do QR Code
- QR Code não pode ser usado **após expiração**
- QR Code de entrada única é **invalidado após uso**

### RN-103: Tempo Máximo de Espera
- Morador tem **tempo configurável** para responder (padrão: 2 minutos)
- Após timeout: Ação configurável (negar, liberar ou ligar)

### RN-104: Documento Válido
- Sistema aceita: RG, CNH, Passaporte, RNE
- CPF pode ser validado via API da Receita Federal (opcional)

### RN-105: Histórico Imutável
- Registros de entrada/saída **não podem ser excluídos**
- Apenas desativação lógica com motivo registrado

### RN-106: Um Visitante por Autorização
- Cada autorização vale para **um visitante**
- Grupos devem ter múltiplas autorizações

### RN-107: Saída Obrigatória
- Visitante que entrou **deve registrar saída**
- Alerta se permanecer além do período esperado

---

## 💾 Campos do Banco de Dados

### Tabela: visitantes
```sql
id, uuid, nome_completo, cpf, rg, telefone, whatsapp,
foto_url, vetor_facial (jsonb), placa_veiculo,
tipo_visitante (comum/recorrente/prestador),
status (ativo/bloqueado), motivo_bloqueio,
total_visitas, data_primeira_visita, data_ultima_visita,
data_cadastro, cadastrado_por
```

### Tabela: visitas
```sql
id, uuid, visitante_id, unidade_id, morador_autorizador_id,
qr_code_hash, pre_cadastrado (boolean),
data_hora_entrada, data_hora_saida, 
tempo_permanencia (interval),
foto_entrada_url, foto_saida_url,
metodo_identificacao (qr_code/documento/facial/manual),
porteiro_entrada_id, porteiro_saida_id,
veiculo_placa, veiculo_modelo, veiculo_cor,
observacoes_entrada, observacoes_saida,
status (aguardando/dentro/saiu/negado),
data_autorizacao, canal_autorizacao (app/whatsapp/sms/telefone)
```

### Tabela: visitantes_recorrentes
```sql
id, visitante_id, unidade_id, morador_id,
tipo_servico (diarista/personal/professor/cuidador/outro),
dias_semana (array), horario_inicio, horario_fim,
data_inicio_validade, data_fim_validade,
requer_autorizacao_sempre (boolean),
status, data_cadastro
```

### Tabela: autorizacoes_visitantes
```sql
id, uuid, visita_id, morador_id,
tipo (previa/tempo_real/retroativa),
status (pendente/autorizado/negado/expirado),
data_solicitacao, data_resposta,
canal_resposta (app/whatsapp/sms/telefone),
motivo_negacao, data_expiracao
```

---

## 🎯 Casos de Uso

### UC-100: Visitante Chega Com QR Code Pré-Cadastrado
**Ator**: Porteiro, Visitante  
**Fluxo**:
1. Visitante apresenta QR Code (celular ou impresso)
2. Porteiro escaneia com leitor
3. Sistema valida assinatura e validade
4. Exibe dados: Nome, Unidade, Foto, Morador
5. Porteiro compara foto com visitante
6. Confirma entrada
7. Sistema registra entrada com timestamp
8. Notificação enviada ao morador (informativa)
9. Portão/cancela liberado

### UC-101: Visitante Chega Sem Pré-Cadastro
**Ator**: Porteiro, Visitante, Morador  
**Fluxo**:
1. Visitante chega à portaria sem QR Code
2. Porteiro solicita documento
3. Porteiro busca por CPF/RG no sistema
4. Se não encontrado: Inicia novo cadastro
5. Preenche: Nome, documento, telefone
6. Captura foto do visitante
7. Informa unidade de destino
8. Sistema envia notificação push ao morador
9. Morador visualiza foto e dados
10. Morador autoriza ou nega
11. Se autorizado: Sistema gera QR temporário
12. Porteiro recebe confirmação
13. Registra entrada
14. Visitante entra

### UC-102: Cadastrar Visitante Recorrente
**Ator**: Morador  
**Fluxo**:
1. Morador acessa app
2. Vai em "Visitantes Recorrentes"
3. Clica em "Novo"
4. Preenche dados do visitante
5. Seleciona tipo de serviço (ex: diarista)
6. Define dias da semana (ex: segunda e quinta)
7. Define horário permitido (8h às 17h)
8. Define validade (ex: 3 meses)
9. Salva
10. Sistema gera autorização permanente
11. Visitante recebe QR Code por WhatsApp
12. Próximas entradas: Automáticas (dentro do período)

---

## 📊 Métricas e KPIs

- **Total de visitantes únicos** por período
- **Média de visitantes por dia**
- **Pico de visitantes** (horário)
- **Taxa de autorização** (aprovadas vs. negadas)
- **Tempo médio de permanência**
- **Visitantes recorrentes** vs. **visitantes únicos**
- **Método de identificação mais usado**
- **Taxa de uso do pré-cadastro**
- **Tempo médio de resposta** do morador

---

## 🔐 Segurança

- ✅ QR Code com **assinatura digital** (impossível falsificar)
- ✅ **Fotos obrigatórias** para validação visual
- ✅ **Logs imutáveis** de todas as autorizações
- ✅ **Biometria facial** (opcional) para reconhecimento
- ✅ **Lista negra** para visitantes indesejados
- ✅ **Alerta de permanência excessiva**
- ✅ **Dupla validação**: QR + comparação visual

---

## 🚀 Melhorias Futuras

- [ ] Reconhecimento facial automático na entrada
- [ ] OCR de documentos (captura automática de dados)
- [ ] Integração com cartório digital
- [ ] Análise comportamental (IA) para detectar padrões suspeitos
- [ ] Compartilhamento de lista negra entre condomínios
- [ ] QR Code dinâmico (rotaciona a cada 30 segundos)
- [ ] Integração com Uber/99 para identificar motoristas
