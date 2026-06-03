# api/v1/router.py
from fastapi import APIRouter

from .routes.ai import router as ai_router
from .routes.auth import router as auth_router
from .routes.candidates import router as candidates_router
from .routes.dashboard import router as dashboard_router
from .routes.jobs import router as jobs_router
from .routes.pipeline import router as pipeline_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(auth_router)
api_v1_router.include_router(candidates_router)
api_v1_router.include_router(jobs_router)
api_v1_router.include_router(pipeline_router)
api_v1_router.include_router(dashboard_router)
api_v1_router.include_router(ai_router)
