# -*- coding: utf-8 -*-
"""
Script para gerar dados de teste
200 moradores, 300 visitantes, 700 correspondências, 100 visitas
"""
import sys
import os
import random
from datetime import datetime, timedelta
from faker import Faker

# Force UTF-8 encoding for Windows console
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

sys.path.append('.')

from app.core.database import SessionLocal
from app.models.morador import Morador
from app.models.visitante import Visitante, TipoDocumento
from app.models.correspondencia import Correspondencia, TipoCorrespondencia, StatusCorrespondencia
from app.models.visita import Visita, TipoVisita, StatusVisita
from app.models.unidade import Unidade
from app.models.condominio import Condominio

fake = Faker('pt_BR')

def gerar_cpf():
    """Gera CPF válido"""
    cpf = [random.randint(0, 9) for _ in range(9)]
    
    # Primeiro dígito verificador
    v1 = sum([(10 - i) * cpf[i] for i in range(9)]) % 11
    cpf.append(0 if v1 < 2 else 11 - v1)
    
    # Segundo dígito verificador
    v2 = sum([(11 - i) * cpf[i] for i in range(10)]) % 11
    cpf.append(0 if v2 < 2 else 11 - v2)
    
    return ''.join(map(str, cpf))

def criar_condominio(db):
    """Cria condomínio se não existir"""
    condominio = db.query(Condominio).first()
    if condominio:
        print(f"✅ Usando condomínio existente: {condominio.nome}")
        return condominio
    
    print(f"\n🏢 Criando condomínio...")
    condominio = Condominio(
        nome="Condomínio Teste",
        cnpj="12345678000199",
        endereco="Rua Teste, 123",
        cidade="Belo Horizonte",
        estado="MG",
        cep="30000000",
        total_unidades=50,
        total_blocos=1,
        telefone="3133334444",
        email="contato@condominioteste.com.br"
    )
    db.add(condominio)
    db.commit()
    print(f"✅ Condomínio criado")
    return condominio

def criar_unidades(db, condominio_id, qtd=50):
    """Cria unidades se não existirem"""
    print(f"\n🏢 Verificando unidades...")
    
    unidades_existentes = db.query(Unidade).count()
    if unidades_existentes >= qtd:
        print(f"✅ Já existem {unidades_existentes} unidades")
        return db.query(Unidade).all()
    
    unidades = []
    for i in range(1, qtd + 1):
        bloco = random.choice(['A', 'B', 'C', 'D'])
        unidade = Unidade(
            condominio_id=condominio_id,
            numero=f"{bloco}{i:03d}",
            bloco=bloco,
            andar=((i - 1) // 4) + 1,
            area_m2=random.uniform(45.0, 150.0)
        )
        unidades.append(unidade)
        db.add(unidade)
    
    db.commit()
    print(f"✅ {qtd} unidades criadas")
    return unidades

def criar_moradores(db, qtd=200):
    """Cria moradores"""
    print(f"\n👥 Criando {qtd} moradores...")
    
    unidades = db.query(Unidade).all()
    if not unidades:
        print("❌ Nenhuma unidade encontrada")
        return []
    
    moradores = []
    for i in range(qtd):
        cpf = gerar_cpf()
        
        # Verifica se CPF já existe
        existe = db.query(Morador).filter(Morador.cpf == cpf).first()
        if existe:
            continue
        
        morador = Morador(
            nome_completo=fake.name(),
            cpf=cpf,
            rg=f"{random.randint(1000000, 9999999)}",
            data_nascimento=fake.date_of_birth(minimum_age=18, maximum_age=80),
            telefone=f"31{random.randint(900000000, 999999999)}",
            email=fake.email(),
            is_active=random.choice([True, True, True, False]),  # 75% ativos
            is_inadimplente=random.choice([True, False, False, False])  # 25% inadimplentes
        )
        moradores.append(morador)
        db.add(morador)
        
        if (i + 1) % 50 == 0:
            db.commit()
            print(f"   ✅ {i + 1}/{qtd} moradores")
    
    db.commit()
    print(f"✅ {len(moradores)} moradores criados")
    return moradores

def criar_visitantes(db, qtd=300):
    """Cria visitantes"""
    print(f"\n🚶 Criando {qtd} visitantes...")
    
    visitantes = []
    for i in range(qtd):
        tipo_doc = random.choice(list(TipoDocumento))
        
        if tipo_doc == TipoDocumento.CPF:
            num_doc = gerar_cpf()
        elif tipo_doc == TipoDocumento.RG:
            num_doc = f"{random.randint(1000000, 9999999)}"
        elif tipo_doc == TipoDocumento.CNH:
            num_doc = f"{random.randint(10000000000, 99999999999)}"
        elif tipo_doc == TipoDocumento.PASSAPORTE:
            num_doc = f"{fake.bothify('??######')}"
        else:  # RNE
            num_doc = f"{fake.bothify('?#######')}"
        
        visitante = Visitante(
            nome_completo=fake.name(),
            tipo_documento=tipo_doc,
            numero_documento=num_doc,
            telefone=f"31{random.randint(900000000, 999999999)}",
            is_blacklisted=random.choice([True] + [False] * 19),  # 5% na lista negra
            total_visitas=random.randint(0, 50),
            primeira_visita=fake.date_time_between(start_date='-2y', end_date='now')
        )
        
        if visitante.is_blacklisted:
            visitante.blacklist_reason = random.choice([
                "Comportamento inadequado",
                "Tentativa de fraude",
                "Conflito com moradores",
                "Recusa em seguir regras do condomínio"
            ])
            visitante.blacklisted_at = fake.date_time_between(start_date='-1y', end_date='now')
        
        visitantes.append(visitante)
        db.add(visitante)
        
        if (i + 1) % 100 == 0:
            db.commit()
            print(f"   ✅ {i + 1}/{qtd} visitantes")
    
    db.commit()
    print(f"✅ {len(visitantes)} visitantes criados")
    return visitantes

def criar_correspondencias(db, qtd=700):
    """Cria correspondências"""
    print(f"\n📦 Criando {qtd} correspondências...")
    
    unidades = db.query(Unidade).all()
    if not unidades:
        print("❌ Nenhuma unidade encontrada")
        return []
    
    porteiros = ["João Silva", "Maria Santos", "Pedro Oliveira", "Ana Costa", "Carlos Souza"]
    
    correspondencias = []
    for i in range(qtd):
        unidade = random.choice(unidades)
        tipo = random.choice(list(TipoCorrespondencia))
        status = random.choice(list(StatusCorrespondencia))
        
        data_receb = fake.date_time_between(start_date='-90d', end_date='now')
        
        corresp = Correspondencia(
            unidade_id=unidade.id,
            destinatario=fake.name(),
            tipo=tipo,
            remetente=random.choice([fake.company(), fake.name(), None]),
            descricao=fake.sentence(nb_words=6) if random.random() > 0.5 else None,
            codigo_rastreio=f"{fake.bothify('??##########')}" if random.random() > 0.6 else None,
            recebido_por=random.choice(porteiros),
            data_recebimento=data_receb,
            status=status
        )
        
        if status == StatusCorrespondencia.ENTREGUE:
            corresp.entregue_para = fake.name()
            corresp.data_entrega = data_receb + timedelta(hours=random.randint(1, 72))
        
        correspondencias.append(corresp)
        db.add(corresp)
        
        if (i + 1) % 200 == 0:
            db.commit()
            print(f"   ✅ {i + 1}/{qtd} correspondências")
    
    db.commit()
    print(f"✅ {len(correspondencias)} correspondências criadas")
    return correspondencias

def criar_visitas(db, qtd=100):
    """Cria visitas"""
    print(f"\n🚪 Criando {qtd} visitas...")
    
    visitantes = db.query(Visitante).all()
    unidades = db.query(Unidade).all()
    moradores = db.query(Morador).filter(Morador.is_active == True).all()
    
    if not visitantes or not unidades:
        print("❌ Faltam visitantes ou unidades")
        return []
    
    visitas = []
    for i in range(qtd):
        visitante = random.choice(visitantes)
        unidade = random.choice(unidades)
        tipo = random.choice(list(TipoVisita))
        status = random.choice(list(StatusVisita))
        
        data_criacao = fake.date_time_between(start_date='-60d', end_date='now')
        
        visita = Visita(
            visitante_id=visitante.id,
            unidade_id=unidade.id,
            autorizado_por=random.choice(moradores).id if moradores and random.random() > 0.3 else None,
            tipo=tipo,
            status=status,
            data_prevista=data_criacao,
            motivo=random.choice([
                "Visita social",
                "Entrega",
                "Manutenção",
                "Serviço contratado",
                "Familiar",
                None
            ]),
            created_at=data_criacao
        )
        
        if status in [StatusVisita.DENTRO, StatusVisita.FINALIZADA]:
            visita.data_entrada = data_criacao + timedelta(minutes=random.randint(5, 120))
            visita.metodo_autorizacao = random.choice(['push', 'whatsapp', 'telefone', 'auto'])
            
            if status == StatusVisita.FINALIZADA:
                duracao = random.randint(15, 240)
                visita.data_saida = visita.data_entrada + timedelta(minutes=duracao)
                visita.duracao_minutos = duracao
        
        visitas.append(visita)
        db.add(visita)
        
        if (i + 1) % 50 == 0:
            db.commit()
            print(f"   ✅ {i + 1}/{qtd} visitas")
    
    db.commit()
    print(f"✅ {len(visitas)} visitas criadas")
    return visitas

def limpar_dados_teste(db):
    """Remove todos os dados de teste antes de gerar novos"""
    try:
        print("\n🗑️  Limpando dados de teste antigos...")
        
        # Ordem de exclusão respeitando foreign keys
        db.query(Visita).delete()
        db.query(Correspondencia).delete()
        db.query(Visitante).delete()
        
        # Manter os 2 moradores iniciais (admin e teste)
        total_moradores = db.query(Morador).count()
        if total_moradores > 2:
            # Busca todos os moradores exceto os 2 primeiros
            moradores_para_deletar = db.query(Morador).offset(2).all()
            for morador in moradores_para_deletar:
                db.delete(morador)
        
        # Limpar unidades extras (manter apenas as existentes se houver)
        total_unidades = db.query(Unidade).count()
        if total_unidades > 0:
            db.query(Unidade).delete()
        
        db.commit()
        print(f"   ✅ Dados antigos removidos")
        
    except Exception as e:
        print(f"   ⚠️  Erro ao limpar dados: {e}")
        db.rollback()

def main():
    """Função principal"""
    print("=" * 60)
    print("🎲 GERADOR DE DADOS DE TESTE")
    print("=" * 60)
    
    db = SessionLocal()
    
    try:
        # 0. Limpar dados antigos
        limpar_dados_teste(db)
        
        # 1. Criar condomínio
        condominio = criar_condominio(db)
        
        # 2. Criar unidades (necessário para outros registros)
        unidades = criar_unidades(db, condominio.id, qtd=50)
        
        # 3. Criar moradores
        moradores = criar_moradores(db, qtd=200)
        
        # 4. Criar visitantes
        visitantes = criar_visitantes(db, qtd=300)
        
        # 5. Criar correspondências
        correspondencias = criar_correspondencias(db, qtd=700)
        
        # 6. Criar visitas
        visitas = criar_visitas(db, qtd=100)
        
        print("\n" + "=" * 60)
        print("✅ DADOS GERADOS COM SUCESSO!")
        print("=" * 60)
        print(f"📊 Resumo:")
        print(f"   🏢 Unidades: {len(unidades)}")
        print(f"   👥 Moradores: {len(moradores)}")
        print(f"   🚶 Visitantes: {len(visitantes)}")
        print(f"   📦 Correspondências: {len(correspondencias)}")
        print(f"   🚪 Visitas: {len(visitas)}")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ ERRO: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
