"""
Script para preparar o ambiente para deploy no Railway
"""
import os
import secrets


def generate_secret_keys():
    """Gera chaves secretas seguras para produção"""
    print("🔐 Gerando chaves secretas para produção...\n")
    
    secret_key = secrets.token_urlsafe(64)
    qr_secret_key = secrets.token_urlsafe(64)
    
    print("📋 Adicione estas variáveis de ambiente no Railway:\n")
    print(f"SECRET_KEY={secret_key}")
    print(f"QR_SECRET_KEY={qr_secret_key}")
    print("\n⚠️  IMPORTANTE: Nunca compartilhe estas chaves!")
    print("⚠️  Adicione-as diretamente no painel do Railway, não no código!")


def create_env_example():
    """Cria arquivo .env.example para referência"""
    env_content = """# Configuração de Ambiente - Railway Deploy

# Aplicação
DEBUG=False
ENVIRONMENT=production
PORT=8000

# Segurança (GERE NOVAS CHAVES COM: python backend/prepare_deploy.py)
SECRET_KEY=sua-chave-secreta-aqui
QR_SECRET_KEY=sua-chave-qr-aqui

# Database
DATABASE_URL=sqlite:///./portaria.db
# Para PostgreSQL no Railway, use a URL fornecida automaticamente

# CORS - Adicione seus domínios
ALLOWED_ORIGINS=https://seu-app.railway.app

# Redis (Opcional)
REDIS_URL=redis://localhost:6379/0

# Storage
STORAGE_PATH=./storage
MAX_FILE_SIZE=10485760
"""
    
    with open('.env.railway.example', 'w', encoding='utf-8') as f:
        f.write(env_content)
    
    print("\n✅ Arquivo .env.railway.example criado!")


def check_requirements():
    """Verifica se todas as dependências estão listadas"""
    print("\n📦 Verificando requirements.txt...")
    
    required_packages = [
        'fastapi',
        'uvicorn',
        'gunicorn',
        'pydantic',
        'pydantic-settings',
        'sqlalchemy',
        'python-jose',
        'passlib',
    ]
    
    try:
        with open('backend/requirements.txt', 'r') as f:
            content = f.read()
            
        missing = []
        for package in required_packages:
            if package not in content.lower():
                missing.append(package)
        
        if missing:
            print(f"⚠️  Pacotes faltando: {', '.join(missing)}")
        else:
            print("✅ Todas as dependências essenciais estão listadas!")
            
    except FileNotFoundError:
        print("❌ Arquivo requirements.txt não encontrado!")


def show_deploy_checklist():
    """Mostra checklist para deploy"""
    print("\n" + "="*60)
    print("📋 CHECKLIST PARA DEPLOY NO RAILWAY")
    print("="*60)
    
    checklist = [
        "☐ Criar conta no Railway (railway.app)",
        "☐ Conectar repositório GitHub",
        "☐ Gerar novas SECRET_KEY e QR_SECRET_KEY",
        "☐ Configurar variáveis de ambiente no Railway",
        "☐ Adicionar domínio em ALLOWED_ORIGINS",
        "☐ (Opcional) Adicionar PostgreSQL ao projeto",
        "☐ (Opcional) Adicionar Redis ao projeto",
        "☐ Fazer push do código para GitHub",
        "☐ Aguardar deploy automático no Railway",
        "☐ Testar endpoints em /docs",
        "☐ Verificar /health endpoint",
        "☐ Configurar domínio personalizado (opcional)",
    ]
    
    for item in checklist:
        print(f"  {item}")
    
    print("\n" + "="*60)
    print("📖 Consulte DEPLOY_RAILWAY.md para instruções detalhadas")
    print("="*60)


if __name__ == "__main__":
    print("\n🚀 Preparando Sistema de Portaria para Deploy no Railway\n")
    
    generate_secret_keys()
    create_env_example()
    check_requirements()
    show_deploy_checklist()
    
    print("\n✅ Preparação concluída!")
    print("🎯 Próximo passo: Siga as instruções em DEPLOY_RAILWAY.md\n")
