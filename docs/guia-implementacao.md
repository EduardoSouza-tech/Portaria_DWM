# 📘 Guia de Implementação e Deployment

## Visão Geral

Guia completo para implementar e colocar o Sistema de Portaria Inteligente em produção.

---

## 🚀 Fases de Implementação

### Fase 1: MVP (Mínimo Produto Viável) - 3 meses

#### Mês 1: Backend Core
**Semanas 1-2**: Setup e Arquitetura
- Configuração do repositório Git
- Setup NestJS + TypeScript
- Configuração Docker / Docker Compose
- PostgreSQL + Redis setup
- Estrutura de pastas (Clean Architecture)

**Semanas 3-4**: Autenticação e Usuários
- Sistema de login (JWT + Refresh Token)
- CRUD de usuários
- RBAC (controle de permissões)
- Middleware de autenticação
- Testes unitários

#### Mês 2: Funcionalidades Core
**Semanas 5-6**: Módulo de Moradores
- CRUD completo de moradores
- Associação com unidades
- Upload de fotos (S3/MinIO)
- Geração de QR Codes
- API REST completa

**Semanas 7-8**: Módulo de Visitantes
- CRUD de visitantes
- Sistema de autorizações
- Registro de visitas (entrada/saída)
- Notificações push básicas (Firebase)
- WebSockets para tempo real

#### Mês 3: Interfaces e Integração
**Semanas 9-10**: Painel da Portaria (Web)
- Dashboard em React
- Registro de entrada/saída
- Consulta de visitantes
- Escaneamento de QR Code
- Chat com moradores

**Semanas 11-12**: App do Morador (Mobile)
- Setup React Native / Flutter
- Telas principais (Home, Visitantes, Correspondências)
- Pré-cadastro de visitantes
- Push notifications
- Build e deploy (TestFlight/Google Play Beta)

### Fase 2: Funcionalidades Avançadas - 2 meses

#### Mês 4: Módulos Complementares
- Gestão de correspondências
- Controle de veículos
- Entregadores e prestadores
- Relatórios básicos
- Exportação CSV/PDF

#### Mês 5: Integrações e IoT
- Integração com câmeras IP
- Abertura automática de portões
- OCR de placas (OpenALPR)
- Reconhecimento facial básico
- WhatsApp Business API

### Fase 3: Produção e Escala - 1 mês

#### Mês 6: Preparação para Produção
- Testes de carga (K6)
- Otimizações de performance
- Configuração de CI/CD
- Setup Kubernetes (ou Docker Swarm)
- Monitoramento (Prometheus + Grafana)
- Backup automático
- Documentação completa
- Treinamento de equipe

---

## 🛠️ Setup Local (Desenvolvimento)

### Pré-requisitos
```bash
# Instalar Node.js 20 LTS
https://nodejs.org/

# Instalar Docker Desktop
https://www.docker.com/products/docker-desktop

# Instalar Git
https://git-scm.com/

# Instalar VS Code (recomendado)
https://code.visualstudio.com/
```

### Clone e Instalação
```bash
# Clonar repositório
git clone https://github.com/empresa/portaria-inteligente.git
cd portaria-inteligente

# Instalar dependências do backend
cd backend
npm install

# Copiar variáveis de ambiente
cp .env.example .env

# Editar .env com suas configurações
code .env

# Subir containers Docker (Postgres + Redis)
docker-compose up -d

# Rodar migrações do banco
npm run migration:run

# Popular banco com dados iniciais
npm run seed

# Iniciar servidor de desenvolvimento
npm run start:dev

# Servidor rodando em http://localhost:3000
```

### Setup do Frontend
```bash
# Em outro terminal
cd frontend

# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env

# Iniciar aplicação React
npm start

# Frontend rodando em http://localhost:3001
```

### Setup do Mobile
```bash
cd mobile

# Instalar dependências
npm install

# iOS (apenas macOS)
cd ios && pod install && cd ..
npx react-native run-ios

# Android
npx react-native run-android
```

---

## 🐳 Docker Compose Completo

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: portaria_db
    environment:
      POSTGRES_USER: portaria
      POSTGRES_PASSWORD: senha_segura_aqui
      POSTGRES_DB: portaria_prod
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - portaria_network
    restart: unless-stopped

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: portaria_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - portaria_network
    restart: unless-stopped

  # MinIO Storage (S3-compatible)
  minio:
    image: minio/minio:latest
    container_name: portaria_storage
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: admin
      MINIO_ROOT_PASSWORD: senha_segura_aqui
    ports:
      - "9000:9000"  # API
      - "9001:9001"  # Console
    volumes:
      - minio_data:/data
    networks:
      - portaria_network
    restart: unless-stopped

  # API Backend
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: portaria_api
    environment:
      DATABASE_URL: postgresql://portaria:senha_segura_aqui@postgres:5432/portaria_prod
      REDIS_URL: redis://redis:6379
      JWT_SECRET: seu_jwt_secret_super_seguro
      AWS_S3_ENDPOINT: http://minio:9000
      AWS_ACCESS_KEY_ID: admin
      AWS_SECRET_ACCESS_KEY: senha_segura_aqui
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
      - minio
    networks:
      - portaria_network
    restart: unless-stopped

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: portaria_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - api
    networks:
      - portaria_network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  minio_data:

networks:
  portaria_network:
    driver: bridge
```

---

## ☁️ Deploy em AWS

### Arquitetura Recomendada

```
                    Internet
                       |
                  [Route 53]
                       |
                  [CloudFront CDN]
                       |
              [Application Load Balancer]
                       |
          ┌────────────┴────────────┐
          |                         |
    [ECS/EKS Cluster]         [S3 Bucket]
          |                    (imagens)
    ┌─────┴─────┐
    |           |
[API Servers] [Workers]
    |           |
    └─────┬─────┘
          |
   [RDS PostgreSQL]
   [ElastiCache Redis]
```

### Custos Estimados (AWS)
**Para 1 condomínio de 100 unidades**:
- EC2 (t3.medium x2): ~$60/mês
- RDS PostgreSQL (db.t3.small): ~$30/mês
- ElastiCache Redis (cache.t3.micro): ~$15/mês
- S3 Storage (100GB): ~$2.30/mês
- CloudFront (50GB transfer): ~$4.25/mês
- **Total: ~$110-130/mês**

**Para 10 condomínios**:
- EC2 (t3.large x3): ~$180/mês
- RDS (db.t3.medium): ~$60/mês
- ElastiCache (cache.t3.small): ~$35/mês
- S3 (1TB): ~$23/mês
- CloudFront (500GB): ~$42/mês
- **Total: ~$340-370/mês**

### Script de Deploy (GitHub Actions)

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: portaria-api
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster portaria-cluster \
            --service portaria-api-service \
            --force-new-deployment
```

---

## 📊 Monitoramento

### Prometheus + Grafana

**Métricas coletadas**:
- Requests por segundo
- Latência de APIs (p50, p95, p99)
- Taxa de erro
- Uso de CPU/Memória
- Conexões ativas no banco
- Queue size (Bull)
- WebSocket connections

**Alertas configurados**:
- API latency > 500ms
- Taxa de erro > 5%
- CPU > 80%
- Memória > 85%
- Disco > 90%

### Logs Estruturados (ELK Stack)

```javascript
// Exemplo de log estruturado
logger.info('Visitante autorizado', {
  visitor_id: 'uuid',
  unit_id: 'uuid',
  authorizer_id: 'uuid',
  method: 'qr_code',
  duration_ms: 245
});
```

**Índices no Elasticsearch**:
- `logs-api-*` - Logs da API
- `logs-auth-*` - Logs de autenticação
- `logs-events-*` - Eventos do sistema
- `logs-errors-*` - Erros e exceções

---

## 🔒 Checklist de Segurança

### Antes de ir para Produção

- [ ] Todas as senhas fortes e únicas
- [ ] Secrets em variáveis de ambiente (nunca no código)
- [ ] HTTPS obrigatório (certificado SSL/TLS)
- [ ] CORS configurado corretamente
- [ ] Rate limiting ativado
- [ ] Helmet.js configurado
- [ ] SQL Injection protegido (ORM + prepared statements)
- [ ] XSS protegido (sanitização de inputs)
- [ ] CSRF protection
- [ ] Firewall configurado (AWS Security Groups)
- [ ] Backup automático ativado
- [ ] Logs de auditoria funcionando
- [ ] Monitoramento e alertas configurados
- [ ] Testes de penetração realizados
- [ ] Documentação de segurança completa
- [ ] Plano de resposta a incidentes

---

## 📖 Documentação de APIs

### Swagger UI
Disponível em: `https://api.portaria.com/docs`

**Endpoints principais**:

```
POST   /auth/login              - Login
POST   /auth/refresh            - Renovar token
GET    /moradores               - Listar moradores
POST   /moradores               - Criar morador
GET    /moradores/:id           - Buscar morador
PUT    /moradores/:id           - Atualizar morador
GET    /visitantes              - Listar visitantes
POST   /visitantes              - Criar visitante
POST   /visitas                 - Registrar visita
PUT    /visitas/:id/entrada     - Registrar entrada
PUT    /visitas/:id/saida       - Registrar saída
POST   /autorizacoes            - Solicitar autorização
PUT    /autorizacoes/:id        - Autorizar/Negar
GET    /correspondencias        - Listar correspondências
POST   /correspondencias        - Registrar correspondência
PUT    /correspondencias/:id    - Marcar como retirada
```

---

## 📞 Suporte e Manutenção

### Níveis de Suporte

**Plano Básico** (incluído):
- Suporte por e-mail
- Horário comercial (seg-sex, 9h-18h)
- Tempo de resposta: 24h
- Atualizações trimestrais

**Plano Premium** (+R$ 500/mês):
- Suporte por WhatsApp/Telefone
- Horário estendido (seg-sáb, 8h-20h)
- Tempo de resposta: 4h
- Atualizações mensais
- Treinamento online

**Plano Enterprise** (personalizado):
- Suporte 24/7
- Tempo de resposta: 30min (crítico)
- Atualizações sob demanda
- Treinamento presencial
- Gerente de conta dedicado
- SLA 99,9%

---

## 🎓 Treinamento

### Para Porteiros (2 horas)
1. Login no sistema
2. Registro de visitantes
3. Escaneamento de QR Codes
4. Registro de correspondências
5. Chat com moradores
6. Situações de emergência

### Para Moradores (Tutorial no App)
1. Primeiro acesso
2. Pré-cadastrar visitante
3. Autorizar visitante em tempo real
4. Ver correspondências
5. Gerenciar veículos
6. Comunicar-se com portaria

### Para Administradores (4 horas)
1. Gestão de unidades
2. Cadastro de moradores
3. Relatórios e analytics
4. Auditoria e logs
5. Configurações do sistema
6. Backup e restore

---

## 📋 Licenciamento

### Modelo de Preços

**SaaS (Software as a Service)**:
- **Freemium**: Até 20 unidades (grátis)
- **Starter**: 21-50 unidades - R$ 199/mês
- **Professional**: 51-150 unidades - R$ 499/mês
- **Enterprise**: 151+ unidades - R$ 999/mês

**On-Premise**:
- Licença perpétua: A partir de R$ 15.000
- Suporte anual: 20% do valor da licença

**White Label**:
- Setup: R$ 10.000 (uma vez)
- Mensalidade: R$ 2.000/mês

---

## 🌟 Próximos Passos

1. **Validar requisitos** com stakeholders
2. **Definir stack final** (Node.js vs Python vs C#)
3. **Setup inicial** do projeto
4. **Contratar equipe** (2 devs backend, 1 frontend, 1 mobile)
5. **Sprint 0**: Arquitetura e setup
6. **Desenvolvimento iterativo**: Sprints de 2 semanas
7. **Beta testing**: 2 condomínios piloto
8. **Launch**: Marketing e vendas

---

**Versão**: 1.0.0  
**Última atualização**: Dezembro 2025  
**Documentação completa em**: `/docs`
