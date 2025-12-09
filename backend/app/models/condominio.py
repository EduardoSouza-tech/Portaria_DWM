"""Condominio model"""
from sqlalchemy import Column, String, Integer, DateTime
from datetime import datetime
import uuid

from app.core.database import Base, GUID


class Condominio(Base):
    __tablename__ = "condominios"
    
    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    nome = Column(String(255), nullable=False)
    cnpj = Column(String(14), unique=True, nullable=False)
    endereco = Column(String(500), nullable=False)
    cidade = Column(String(100), nullable=False)
    estado = Column(String(2), nullable=False)
    cep = Column(String(8), nullable=False)
    
    total_unidades = Column(Integer, nullable=False, default=0)
    total_blocos = Column(Integer, default=1)
    
    telefone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Condominio {self.nome}>"
