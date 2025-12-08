"""Visitantes (visitors) endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any
from uuid import UUID

from app.core.database import get_db
from app.models.visitante import Visitante, TipoDocumento
from pydantic import BaseModel

router = APIRouter()


# Schemas
class VisitanteCreate(BaseModel):
    nome_completo: str
    tipo_documento: str = "CPF"
    numero_documento: str
    telefone: str | None = None


class VisitanteResponse(BaseModel):
    id: Any
    nome_completo: str
    tipo_documento: str
    numero_documento: str
    telefone: str | None
    is_blacklisted: bool
    total_visitas: int
    
    class Config:
        from_attributes = True
        json_encoders = {
            UUID: lambda v: str(v)
        }


@router.get("", response_model=List[VisitanteResponse])
async def list_visitantes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all visitors"""
    visitantes = db.query(Visitante).offset(skip).limit(limit).all()
    return visitantes


@router.post("", response_model=VisitanteResponse, status_code=status.HTTP_201_CREATED)
async def create_visitante(visitante_data: VisitanteCreate, db: Session = Depends(get_db)):
    """Create new visitor"""
    visitante = Visitante(**visitante_data.model_dump())
    db.add(visitante)
    db.commit()
    db.refresh(visitante)
    
    return visitante


@router.get("/{visitante_id}", response_model=VisitanteResponse)
async def get_visitante(visitante_id: UUID, db: Session = Depends(get_db)):
    """Get visitor by ID"""
    visitante = db.query(Visitante).filter(Visitante.id == visitante_id).first()
    
    if not visitante:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visitante not found"
        )
    
    return visitante


@router.get("/documento/{numero_documento}", response_model=VisitanteResponse)
async def get_visitante_by_documento(numero_documento: str, db: Session = Depends(get_db)):
    """Search visitor by document number"""
    visitante = db.query(Visitante).filter(
        Visitante.numero_documento == numero_documento
    ).first()
    
    if not visitante:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visitante not found"
        )
    
    return visitante
