# tests/test_jwt.py
import pytest
from fastapi import HTTPException

from backend.auth.jwt import (
    create_access_token,
    create_refresh_token,
    create_reset_token,
    decode_access_token,
    decode_refresh_token,
    decode_reset_token,
)


def test_access_token_roundtrip():
    payload = {
        "sub": "abc123",
        "email": "a@b.com",
        "name": "Alice",
        "role": "admin",
        "company_name": "Acme",
        "created_at": "2025-01-01T00:00:00",
    }
    token = create_access_token(payload)
    decoded = decode_access_token(token)
    assert decoded["sub"] == "abc123"
    assert decoded["email"] == "a@b.com"
    assert decoded["type"] == "access"


def test_refresh_token_roundtrip():
    token, jti, expires_at = create_refresh_token("user99")
    assert jti  # JTI must be present
    payload = decode_refresh_token(token)
    assert payload["sub"] == "user99"
    assert payload["jti"] == jti
    assert payload["type"] == "refresh"


def test_refresh_token_has_unique_jti():
    """Each issued refresh token must have a unique JTI for targeted revocation."""
    _, jti1, _ = create_refresh_token("user1")
    _, jti2, _ = create_refresh_token("user1")
    assert jti1 != jti2


def test_reset_token_roundtrip():
    token = create_reset_token("user42")
    user_id = decode_reset_token(token)
    assert user_id == "user42"


def test_invalid_access_token():
    with pytest.raises(HTTPException) as exc:
        decode_access_token("not.a.valid.token")
    assert exc.value.status_code == 401


def test_wrong_token_type():
    """A refresh token must not be accepted as an access token."""
    token, _, _ = create_refresh_token("uid")
    with pytest.raises(HTTPException) as exc:
        decode_access_token(token)
    assert exc.value.status_code == 401
