"""Moradores (residents) endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any
from uuid import UUID

from app.core.database import get_db
from app.models.morador import Morador
from pydantic import BaseModel
from datetime import date

router = APIRouter()


# Schemas
class MoradorCreate(BaseModel):
    nome_completo: str
    cpf: str
    rg: str | None = None
    data_nascimento: date | None = None
    telefone: str | None = None
    email: str | None = None


class MoradorResponse(BaseModel):
    id: Any
    nome_completo: str
    cpf: str
    telefone: str | None
    email: str | None
    is_active: bool
    qr_code_permanente: str | None
    
    class Config:
        from_attributes = True
        json_encoders = {
            UUID: lambda v: str(v)
        }


@router.get("", response_model=List[MoradorResponse])
async def list_moradores(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """List all residents with pagination (default limit: 50)"""
    moradores = db.query(Morador).filter(Morador.is_active == True).offset(skip).limit(limit).all()
    return moradores


@router.post("", response_model=MoradorResponse, status_code=status.HTTP_201_CREATED)
async def create_morador(morador_data: MoradorCreate, db: Session = Depends(get_db)):
    """Create new resident"""
    # Check if CPF already exists
    existing = db.query(Morador).filter(Morador.cpf == morador_data.cpf).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CPF already registered"
        )
    
    # Create morador
    morador = Morador(**morador_data.model_dump())
    db.add(morador)
    db.commit()
    db.refresh(morador)
    
    return morador


@router.get("/{morador_id}", response_model=MoradorResponse)
async def get_morador(morador_id: UUID, db: Session = Depends(get_db)):
    """Get resident by ID"""
    morador = db.query(Morador).filter(Morador.id == morador_id).first()
    
    if not morador:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Morador not found"
        )
    
    return morador


@router.put("/{morador_id}", response_model=MoradorResponse)
async def update_morador(
    morador_id: UUID,
    morador_data: MoradorCreate,
    db: Session = Depends(get_db)
):
    """Update resident"""
    morador = db.query(Morador).filter(Morador.id == morador_id).first()
    
    if not morador:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Morador not found"
        )
    
    # Update fields
    for field, value in morador_data.model_dump(exclude_unset=True).items():
        setattr(morador, field, value)
    
    db.commit()
    db.refresh(morador)
    
    return morador


@router.delete("/{morador_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_morador(morador_id: UUID, db: Session = Depends(get_db)):
    """Soft delete resident (set is_active = False)"""
    morador = db.query(Morador).filter(Morador.id == morador_id).first()
    
    if not morador:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Morador not found"
        )
    
    morador.is_active = False
    db.commit()
    
    return None
