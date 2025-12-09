"""API v1 routes"""
from fastapi import APIRouter
from app.api.v1.endpoints import auth, moradores, visitantes, visitas, correspondencias, dashboard

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Autenticação"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(moradores.router, prefix="/moradores", tags=["Moradores"])
api_router.include_router(visitantes.router, prefix="/visitantes", tags=["Visitantes"])
api_router.include_router(visitas.router, prefix="/visitas", tags=["Visitas"])
api_router.include_router(correspondencias.router, prefix="/correspondencias", tags=["Correspondências"])
