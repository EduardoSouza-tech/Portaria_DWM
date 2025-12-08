# 🛡️ Sistema Antifraude e Diferenciais Competitivos

## Visão Geral

Conjunto de tecnologias e estratégias avançadas que diferenciam o sistema no mercado, garantindo segurança máxima e confiabilidade.

---

## 🔐 Sistema Antifraude em QR Codes

### Problema que Resolve
**Fraudes comuns**:
- Screenshots de QR Codes compartilhados indevidamente
- QR Codes impressos e replicados
- Tentativas de falsificação digital
- Reutilização de QR Codes expirados

### Solução Implementada

#### 1. Assinatura Digital com SHA-256
Cada QR Code contém:
```json
{
  "visitor_id": "uuid-v4",
  "unit_id": "uuid-v4",
  "valid_from": "2025-12-07T14:00:00Z",
  "valid_until": "2025-12-07T23:59:59Z",
  "entry_type": "single",
  "nonce": "random-unique-value",
  "signature": "sha256(dados + chave_secreta + nonce)"
}
```

**Validação**:
1. Sistema extrai dados do QR Code
2. Recalcula signature com chave secreta (armazenada no servidor)
3. Compara com signature do QR Code
4. Se diferente: **FRAUDE DETECTADA**

**Por que é seguro?**:
- ✅ Chave secreta nunca está no QR Code
- ✅ Nonce único previne replicação
- ✅ Impossível gerar QR válido sem acesso ao servidor

#### 2. Timestamp Dinâmico
- QR Code só é válido **dentro do período especificado**
- Sistema valida timezone correto
- Previne uso após expiração

#### 3. Uso Único (Single-Entry)
Para QR Codes de entrada única:
```sql
-- Marca QR Code como usado após primeira entrada
UPDATE visitas 
SET qr_code_usado = TRUE, 
    data_uso = NOW() 
WHERE qr_code_hash = 'hash-do-qr';
```

**Tentativa de reutilização**:
```
❌ QR CODE JÁ UTILIZADO
Este código foi usado em 07/12 às 15:03
Solicite novo QR Code ao morador
```

#### 4. QR Code Rotativo (Opcional - Premium)
Para segurança máxima:
- QR Code **muda a cada 30 segundos** (como Google Authenticator)
- Baseado em TOTP (Time-based One-Time Password)
- Sincronizado entre app e servidor

**Implementação**:
```javascript
// Gera QR Code rotativo
const secret = morador.totp_secret;
const token = totp.generate(secret); // Muda a cada 30s
const qrData = {
  morador_id: morador.id,
  token: token,
  timestamp: Date.now()
};
```

#### 5. Geolocalização (Opcional)
- QR Code só é válido se escaneado **dentro do condomínio**
- Usa GPS do dispositivo do porteiro
- Previne uso remoto do QR Code

```javascript
// Validação geográfica
const portariaCoords = {lat: -23.550520, lng: -46.633308};
const distancia = calcularDistancia(portariaCoords, scanLocation);

if (distancia > 100) { // 100 metros
  return "QR Code só pode ser usado na portaria";
}
```

---

## 🔗 Logs Imutáveis (Blockchain-Style)

### Problema que Resolve
- **Adulteração de logs**: Alguém pode tentar modificar registros de entrada/saída
- **Falta de auditoria confiável**: Impossível provar que logs não foram alterados
- **Disputas legais**: Sem prova irrefutável de eventos

### Solução: Cadeia de Hashes

#### Como Funciona
Cada registro de log contém:
1. **Hash do próprio registro** (SHA-256)
2. **Hash do registro anterior** (como blockchain)
3. **Timestamp** preciso
4. **Dados do evento**

```sql
CREATE TABLE logs_auditoria (
    id UUID PRIMARY KEY,
    acao VARCHAR(255),
    detalhes JSONB,
    hash_anterior VARCHAR(64),  -- Hash do log anterior
    hash_atual VARCHAR(64),      -- Hash deste log
    timestamp TIMESTAMP
);
```

#### Cálculo do Hash
```javascript
function gerarHashLog(log, hashAnterior) {
  const dados = JSON.stringify({
    id: log.id,
    acao: log.acao,
    detalhes: log.detalhes,
    timestamp: log.timestamp,
    hash_anterior: hashAnterior
  });
  
  return crypto
    .createHash('sha256')
    .update(dados)
    .digest('hex');
}
```

#### Exemplo Real
```
Log #1:
- Ação: "Visitante João entrou"
- Hash anterior: null (primeiro log)
- Hash atual: a3f5b8c2...

Log #2:
- Ação: "Visitante João saiu"
- Hash anterior: a3f5b8c2...  (hash do log #1)
- Hash atual: 7d2e9f1a...

Log #3:
- Ação: "Encomenda recebida"
- Hash anterior: 7d2e9f1a...  (hash do log #2)
- Hash atual: c4b8e3d9...
```

#### Validação de Integridade
Sistema pode **verificar toda a cadeia**:
```javascript
function validarCadeiaLogs(logs) {
  for (let i = 1; i < logs.length; i++) {
    const logAnterior = logs[i - 1];
    const logAtual = logs[i];
    
    // Recalcula hash do log anterior
    const hashRecalculado = gerarHashLog(logAnterior, logs[i-2]?.hash_atual);
    
    // Compara com hash armazenado no log atual
    if (hashRecalculado !== logAtual.hash_anterior) {
      return {
        valido: false,
        erro: `Cadeia quebrada no log ${logAtual.id}`
      };
    }
  }
  
  return {valido: true};
}
```

**Se alguém tentar adulterar um log**:
- Hash não bate mais
- **Toda a cadeia fica inválida**
- Auditoria detecta imediatamente

### Benefícios
- ✅ **Logs à prova de adulteração**
- ✅ **Auditoria confiável**
- ✅ **Prova legal** em disputas
- ✅ **Conformidade** com regulamentações

### Blockchain Completo (Opcional - Enterprise)
Para clientes enterprise:
- **Hyperledger Fabric** ou **Ethereum privada**
- Logs armazenados em blockchain real
- Múltiplos nós validadores
- Impossível adulterar (descentralizado)

---

## 🕵️ Auditoria Completa

### O que é Auditado
**Todas as ações do sistema**:
- Login/logout de usuários
- Criação/edição/exclusão de registros
- Autorizações de visitantes
- Abertura de portões
- Acesso a dados sensíveis
- Mudanças de permissões
- Tentativas de fraude

### Dados Armazenados em Cada Log
```sql
{
  "usuario_id": "uuid",
  "usuario_nome": "Porteiro Carlos",
  "acao": "registrar_entrada_visitante",
  "recurso": "visitas",
  "recurso_id": "uuid-da-visita",
  "detalhes": {
    "visitante_nome": "João Silva",
    "unidade": "302",
    "metodo": "qr_code"
  },
  "ip_address": "192.168.1.50",
  "user_agent": "Mozilla/5.0...",
  "timestamp": "2025-12-07T15:30:45.123Z",
  "resultado": "sucesso"
}
```

### Interface de Auditoria (Admin)
```
┌──────────────────────────────────────────────────┐
│ 🔍 Auditoria de Logs                             │
├──────────────────────────────────────────────────┤
│ Filtros:                                         │
│ Usuário: [Todos ▼]  Ação: [Todas ▼]            │
│ Período: [Últimos 7 dias ▼]  [Buscar]          │
├──────────────────────────────────────────────────┤
│ DATA/HORA          USUÁRIO         AÇÃO          │
│ 07/12 15:30:45    Porteiro Carlos  Entrada Visit.│
│ 07/12 15:25:12    Morador Maria    Autorizou Visit.│
│ 07/12 15:20:01    Porteiro Carlos  Abriu Portão  │
│ 07/12 15:15:33    Admin João       Editou Morador│
│ 07/12 15:10:00    Sistema          Backup Auto   │
├──────────────────────────────────────────────────┤
│ [Exportar Relatório] [Validar Integridade]      │
└──────────────────────────────────────────────────┘
```

### Alertas Automáticos
Sistema detecta **padrões suspeitos**:
- ⚠️ Múltiplas tentativas de login falhadas
- ⚠️ Acesso a dados sensíveis fora do horário
- ⚠️ Alteração em massa de registros
- ⚠️ Abertura de portão sem visitante registrado
- ⚠️ QR Code falsificado detectado

**Ação**: Notificação imediata para administração

---

## 📴 Acesso Offline

### Problema que Resolve
- Queda de internet na portaria
- Instabilidade de conexão
- Necessidade de funcionamento contínuo

### Solução Implementada

#### 1. Cache Local (Service Worker)
- App da portaria mantém **cache** de:
  - Moradores cadastrados
  - Visitantes pré-cadastrados (últimas 24h)
  - Veículos cadastrados
  - Fotos essenciais (baixa resolução)

#### 2. Validação Offline de QR Codes
QR Code contém **todos os dados necessários**:
```json
{
  "version": "1.0",
  "visitor_name": "João Silva",
  "visitor_cpf": "123.456.789-00",
  "unit_number": "302",
  "authorizer_name": "Maria Costa",
  "valid_from": "2025-12-07T14:00:00Z",
  "valid_until": "2025-12-07T23:59:59Z",
  "signature": "hash-assinatura"
}
```

**Porteiro pode**:
- Ler dados visuais do QR Code
- Validar **data/hora** manualmente
- Comparar **assinatura** com lista local de hashes válidos
- Registrar entrada em **modo offline**

#### 3. Sincronização Automática
Quando internet volta:
1. Sistema detecta conexão
2. Envia todos os registros offline para servidor
3. Servidor valida e persiste
4. Atualiza cache local com dados mais recentes

```javascript
// Registro offline
if (!navigator.onLine) {
  // Salva localmente (IndexedDB)
  await saveToLocalDB({
    type: 'visita',
    action: 'entrada',
    data: visitaData,
    timestamp: Date.now(),
    synced: false
  });
  
  showMessage('Registrado offline. Será sincronizado automaticamente.');
}

// Quando internet voltar
window.addEventListener('online', async () => {
  const pending = await getUnsyncedRecords();
  
  for (const record of pending) {
    await syncToServer(record);
    await markAsSynced(record.id);
  }
  
  showMessage('✅ Todos os registros foram sincronizados!');
});
```

#### 4. Modo Offline Limitado
Funcionalidades disponíveis **sem internet**:
- ✅ Validar QR Codes pré-cadastrados
- ✅ Registrar entradas/saídas (salva localmente)
- ✅ Visualizar lista de visitantes dentro
- ✅ Consultar moradores cadastrados (cache)
- ❌ Solicitar nova autorização em tempo real (precisa internet)
- ❌ Enviar notificações push

---

## 🚨 Modo Emergência

### Quando Usar
- Incêndio
- Evacuação
- Emergência médica
- Desastre natural
- Ordem de autoridade (polícia, bombeiros)

### Como Funciona

#### Ativação
1. Porteiro pressiona **botão vermelho** físico **OU**
2. Clica em botão no sistema: "🚨 EMERGÊNCIA"
3. Sistema pede **confirmação**:
```
⚠️ ATIVAR MODO EMERGÊNCIA?

Isso irá:
- Abrir TODOS os portões
- Liberar TODAS as catracas
- Notificar administração
- Registrar evento crítico

[Cancelar]  [🚨 CONFIRMAR EMERGÊNCIA]
```

#### O que Acontece
Ao confirmar:
1. **Todos os portões abrem** automaticamente
2. **Catracas liberadas** (se houver)
3. **Alarme sonoro** (opcional)
4. **Notificações enviadas** para:
   - Administração
   - Síndico
   - Corpo de bombeiros (se integrado)
5. **Registro em log** como evento crítico
6. **Timestamp** preciso salvo

#### Desativação
- Apenas **administrador** pode desativar
- Exige **senha especial** ou **dupla autenticação**
- Sistema pede **motivo** da emergência
- Tudo registrado em auditoria

#### Acesso de Emergência (Autoridades)
**Bombeiros/Polícia** chegam sem QR Code:
- Porteiro ativa "Acesso de Emergência"
- Sistema registra:
  - Foto dos profissionais
  - Viatura (placa)
  - Horário
  - Motivo
- Entrada **imediata sem autorização**

---

## 📊 Painel para Síndico

### Diferencial Exclusivo
Enquanto porteiros e moradores têm suas interfaces, **síndico tem painel especial** com:

#### Dashboard Executivo
```
┌──────────────────────────────────────────────────┐
│ 📊 Condomínio Green Park - Dashboard do Síndico  │
├──────────────────────────────────────────────────┤
│ 📈 Métricas do Mês                               │
│ ┌─────────┬─────────┬─────────┬─────────┐        │
│ │ Visitas │ Entregas│ Eventos │ Acessos │        │
│ │  1,245  │   387   │   12    │ 8,932   │        │
│ └─────────┴─────────┴─────────┴─────────┘        │
│                                                  │
│ 🏠 Taxa de Ocupação: 92% (110/120 unidades)     │
│ 🅿️ Vagas Ocupadas: 87/120 (72%)                 │
│                                                  │
│ ⚠️ Alertas Ativos (3)                            │
│ • Correspondências acima de 30 dias: 5          │
│ • Tentativa de QR falsificado: 1 (ontem)        │
│ • Veículos não cadastrados: 2 esta semana       │
│                                                  │
│ 📊 Top 5 Unidades com Mais Visitas              │
│ 1. Unidade 302 - 45 visitas                     │
│ 2. Unidade 105 - 38 visitas                     │
│ 3. Unidade 501 - 32 visitas                     │
│                                                  │
│ [Relatórios Completos] [Exportar Dados]         │
└──────────────────────────────────────────────────┘
```

#### Relatórios Avançados
- **Financeiro**: Custos de operação (se integrado)
- **Uso de áreas comuns**
- **Ocorrências de segurança**
- **Performance dos porteiros**
- **Satisfação dos moradores** (pesquisas)
- **Compliance**: LGPD, regulamentações

#### Aprovações Especiais
- Bloqueio/desbloqueio de moradores inadimplentes
- Autorização de obras/mudanças
- Aprovação de cadastro de prestadores recorrentes
- Gestão de permissões especiais

---

## 🎯 Outros Diferenciais Competitivos

### 1. Multi-Tenancy Inteligente
- **Uma instância** do sistema serve **múltiplos condomínios**
- Isolamento completo de dados
- Personalização por condomínio (logo, cores, regras)
- Reduz custos de infraestrutura

### 2. White Label
- Sistema pode ser **rebrandizado** completamente
- Logo personalizado
- Cores da marca do cliente
- Domínio próprio (portaria.condominioxyz.com.br)

### 3. APIs Abertas
- **Documentação OpenAPI** completa
- Outros sistemas podem integrar:
  - Sistemas de cobrança (taxas condominiais)
  - ERPs de administradoras
  - Apps de delivery
  - Plataformas de reserva de áreas comuns

### 4. Machine Learning (IA - Opcional)
- **Detecção de anomalias**:
  - Padrões de acesso suspeitos
  - Horários fora do comum
  - Visitantes com comportamento irregular
- **Sugestões inteligentes**:
  - "Este visitante costuma vir às quintas, deseja pré-autorizar?"
- **Reconhecimento facial avançado**:
  - 99,5% de precisão
  - Funciona mesmo com máscara

### 5. Compliance LGPD Nativo
- **Consentimento explícito** para coleta de dados
- **Direito ao esquecimento**: Botão para deletar dados
- **Portabilidade**: Exportar todos os dados em JSON/CSV
- **Transparência**: Morador vê quem acessou seus dados
- **Minimização**: Coleta apenas o necessário
- **Relatório de impacto**: Automático para DPO

### 6. Backup Automático Criptografado
- **Backup diário** de todo o banco de dados
- **Criptografia AES-256** antes de enviar
- **Armazenamento**: AWS S3 (ou similar)
- **Retenção**: 90 dias
- **Restore**: Em menos de 1 hora

### 7. SLA Garantido (Para Planos Enterprise)
- **99,9% de uptime**
- **Suporte 24/7**
- **Tempo de resposta**: < 15 minutos para crítico
- **Compensação** se SLA não for cumprido

---

## 📈 Comparativo com Concorrentes

| Funcionalidade | Nosso Sistema | Concorrente A | Concorrente B |
|---|---|---|---|
| QR Code Antifraude | ✅ Assinatura digital | ❌ QR simples | ⚠️ Básico |
| Logs Imutáveis | ✅ Blockchain-style | ❌ Não | ❌ Não |
| Modo Offline | ✅ Completo | ⚠️ Limitado | ❌ Não |
| Modo Emergência | ✅ Sim | ❌ Não | ❌ Não |
| Reconhecimento Facial | ✅ IA avançada | ⚠️ Básico | ❌ Não |
| Multi-Tenancy | ✅ Nativo | ❌ Não | ⚠️ Limitado |
| APIs Abertas | ✅ OpenAPI | ⚠️ Limitadas | ❌ Não |
| Compliance LGPD | ✅ Nativo | ⚠️ Parcial | ❌ Não |
| Painel do Síndico | ✅ Completo | ⚠️ Básico | ❌ Não |

---

**Versão**: 1.0.0  
**Última atualização**: Dezembro 2025
