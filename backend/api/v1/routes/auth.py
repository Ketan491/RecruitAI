# api/v1/routes/auth.py
from datetime import UTC

from fastapi import APIRouter, HTTPException, Request, Response
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from slowapi import Limiter
from slowapi.util import get_remote_address

from ....auth.jwt import (
    create_access_token,
    create_refresh_token,
    create_reset_token,
    decode_refresh_token,
    decode_reset_token,
)
from ....auth.token_blocklist import is_revoked, revoke_token
from ....config import settings
from ....models.user import User
from ....schemas.auth import LoginRequest, RegisterRequest, TokenOut, UserOut
from ....services.email_service import password_reset_html, send_email

_limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/auth", tags=["auth"])
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

COOKIE_OPTS = {
    "key": "refresh_token",
    "httponly": True,
    "secure": settings.is_production,
    # FIX 10: "strict" blocks cookies on cross-origin requests in development
    # (frontend :5173 → backend :8000 are different origins).
    # Use "lax" in dev so the httpOnly refresh cookie is actually sent.
    # In production both are on the same domain so "strict" works, but "lax" is fine there too.
    "samesite": "lax",
    "path": "/api/v1/auth",
    "max_age": settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
}


def _user_out(user: User) -> UserOut:
    return UserOut(
        id=str(user.id),
        name=user.name,
        email=user.email,
        role=user.role,
        company_name=user.company_name,
        created_at=user.created_at.isoformat(),
    )


def _token_payload(user: User) -> dict:
    return {
        "sub": str(user.id),
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "company_name": user.company_name,
        "created_at": user.created_at.isoformat(),
    }


@router.post("/register", status_code=201)
async def register(body: RegisterRequest):
    existing = await User.find_one({"email": body.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    user = User(
        name=body.name,
        email=body.email,
        company_name=body.company_name,
        hashed_password=pwd_ctx.hash(body.password),
    )
    await user.insert()
    return {"success": True, "data": {"user": _user_out(user)}}


@router.post("/login")
@_limiter.limit("10/minute")
async def login(request: Request, body: LoginRequest, response: Response):
    user = await User.find_one({"email": body.email})
    if not user or not pwd_ctx.verify(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(_token_payload(user))
    refresh_token, _jti, _exp = create_refresh_token(str(user.id))
    response.set_cookie(value=refresh_token, **COOKIE_OPTS)
    return {"success": True, "data": TokenOut(access_token=access_token, user=_user_out(user))}


@router.post("/refresh")
async def refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")

    payload = decode_refresh_token(token)
    jti = payload.get("jti")

    # Reject if this token has been explicitly revoked (e.g. after logout)
    if jti and await is_revoked(jti):
        raise HTTPException(status_code=401, detail="Token has been revoked")

    user_id = payload["sub"]
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    # Rotate: revoke the old token, issue a fresh pair
    if jti:
        from datetime import datetime

        from jose import jwt as _jwt

        try:
            raw = _jwt.decode(
                token, settings.JWT_REFRESH_SECRET, algorithms=[settings.JWT_ALGORITHM]
            )
            exp_ts = raw.get("exp", 0)
            expires_at = datetime.fromtimestamp(exp_ts, tz=UTC)
            await revoke_token(jti, expires_at)
        except Exception:
            pass  # If decode fails here it was already rejected above

    access_token = create_access_token(_token_payload(user))
    new_refresh, _new_jti, _new_exp = create_refresh_token(str(user.id))
    response.set_cookie(value=new_refresh, **COOKIE_OPTS)
    return {"success": True, "data": {"access_token": access_token}}


@router.post("/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if token:
        try:
            from datetime import datetime

            payload = decode_refresh_token(token)
            jti = payload.get("jti")
            if jti:
                from jose import jwt as _jwt

                raw = _jwt.decode(
                    token, settings.JWT_REFRESH_SECRET, algorithms=[settings.JWT_ALGORITHM]
                )
                exp_ts = raw.get("exp", 0)
                expires_at = datetime.fromtimestamp(exp_ts, tz=UTC)
                await revoke_token(jti, expires_at)
        except Exception:
            pass  # Token already invalid; still clear cookie
    response.delete_cookie("refresh_token", path="/api/v1/auth")
    return {"success": True, "data": None}


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


@router.post("/forgot-password")
@_limiter.limit("5/minute")
async def forgot_password(request: Request, body: ForgotPasswordRequest):
    # Always return 200 to prevent email enumeration
    user = await User.find_one({"email": body.email})
    if user:
        token = create_reset_token(str(user.id))
        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        await send_email(
            to=user.email,
            subject="Reset your RecruitAI password",
            html_body=password_reset_html(user.name, reset_link),
        )
    return {
        "success": True,
        "data": {"message": "If that email exists, a reset link has been sent."},
    }


class ResetPasswordRequest(BaseModel):
    token: str
    password: str


@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest):
    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    user_id = decode_reset_token(body.token)
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid reset token")
    user.hashed_password = pwd_ctx.hash(body.password)
    await user.save()
    return {"success": True, "data": {"message": "Password reset successfully"}}
