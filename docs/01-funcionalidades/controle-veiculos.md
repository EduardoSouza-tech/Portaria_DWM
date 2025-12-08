# 🚗 Controle de Veículos

## Visão Geral

Módulo completo para gestão de veículos de moradores e visitantes, incluindo cadastro, controle de entrada/saída, gestão de vagas e integração com OCR de placas.

---

## 📋 Funcionalidades Detalhadas

### 1. Cadastro de Veículos de Moradores

#### Dados do Veículo
**Informações Obrigatórias**:
- **Placa**: Formato Mercosul (ABC1D23) ou antigo (ABC-1234)
- **Tipo**: Carro, Moto, Bicicleta, Van, Caminhonete, Outros
- **Unidade associada**

**Informações Complementares**:
- **Marca**: Chevrolet, Fiat, Ford, Honda, Toyota, etc.
- **Modelo**: Onix, Civic, Corolla, etc.
- **Cor**: Branco, Preto, Prata, Vermelho, etc.
- **Ano**: 2020, 2021, etc.
- **Foto frontal** do veículo
- **Foto lateral**
- **Foto da placa** (zoom)
- **Número do RENAVAM** (opcional)

#### Validação de Placa
Sistema valida:
- ✅ Formato Mercosul: ABC1D23
- ✅ Formato antigo: ABC-1234
- ✅ Caracteres válidos
- ✅ Placa única (não duplicada no sistema)

#### Múltiplos Veículos por Unidade
- Unidade pode ter **vários veículos** cadastrados
- Limite configurável (ex: até 3 veículos por vaga)
- Identificação de:
  - **Proprietário**: Dono registrado
  - **Usuário habitual**: Quem usa normalmente
  - **Usuário eventual**: Familiar, visitante recorrente

#### Veículos Temporários
- Morador pode cadastrar **veículo temporário**:
  - Carro alugado
  - Veículo emprestado
  - Veículo de hóspede
- Validade configurável (ex: 7 dias, 30 dias)
- Sistema desativa automaticamente após expiração

---

### 2. Cadastro de Placas

#### Interface de Cadastro
**Fluxo rápido**:
1. Informar placa
2. Validação automática do formato
3. Busca em base de dados (se já existe)
4. Preencher marca/modelo/cor
5. Capturar foto (opcional mas recomendado)
6. Associar à unidade
7. Salvar

#### Importação em Massa
Administração pode:
- Importar planilha CSV/Excel com:
  - Placa, Unidade, Marca, Modelo, Cor
- Sistema valida todas as linhas
- Importa em lote
- Gera relatório de sucesso/erro

#### Busca de Veículos
Sistema oferece busca:
- Por **placa** (parcial ou completa)
- Por **unidade**
- Por **marca/modelo**
- Por **cor**
- Por **tipo** (todos os carros, todas as motos, etc.)

---

### 3. Registro de Entrada/Saída

#### Detecção Automática (com OCR)
Se condomínio possui **câmera OCR**:
1. Veículo se aproxima da cancela
2. Câmera captura imagem da placa
3. OCR lê placa automaticamente
4. Sistema busca no cadastro
5. Se encontrado: Cancela abre automaticamente
6. Registra entrada com timestamp
7. Se não encontrado: Alerta porteiro

#### Registro Manual
Se não possui OCR:
1. Porteiro visualiza veículo
2. Anota placa (ou busca por modelo/cor)
3. Sistema busca cadastro
4. Confirma unidade
5. Registra entrada manual
6. Abre cancela (se integrado)

#### Dados do Registro
Cada entrada/saída registra:
- **Placa**
- **Data/hora** precisa
- **Tipo**: Entrada ou Saída
- **Método**: OCR automático, Manual, QR Code (morador)
- **Porteiro** responsável (se manual)
- **Portão/Cancela** utilizado
- **Foto** do veículo no momento (se câmera disponível)
- **Ocupantes** (se visível/informado)

---

### 4. Gestão de Vagas

#### Cadastro de Vagas
Sistema mantém registro de:
- **Número total de vagas** do condomínio
- **Vagas fixas** (por unidade)
- **Vagas rotativas** (visitantes)
- **Vagas especiais**:
  - PcD (Pessoa com Deficiência)
  - Idoso
  - Motos
  - Bicicletas
  - Carga/Descarga

#### Vaga Fixa
- Cada unidade pode ter **vaga(s) fixa(s)**
- Numeração identificada (ex: Vaga 302-A, 302-B)
- Associação de veículos à vaga
- Alerta se **veículo estranho** ocupar vaga fixa

#### Controle de Ocupação
Sistema monitora:
- **Vagas ocupadas** vs. **Vagas livres**
- **Taxa de ocupação** (%)
- **Vagas de visitantes disponíveis**
- **Tempo de permanência** em cada vaga

#### Painel de Vagas
Dashboard mostra:
```
┌──────────────────────────────────────────┐
│ 🅿️ GARAGEM - OCUPAÇÃO                    │
├──────────────────────────────────────────┤
│ Total de vagas: 120                      │
│ Ocupadas: 87 (72%)                       │
│ Livres: 33                               │
├──────────────────────────────────────────┤
│ Vagas Visitantes: 10                     │
│ Ocupadas: 7                              │
│ Livres: 3 🟢                             │
└──────────────────────────────────────────┘
```

---

### 5. Controle de Visitantes Motorizados

#### Fluxo de Visitante com Veículo
1. Visitante chega de carro
2. Porteiro registra visitante (processo normal)
3. Durante registro, pergunta: "Veio de carro?"
4. Se sim: Campo adicional para **placa**
5. Tira foto do veículo (frontal)
6. Informa marca/modelo/cor
7. Sistema associa veículo ao registro de visita
8. Morador autoriza (vê foto do veículo também)
9. Visitante estaciona em vaga rotativa

#### Controle de Permanência
- Sistema sabe que visitante está **com veículo**
- Monitora tempo de permanência do veículo
- Alerta se:
  - Veículo permanece após visitante sair
  - Veículo sai sem registro de saída do visitante
  - Tempo excessivo (ex: mais de 4 horas)

#### Vagas para Visitantes
- Sistema gerencia **pool de vagas** para visitantes
- Pode sugerir vaga livre
- Alerta quando vagas de visitantes lotam
- Relatório de uso de vagas por visitantes

---

### 6. Histórico de Entradas/Saídas por Veículo

#### Visualização Completa
Para cada veículo, sistema exibe:
```
┌────────────────────────────────────────────────┐
│ 🚗 PLACA: ABC-1234 (Onix Branco - Unidade 302) │
├────────────────────────────────────────────────┤
│ DATA       │ ENTRADA │ SAÍDA   │ PERMANÊNCIA  │
├────────────┼─────────┼─────────┼──────────────┤
│ 07/12/2025 │ 18:30   │ --:--   │ DENTRO AGORA │
│ 06/12/2025 │ 19:15   │ 23:45   │ 4h30min      │
│ 05/12/2025 │ 07:45   │ 18:10   │ 10h25min     │
│ 04/12/2025 │ 08:00   │ 19:30   │ 11h30min     │
└────────────┴─────────┴─────────┴──────────────┘
```

#### Filtros e Relatórios
- **Por período**: Últimos 7 dias, 30 dias, ano
- **Por unidade**: Todos os veículos de uma unidade
- **Por tipo**: Apenas carros, apenas motos
- **Exportação**: CSV, PDF, Excel

#### Estatísticas
- **Tempo médio de permanência**
- **Horário de entrada mais comum**
- **Horário de saída mais comum**
- **Dias da semana** com mais movimento
- **Veículos que mais entram/saem** (frequência)

---

### 7. OCR de Placas (Módulo Opcional)

#### Como Funciona
1. **Câmera IP** posicionada na entrada/saída
2. Veículo se aproxima
3. Sistema captura imagem em **alta resolução**
4. **Algoritmo OCR** extrai texto da placa
5. Validação do formato
6. Busca no banco de dados
7. Ação automática (abre cancela, alerta, etc.)

#### Tecnologias
- **OpenALPR** (biblioteca open-source)
- **Tesseract OCR** (customizado para placas)
- **IA/Deep Learning** (modelos treinados)
- APIs comerciais: **Sighthound**, **PlateRecognizer**

#### Precisão
- Taxa de acerto: **95-98%** em boas condições
- Fatores que afetam:
  - Iluminação (noite, chuva)
  - Placa suja/danificada
  - Velocidade do veículo
  - Ângulo da câmera

#### Fallback Manual
Se OCR falhar ou tiver baixa confiança:
- Sistema alerta porteiro
- Exibe imagem capturada
- Porteiro confirma/corrige placa manualmente

#### Integração com Cancela
- Placa reconhecida → **Abre automaticamente**
- Placa desconhecida → **Alerta porteiro**
- Blacklist → **Bloqueia e notifica segurança**

---

### 8. Alertas e Notificações

#### Tipos de Alerta

**Veículo Não Cadastrado**:
- OCR detecta placa não registrada
- Porteiro é alertado
- Pode ser:
  - Visitante (registrar)
  - Veículo novo de morador (cadastrar)
  - Erro do OCR (corrigir)

**Veículo em Vaga Errada**:
- Câmera de vaga detecta placa
- Sistema verifica se é a vaga correta
- Se não: Alerta porteiro e síndico

**Permanência Excessiva**:
- Veículo de visitante há mais de X horas
- Sistema alerta porteiro
- Porteiro pode notificar morador

**Veículo Bloqueado (Lista Negra)**:
- Placa está em blacklist
- Sistema bloqueia cancela
- Alerta imediato para segurança

**Veículo Suspeito**:
- Múltiplas entradas/saídas no mesmo dia
- Veículo ronda sem entrar
- Sistema sinaliza para atenção

---

### 9. Integração com Detran (Opcional)

#### Consulta de Veículos
Via API do Detran (se disponível):
- Validar placa
- Obter marca/modelo/cor oficiais
- Verificar se veículo é roubado
- Confirmar proprietário

#### Benefícios
- ✅ **Validação automática** de dados
- ✅ **Preenchimento automático** no cadastro
- ✅ **Segurança adicional** (detectar veículos roubados)

#### Privacidade
- Consulta apenas com **consentimento** do morador
- Dados não armazenados permanentemente
- Compliance LGPD

---

### 10. Relatórios Veiculares

#### Relatório de Movimentação
- Total de entradas/saídas por período
- Horários de pico
- Veículos mais frequentes
- Taxa de ocupação da garagem

#### Relatório por Unidade
- Veículos cadastrados
- Frequência de uso
- Tempo médio de permanência
- Histórico completo

#### Relatório de Visitantes
- Veículos de visitantes
- Tempo médio de permanência
- Vagas rotativas mais usadas

#### Relatório de Infrações
- Veículos em vagas erradas
- Permanência excessiva
- Bloqueios/alertas

---

## 🔧 Regras de Negócio

### RN-500: Placa Única
- Cada placa só pode estar **cadastrada uma vez** por condomínio
- Pode estar associada a **múltiplas unidades** (veículo compartilhado)

### RN-501: Limite de Veículos
- Número máximo de veículos por unidade **configurável**
- Padrão: 2 veículos por vaga

### RN-502: Validação de Placa
- Sistema aceita formatos: Mercosul e antigo
- Validação automática ao cadastrar

### RN-503: Veículo Temporário
- Expira automaticamente após período
- Morador pode renovar

### RN-504: OCR com Fallback
- Se OCR falhar 3 vezes na mesma placa: Sugerir recadastramento com foto melhor

### RN-505: Vaga Fixa
- Veículo em vaga errada: Alerta mas não bloqueia
- Configurável por condomínio

### RN-506: Histórico Imutável
- Registros de entrada/saída **não podem ser excluídos**
- Apenas desativação lógica

### RN-507: Foto Opcional
- Cadastro de veículo **não exige foto**
- Mas é altamente recomendada

---

## 💾 Campos do Banco de Dados

### Tabela: veiculos
```sql
id, uuid, placa, placa_normalizada (sem hífen/espaços),
tipo (carro/moto/bicicleta/van/caminhonete/outro),
marca, modelo, cor, ano,
foto_frontal_url, foto_lateral_url, foto_placa_url,
renavam, chassi,
status (ativo/inativo/temporario/bloqueado),
data_cadastro, cadastrado_por
```

### Tabela: veiculo_unidade
```sql
id, veiculo_id, unidade_id,
tipo_vinculo (proprietario/usuario_habitual/usuario_eventual/temporario),
data_inicio, data_termino (para temporários),
vaga_fixa_numero, vaga_fixa_andar,
status, data_cadastro
```

### Tabela: acessos_veiculares
```sql
id, uuid, veiculo_id, unidade_id,
tipo_acesso (entrada/saída),
data_hora, metodo (ocr/manual/qr_code),
porteiro_id, portao_cancela,
foto_veiculo_url, placa_detectada_ocr,
confianca_ocr (0-100), corrigido_manualmente (boolean),
ocupantes_quantidade, observacoes,
tempo_permanencia (calculado na saída),
data_cadastro
```

### Tabela: vagas
```sql
id, numero, andar, bloco (se houver),
tipo (fixa/rotativa/pcd/idoso/moto/bicicleta/carga),
unidade_id (se fixa), status (livre/ocupada/reservada),
veiculo_atual_id, data_hora_ocupacao,
data_cadastro
```

### Tabela: veiculos_blacklist
```sql
id, uuid, placa, motivo,
data_bloqueio, bloqueado_por, observacoes,
status (ativo/revogado), data_revogacao
```

---

## 🎯 Casos de Uso

### UC-500: Cadastrar Veículo de Morador
**Ator**: Administrador, Síndico, Morador (se permitido)  
**Fluxo**:
1. Acessar módulo "Veículos"
2. Clicar em "Novo Veículo"
3. Informar placa: ABC-1234
4. Sistema valida formato
5. Preencher marca: Chevrolet
6. Modelo: Onix
7. Cor: Branco
8. Ano: 2022
9. Capturar foto frontal (câmera)
10. Associar à unidade: 302
11. Tipo de vínculo: Proprietário
12. Vaga fixa: 302-A
13. Salvar
14. Sistema gera QR Code do veículo (opcional)

### UC-501: Entrada Automática com OCR
**Ator**: Sistema, Morador  
**Fluxo**:
1. Morador se aproxima da cancela com carro
2. Câmera OCR captura placa: ABC-1234
3. Sistema faz OCR: Detecta "ABC1234"
4. Normaliza para "ABC-1234"
5. Busca no banco de dados
6. Encontra: Unidade 302, Onix Branco
7. Valida: Veículo ativo, não bloqueado
8. Sistema abre cancela automaticamente
9. Registra entrada com timestamp
10. Morador entra sem parar

### UC-502: Visitante com Veículo
**Ator**: Porteiro, Visitante, Morador  
**Fluxo**:
1. Visitante chega de carro na portaria
2. Porteiro inicia registro de visitante
3. Durante registro, marca: "Veio de veículo"
4. Informa placa: XYZ-9876
5. Tira foto do carro
6. Informa modelo: Civic Prata
7. Sistema busca vaga rotativa livre
8. Sugere: Vaga V-05
9. Morador autoriza visitante (vê foto do veículo também)
10. Porteiro informa: "Estacione na V-05"
11. Registra entrada
12. Sistema monitora tempo de permanência

### UC-503: Alerta de Placa Não Cadastrada
**Ator**: Sistema, Porteiro  
**Fluxo**:
1. Câmera OCR detecta placa: DEF-5678
2. Sistema busca no banco
3. Não encontra cadastro
4. Alerta sonoro na portaria
5. Porteiro visualiza:
   - Foto do veículo
   - Placa detectada: DEF-5678
   - Status: NÃO CADASTRADO
6. Porteiro vai até o veículo
7. Verifica: É visitante
8. Registra visitante com veículo
9. Ou: É veículo novo de morador → Cadastra no sistema

---

## 📊 Métricas e KPIs

- **Total de veículos cadastrados**
- **Média de veículos por unidade**
- **Taxa de ocupação da garagem** (%)
- **Acessos veiculares por dia**
- **Horário de pico** de entrada/saída
- **Tempo médio de permanência**
- **Taxa de acerto do OCR** (%)
- **Veículos de visitantes** vs. **Moradores**
- **Uso de vagas rotativas** (%)

---

## 🔐 Segurança

- ✅ **Lista negra** de veículos bloqueados
- ✅ **OCR com validação** manual se necessário
- ✅ **Logs imutáveis** de todos os acessos
- ✅ **Fotos** para rastreabilidade
- ✅ **Alertas automáticos** para anomalias
- ✅ **Integração opcional** com Detran
- ✅ **Backup automático** de registros

---

## 🚀 Melhorias Futuras

- [ ] Reconhecimento de modelo/cor por IA
- [ ] Detecção de veículos estacionados irregularmente (câmeras de vaga)
- [ ] App para morador ver se seu carro está na garagem
- [ ] Reserva de vaga rotativa via app
- [ ] Integração com sistemas de carregamento (carros elétricos)
- [ ] Histórico de manutenções do veículo
- [ ] Alerta de revisão (integrado com calendário do morador)
- [ ] Compartilhamento de vaga entre unidades
