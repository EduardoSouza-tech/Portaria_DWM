"""
Portaria Inteligente - Backend API
FastAPI Application
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import time
import logging
from datetime import datetime
from pathlib import Path

from app.core.config import settings
from app.core.database import engine, Base
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
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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

# Servir arquivos estáticos do frontend (React build)
static_path = Path(__file__).parent / "static"
if static_path.exists():
    app.mount("/assets", StaticFiles(directory=str(static_path / "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve o frontend React para todas as rotas não-API"""
        # Se for uma rota da API, não servir o frontend
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("redoc"):
            return JSONResponse({"detail": "Not Found"}, status_code=404)
        
        # Tentar servir o arquivo solicitado
        file_path = static_path / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        
        # Caso contrário, servir o index.html (SPA routing)
        return FileResponse(static_path / "index.html")


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


# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected",
        "version": settings.APP_VERSION
    }


# Test data generator endpoint
@app.post("/generate-test-data")
async def generate_test_data():
    """Generate test data for development"""
    from app.core.database import SessionLocal
    from app.models.condominio import Condominio
    from app.models.unidade import Unidade
    from app.models.morador import Morador
    from app.models.visitante import Visitante
    from app.models.correspondencia import Correspondencia, TipoCorrespondencia, StatusCorrespondencia
    from uuid import uuid4
    
    db = SessionLocal()
    try:
        # Create or get test condominium
        condominio = db.query(Condominio).first()
        if not condominio:
            condominio = Condominio(
                id=uuid4(),
                nome="Condomínio Teste",
                cnpj="00000000000000",
                endereco="Rua Teste, 123",
                cidade="São Paulo",
                estado="SP",
                cep="00000000",
                total_unidades=15,
                total_blocos=3,
                telefone="(11) 0000-0000",
                email="contato@teste.com"
            )
            db.add(condominio)
            db.commit()
            db.refresh(condominio)
        
        # Create test units
        units_created = 0
        for bloco in ['A', 'B', 'C']:
            for numero in range(101, 106):
                unidade_id = f"{bloco}{numero}"
                exists = db.query(Unidade).filter(Unidade.numero == unidade_id).first()
                if not exists:
                    unidade = Unidade(
                        id=uuid4(),
                        condominio_id=condominio.id,
                        numero=unidade_id,
                        bloco=bloco,
                        andar=int(str(numero)[0])
                    )
                    db.add(unidade)
                    units_created += 1
        
        db.commit()
        
        # Create test residents
        unidades = db.query(Unidade).limit(5).all()
        residents_created = 0
        for i, unidade in enumerate(unidades):
            exists = db.query(Morador).filter(Morador.unidade_id == unidade.id).first()
            if not exists:
                morador = Morador(
                    id=uuid4(),
                    nome=f"Morador Teste {i+1}",
                    cpf=f"000.000.00{i:02d}-00",
                    telefone=f"(11) 9999-{i:04d}",
                    email=f"morador{i+1}@teste.com",
                    unidade_id=unidade.id,
                    tipo="PROPRIETARIO" if i % 2 == 0 else "INQUILINO"
                )
                db.add(morador)
                residents_created += 1
        
        db.commit()
        
        return {
            "success": True,
            "message": "Dados de teste gerados com sucesso",
            "data": {
                "condominium_created": condominio.nome,
                "units_created": units_created,
                "residents_created": residents_created
            }
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao gerar dados de teste: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e)
            }
        )
    finally:
        db.close()


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
