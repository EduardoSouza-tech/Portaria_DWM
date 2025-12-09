"""Dashboard statistics endpoint - optimized for performance"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from datetime import datetime, date

from app.core.database import get_db
from app.models.morador import Morador
from app.models.visitante import Visitante
from app.models.visita import Visita
from app.models.correspondencia import Correspondencia, StatusCorrespondencia
from pydantic import BaseModel

router = APIRouter()


class DashboardStats(BaseModel):
    total_moradores: int
    total_visitantes: int
    visitantes_hoje: int
    visitas_dentro: int
    correspondencias_aguardando: int


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Get all dashboard statistics in a single optimized query.
    Returns counts instead of loading all records.
    """
    hoje = date.today()
    
    # Count moradores ativos
    total_moradores = db.query(func.count(Morador.id)).filter(
        Morador.is_active == True
    ).scalar() or 0
    
    # Count visitantes total
    total_visitantes = db.query(func.count(Visitante.id)).scalar() or 0
    
    # Count visitantes programados para hoje
    visitantes_hoje = db.query(func.count(Visita.id)).filter(
        func.date(Visita.data_prevista) == hoje
    ).scalar() or 0
    
    # Count visitas com status DENTRO
    visitas_dentro = db.query(func.count(Visita.id)).filter(
        Visita.status == "DENTRO"
    ).scalar() or 0
    
    # Count correspondências aguardando retirada
    correspondencias_aguardando = db.query(func.count(Correspondencia.id)).filter(
        Correspondencia.status == StatusCorrespondencia.AGUARDANDO_RETIRADA
    ).scalar() or 0
    
    return DashboardStats(
        total_moradores=total_moradores,
        total_visitantes=total_visitantes,
        visitantes_hoje=visitantes_hoje,
        visitas_dentro=visitas_dentro,
        correspondencias_aguardando=correspondencias_aguardando
    )
