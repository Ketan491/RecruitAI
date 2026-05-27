"""
Main FastAPI application — entry point.
Uses lifespan context manager (modern approach, no DeprecationWarnings).
"""
from contextlib import asynccontextmanager
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import connect_db, close_db
from app.routes.auth            import router as auth_router
from app.routes.resume          import router as resume_router
from app.routes.ats             import router as ats_router
from app.routes.recommendations import router as rec_router
from app.routes.interview       import router as interview_router
from app.routes.hr              import router as hr_router
from app.routes.users           import router as users_router
from app.routes.jobs            import router as jobs_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run startup tasks, yield (serve requests), then run shutdown tasks."""
    # Ensure uploads dir exists before mounting static files
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="RecruitAI API",
    description="AI-powered resume analysis, ATS scoring, and interview feedback.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(resume_router)
app.include_router(ats_router)
app.include_router(rec_router)
app.include_router(interview_router)
app.include_router(hr_router)
app.include_router(users_router)
app.include_router(jobs_router)

# Ensure directory exists before mounting (so importing this module doesn't crash)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


@app.get("/", tags=["Health"])
async def root():
    return {"status": "running", "message": "RecruitAI API 🚀", "docs": "/docs"}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy", "version": "1.0.0"}
