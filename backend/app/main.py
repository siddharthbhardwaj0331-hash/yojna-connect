"""
Yojna AI - Main Application Entry Point
========================================
This is the heart of the FastAPI application.
It initializes the app, sets up CORS, registers routes,
and connects to MongoDB on startup.
"""
from __future__ import annotations
from app.routes.chat import router as chat_router

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database.mongodb import connect_to_mongo, close_mongo_connection, seed_schemes
from app.routes import users, schemes
from app.utils.config import settings
from app.utils.logger import setup_logger
from app.routes.chat import router as chat_router

logger = setup_logger(__name__)


def _parse_cors_origins() -> tuple[list[str], bool]:
    """
    Returns (allow_origins, allow_credentials).
    Browsers reject allow_credentials=True with allow_origins=['*']; we normalize that.
    """
    raw = settings.CORS_ORIGINS.strip()
    if raw == "*":
        return ["*"], False
    origins = [o.strip() for o in raw.split(",") if o.strip()]
    return (origins or ["http://127.0.0.1:3000", "http://localhost:3000"]), True

@app.get("/")
def home():
    return {"message": "Yojna Connect API is running 🔥"}


# ─── Lifespan: Startup & Shutdown ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles startup and shutdown events.
    - On startup: connect to MongoDB and seed initial scheme data.
    - On shutdown: close the MongoDB connection cleanly.
    """
    logger.info("🚀 Starting Yojna AI Backend...")
    await connect_to_mongo()
    await seed_schemes()          # Seed sample government schemes if not present
    logger.info("✅ Database connected and seeded successfully.")
    yield                          # App runs here
    logger.info("🛑 Shutting down Yojna AI Backend...")
    await close_mongo_connection()


# ─── FastAPI App Initialization ────────────────────────────────────────────────
app = FastAPI(
    title="Yojna AI",
    description="AI-powered Indian Government Scheme Recommendation System",
    version="1.0.0",
    docs_url="/docs",          # Swagger UI at /docs
    redoc_url="/redoc",        # ReDoc UI at /redoc
    lifespan=lifespan,
)

app.include_router(chat_router)


# ─── CORS Middleware ───────────────────────────────────────────────────────────
_cors_origins, _cors_credentials = _parse_cors_origins()
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=_cors_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API lives under /api so the SPA (mounted at /) never shadows /docs or /openapi.json
API_PREFIX = "/api"
app.include_router(users.router, prefix=f"{API_PREFIX}/user", tags=["User"])
app.include_router(schemes.router, prefix=f"{API_PREFIX}/schemes", tags=["Schemes"])


# ─── Health & API info (always available even when static SPA is mounted) ─────
@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check endpoint."""
    return {"status": "ok", "service": "Yojna AI", "version": "1.0.0"}


@app.get("/api", tags=["Health"])
async def api_info():
    """JSON status when the API is reachable (useful when not serving the SPA at /)."""
    return {
        "message": "Yojna AI API is running",
        "docs": "/docs",
        "status": "healthy",
    }


# ─── Optional: serve Next.js static export (`npm run build` in `frontend/`) ────
_static_root = settings.FRONTEND_OUT_DIR
if os.path.isdir(_static_root):
    logger.info("Serving built frontend from %s", _static_root)
    app.mount("/", StaticFiles(directory=_static_root, html=True), name="frontend")
else:

    @app.get("/", tags=["Health"])
    async def root():
        """Fallback when frontend/out is missing — API-only mode."""
        return {
            "message": "Yojna AI API is running (build the frontend to serve UI at /).",
            "docs": "/docs",
            "api": "/api",
            "hint": "cd frontend && npm install && npm run build",
            "status": "healthy",
        }
