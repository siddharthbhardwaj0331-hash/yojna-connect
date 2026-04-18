"""
Configuration Manager
======================
Loads environment variables from the project root `.env` using Pydantic Settings.
"""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Project root: parent of `app/`
_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """Application settings loaded from environment and optional `.env` file."""

    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "yojna_ai"
    # If true, skip MongoDB and use an in-process store (good for demos; not for production).
    USE_MEMORY_DB: bool = False

    GEMINI_API_KEY: str = ""
    # Tried in order until a model accepts requests (Google renames models over time).
    GEMINI_MODEL: str = "gemini-2.0-flash"

    APP_NAME: str = "Yojna AI"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"

    # CORS: comma-separated origins. Default covers local Next.js on common dev ports.
    # Use "*" to allow any origin (credentials disabled automatically in main.py).
    CORS_ORIGINS: str = (
        "http://127.0.0.1:3000,http://localhost:3000,"
        "http://127.0.0.1:3001,http://localhost:3001"
    )

    # Built Next.js static export (`frontend/out`). If the directory exists, FastAPI can serve it.
    FRONTEND_OUT_DIR: str = str(_PROJECT_ROOT / "frontend" / "out")

    model_config = SettingsConfigDict(
        env_file=str(_PROJECT_ROOT / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
