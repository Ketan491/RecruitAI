# config/database.py — MongoDB async connection via Motor

import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME   = "recruitment_db"

client = None
db     = None

async def connect_db():
    global client, db
    try:
        client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000)
        # Verify connection is reachable
        await client.admin.command("ping")
        db = client[DB_NAME]
        print(f"✅ MongoDB connected: {DB_NAME}")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        print("   Check your MONGO_URL in .env and make sure MongoDB is running.")
        sys.exit(1)

async def close_db():
    global client
    if client:
        client.close()
        print("🔌 MongoDB connection closed")

def get_db():
    if db is None:
        raise RuntimeError("Database not connected. Did startup run?")
    return db
