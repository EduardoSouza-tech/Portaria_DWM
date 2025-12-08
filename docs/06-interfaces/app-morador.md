# 📱 App do Morador

## Visão Geral

Aplicativo móvel (iOS/Android) intuitivo e moderno para moradores gerenciarem visitantes, correspondências, veículos e comunicação com a portaria.

---

## 🎨 Design e Experiência

### Princípios de UX
- **Simplicidade**: Máximo 3 toques para tarefas principais
- **Clareza**: Informações importantes em destaque
- **Velocidade**: Ações rápidas (autorizar visitante em 5 segundos)
- **Acessibilidade**: Suporte a leitores de tela, contraste adequado
- **Personalização**: Tema claro/escuro

### Tecnologia
- **Framework**: React Native ou Flutter
- **Design System**: Material Design 3 (Android) + Human Interface (iOS)
- **Ícones**: Material Icons / Ionicons
- **Animações**: Lottie para feedback visual

---

## 📱 Telas Principais

### 1. Tela de Login / Onboarding

#### Login
```
┌─────────────────────────────────┐
│                                 │
│      🏢 LOGO CONDOMÍNIO          │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 📧 E-mail                  │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 🔒 Senha                   │  │
│  └───────────────────────────┘  │
│                                 │
│  [ Esqueci minha senha ]        │
│                                 │
│  ┌───────────────────────────┐  │
│  │      ENTRAR               │  │
│  └───────────────────────────┘  │
│                                 │
│  Ou entre com:                  │
│  [🟦 Google] [⚫ Apple]          │
│                                 │
│  Não tem conta? [Cadastre-se]   │
└─────────────────────────────────┘
```

**Funcionalidades**:
- Login com e-mail/senha
- OAuth2: Google, Apple, Facebook
- Biometria (Face ID / Touch ID / Digital)
- Recuperação de senha por e-mail
- MFA (se habilitado)

#### Onboarding (Primeiro Acesso)
**3 telas explicativas**:
1. "Autorize visitantes em segundos"
2. "Receba notificações de encomendas"
3. "Comunique-se com a portaria"

---

### 2. Home / Dashboard

```
┌─────────────────────────────────┐
│ ☰  Green Park            🔔(3)  │
│ Unidade 302                     │
├─────────────────────────────────┤
│                                 │
│ 👋 Olá, Maria!                  │
│                                 │
│ ┌─────────────┬─────────────┐   │
│ │ 📦 ENTREGAS │ 👥 VISITAS  │   │
│ │     3       │     2       │   │
│ │  pendentes  │  hoje       │   │
│ └─────────────┴─────────────┘   │
│                                 │
│ 🔔 Atividades Recentes          │
│ ┌─────────────────────────────┐ │
│ │ 📦 Encomenda Amazon         │ │
│ │    Há 2 horas               │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 👤 João Silva entrou        │ │
│ │    Às 14:30                 │ │
│ └─────────────────────────────┘ │
│                                 │
│ ⚡ Ações Rápidas                │
│ [➕ Novo Visitante]             │
│ [🚗 Abrir Portão]               │
│ [💬 Falar com Portaria]         │
│                                 │
└─────────────────────────────────┘
│ [🏠] [👥] [📦] [🚗] [⚙️]        │
└─────────────────────────────────┘
```

**Componentes**:
- **Header**: Nome do condomínio, unidade, notificações
- **Saudação personalizada**
- **Cards de resumo**: Entregas pendentes, visitas hoje
- **Feed de atividades**: Últimos 5 eventos
- **Botões de ação rápida**: Tarefas mais comuns
- **Bottom Navigation**: 5 seções principais

---

### 3. Tela de Visitantes

```
┌─────────────────────────────────┐
│ ←  Visitantes                🔍 │
├─────────────────────────────────┤
│                                 │
│ [➕ Pré-Cadastrar Visitante]    │
│                                 │
│ 📅 Aguardando Autorização (1)   │
│ ┌─────────────────────────────┐ │
│ │ 👤 Carlos Mendes            │ │
│ │    Solicitado há 2 min      │ │
│ │ [✅ Autorizar] [❌ Negar]   │ │
│ └─────────────────────────────┘ │
│                                 │
│ 🟢 Dentro Agora (2)             │
│ ┌─────────────────────────────┐ │
│ │ 👤 João Silva               │ │
│ │    Entrou às 14:30          │ │
│ │    [Ver Detalhes]           │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 👤 Ana Paula                │ │
│ │    Entrou às 15:10          │ │
│ └─────────────────────────────┘ │
│                                 │
│ ⏰ Pré-Cadastrados (3)          │
│ ┌─────────────────────────────┐ │
│ │ 👤 Pedro Souza              │ │
│ │    Válido: Hoje até 18:00   │ │
│ │    [QR Code] [Cancelar]     │ │
│ └─────────────────────────────┘ │
│                                 │
│ 🔁 Recorrentes (2)              │
│ ┌─────────────────────────────┐ │
│ │ 👤 Diarista - Seg/Qua       │ │
│ │    Válido até 31/12         │ │
│ └─────────────────────────────┘ │
│                                 │
│ 📊 [Ver Histórico Completo]     │
│                                 │
└─────────────────────────────────┘
```

**Funcionalidades**:
- **Pré-cadastrar**: Formulário completo + upload de foto
- **Autorizar em tempo real**: Push com foto do visitante
- **Visualizar quem está dentro**: Lista atualizada ao vivo (WebSocket)
- **Gerenciar pré-cadastrados**: Ver QR Codes, cancelar autorizações
- **Visitantes recorrentes**: Cadastrar diarista, personal, etc.
- **Histórico**: Filtrar por data, nome, tipo

---

### 4. Tela de Correspondências

```
┌─────────────────────────────────┐
│ ←  Correspondências          🔍 │
├─────────────────────────────────┤
│                                 │
│ 📦 Pendentes de Retirada (3)    │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [📸]  📦 Pacote (M)          │ │
│ │       Amazon                │ │
│ │       Recebido: 05/12 14:30 │ │
│ │       [Ver Foto] [Autorizar]│ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [📸]  ✉️ Carta               │ │
│ │       Banco Itaú            │ │
│ │       Recebido: 06/12 10:15 │ │
│ │       [Ver Foto]            │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [📸]  📄 Documento ⚠️        │ │
│ │       Tribunal - URGENTE    │ │
│ │       Recebido: 07/12 09:00 │ │
│ │       [Ver Foto]            │ │
│ └─────────────────────────────┘ │
│                                 │
│ ✅ Já Retiradas (15)            │
│ ┌─────────────────────────────┐ │
│ │ 📦 Mercado Livre            │ │
│ │    Retirado: 04/12 18:45    │ │
│ └─────────────────────────────┘ │
│                                 │
│ [👤 Autorizar Terceiro]         │
│ [📊 Ver Histórico Completo]     │
│                                 │
└─────────────────────────────────┘
```

**Funcionalidades**:
- **Ver foto** da encomenda em alta resolução (galeria)
- **Autorizar terceiro** a retirar (nome, CPF, foto opcional)
- **Notificações push** quando correspondência chega
- **Filtrar**: Pendentes, retiradas, por tipo, por data
- **Código de rastreio**: Link para site da transportadora

---

### 5. Tela de Veículos

```
┌─────────────────────────────────┐
│ ←  Meus Veículos             ➕ │
├─────────────────────────────────┤
│                                 │
│ 🚗 Veículos Cadastrados (2)     │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [🚗]  ABC-1234              │ │
│ │       Onix Branco 2022      │ │
│ │       Vaga: 302-A           │ │
│ │       [Ver Histórico]       │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [🏍️]  XYZ-5678              │ │
│ │       CB 300 Preta 2020     │ │
│ │       [Ver Histórico]       │ │
│ └─────────────────────────────┘ │
│                                 │
│ 📍 Status Atual                 │
│ ┌─────────────────────────────┐ │
│ │ ABC-1234                    │ │
│ │ 🟢 Dentro do condomínio     │ │
│ │    Entrada: Hoje às 08:15   │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ XYZ-5678                    │ │
│ │ ⚪ Fora do condomínio       │ │
│ │    Última saída: Ontem 18:30│ │
│ └─────────────────────────────┘ │
│                                 │
│ [📊 Relatório de Acessos]       │
│ [➕ Cadastrar Veículo Temp.]    │
│                                 │
└─────────────────────────────────┘
```

**Funcionalidades**:
- **Cadastrar veículo**: Placa, marca, modelo, cor, fotos
- **Ver status em tempo real**: Dentro ou fora
- **Histórico de acessos**: Datas, horários, tempo de permanência
- **Veículos temporários**: Para aluguel, empréstimo (com validade)
- **Notificações**: Alerta quando veículo entra/sai

---

### 6. Tela de Comunicação com Portaria

```
┌─────────────────────────────────┐
│ ←  Chat - Portaria              │
├─────────────────────────────────┤
│                                 │
│         HOJE 15:30              │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Olá! Espero um visitante│    │
│  │ às 16h, João Silva      │    │
│  └─────────────────────────┘    │
│                      Você 15:30 │
│                                 │
│ ┌──────────────────────────┐    │
│ │ Ok, já anotei. Quando    │    │
│ │ ele chegar vou avisá-la! │    │
│ └──────────────────────────┘    │
│ Porteiro Carlos  15:31          │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Obrigada! 😊            │    │
│  └─────────────────────────┘    │
│                      Você 15:31 │
│                                 │
│ [📎] [📷] Digite uma mensagem... │
│                            [📤] │
└─────────────────────────────────┘
```

**Funcionalidades**:
- **Chat em tempo real** (WebSocket)
- **Envio de imagens**: Foto de visitante, documento, etc.
- **Histórico completo** de conversas
- **Status do porteiro**: Online, offline
- **Notificações**: Som/vibração quando porteiro responde
- **Respostas rápidas**: "Estou descendo", "Pode liberar", etc.

---

### 7. Tela de Configurações

```
┌─────────────────────────────────┐
│ ←  Configurações                │
├─────────────────────────────────┤
│                                 │
│ 👤 Perfil                       │
│ ┌─────────────────────────────┐ │
│ │ [👤] Maria Costa            │ │
│ │      Unidade 302            │ │
│ │      [Editar Perfil]        │ │
│ └─────────────────────────────┘ │
│                                 │
│ 🔔 Notificações                 │
│ ┌─────────────────────────────┐ │
│ │ Push Notifications    [ON]  │ │
│ │ E-mail                [ON]  │ │
│ │ WhatsApp              [OFF] │ │
│ │ Modo Silencioso 22h-7h[ON]  │ │
│ └─────────────────────────────┘ │
│                                 │
│ 🔐 Segurança                    │
│ ┌─────────────────────────────┐ │
│ │ Autenticação Biométrica[ON] │ │
│ │ MFA (2 Fatores)       [OFF] │ │
│ │ [Alterar Senha]             │ │
│ └─────────────────────────────┘ │
│                                 │
│ 🎨 Aparência                    │
│ ┌─────────────────────────────┐ │
│ │ Tema: [Escuro ▼]            │ │
│ │ Tamanho da fonte: [Normal]  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ℹ️ Sobre                        │
│ [Termos de Uso] [Privacidade]   │
│ [Ajuda] [Sair]                  │
│                                 │
└─────────────────────────────────┘
```

**Funcionalidades**:
- **Editar perfil**: Foto, telefone, e-mail
- **Gerenciar notificações**: Escolher canais, horários
- **Segurança**: Biometria, MFA, alterar senha
- **Preferências visuais**: Tema claro/escuro
- **Termos e privacidade**: LGPD compliance

---

## 🔔 Sistema de Notificações

### Tipos de Notificação

#### 1. Visitante Aguardando Autorização (Prioritária)
```
🔔 Visitante na portaria
João Silva aguarda autorização
[Foto do visitante]
[✅ Autorizar]  [❌ Negar]
```
**Características**:
- Som alto
- Vibração
- Ação direta nos botões
- Timeout: 2 minutos

#### 2. Visitante Entrou (Informativa)
```
🟢 João Silva entrou
Horário: 15:03 | Unidade: 302
```

#### 3. Correspondência Recebida
```
📦 Nova encomenda!
Amazon - Pacote Médio
Recebido às 14:30
[Ver Foto]
```

#### 4. Veículo Entrou/Saiu
```
🚗 Seu veículo ABC-1234 entrou
Horário: 08:15
```

---

## ⚡ Ações Rápidas (Widgets)

### iOS Widget
```
┌────────────────────┐
│ Green Park - 302   │
├────────────────────┤
│ 📦 Entregas: 3     │
│ 👥 Dentro: 2       │
│                    │
│ [➕ Novo Visitante]│
└────────────────────┘
```

### Android Widget
```
┌────────────────────────────┐
│ 🏢 Green Park              │
│ Unidade 302                │
├────────────────────────────┤
│ 📦 3 Entregas  👥 2 Visitas│
│                            │
│ [➕ Visitante] [🚗 Portão] │
└────────────────────────────┘
```

---

## 🎯 Jornadas do Usuário

### Jornada 1: Autorizar Visitante Rápido
1. Recebe notificação
2. Abre notificação (já mostra foto)
3. Toca em "✅ Autorizar"
4. Pronto! (**3 segundos**)

### Jornada 2: Pré-Cadastrar Visitante
1. Abre app → Home
2. Toca em "➕ Novo Visitante"
3. Preenche formulário (nome, CPF, data/hora)
4. Tira/faz upload de foto
5. Salva
6. QR Code gerado e enviado automaticamente
7. **Tempo total: 45-60 segundos**

### Jornada 3: Ver Correspondência
1. Recebe notificação "📦 Nova encomenda"
2. Toca na notificação
3. App abre direto na foto da encomenda
4. Pode ampliar (zoom)
5. Visualiza código de rastreio
6. **Tempo: 5 segundos**

---

## 🔐 Segurança no App

- ✅ **Biometria**: Face ID, Touch ID, Digital
- ✅ **Token JWT** com refresh automático
- ✅ **Timeout de sessão**: 15 minutos inativo
- ✅ **SSL Pinning**: Previne MITM attacks
- ✅ **Ofuscação de código**: Dificulta engenharia reversa
- ✅ **Logs sensíveis**: Não armazena senhas/tokens em logs

---

## 📊 Analytics e Métricas

**Eventos rastreados** (com consentimento):
- Telas mais acessadas
- Tempo médio por tela
- Taxa de conversão de autorizações
- Uso de funcionalidades
- Erros/crashes

**Ferramentas**:
- Firebase Analytics
- Sentry (monitoramento de erros)

---

**Versão**: 1.0.0  
**Última atualização**: Dezembro 2025
