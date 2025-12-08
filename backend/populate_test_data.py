"""
Script para popular banco de dados com dados de teste
15 moradores, 15 visitantes, 15 visitas
"""
import sys
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
import random

from app.core.database import SessionLocal, engine, Base
from app.models.morador import Morador
from app.models.visitante import Visitante, TipoDocumento
from app.models.visita import Visita, StatusVisita, TipoVisita
from app.models.unidade import Unidade
from app.models.condominio import Condominio

# Dados de exemplo
NOMES = [
    "Ana Silva Santos", "Carlos Eduardo Oliveira", "Maria Fernanda Costa",
    "João Pedro Almeida", "Juliana Rodrigues Lima", "Rafael Henrique Souza",
    "Beatriz Martins Rocha", "Lucas Gabriel Ferreira", "Camila Vitória Gomes",
    "Felipe Augusto Ribeiro", "Larissa Cristina Pereira", "Gustavo Henrique Dias",
    "Isabela Fernandes Cardoso", "Matheus Vinicius Barbosa", "Fernanda Carolina Monteiro",
    "Ricardo Alexandre Cunha", "Patrícia Helena Araújo", "Rodrigo César Pinto",
    "Mariana Beatriz Correia", "Thiago Renato Moreira", "Aline Cristiane Teixeira",
    "Bruno Leonardo Carvalho", "Vanessa Aparecida Nunes", "Anderson Luiz Campos",
    "Daniela Cristina Freitas"
]

TELEFONES = [
    "11987654321", "11912345678", "21987654321", "31987654321", "41987654321",
    "51987654321", "61987654321", "71987654321", "81987654321", "85987654321",
    "11976543210", "11965432109", "21976543210", "31976543210", "41976543210",
    "51976543210", "61976543210", "71976543210", "81976543210", "85976543210",
    "11998877665", "11988776655", "21998877665", "31998877665", "41998877665"
]

MOTIVOS_VISITA = [
    "Visita familiar", "Entrega de encomenda", "Manutenção predial",
    "Visita social", "Prestação de serviços", "Reunião condominial",
    "Mudança", "Entrega de documentos", "Visita amigo", "Serviço de limpeza"
]


def generate_cpf():
    """Gera CPF fictício válido"""
    cpf = [random.randint(0, 9) for _ in range(9)]
    
    # Primeiro dígito verificador
    soma = sum([(10 - i) * cpf[i] for i in range(9)])
    d1 = 11 - (soma % 11)
    cpf.append(d1 if d1 < 10 else 0)
    
    # Segundo dígito verificador
    soma = sum([(11 - i) * cpf[i] for i in range(10)])
    d2 = 11 - (soma % 11)
    cpf.append(d2 if d2 < 10 else 0)
    
    return ''.join(map(str, cpf))


def generate_rg():
    """Gera RG fictício"""
    return ''.join([str(random.randint(0, 9)) for _ in range(9)])


def populate_database():
    """Popula banco com dados de teste"""
    db = SessionLocal()
    
    try:
        print("🚀 Iniciando população do banco de dados...\n")
        
        # Verificar se já existem dados
        existing_moradores = db.query(Morador).count()
        print(f"📊 Moradores existentes: {existing_moradores}")
        
        # Buscar condomínio e unidades existentes
        condominio = db.query(Condominio).first()
        if not condominio:
            print("❌ Nenhum condomínio encontrado! Execute init_db.py primeiro.")
            return
        
        unidades = db.query(Unidade).all()
        if not unidades:
            print("❌ Nenhuma unidade encontrada! Execute init_db.py primeiro.")
            return
        
        print(f"✅ Condomínio: {condominio.nome}")
        print(f"✅ Unidades disponíveis: {len(unidades)}\n")
        
        # Criar 15 MORADORES
        print("👥 Criando 15 moradores...")
        moradores_criados = []
        for i in range(15):
            nome = NOMES[i % len(NOMES)]
            cpf = generate_cpf()
            
            # Verificar se CPF já existe
            existing = db.query(Morador).filter(Morador.cpf == cpf).first()
            if existing:
                cpf = generate_cpf()  # Gerar novo se existir
            
            morador = Morador(
                nome_completo=nome,
                cpf=cpf,
                rg=generate_rg(),
                data_nascimento=date(
                    random.randint(1960, 2005),
                    random.randint(1, 12),
                    random.randint(1, 28)
                ),
                telefone=TELEFONES[i % len(TELEFONES)],
                email=f"{nome.lower().replace(' ', '.')}@email.com",
                is_active=True,
                is_inadimplente=random.choice([True, False]) if i > 10 else False
            )
            db.add(morador)
            moradores_criados.append(morador)
            print(f"  ✓ {i+1}. {nome} - CPF: {cpf}")
        
        db.commit()
        print(f"✅ {len(moradores_criados)} moradores criados!\n")
        
        # Criar 15 VISITANTES
        print("🚶 Criando 15 visitantes...")
        visitantes_criados = []
        tipos_doc = ["CPF", "RG", "CNH", "PASSAPORTE", "RNE"]
        
        for i in range(15):
            nome = NOMES[(i + 10) % len(NOMES)]
            tipo_doc = random.choice(tipos_doc)
            
            if tipo_doc == "CPF":
                numero_doc = generate_cpf()
            elif tipo_doc == "PASSAPORTE":
                numero_doc = f"BR{random.randint(100000, 999999)}"
            elif tipo_doc == "RNE":
                numero_doc = f"V{random.randint(100000, 999999)}-X"
            else:
                numero_doc = generate_rg()
            
            visitante = Visitante(
                nome_completo=nome,
                tipo_documento=tipo_doc,
                numero_documento=numero_doc,
                telefone=TELEFONES[(i + 5) % len(TELEFONES)],
                is_blacklisted=random.choice([True, False]) if i > 12 else False,
                total_visitas=random.randint(0, 10)
            )
            db.add(visitante)
            visitantes_criados.append(visitante)
            print(f"  ✓ {i+1}. {nome} - {tipo_doc}: {numero_doc}")
        
        db.commit()
        print(f"✅ {len(visitantes_criados)} visitantes criados!\n")
        
        # Criar 15 VISITAS
        print("📋 Criando 15 visitas...")
        status_list = [
            StatusVisita.AUTORIZADA, StatusVisita.DENTRO,
            StatusVisita.FINALIZADA, StatusVisita.PENDENTE
        ]
        tipo_list = [TipoVisita.COMUM, TipoVisita.DELIVERY, TipoVisita.PRESTADOR, TipoVisita.RECORRENTE]
        
        for i in range(15):
            visitante = random.choice(visitantes_criados)
            unidade = random.choice(unidades)
            status = random.choice(status_list)
            tipo = random.choice(tipo_list)
            
            # Datas baseadas no status
            data_prevista = datetime.utcnow() + timedelta(days=random.randint(-5, 5))
            
            if status == StatusVisita.DENTRO:
                data_entrada = datetime.utcnow() - timedelta(hours=random.randint(1, 8))
                data_saida = None
            elif status == StatusVisita.FINALIZADA:
                data_entrada = datetime.utcnow() - timedelta(days=random.randint(1, 10))
                data_saida = data_entrada + timedelta(hours=random.randint(1, 6))
            elif status == StatusVisita.AUTORIZADA:
                data_entrada = None
                data_saida = None
            else:  # PENDENTE
                data_entrada = None
                data_saida = None
            
            validade = datetime.utcnow() + timedelta(hours=24)
            
            visita = Visita(
                visitante_id=visitante.id,
                unidade_id=unidade.id,
                status=status,
                tipo=tipo,
                motivo=random.choice(MOTIVOS_VISITA),
                data_prevista=data_prevista,
                valido_ate=validade if status in [StatusVisita.AUTORIZADA, StatusVisita.DENTRO] else None,
                data_entrada=data_entrada,
                data_saida=data_saida,
                qr_code=f"QR{random.randint(100000, 999999)}" if status != StatusVisita.PENDENTE else None
            )
            db.add(visita)
            print(f"  ✓ {i+1}. {visitante.nome_completo} -> Unidade {unidade.numero} - Status: {status.value}")
        
        db.commit()
        print(f"✅ 15 visitas criadas!\n")
        
        # Resumo final
        print("="*60)
        print("📊 RESUMO FINAL:")
        print(f"   👥 Total de moradores: {db.query(Morador).count()}")
        print(f"   🚶 Total de visitantes: {db.query(Visitante).count()}")
        print(f"   📋 Total de visitas: {db.query(Visita).count()}")
        print("="*60)
        print("✅ Banco de dados populado com sucesso!\n")
        
    except Exception as e:
        print(f"❌ Erro ao popular banco: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    populate_database()
