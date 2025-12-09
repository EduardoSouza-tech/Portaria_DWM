"""
Script para popular banco de dados com moradores de teste
"""
import sys
import random
from datetime import datetime, timedelta
from pathlib import Path

# Adicionar o diretório backend ao path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.core.database import SessionLocal
from app.models.morador import Morador

# Lista de nomes brasileiros
NOMES = [
    "João Silva Santos", "Maria Oliveira Costa", "Pedro Souza Lima", "Ana Paula Ferreira",
    "Carlos Eduardo Alves", "Juliana Mendes Rocha", "Fernando Castro Dias", "Patrícia Gomes Ribeiro",
    "Ricardo Martins Cardoso", "Camila Rodrigues Pinto", "Lucas Henrique Barbosa", "Beatriz Santos Araújo",
    "Rafael Pereira Cunha", "Amanda Costa Moreira", "Thiago Almeida Monteiro", "Mariana Fernandes Cruz",
    "Gabriel Lima Carvalho", "Larissa Vieira Ramos", "Diego Nascimento Freitas", "Isabela Correia Teixeira",
    "Rodrigo Batista Azevedo", "Carolina Duarte Melo", "Bruno Campos Borges", "Fernanda Rezende Farias",
    "André Barros Nogueira", "Aline Ribeiro Miranda", "Marcelo Pires Tavares", "Natália Moura Cavalcanti",
    "Felipe Santana Guimarães", "Vanessa Leite Machado", "Daniel Gonçalves Porto", "Tatiana Lopes Xavier"
]

def gerar_cpf():
    """Gera um CPF válido aleatório"""
    def calcular_digito(cpf, peso):
        soma = sum(int(cpf[i]) * peso[i] for i in range(len(peso)))
        resto = soma % 11
        return 0 if resto < 2 else 11 - resto
    
    # Gera 9 dígitos aleatórios
    cpf = [random.randint(0, 9) for _ in range(9)]
    
    # Calcula primeiro dígito verificador
    peso1 = list(range(10, 1, -1))
    cpf.append(calcular_digito(cpf, peso1))
    
    # Calcula segundo dígito verificador
    peso2 = list(range(11, 1, -1))
    cpf.append(calcular_digito(cpf, peso2))
    
    return ''.join(map(str, cpf))

def gerar_rg():
    """Gera um RG aleatório"""
    return f"{random.randint(10000000, 99999999)}"

def gerar_telefone():
    """Gera um telefone aleatório"""
    ddd = random.choice(['11', '21', '31', '41', '51', '61', '71', '81', '85'])
    numero = f"9{random.randint(10000000, 99999999)}"
    return f"({ddd}) {numero[:5]}-{numero[5:]}"

def gerar_email(nome):
    """Gera email baseado no nome"""
    nome_limpo = nome.lower().replace(' ', '.').split()[0:2]
    nome_email = '.'.join(nome_limpo)
    dominio = random.choice(['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com.br'])
    return f"{nome_email}{random.randint(1, 999)}@{dominio}"

def gerar_data_nascimento():
    """Gera data de nascimento aleatória (18 a 80 anos)"""
    hoje = datetime.now()
    anos_atras = random.randint(18, 80)
    dias_atras = random.randint(0, 365)
    data = hoje - timedelta(days=anos_atras*365 + dias_atras)
    return data.date()

def popular_moradores():
    """Popula banco com 30 moradores"""
    db = SessionLocal()
    
    try:
        print("🏢 POPULANDO BANCO DE DADOS COM MORADORES")
        print("=" * 60)
        
        moradores_criados = 0
        
        for i, nome in enumerate(NOMES, 1):
            cpf = gerar_cpf()
            
            # Verificar se CPF já existe
            existe = db.query(Morador).filter(Morador.cpf == cpf).first()
            if existe:
                continue
            
            morador = Morador(
                nome_completo=nome,
                cpf=cpf,
                rg=gerar_rg(),
                telefone=gerar_telefone(),
                email=gerar_email(nome),
                data_nascimento=gerar_data_nascimento(),
                is_active=True
            )
            
            db.add(morador)
            moradores_criados += 1
            print(f"✅ [{i:02d}/30] {nome} - CPF: {cpf}")
        
        db.commit()
        print("=" * 60)
        print(f"🎉 {moradores_criados} moradores cadastrados com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro ao popular banco: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    popular_moradores()
