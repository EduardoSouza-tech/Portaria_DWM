"""Correspondências (mail/packages) endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

from app.core.database import get_db
from app.models.correspondencia import Correspondencia, TipoCorrespondencia, StatusCorrespondencia

router = APIRouter()


# Schemas
class CorrespondenciaCreate(BaseModel):
    unidade_id: str
    destinatario: str
    tipo: str
    remetente: str | None = None
    descricao: str | None = None
    codigo_rastreio: str | None = None
    recebido_por: str
    observacoes: str | None = None


class CorrespondenciaEntrega(BaseModel):
    entregue_para: str
    assinatura_base64: str | None = None
    entregue_por: str
    observacoes: str | None = None


class CorrespondenciaResponse(BaseModel):
    id: Any
    unidade_id: Any
    destinatario: str
    tipo: str
    remetente: str | None
    descricao: str | None
    codigo_rastreio: str | None
    recebido_por: str
    data_recebimento: datetime
    status: str
    entregue_para: str | None
    data_entrega: datetime | None
    entregue_por: str | None
    morador_notificado: bool
    observacoes: str | None
    
    class Config:
        from_attributes = True
        json_encoders = {
            UUID: lambda v: str(v)
        }


@router.get("", response_model=List[CorrespondenciaResponse])
async def list_correspondencias(
    status_filter: str | None = None,
    unidade_id: str | None = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List mail/packages with optional filters"""
    query = db.query(Correspondencia)
    
    if status_filter:
        query = query.filter(Correspondencia.status == status_filter)
    
    if unidade_id:
        query = query.filter(Correspondencia.unidade_id == unidade_id)
    
    correspondencias = query.order_by(Correspondencia.data_recebimento.desc()).offset(skip).limit(limit).all()
    return correspondencias


@router.post("", response_model=CorrespondenciaResponse, status_code=status.HTTP_201_CREATED)
async def create_correspondencia(data: CorrespondenciaCreate, db: Session = Depends(get_db)):
    """Register new mail/package received"""
    correspondencia = Correspondencia(
        unidade_id=data.unidade_id,
        destinatario=data.destinatario,
        tipo=data.tipo,
        remetente=data.remetente,
        descricao=data.descricao,
        codigo_rastreio=data.codigo_rastreio,
        recebido_por=data.recebido_por,
        observacoes=data.observacoes,
        status=StatusCorrespondencia.AGUARDANDO_RETIRADA
    )
    
    db.add(correspondencia)
    db.commit()
    db.refresh(correspondencia)
    
    return correspondencia


@router.get("/{correspondencia_id}", response_model=CorrespondenciaResponse)
async def get_correspondencia(correspondencia_id: UUID, db: Session = Depends(get_db)):
    """Get mail/package by ID"""
    correspondencia = db.query(Correspondencia).filter(Correspondencia.id == correspondencia_id).first()
    
    if not correspondencia:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Correspondência not found"
        )
    
    return correspondencia


@router.post("/{correspondencia_id}/entregar", response_model=CorrespondenciaResponse)
async def entregar_correspondencia(
    correspondencia_id: UUID,
    data: CorrespondenciaEntrega,
    db: Session = Depends(get_db)
):
    """Register delivery with signature"""
    correspondencia = db.query(Correspondencia).filter(Correspondencia.id == correspondencia_id).first()
    
    if not correspondencia:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Correspondência not found"
        )
    
    if correspondencia.status == StatusCorrespondencia.ENTREGUE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Correspondência já foi entregue"
        )
    
    # Register delivery
    correspondencia.status = StatusCorrespondencia.ENTREGUE
    correspondencia.entregue_para = data.entregue_para
    correspondencia.assinatura_base64 = data.assinatura_base64
    correspondencia.entregue_por = data.entregue_por
    correspondencia.data_entrega = datetime.utcnow()
    
    if data.observacoes:
        correspondencia.observacoes = (correspondencia.observacoes or "") + f"\nEntrega: {data.observacoes}"
    
    db.commit()
    db.refresh(correspondencia)
    
    return correspondencia


@router.get("/aguardando/count")
async def count_aguardando(db: Session = Depends(get_db)):
    """Count pending deliveries"""
    count = db.query(Correspondencia).filter(
        Correspondencia.status == StatusCorrespondencia.AGUARDANDO_RETIRADA
    ).count()
    
    return {"count": count}


@router.get("/aguardando/por-unidade")
async def aguardando_por_unidade(db: Session = Depends(get_db)):
    """List pending deliveries grouped by unit"""
    from sqlalchemy import func
    
    result = db.query(
        Correspondencia.unidade_id,
        func.count(Correspondencia.id).label('total')
    ).filter(
        Correspondencia.status == StatusCorrespondencia.AGUARDANDO_RETIRADA
    ).group_by(
        Correspondencia.unidade_id
    ).all()
    
    return [{"unidade_id": str(r[0]), "total": r[1]} for r in result]


@router.delete("/{correspondencia_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_correspondencia(correspondencia_id: UUID, db: Session = Depends(get_db)):
    """Delete mail/package record"""
    correspondencia = db.query(Correspondencia).filter(Correspondencia.id == correspondencia_id).first()
    
    if not correspondencia:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Correspondência not found"
        )
    
    db.delete(correspondencia)
    db.commit()
    
    return None
