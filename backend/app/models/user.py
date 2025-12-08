"""User model for authentication"""
from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum
from datetime import datetime
import uuid
import enum

from app.core.database import Base, GUID


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    PORTEIRO = "porteiro"
    MORADOR = "morador"
    SINDICO = "sindico"


class User(Base):
    __tablename__ = "usuarios"
    
    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    nome = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.MORADOR)
    
    is_active = Column(Boolean, default=True)
    mfa_enabled = Column(Boolean, default=False)
    mfa_secret = Column(String(32), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    def __repr__(self):
        return f"<User {self.email} ({self.role})>"
