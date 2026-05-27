"""
Auth routes: /api/auth/signup and /api/auth/login
"""
from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime, timedelta
from bson import ObjectId
from app.models.user import UserCreate, UserLogin, TokenResponse, UserResponse
from app.core.security import hash_password, verify_password, create_access_token
from app.core.database import get_db
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def serialize_user(user: dict) -> dict:
    """Convert MongoDB user doc to JSON-serializable dict."""
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user.get("role", "user"),
        "avatar": user.get("avatar"),
        "created_at": user.get("created_at", datetime.utcnow()),
        "skills": user.get("skills", []),
        "resume_uploaded": user.get("resume_uploaded", False)
    }

@router.post("/signup", response_model=TokenResponse, status_code=201)
async def signup(user_data: UserCreate, db=Depends(get_db)):
    """Register a new user account."""
    # Check if email already registered
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered. Please login."
        )
    
    # Hash password and create user doc
    new_user = {
        "name": user_data.name,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "role": user_data.role,
        "avatar": None,
        "created_at": datetime.utcnow(),
        "skills": [],
        "resume_uploaded": False,
        "phone": None,
        "location": None,
        "bio": None
    }
    
    result = await db.users.insert_one(new_user)
    new_user["_id"] = result.inserted_id
    
    # Create JWT token
    token = create_access_token({"sub": str(result.inserted_id)})
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(**serialize_user(new_user))
    )

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db=Depends(get_db)):
    """Login with email and password."""
    user = await db.users.find_one({"email": credentials.email})
    
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    
    token = create_access_token({"sub": str(user["_id"])})
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(**serialize_user(user))
    )

@router.get("/me", response_model=UserResponse)
async def get_me(current_user=Depends(get_current_user)):
    """Get the currently logged-in user's profile."""
    return UserResponse(**serialize_user(current_user))
