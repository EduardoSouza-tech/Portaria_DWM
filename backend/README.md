# 🚀 Backend Python FastAPI - Portaria Inteligente

API REST desenvolvida em Python com FastAPI para o sistema de Portaria Inteligente.

## 📋 Pré-requisitos

- Python 3.11+
- PostgreSQL 15+
- Redis 7+ (opcional, para cache e WebSocket)

## 🛠️ Instalação

### 1. Criar ambiente virtual

```powershell
python -m venv venv
.\venv\Scripts\Activate
```

### 2. Instalar dependências

```powershell
pip install -r requirements.txt
```

### 3. Configurar variáveis de ambiente

```powershell
cp .env.example .env
```

Edite o `.env` com suas configurações:
- `DATABASE_URL`: Connection string do PostgreSQL
- `SECRET_KEY`: Chave secreta para JWT (32+ caracteres)
- `QR_SECRET_KEY`: Chave para assinar QR Codes

### 4. Criar banco de dados

```powershell
# No PostgreSQL
createdb portaria_db
createuser portaria_user

# Ou executar SQL:
# CREATE DATABASE portaria_db;
# CREATE USER portaria_user WITH PASSWORD 'portaria_pass';
# GRANT ALL PRIVILEGES ON DATABASE portaria_db TO portaria_user;
```

### 5. Criar tabelas

```powershell
python
>>> from app.core.database import engine, Base
>>> Base.metadata.create_all(bind=engine)
>>> exit()
```

Ou execute o schema SQL completo em `/docs/03-banco-dados/database-schema.sql`

## 🚀 Executar

```powershell
# Desenvolvimento com hot-reload
python main.py

# Ou com uvicorn
uvicorn main:app --reload --port 8000
```

Acesse:
- API: http://localhost:8000
- Documentação Swagger: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 📚 Endpoints Principais

### Autenticação
- `POST /api/v1/auth/register` - Registrar usuário
- `POST /api/v1/auth/login` - Login (retorna JWT)
- `GET /api/v1/auth/me` - Usuário atual

### Moradores
- `GET /api/v1/moradores` - Listar moradores
- `POST /api/v1/moradores` - Criar morador
- `GET /api/v1/moradores/{id}` - Buscar morador
- `PUT /api/v1/moradores/{id}` - Atualizar morador
- `DELETE /api/v1/moradores/{id}` - Desativar morador

### Visitantes
- `GET /api/v1/visitantes` - Listar visitantes
- `POST /api/v1/visitantes` - Criar visitante
- `GET /api/v1/visitantes/{id}` - Buscar visitante
- `GET /api/v1/visitantes/documento/{doc}` - Buscar por documento

### Visitas (com QR Code)
- `GET /api/v1/visitas` - Listar visitas
- `POST /api/v1/visitas` - Pré-cadastrar visita (gera QR Code)
- `GET /api/v1/visitas/{id}/qrcode` - Gerar imagem QR Code
- `POST /api/v1/visitas/validate-qr` - Validar QR Code e registrar entrada
- `POST /api/v1/visitas/{id}/saida` - Registrar saída
- `GET /api/v1/visitas/dentro/agora` - Ver quem está dentro

## 🔐 Autenticação

Todas as rotas (exceto login/register) requerem JWT Bearer Token:

```bash
# 1. Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=usuario@email.com&password=senha123"

# Resposta:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "...",
  "token_type": "bearer"
}

# 2. Usar token nas requisições
curl http://localhost:8000/api/v1/moradores \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 🔒 Sistema de QR Code Antifraude

O sistema gera QR Codes com assinatura digital SHA-256:

```json
{
  "visitor_id": "uuid-do-visitante",
  "unit_id": "uuid-da-unidade",
  "valid_until": "2025-12-08T23:59:59Z",
  "nonce": "token-unico-aleatorio",
  "signature": "sha256-hash-criptografico"
}
```

**Segurança**:
- ✅ Assinatura com chave secreta
- ✅ Nonce único (previne replicação)
- ✅ Validade temporal
- ✅ Uso único para entrada
- ✅ Impossível falsificar sem a chave

## 📊 Estrutura do Projeto

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── __init__.py
│   │       └── endpoints/
│   │           ├── auth.py
│   │           ├── moradores.py
│   │           ├── visitantes.py
│   │           └── visitas.py
│   ├── core/
│   │   ├── config.py        # Configurações
│   │   ├── database.py      # SQLAlchemy setup
│   │   └── security.py      # JWT, QR Code, senha
│   ├── models/
│   │   ├── user.py
│   │   ├── morador.py
│   │   ├── visitante.py
│   │   └── visita.py
│   └── __init__.py
├── main.py                  # Entry point
├── requirements.txt
├── .env.example
└── README.md
```

## 🧪 Testes

```powershell
# Instalar pytest
pip install pytest pytest-asyncio httpx

# Executar testes
pytest

# Com cobertura
pytest --cov=app --cov-report=html
```

## 🐳 Docker (Opcional)

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```powershell
docker build -t portaria-backend .
docker run -p 8000:8000 portaria-backend
```

## 📝 Logs

Logs são exibidos no console em formato estruturado:

```
2025-12-07 10:30:45 - uvicorn.access - INFO - POST /api/v1/auth/login HTTP/1.1 200
2025-12-07 10:30:50 - app.api.v1.endpoints.visitas - INFO - QR Code gerado para visita abc123
```

## 🔄 Próximos Passos

- [ ] WebSocket para notificações real-time
- [ ] Upload de fotos (S3/MinIO)
- [ ] Reconhecimento facial (OpenCV)
- [ ] OCR de placas de veículos
- [ ] Testes unitários e integração
- [ ] Alembic para migrações do banco
- [ ] Rate limiting com Redis
- [ ] Monitoramento com Prometheus

## 📞 Suporte

- Documentação completa em `/docs`
- Issues: GitHub Issues
- E-mail: dev@portariainteligente.com.br
