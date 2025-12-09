"""
Application Configuration
Using Pydantic Settings for environment variables
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os
from pathlib import Path

# Get absolute path to backend directory
BACKEND_DIR = Path(__file__).parent.parent.parent.resolve()
DB_PATH = BACKEND_DIR / "portaria.db"


class Settings(BaseSettings):
    """Application settings"""
    
    # App
    APP_NAME: str = "Portaria Inteligente"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = f"sqlite:///{DB_PATH}"
    
    # Security
    SECRET_KEY: str = "sua-chave-secreta-super-segura-aqui-min-32-caracteres"
    QR_SECRET_KEY: str = "chave-para-assinar-qr-codes-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Storage
    STORAGE_PATH: str = "./storage"
    MAX_FILE_SIZE: int = 10485760  # 10MB
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000,https://portariadwm-production.up.railway.app"
    
    @property
    def get_allowed_origins(self) -> List[str]:
        """Convert ALLOWED_ORIGINS string to list"""
        if self.ALLOWED_ORIGINS == "*":
            return ["*"]
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True
    )


settings = Settings()
