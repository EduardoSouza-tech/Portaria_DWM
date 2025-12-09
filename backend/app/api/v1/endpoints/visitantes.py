"""Visitantes (visitors) endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Any, Optional
from uuid import UUID
from datetime import datetime, date

from app.core.database import get_db
from app.models.visitante import Visitante, TipoDocumento
from app.models.visita import Visita
from pydantic import BaseModel

router = APIRouter()


# Schemas
class VisitanteCreate(BaseModel):
    nome_completo: str
    tipo_documento: str = "CPF"
    numero_documento: str
    telefone: str | None = None
    data_visita: datetime | None = None


class VisitanteResponse(BaseModel):
    id: Any
    nome_completo: str
    tipo_documento: str
    numero_documento: str
    telefone: str | None
    is_blacklisted: bool
    total_visitas: int
    proxima_visita: datetime | None = None
    
    class Config:
        from_attributes = True
        json_encoders = {
            UUID: lambda v: str(v)
        }


class VisitanteProgramacaoResponse(BaseModel):
    id: Any
    nome_completo: str
    tipo_documento: str
    numero_documento: str
    telefone: str | None
    data_prevista: datetime | None
    status_visita: str | None
    motivo: str | None
    
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
    # Extrai data_visita do payload
    data_dict = visitante_data.model_dump()
    data_visita = data_dict.pop('data_visita', None)
    
    # Cria visitante
    visitante = Visitante(**data_dict)
    db.add(visitante)
    db.commit()
    db.refresh(visitante)
    
    # Se data_visita foi informada, cria uma visita programada
    if data_visita:
        from app.models.visita import VisitaStatus
        nova_visita = Visita(
            visitante_id=visitante.id,
            data_prevista=data_visita,
            status=VisitaStatus.PENDENTE,
            motivo="Visita programada no cadastro"
        )
        db.add(nova_visita)
        db.commit()
    
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


@router.get("/programacao/data", response_model=List[VisitanteProgramacaoResponse])
async def listar_visitantes_por_data(
    data: Optional[date] = Query(None, description="Data da visita (YYYY-MM-DD). Se não informada, usa data atual."),
    db: Session = Depends(get_db)
):
    """Lista visitantes programados para uma data específica"""
    # Se não informar data, usa hoje
    if data is None:
        data = date.today()
    
    # Busca visitas do dia com informações do visitante
    inicio_dia = datetime.combine(data, datetime.min.time())
    fim_dia = datetime.combine(data, datetime.max.time())
    
    visitas = db.query(
        Visitante.id,
        Visitante.nome_completo,
        Visitante.tipo_documento,
        Visitante.numero_documento,
        Visitante.telefone,
        Visita.data_prevista,
        Visita.status.label('status_visita'),
        Visita.motivo
    ).join(
        Visita, Visitante.id == Visita.visitante_id
    ).filter(
        Visita.data_prevista >= inicio_dia,
        Visita.data_prevista <= fim_dia
    ).order_by(
        Visita.data_prevista
    ).all()
    
    return [
        {
            "id": str(v.id),
            "nome_completo": v.nome_completo,
            "tipo_documento": v.tipo_documento,
            "numero_documento": v.numero_documento,
            "telefone": v.telefone,
            "data_prevista": v.data_prevista,
            "status_visita": v.status_visita,
            "motivo": v.motivo
        }
        for v in visitas
    ]
