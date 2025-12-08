"""Morador (resident) model"""
from sqlalchemy import Column, String, Date, DateTime, Boolean, Text
from datetime import datetime
import uuid

from app.core.database import Base, GUID


class Morador(Base):
    __tablename__ = "moradores"
    
    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    
    # Personal info
    nome_completo = Column(String(255), nullable=False)
    cpf = Column(String(11), unique=True, nullable=False, index=True)
    rg = Column(String(20), nullable=True)
    data_nascimento = Column(Date, nullable=True)
    telefone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    
    # Photos and biometrics
    foto_perfil_url = Column(String(500), nullable=True)
    fotos_reconhecimento = Column(Text, nullable=True)  # JSON array of URLs
    facial_encoding = Column(Text, nullable=True)  # JSON vector
    
    # Access control
    qr_code_permanente = Column(String(100), unique=True, nullable=True)
    pin_acesso = Column(String(6), nullable=True)
    rfid_card = Column(String(50), unique=True, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_inadimplente = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Morador {self.nome_completo} - CPF: {self.cpf}>"
