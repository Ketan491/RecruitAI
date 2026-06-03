# schemas/auth.py
from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    company_name: str
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str
    company_name: str
    created_at: str


class TokenOut(BaseModel):
    access_token: str
    user: UserOut
