# 🚀 Deploy no Railway - Portaria Inteligente

Sistema completo rodando na nuvem com PostgreSQL gerenciado.

---

## ✅ Backend (Já Configurado)

### URL
- **API:** https://portariadwm-production.up.railway.app
- **Docs:** https://portariadwm-production.up.railway.app/docs

### Variáveis de Ambiente Configuradas
```bash
ALLOWED_ORIGINS="*"
APP_NAME="Portaria Inteligente"
APP_VERSION="1.0.0"
DATABASE_URL="${{Postgres.DATABASE_URL}}"
DEBUG="False"
SECRET_KEY="portaria-secret-key-super-seguro-2024"
```

### PostgreSQL (Conectado)
- Database: `railway`
- User: `postgres`
- Porta: `5432`
- Gerenciado automaticamente pelo Railway

---

## ⏳ Frontend (A Configurar)

### 1. Criar Novo Serviço no Railway

1. No dashboard do Railway, clique em **"New"** → **"GitHub Repo"**
2. Selecione: `EduardoSouza-tech/Portaria_DWM`
3. Railway detectará 2 Dockerfiles (backend e frontend)

### 2. Configurar Serviço Frontend

- **Service Name:** `portaria-frontend`
- **Root Directory:** `frontend`
- **Dockerfile Path:** `frontend/Dockerfile`
- **Port:** `80` (nginx)

### 3. Variáveis de Ambiente do Frontend

```bash
VITE_API_URL=https://portariadwm-production.up.railway.app/api/v1
```

### 4. Gerar Domínio Público

1. Vá em **Settings** → **Networking**
2. Clique em **"Generate Domain"**
3. Railway gerará: `portaria-frontend-production.up.railway.app`

---

## 🎯 URLs Finais

| Serviço | URL | Status |
|---------|-----|--------|
| **Backend API** | https://portariadwm-production.up.railway.app | ✅ Online |
| **Documentação** | https://portariadwm-production.up.railway.app/docs | ✅ Online |
| **Health Check** | https://portariadwm-production.up.railway.app/health | ✅ Online |
| **Frontend** | https://[gerar-dominio].up.railway.app | ⏳ A configurar |

---

## 👤 Login Padrão

- **Email:** `admin@portaria.com`
- **Senha:** `admin123`

---

## 📊 Estrutura no Railway

```
Railway Project: Portaria Inteligente
│
├── 🔧 Backend (portariadwm-production)
│   ├── FastAPI + Uvicorn
│   ├── Dockerfile: backend/Dockerfile
│   ├── Porta: 8080
│   └── ✅ Online
│
├── 🗄️ PostgreSQL
│   ├── Database: railway
│   ├── User: postgres
│   ├── Porta: 5432
│   └── ✅ Conectado ao Backend
│
└── 🎨 Frontend (a criar)
    ├── React + Vite + Nginx
    ├── Dockerfile: frontend/Dockerfile
    ├── Porta: 80
    └── ⏳ Pendente
```

---

## 🔄 Deploy Automático

Toda vez que você fizer `git push`:
1. Railway detecta alterações
2. Faz rebuild da imagem Docker
3. Deploy automático em ~2 minutos
4. Zero downtime

---

## 🐛 Troubleshooting

### Backend: EOFError no init_db.py
✅ **Resolvido** - Removido `input()` interativo

### Backend: Foreign Key Violation
✅ **Resolvido** - Validação de `unidade_id` antes de criar visita

### Backend: Null Constraint em total_unidades
✅ **Resolvido** - Adicionado `default=0`

### Frontend: CORS Error
✅ **Já configurado** - Backend aceita todas as origens (`ALLOWED_ORIGINS="*"`)

### Frontend: Não conecta ao Backend
- Verifique se `VITE_API_URL` está configurada
- Teste a API: https://portariadwm-production.up.railway.app/docs

---

## 📝 Comandos Git

```bash
# Adicionar alterações
git add .

# Fazer commit
git commit -m "feat: Nova funcionalidade"

# Enviar para GitHub (deploy automático)
git push

# Ver status
git status
```

---

## 📚 Próximos Passos

- [ ] Criar serviço frontend no Railway
- [ ] Configurar `VITE_API_URL`
- [ ] Gerar domínio público
- [ ] Testar login no sistema
- [ ] Cadastrar primeiro condomínio
- [ ] Sistema 100% na nuvem! 🎉

1. ✅ Deploy do Backend no Railway
2. 🔜 Deploy do Frontend (Vercel/Netlify)
3. 🔜 Configurar domínio personalizado
4. 🔜 Configurar CI/CD
5. 🔜 Adicionar monitoramento avançado

## 💡 Dicas

- Use PostgreSQL para produção (melhor performance)
- Configure backups automáticos do banco
- Monitore os custos no painel Railway
- Configure alertas para erros críticos
- Use variáveis de ambiente para tudo sensível

---

**Desenvolvido por Eduardo Souza**
Sistema de Portaria Inteligente DWM
