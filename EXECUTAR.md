# 🚀 Guia Rápido - Como Executar o Sistema

## ✅ Pré-requisitos Instalados

Você precisa ter instalado:
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+

---

## 📦 Passo 1: Configurar Backend (Python)

### 1.1. Criar ambiente virtual e instalar dependências

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate
pip install -r requirements.txt
```

### 1.2. Configurar banco de dados PostgreSQL

```powershell
# Abrir psql ou usar pgAdmin
# Executar os comandos:
```

```sql
CREATE DATABASE portaria_db;
CREATE USER portaria_user WITH PASSWORD 'portaria_pass';
GRANT ALL PRIVILEGES ON DATABASE portaria_db TO portaria_user;
```

### 1.3. Copiar variáveis de ambiente

```powershell
cp .env.example .env
```

**Edite o `.env` se necessário** (banco de dados, chaves secretas)

### 1.4. Criar tabelas no banco

```powershell
python
```

```python
>>> from app.core.database import engine, Base
>>> Base.metadata.create_all(bind=engine)
>>> exit()
```

### 1.5. Criar usuário inicial (admin)

```powershell
python
```

```python
>>> from app.core.database import SessionLocal
>>> from app.models.user import User
>>> from app.core.security import get_password_hash
>>> 
>>> db = SessionLocal()
>>> admin = User(
...     email="admin@portaria.com",
...     password_hash=get_password_hash("admin123"),
...     nome="Administrador",
...     role="admin"
... )
>>> db.add(admin)
>>> db.commit()
>>> exit()
```

### 1.6. Executar backend

```powershell
python main.py
```

✅ **Backend rodando em: http://localhost:8000**  
📚 **Documentação API: http://localhost:8000/docs**

---

## 🌐 Passo 2: Configurar Frontend (React)

### 2.1. Instalar dependências (já feito)

```powershell
cd ..\frontend
npm install
```

### 2.2. Executar frontend

```powershell
npm run dev
```

✅ **Frontend rodando em: http://localhost:5173**

---

## 🎉 Passo 3: Testar o Sistema

### 3.1. Acessar o sistema

Abra o navegador em: **http://localhost:5173**

### 3.2. Fazer login

- **E-mail:** `admin@portaria.com`
- **Senha:** `admin123`

### 3.3. Testar funcionalidades

1. **Dashboard** - Ver resumo do sistema
2. **Painel Portaria** - Dashboard em tempo real para porteiros
3. **Moradores** - Gerenciar moradores
4. **Visitantes** - Cadastrar visitantes
5. **Visitas** - Gerar QR Codes antifraude

---

## 🔧 Estrutura de Pastas

```
Portaria/
├── backend/              # Python FastAPI
│   ├── app/
│   │   ├── api/         # Rotas REST
│   │   ├── core/        # Config, database, security
│   │   └── models/      # SQLAlchemy models
│   ├── main.py          # Entry point
│   ├── requirements.txt
│   └── README.md
│
├── frontend/            # React + TypeScript
│   ├── src/
│   │   ├── api/        # Axios client
│   │   ├── pages/      # Páginas (Login, Dashboard, etc)
│   │   └── App.tsx
│   ├── package.json
│   └── .env
│
└── docs/               # Documentação completa
```

---

## 🔐 Endpoints Principais da API

### Autenticação
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Registrar usuário
- `GET /api/v1/auth/me` - Usuário atual

### Moradores
- `GET /api/v1/moradores` - Listar
- `POST /api/v1/moradores` - Criar
- `GET /api/v1/moradores/{id}` - Buscar
- `PUT /api/v1/moradores/{id}` - Atualizar
- `DELETE /api/v1/moradores/{id}` - Desativar

### Visitantes
- `GET /api/v1/visitantes` - Listar
- `POST /api/v1/visitantes` - Criar
- `GET /api/v1/visitantes/documento/{doc}` - Buscar por documento

### Visitas (QR Code)
- `GET /api/v1/visitas` - Listar visitas
- `POST /api/v1/visitas` - Pré-cadastrar (gera QR Code)
- `GET /api/v1/visitas/{id}/qrcode` - Gerar imagem QR
- `POST /api/v1/visitas/validate-qr` - Validar QR e registrar entrada
- `POST /api/v1/visitas/{id}/saida` - Registrar saída
- `GET /api/v1/visitas/dentro/agora` - Visitantes dentro agora

---

## 🧪 Testar API com cURL/Postman

### 1. Login

```powershell
curl -X POST http://localhost:8000/api/v1/auth/login `
  -H "Content-Type: application/x-www-form-urlencoded" `
  -d "username=admin@portaria.com&password=admin123"
```

Resposta:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "...",
  "token_type": "bearer"
}
```

### 2. Listar moradores (com token)

```powershell
curl http://localhost:8000/api/v1/moradores `
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 🐛 Troubleshooting

### Backend não inicia
- ✅ Verificar se PostgreSQL está rodando
- ✅ Verificar credenciais no `.env`
- ✅ Verificar se porta 8000 está livre

### Frontend não conecta com backend
- ✅ Backend deve estar rodando em `http://localhost:8000`
- ✅ Verificar arquivo `frontend/.env` (VITE_API_URL)
- ✅ Verificar CORS no backend (permitir localhost:5173)

### Erro de autenticação
- ✅ Criar usuário admin conforme passo 1.5
- ✅ Verificar se token JWT está sendo gerado
- ✅ Limpar localStorage no navegador

---

## 🚀 Próximos Passos

- [ ] Implementar upload de fotos
- [ ] Adicionar WebSocket para notificações real-time
- [ ] Implementar módulo de correspondências
- [ ] Adicionar controle de veículos com OCR
- [ ] Criar testes automatizados
- [ ] Deploy em produção (Docker + AWS)

---

## 📞 Suporte

- Documentação completa em `/docs`
- README Backend: `/backend/README.md`
- API Docs: http://localhost:8000/docs (quando rodando)

**Sistema criado com ❤️ para transformar a gestão de portaria em condomínios!**
