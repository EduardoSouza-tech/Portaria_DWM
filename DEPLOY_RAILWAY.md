# Deploy no Railway - Sistema de Portaria DWM

Este guia explica como fazer o deploy do Sistema de Portaria Inteligente no Railway.

## 📋 Pré-requisitos

1. Conta no [Railway](https://railway.app/)
2. Repositório Git conectado
3. Código enviado para o GitHub

## 🚀 Passos para Deploy

### 1. Criar Novo Projeto no Railway

1. Acesse [railway.app](https://railway.app/)
2. Faça login com sua conta GitHub
3. Clique em "New Project"
4. Selecione "Deploy from GitHub repo"
5. Escolha o repositório: `EduardoSouza-tech/Portaria_DWM`

### 2. Configurar Variáveis de Ambiente

No painel do Railway, vá em **Variables** e adicione:

```env
# Aplicação
DEBUG=False
ENVIRONMENT=production
PORT=8000

# Segurança (IMPORTANTE: Gere novas chaves para produção!)
SECRET_KEY=sua-chave-secreta-muito-segura-min-64-caracteres-aqui
QR_SECRET_KEY=outra-chave-para-qr-codes-min-64-caracteres-segura

# CORS - Adicione seu domínio do Railway
ALLOWED_ORIGINS=https://seu-app.railway.app,http://localhost:5173

# Database (Railway fornece automaticamente se adicionar PostgreSQL)
DATABASE_URL=sqlite:///./portaria.db

# Redis (opcional - adicione serviço Redis no Railway)
REDIS_URL=redis://localhost:6379/0
```

### 3. Deploy Automático

O Railway detectará automaticamente:
- `Procfile` - Define como executar a aplicação
- `railway.json` - Configurações de build e deploy
- `nixpacks.toml` - Configuração de ambiente Python
- `backend/requirements.txt` - Dependências Python

O deploy iniciará automaticamente após o push para o repositório.

### 4. Adicionar PostgreSQL (Recomendado para Produção)

1. No projeto Railway, clique em "New Service"
2. Selecione "Database" > "PostgreSQL"
3. O Railway criará automaticamente a variável `DATABASE_URL`
4. Atualize o código para usar PostgreSQL em produção

### 5. Verificar Deploy

Após o deploy:
1. Clique no serviço no Railway
2. Vá em "Settings" > "Networking"
3. Clique em "Generate Domain"
4. Acesse: `https://seu-app.railway.app/`
5. Teste a API: `https://seu-app.railway.app/docs`

## 📊 Monitoramento

- **Logs**: Aba "Deployments" no Railway
- **Métricas**: Aba "Metrics" para CPU, memória e rede
- **Health Check**: `https://seu-app.railway.app/health`

## 🔒 Segurança - IMPORTANTE

### Antes de ir para produção:

1. **Gere novas SECRET_KEY**:
```python
import secrets
print(secrets.token_urlsafe(64))
```

2. **Atualize CORS** com seu domínio real
3. **Configure HTTPS** (Railway já fornece)
4. **Use PostgreSQL** ao invés de SQLite
5. **Configure Redis** para sessões (opcional)

## 🔄 Atualizações

Para atualizar o sistema em produção:

```bash
git add .
git commit -m "Sua mensagem de commit"
git push origin master
```

O Railway fará o deploy automaticamente!

## 📝 Comandos Úteis

### Ver logs em tempo real:
```bash
railway logs
```

### Executar comandos no servidor:
```bash
railway run python backend/init_db.py
```

### Conectar ao banco:
```bash
railway connect
```

## 🐛 Troubleshooting

### Erro de Build
- Verifique `backend/requirements.txt`
- Confirme que Python 3.9+ está configurado

### Erro de Porta
- Railway define `$PORT` automaticamente
- Código já está configurado para usar `os.getenv("PORT", 8000)`

### Erro 502/503
- Verifique os logs no Railway
- Confirme que o servidor está iniciando corretamente

### CORS Error
- Adicione o domínio do Railway em `ALLOWED_ORIGINS`
- Exemplo: `https://portaria-dwm.railway.app`

## 📚 Recursos

- [Documentação Railway](https://docs.railway.app/)
- [Railway Templates](https://railway.app/templates)
- [Suporte Railway](https://help.railway.app/)

## 🎯 Próximos Passos

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
