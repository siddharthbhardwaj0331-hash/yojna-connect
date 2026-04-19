"""
Yojna AI - Main Application Entry Point
"""

from __future__ import annotations

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routes import users, schemes
from app.routes.chat import router as chat_router
from app.utils.config import settings
from app.utils.logger import setup_logger

# ✅ Logger MUST be here (top pe)
logger = setup_logger(__name__)

# ─── Lifespan ─────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting Yojna AI Backend...")
    yield
    logger.info("🛑 Shutting down...")


# ─── App Init ─────────────────────────────
app = FastAPI(
    title="Yojna AI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ─── BASIC ROUTE ──────────────────────────
@app.get("/")
def home():
    return {"message": "Yojna Connect API is running 🔥"}


# ─── Routers ─────────────────────────────
app.include_router(chat_router)

API_PREFIX = "/api"
app.include_router(users.router, prefix=f"{API_PREFIX}/user", tags=["User"])
app.include_router(schemes.router, prefix=f"{API_PREFIX}/schemes", tags=["Schemes"])


# ─── CORS ─────────────────────────────
def _parse_cors_origins():
    raw = settings.CORS_ORIGINS.strip()
    if raw == "*":
        return ["*"], False
    origins = [o.strip() for o in raw.split(",") if o.strip()]
    return (origins or ["http://localhost:3000"]), True


origins, creds = _parse_cors_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=creds,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Health ─────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok"}


# ─── Static Frontend (optional) ─────────
_static_root = settings.FRONTEND_OUT_DIR

if os.path.isdir(_static_root):
    app.mount("/", StaticFiles(directory=_static_root, html=True), name="frontend")