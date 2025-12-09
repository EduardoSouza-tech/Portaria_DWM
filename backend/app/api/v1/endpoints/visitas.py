"""Visitas (visits) endpoints with QR Code generation"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any
from uuid import UUID
from datetime import datetime, timedelta
import qrcode
import io
import base64
import json

from app.core.database import get_db
from app.core.security import sign_qr_code_data, generate_nonce, verify_qr_code_signature
from app.models.visita import Visita, StatusVisita, TipoVisita
from app.models.visitante import Visitante
from pydantic import BaseModel

router = APIRouter()


# Schemas
class VisitaCreate(BaseModel):
    visitante_id: str
    unidade_id: str
    tipo: str = "comum"
    motivo: str | None = None
    data_prevista: datetime | None = None
    validade_horas: int = 24  # QR Code válido por 24 horas


class VisitaResponse(BaseModel):
    id: Any
    visitante_id: Any
    unidade_id: Any
    status: str
    tipo: str
    qr_code: str | None
    valido_ate: datetime | None
    data_entrada: datetime | None
    data_saida: datetime | None
    
    class Config:
        from_attributes = True
        json_encoders = {
            UUID: lambda v: str(v)
        }


class QRCodeResponse(BaseModel):
    qr_code_image: str  # Base64 encoded PNG
    qr_code_data: dict
    valido_ate: str


@router.get("", response_model=List[VisitaResponse])
async def list_visitas(
    status_filter: str | None = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """List visits with optional status filter (default limit: 50)"""
    query = db.query(Visita)
    
    if status_filter:
        query = query.filter(Visita.status == status_filter)
    
    visitas = query.order_by(Visita.created_at.desc()).offset(skip).limit(limit).all()
    return visitas


@router.post("", response_model=VisitaResponse, status_code=status.HTTP_201_CREATED)
async def create_visita(visita_data: VisitaCreate, db: Session = Depends(get_db)):
    """Pre-register visit and generate QR Code"""
    # Verify visitor exists
    visitante = db.query(Visitante).filter(Visitante.id == visita_data.visitante_id).first()
    if not visitante:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visitante not found"
        )
    
    # Check blacklist
    if visitante.is_blacklisted:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Visitante bloqueado: {visitante.blacklist_reason}"
        )
    
    # Calculate expiry
    valido_ate = datetime.utcnow() + timedelta(hours=visita_data.validade_horas)
    
    # Generate nonce
    nonce = generate_nonce()
    
    # Create QR Code data
    qr_data = {
        "visitor_id": str(visita_data.visitante_id),
        "unit_id": str(visita_data.unidade_id),
        "valid_until": valido_ate.isoformat(),
        "nonce": nonce
    }
    
    # Sign data
    signature = sign_qr_code_data(qr_data, nonce)
    qr_data["signature"] = signature
    
    # Create visit record
    visita = Visita(
        visitante_id=visita_data.visitante_id,
        unidade_id=visita_data.unidade_id,
        tipo=visita_data.tipo,
        motivo=visita_data.motivo,
        data_prevista=visita_data.data_prevista or datetime.utcnow(),
        valido_ate=valido_ate,
        qr_code=json.dumps(qr_data),
        qr_nonce=nonce,
        qr_signature=signature,
        status=StatusVisita.AUTORIZADA
    )
    
    db.add(visita)
    db.commit()
    db.refresh(visita)
    
    return visita


@router.get("/{visita_id}/qrcode", response_model=QRCodeResponse)
async def get_qr_code(visita_id: UUID, db: Session = Depends(get_db)):
    """Generate QR Code image for visit"""
    visita = db.query(Visita).filter(Visita.id == visita_id).first()
    
    if not visita:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visita not found"
        )
    
    if not visita.qr_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="QR Code not generated for this visit"
        )
    
    # Parse QR Code data - handle both JSON and simple string formats
    try:
        qr_data = json.loads(visita.qr_code)
    except (json.JSONDecodeError, TypeError):
        # Simple string format (from test data) - create proper structure
        qr_data = {
            "visit_id": str(visita.id),
            "visitor_id": str(visita.visitante_id),
            "unit_id": str(visita.unidade_id),
            "qr_code": visita.qr_code,
            "valid_until": visita.valido_ate.isoformat() if visita.valido_ate else None,
            "status": visita.status.value if hasattr(visita.status, 'value') else str(visita.status)
        }
    
    # Generate QR Code image
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(json.dumps(qr_data))
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    img_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    valido_ate_str = visita.valido_ate.isoformat() if visita.valido_ate else datetime.utcnow().isoformat()
    
    return {
        "qr_code_image": f"data:image/png;base64,{img_base64}",
        "qr_code_data": qr_data,
        "valido_ate": valido_ate_str
    }


@router.post("/validate-qr", status_code=status.HTTP_200_OK)
async def validate_qr_code(qr_data: dict, db: Session = Depends(get_db)):
    """Validate QR Code signature and register entry"""
    # Extract data
    visitor_id = qr_data.get("visitor_id")
    unit_id = qr_data.get("unit_id")
    valid_until = qr_data.get("valid_until")
    nonce = qr_data.get("nonce")
    signature = qr_data.get("signature")
    
    if not all([visitor_id, unit_id, valid_until, nonce, signature]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="QR Code inválido: dados incompletos"
        )
    
    # Verify signature
    data_to_verify = {
        "visitor_id": visitor_id,
        "unit_id": unit_id,
        "valid_until": valid_until
    }
    
    if not verify_qr_code_signature(data_to_verify, signature, nonce):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="QR Code FALSIFICADO - Assinatura inválida"
        )
    
    # Check expiry
    valid_until_dt = datetime.fromisoformat(valid_until)
    if datetime.utcnow() > valid_until_dt:
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="QR Code expirado"
        )
    
    # Find visit
    visita = db.query(Visita).filter(
        Visita.qr_nonce == nonce,
        Visita.qr_signature == signature
    ).first()
    
    if not visita:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visita não encontrada"
        )
    
    # Check if already used
    if visita.data_entrada:
        return {
            "status": "already_used",
            "message": "QR Code já utilizado",
            "entrada_em": visita.data_entrada.isoformat()
        }
    
    # Register entry
    visita.data_entrada = datetime.utcnow()
    visita.status = StatusVisita.DENTRO
    db.commit()
    
    return {
        "status": "success",
        "message": "Entrada autorizada",
        "visitante_nome": visita.visitante_id,
        "entrada_em": visita.data_entrada.isoformat()
    }


@router.post("/{visita_id}/saida", status_code=status.HTTP_200_OK)
async def register_saida(visita_id: UUID, db: Session = Depends(get_db)):
    """Register visitor exit"""
    visita = db.query(Visita).filter(Visita.id == visita_id).first()
    
    if not visita:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visita not found"
        )
    
    if not visita.data_entrada:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Visita não possui entrada registrada"
        )
    
    if visita.data_saida:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Saída já registrada"
        )
    
    # Register exit
    visita.data_saida = datetime.utcnow()
    visita.status = StatusVisita.FINALIZADA
    
    # Calculate duration
    duration = (visita.data_saida - visita.data_entrada).total_seconds() / 60
    visita.duracao_minutos = int(duration)
    
    db.commit()
    
    return {
        "status": "success",
        "message": "Saída registrada",
        "duracao_minutos": visita.duracao_minutos
    }


@router.get("/dentro/agora", response_model=List[VisitaResponse])
async def visitors_inside_now(db: Session = Depends(get_db)):
    """Get all visitors currently inside"""
    visitas = db.query(Visita).filter(
        Visita.status == StatusVisita.DENTRO
    ).order_by(Visita.data_entrada.desc()).all()
    
    return visitas
