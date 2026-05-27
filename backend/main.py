# main.py — FastAPI entry point
# Run: uvicorn main:app --reload

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from config.database import connect_db, close_db
from routes import auth, resume, ats, recommendations, interview, hr

load_dotenv()

# ── Lifespan (replaces deprecated @app.on_event) ─────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()   # startup
    yield
    await close_db()     # shutdown

app = FastAPI(
    title="AI Smart Recruitment Platform",
    description="Resume parsing, ATS scoring, interview analysis & more",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:5173"),
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────────
app.include_router(auth.router,            prefix="/api")
app.include_router(resume.router,          prefix="/api")
app.include_router(ats.router,             prefix="/api")
app.include_router(recommendations.router, prefix="/api")
app.include_router(interview.router,       prefix="/api")
app.include_router(hr.router,              prefix="/api")

@app.get("/")
def root():
    return {"message": "AI Smart Recruitment API is running 🚀"}

@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0"}
