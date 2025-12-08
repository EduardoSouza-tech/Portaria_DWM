"""Visitante (visitor) model"""
from sqlalchemy import Column, String, Date, DateTime, Boolean, Text, Integer, Enum as SQLEnum
from datetime import datetime
import uuid
import enum

from app.core.database import Base, GUID


class TipoDocumento(str, enum.Enum):
    CPF = "CPF"
    RG = "RG"
    CNH = "CNH"
    PASSAPORTE = "PASSAPORTE"
    RNE = "RNE"


class Visitante(Base):
    __tablename__ = "visitantes"
    
    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    
    # Personal info
    nome_completo = Column(String(255), nullable=False)
    tipo_documento = Column(SQLEnum(TipoDocumento), nullable=False, default=TipoDocumento.CPF)
    numero_documento = Column(String(20), nullable=False, index=True)
    telefone = Column(String(20), nullable=True)
    
    # Photos
    foto_url = Column(String(500), nullable=True)
    facial_encoding = Column(Text, nullable=True)  # JSON vector
    
    # Blacklist
    is_blacklisted = Column(Boolean, default=False)
    blacklist_reason = Column(Text, nullable=True)
    blacklisted_at = Column(DateTime, nullable=True)
    
    # Metadata
    primeira_visita = Column(DateTime, default=datetime.utcnow)
    total_visitas = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Visitante {self.nome_completo} - {self.numero_documento}>"
