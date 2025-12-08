# 🚀 Como Executar a Portaria Inteligente

## 📋 Pré-requisitos

- ✅ Python 3.12+ instalado
- ✅ Node.js 18+ instalado
- ✅ Ambiente virtual Python (.venv) configurado
- ✅ Dependências instaladas (backend e frontend)

## 🎯 Início Rápido

### Opção 1: Usando arquivos .bat (Windows) - RECOMENDADO

1. **Iniciar o sistema completo:**
   ```
   Duplo clique em: INICIAR_SERVIDOR.bat
   ```
   - Abre 2 janelas: Backend (porta 8000) e Frontend (porta 5173)
   - Acesse: http://localhost:5173

2. **Parar os servidores:**
   ```
   Duplo clique em: PARAR_SERVIDOR.bat
   ```

3. **Reiniciar o banco de dados:**
   ```
   Duplo clique em: REINICIAR_BANCO.bat
   ```
   - Apaga e recria o banco SQLite com dados de exemplo

### Opção 2: Manual

#### Backend (Terminal 1)
```bash
cd backend
..\\.venv\\Scripts\\activate
python main.py
```

#### Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

## 🔐 Credenciais de Teste

- **Email:** admin@portaria.com
- **Senha:** admin123

## 🌐 URLs do Sistema

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **Documentação API (Swagger):** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## 📊 Estrutura do Banco de Dados

O sistema usa **SQLite** para desenvolvimento local (sem necessidade de instalar PostgreSQL).

**Arquivo:** `backend/portaria.db`

### Dados de Exemplo (após init_db.py):
- 1 usuário administrador
- 1 condomínio
- 5 unidades
- 2 moradores
- Tabelas: usuarios, condominios, unidades, moradores, visitantes, visitas

## 🛠️ Solução de Problemas

### Erro: "Python não encontrado"
```bash
# Verifique se o Python está instalado
python --version

# Se não estiver, instale do site oficial
# https://www.python.org/downloads/
```

### Erro: "Ambiente virtual não encontrado"
```bash
# Recrie o ambiente virtual
python -m venv .venv
.venv\\Scripts\\activate
cd backend
pip install -r requirements.txt
```

### Erro: "npm não encontrado"
```bash
# Instale o Node.js do site oficial
# https://nodejs.org/

# Depois instale as dependências
cd frontend
npm install
```

### Erro CORS / Problema de conexão
1. Verifique se o backend está rodando na porta 8000
2. Verifique se o frontend está rodando na porta 5173
3. Reinicie ambos os servidores usando `PARAR_SERVIDOR.bat` e depois `INICIAR_SERVIDOR.bat`

### Banco de dados corrompido
```bash
# Execute:
REINICIAR_BANCO.bat
```

## 📝 Comandos Úteis

### Backend
```bash
# Rodar servidor de desenvolvimento
python main.py

# Reinicializar banco
python init_db.py

# Verificar logs
# Os logs aparecem no terminal do backend
```

### Frontend
```bash
# Rodar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 🎨 Páginas Disponíveis

1. **/login** - Autenticação
2. **/dashboard** - Dashboard principal com métricas
3. **/moradores** - Cadastro e gestão de moradores
4. **/visitantes** - Cadastro rápido de visitantes
5. **/visitas** - Geração de QR Codes e controle de visitas
6. **/portaria** - Dashboard em tempo real da portaria

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs no terminal do backend
2. Verifique o console do navegador (F12)
3. Reinicie os servidores
4. Reinicie o banco de dados
