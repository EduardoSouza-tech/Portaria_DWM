"""
Script para inicializar o banco de dados
Cria todas as tabelas e um usuário administrador padrão
"""
import sys
from app.core.database import engine, Base, SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

def init_database():
    """Criar todas as tabelas"""
    print("🔧 Criando tabelas no banco de dados...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Tabelas criadas com sucesso!")
        return True
    except Exception as e:
        print(f"❌ Erro ao criar tabelas: {e}")
        return False

def create_admin_user():
    """Criar usuário administrador padrão"""
    print("\n👤 Criando usuário administrador...")
    
    db = SessionLocal()
    try:
        # Verificar se admin já existe
        existing_admin = db.query(User).filter(User.email == "admin@portaria.com").first()
        if existing_admin:
            print("⚠️  Usuário admin já existe!")
            return True
        
        # Criar novo admin
        admin = User(
            email="admin@portaria.com",
            password_hash=get_password_hash("admin123"),
            nome="Administrador",
            role="admin"
        )
        
        db.add(admin)
        db.commit()
        
        print("✅ Usuário administrador criado com sucesso!")
        print("\n📧 E-mail: admin@portaria.com")
        print("🔑 Senha: admin123")
        print("\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao criar usuário admin: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def create_sample_data():
    """Criar dados de exemplo para testes"""
    print("\n📦 Criando dados de exemplo...")
    
    db = SessionLocal()
    try:
        from app.models.condominio import Condominio
        from app.models.unidade import Unidade
        from app.models.morador import Morador
        from app.models.correspondencia import Correspondencia
        import uuid
        
        # Verificar se já existem dados
        existing_condo = db.query(Condominio).first()
        if existing_condo:
            print("⚠️  Dados de exemplo já existem!")
            return True
        
        # Criar condomínio de teste
        condo = Condominio(
            nome="Condomínio Teste",
            cnpj="12345678000100",
            endereco="Rua Teste, 123",
            cidade="São Paulo",
            estado="SP",
            cep="01234567",
            total_unidades=50,
            total_blocos=2
        )
        db.add(condo)
        db.flush()
        
        # Criar 5 unidades de teste
        for i in range(1, 6):
            unidade = Unidade(
                condominio_id=condo.id,
                numero=str(101 + i),
                bloco="A",
                andar=i,
                area_m2=80.0
            )
            db.add(unidade)
        
        # Criar 2 moradores de teste
        morador1 = Morador(
            nome_completo="João da Silva",
            cpf="12345678901",
            telefone="11987654321",
            email="joao@email.com",
            is_active=True
        )
        
        morador2 = Morador(
            nome_completo="Maria Santos",
            cpf="98765432100",
            telefone="11912345678",
            email="maria@email.com",
            is_active=True
        )
        
        db.add(morador1)
        db.add(morador2)
        
        db.commit()
        
        print("✅ Dados de exemplo criados com sucesso!")
        print("   - 1 Condomínio")
        print("   - 5 Unidades")
        print("   - 2 Moradores")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao criar dados de exemplo: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def main():
    print("=" * 60)
    print("🏢 PORTARIA INTELIGENTE - Inicialização do Banco de Dados")
    print("=" * 60)
    
    # Criar tabelas
    if not init_database():
        sys.exit(1)
    
    # Criar admin
    if not create_admin_user():
        sys.exit(1)
    
    # Perguntar se quer criar dados de exemplo
    print("\n" + "=" * 60)
    resposta = input("\n❓ Deseja criar dados de exemplo para testes? (s/n): ").strip().lower()
    
    if resposta in ['s', 'sim', 'y', 'yes']:
        create_sample_data()
    
    print("\n" + "=" * 60)
    print("✅ Inicialização concluída!")
    print("=" * 60)
    print("\n🚀 Próximos passos:")
    print("   1. Execute o backend: python main.py")
    print("   2. Acesse a API: http://localhost:8000/docs")
    print("   3. Execute o frontend: cd ../frontend && npm run dev")
    print("   4. Acesse o sistema: http://localhost:5173")
    print("\n📧 Login: admin@portaria.com")
    print("🔑 Senha: admin123")
    print("\n")

if __name__ == "__main__":
    main()
