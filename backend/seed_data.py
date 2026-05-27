"""
Seed script — creates demo HR and User accounts in MongoDB.
Run with: python seed_data.py

Make sure MongoDB is running and .env is configured first.
"""
import asyncio
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
MONGODB_URL = "mongodb://localhost:27017"
DB_NAME = "recruitment_db"

demo_users = [
    {
        "name": "Priya Sharma (HR)",
        "email": "hr@demo.com",
        "password": pwd_context.hash("password123"),
        "role": "hr",
        "created_at": datetime.utcnow(),
        "skills": [],
        "resume_uploaded": False,
        "avatar": None
    },
    {
        "name": "Ketan Patil",
        "email": "user@demo.com",
        "password": pwd_context.hash("password123"),
        "role": "user",
        "created_at": datetime.utcnow(),
        "skills": ["python", "react", "mongodb", "fastapi", "git", "javascript"],
        "resume_uploaded": True,
        "avatar": None,
        "location": "Mumbai, India",
        "bio": "B.E. Computer Engineering student passionate about AI and web development."
    }
]

async def seed():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    
    print("🌱 Seeding database...")
    
    for user in demo_users:
        existing = await db.users.find_one({"email": user["email"]})
        if existing:
            print(f"  ⚠️  User {user['email']} already exists — skipping.")
            continue
        result = await db.users.insert_one(user)
        print(f"  ✅ Created {user['role']}: {user['email']} (ID: {result.inserted_id})")
    
    print("\n🎉 Done! Demo credentials:")
    print("   HR:   hr@demo.com / password123")
    print("   User: user@demo.com / password123")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed())
