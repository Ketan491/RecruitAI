# models/user.py — Pydantic schemas for user data

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "candidate"   # "candidate" or "hr"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    avatar: Optional[str] = None
    created_at: Optional[datetime] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# MongoDB document shape (for reference in comments):
# {
#   "_id": ObjectId,
#   "name": "Arjun Sharma",
#   "email": "arjun@example.com",
#   "password": "<bcrypt_hash>",
#   "role": "candidate",
#   "avatar": null,
#   "created_at": ISODate
# }
