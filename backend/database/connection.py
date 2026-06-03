# database/connection.py
import logging

from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from ..config import settings
from .indexes import create_indexes

logger = logging.getLogger(__name__)

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


def get_db() -> AsyncIOMotorDatabase:
    """Return the active Motor database. Raises if not connected."""
    if _db is None:
        raise RuntimeError("Database not connected. Call connect_db() first.")
    return _db


async def connect_db() -> None:
    global _client, _db
    _client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=5000)
    _db = _client[settings.DB_NAME]

    from ..models.candidate import CandidateDoc
    from ..models.job import JobDoc
    from ..models.user import User

    await init_beanie(database=_db, document_models=[User, CandidateDoc, JobDoc])
    await create_indexes(_db)
    logger.info("MongoDB connected and indexes ready ✓")


async def disconnect_db() -> None:
    global _client, _db
    if _client:
        _client.close()
        _db = None
        logger.info("MongoDB disconnected")
