"""Visita (visit record) model"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Text, Integer, Enum as SQLEnum
from datetime import datetime
import uuid
import enum

from app.core.database import Base, GUID


class StatusVisita(str, enum.Enum):
    PENDENTE = "pendente"
    AUTORIZADA = "autorizada"
    NEGADA = "negada"
    DENTRO = "dentro"
    FINALIZADA = "finalizada"
    CANCELADA = "cancelada"


class TipoVisita(str, enum.Enum):
    COMUM = "comum"
    RECORRENTE = "recorrente"
    DELIVERY = "delivery"
    PRESTADOR = "prestador"


class Visita(Base):
    __tablename__ = "visitas"
    
    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    
    # Foreign keys
    visitante_id = Column(GUID, ForeignKey("visitantes.id", ondelete="CASCADE"), nullable=False)
    unidade_id = Column(GUID, ForeignKey("unidades.id", ondelete="CASCADE"), nullable=False)
    autorizado_por = Column(GUID, ForeignKey("moradores.id"), nullable=True)
    registrado_por = Column(GUID, ForeignKey("usuarios.id"), nullable=True)
    
    # Visit info
    tipo = Column(SQLEnum(TipoVisita), nullable=False, default=TipoVisita.COMUM)
    status = Column(SQLEnum(StatusVisita), nullable=False, default=StatusVisita.PENDENTE)
    
    # QR Code
    qr_code = Column(String(500), nullable=True, unique=True)
    qr_nonce = Column(String(50), nullable=True)
    qr_signature = Column(String(64), nullable=True)
    
    # Timestamps
    data_prevista = Column(DateTime, nullable=True)
    valido_ate = Column(DateTime, nullable=True)
    
    data_entrada = Column(DateTime, nullable=True)
    data_saida = Column(DateTime, nullable=True)
    duracao_minutos = Column(Integer, nullable=True)
    
    # Authorization
    autorizado_em = Column(DateTime, nullable=True)
    metodo_autorizacao = Column(String(50), nullable=True)  # push, whatsapp, sms, telefone, auto
    
    # Observations
    motivo = Column(String(255), nullable=True)
    observacoes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Visita {self.id} - Status: {self.status}>"
