# models/user.py
from datetime import UTC, datetime
from typing import Literal

from beanie import Document, Indexed
from pydantic import EmailStr


class User(Document):
    name: str
    email: Indexed(EmailStr, unique=True)  # type: ignore[valid-type]
    hashed_password: str
    company_name: str
    role: Literal["admin", "recruiter", "viewer"] = "recruiter"
    created_at: datetime = datetime.now(UTC)

    class Settings:
        name = "users"
        # Index defined via Indexed() on the email field above — no Settings.indexes needed
