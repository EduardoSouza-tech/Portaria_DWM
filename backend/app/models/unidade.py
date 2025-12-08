"""Unidade (apartment/house) model"""
from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base, GUID


class Unidade(Base):
    __tablename__ = "unidades"
    
    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    condominio_id = Column(GUID, ForeignKey("condominios.id", ondelete="CASCADE"), nullable=False)
    
    numero = Column(String(10), nullable=False)
    bloco = Column(String(10), nullable=True)
    andar = Column(Integer, nullable=True)
    area_m2 = Column(Float, nullable=True)
    
    # Relationships
    # condominio = relationship("Condominio", back_populates="unidades")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        bloco_str = f" Bloco {self.bloco}" if self.bloco else ""
        return f"<Unidade {self.numero}{bloco_str}>"
