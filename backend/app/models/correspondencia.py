"""Correspondência (mail/package) model"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Text, Enum as SQLEnum
from datetime import datetime
import uuid
import enum

from app.core.database import Base, GUID


class TipoCorrespondencia(str, enum.Enum):
    CARTA = "carta"
    ENVELOPE = "envelope"
    CAIXA_PEQUENA = "caixa_pequena"
    CAIXA_MEDIA = "caixa_media"
    CAIXA_GRANDE = "caixa_grande"
    SEDEX = "sedex"
    TELEGRAMA = "telegrama"
    NOTIFICACAO = "notificacao"


class StatusCorrespondencia(str, enum.Enum):
    AGUARDANDO_RETIRADA = "aguardando_retirada"
    ENTREGUE = "entregue"
    DEVOLVIDA = "devolvida"
    NAO_RETIRADA = "nao_retirada"


class Correspondencia(Base):
    __tablename__ = "correspondencias"
    
    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    
    # Destinatário
    unidade_id = Column(GUID, ForeignKey("unidades.id"), nullable=False)
    destinatario = Column(String(255), nullable=False)  # Nome na correspondência
    
    # Detalhes da correspondência
    tipo = Column(SQLEnum(TipoCorrespondencia), nullable=False)
    remetente = Column(String(255), nullable=True)
    descricao = Column(Text, nullable=True)
    codigo_rastreio = Column(String(100), nullable=True)
    
    # Recebimento na portaria
    recebido_por = Column(String(255), nullable=False)  # Nome do porteiro
    data_recebimento = Column(DateTime, default=datetime.utcnow, nullable=False)
    foto_url = Column(String(500), nullable=True)  # Foto da correspondência
    
    # Entrega ao destinatário
    status = Column(SQLEnum(StatusCorrespondencia), default=StatusCorrespondencia.AGUARDANDO_RETIRADA)
    entregue_para = Column(String(255), nullable=True)  # Quem retirou
    assinatura_base64 = Column(Text, nullable=True)  # Assinatura digital
    data_entrega = Column(DateTime, nullable=True)
    entregue_por = Column(String(255), nullable=True)  # Porteiro que entregou
    
    # Notificação
    morador_notificado = Column(Boolean, default=False)
    data_notificacao = Column(DateTime, nullable=True)
    
    # Observações
    observacoes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Correspondencia {self.tipo.value} para {self.destinatario} - {self.status.value}>"
