"""
MongoDB connection using Motor (async driver).
Single client instance shared across the app lifetime.
"""
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import HTTPException
from app.core.config import settings

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    """Establish MongoDB connection on app startup."""
    global client, db
    print("🔌 Connecting to MongoDB...")
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DB_NAME]
    # Verify the connection is live before serving traffic
    await client.admin.command("ping")
    print(f"✅ MongoDB connected → {settings.DB_NAME}")


async def close_db():
    """Close connection gracefully on app shutdown."""
    global client
    if client:
        client.close()
        print("🔌 MongoDB connection closed.")


def get_db():
    """
    FastAPI dependency — returns the active DB instance.
    Raises 503 instead of crashing with AttributeError if DB isn't ready.
    """
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database not available. Server may still be starting up.",
        )
    return db
