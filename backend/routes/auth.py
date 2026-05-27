# routes/auth.py — Signup, Login, Profile

from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from models.user import UserCreate, UserLogin, TokenResponse, UserResponse
from middleware.auth import hash_password, verify_password, create_access_token, get_current_user
from config.database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=TokenResponse)
async def signup(data: UserCreate):
    db = get_db()
    # Check duplicate email
    if await db.users.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "name":       data.name,
        "email":      data.email,
        "password":   hash_password(data.password),
        "role":       data.role,
        "avatar":     None,
        "created_at": datetime.utcnow(),
    }
    result = await db.users.insert_one(user_doc)
    user_doc["id"] = str(result.inserted_id)

    token = create_access_token({"sub": data.email, "role": data.role})
    return {
        "access_token": token,
        "user": UserResponse(
            id=user_doc["id"], name=data.name, email=data.email,
            role=data.role, created_at=user_doc["created_at"]
        )
    }

@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    db = get_db()
    user = await db.users.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": data.email, "role": user.get("role")})
    return {
        "access_token": token,
        "user": UserResponse(
            id=str(user["_id"]), name=user["name"],
            email=user["email"], role=user.get("role", "candidate"),
            created_at=user.get("created_at")
        )
    }

@router.get("/me", response_model=UserResponse)
async def me(user=Depends(get_current_user)):
    return UserResponse(
        id=user["id"], name=user["name"], email=user["email"],
        role=user.get("role"), created_at=user.get("created_at")
    )
