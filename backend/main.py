"""
Portaria Inteligente - Backend API
FastAPI Application
"""
from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session
import time
import logging
from datetime import datetime

from app.core.config import settings
from app.core.database import engine, Base, get_db
from app.api.v1 import api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("🚀 Iniciando Portaria Inteligente API...")
    logger.info(f"📦 Versão: {settings.APP_VERSION}")
    logger.info(f"🔧 Debug mode: {settings.DEBUG}")
    
    # Create tables (em produção, usar Alembic)
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Banco de dados conectado")
    except Exception as e:
        logger.error(f"❌ Erro ao conectar banco: {e}")
    
    yield
    
    # Shutdown
    logger.info("👋 Encerrando aplicação...")


# Initialize FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API REST para Sistema de Portaria Inteligente",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
    redirect_slashes=False
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todas as origens em desenvolvimento
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    return response


# Include API routes
app.include_router(api_router, prefix="/api/v1")


# Root endpoint
@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "timestamp": datetime.utcnow().isoformat(),
        "docs": "/docs",
        "health": "/health"
    }


# Generate test data endpoint
@app.post("/generate-test-data")
async def generate_test_data():
    """Gera dados de teste: 200 moradores, 300 visitantes, 700 correspondências, 100 visitas"""
    try:
        import subprocess
        import sys
        import os
        
        # Pega o diretório do script
        script_path = os.path.join(os.path.dirname(__file__), "generate_test_data.py")
        
        logger.info("🎲 Iniciando geração de dados de teste...")
        
        result = subprocess.run(
            [sys.executable, script_path],
            capture_output=True,
            text=True,
            timeout=120,
            cwd=os.path.dirname(__file__)
        )
        
        if result.returncode == 0:
            logger.info("✅ Dados gerados com sucesso")
            return {
                "success": True,
                "message": "Dados de teste gerados com sucesso!",
                "output": result.stdout,
                "details": {
                    "moradores": 200,
                    "visitantes": 300,
                    "correspondencias": 700,
                    "visitas": 100
                }
            }
        else:
            logger.error(f"❌ Erro ao gerar dados: {result.stderr}")
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "message": "Erro ao gerar dados",
                    "error": result.stderr,
                    "output": result.stdout
                }
            )
    except subprocess.TimeoutExpired:
        logger.error("⏱️ Timeout ao gerar dados")
        return JSONResponse(
            status_code=408,
            content={
                "success": False,
                "message": "Tempo limite excedido ao gerar dados"
            }
        )
    except Exception as e:
        logger.error(f"💥 Exceção ao gerar dados: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": f"Erro inesperado: {str(e)}"
            }
        )


# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected",
        "version": settings.APP_VERSION
    }


# Setup database endpoint (one-time use)
@app.post("/setup-database")
async def setup_database(db: Session = Depends(get_db)):
    """Initialize database with admin user"""
    from app.models.user import User
    from app.core.security import get_password_hash
    
    # Check if admin exists
    existing_admin = db.query(User).filter(User.email == "admin@portaria.com").first()
    if existing_admin:
        return {"message": "Database already initialized", "admin_exists": True}
    
    # Create admin user
    admin_user = User(
        email="admin@portaria.com",
        hashed_password=get_password_hash("admin123"),
        nome="Administrador",
        is_active=True,
        role="admin"
    )
    
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    
    return {
        "message": "✅ Database initialized successfully!",
        "admin_created": True,
        "email": "admin@portaria.com",
        "password": "admin123"
    }


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if settings.DEBUG else "An unexpected error occurred"
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info" if settings.DEBUG else "warning"
    )
