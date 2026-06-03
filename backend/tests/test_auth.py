# tests/test_auth.py
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient


async def _make_client():
    """Create test client with all DB calls mocked."""
    with (
        patch("backend.database.connection.connect_db", new_callable=AsyncMock),
        patch("backend.database.connection.disconnect_db", new_callable=AsyncMock),
    ):
        from backend.main import app

        return app


@pytest.mark.anyio
async def test_register_missing_fields():
    app = await _make_client()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/v1/auth/register", json={})
    assert res.status_code == 422


@pytest.mark.anyio
async def test_register_duplicate_email():
    """Registering with an existing email must return 400."""
    from backend.models.user import User

    existing_user = MagicMock()
    existing_user.email = "exists@example.com"

    app = await _make_client()
    with patch.object(User, "find_one", new_callable=AsyncMock, return_value=existing_user):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            res = await ac.post(
                "/api/v1/auth/register",
                json={
                    "name": "Test",
                    "email": "exists@example.com",
                    "company_name": "Acme",
                    "password": "Password1",
                },
            )
    assert res.status_code == 400
    assert "already registered" in res.json()["message"]


@pytest.mark.anyio
async def test_login_invalid_credentials():
    from backend.models.user import User

    app = await _make_client()
    with patch.object(User, "find_one", new_callable=AsyncMock, return_value=None):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            res = await ac.post(
                "/api/v1/auth/login", json={"email": "x@x.com", "password": "wrong"}
            )
    assert res.status_code == 401
    assert res.json()["success"] is False


@pytest.mark.anyio
async def test_forgot_password_always_200():
    """Forgot password must always return 200 to prevent email enumeration."""
    from backend.models.user import User

    app = await _make_client()
    with patch.object(User, "find_one", new_callable=AsyncMock, return_value=None):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            res = await ac.post(
                "/api/v1/auth/forgot-password", json={"email": "nobody@example.com"}
            )
    assert res.status_code == 200
    assert res.json()["success"] is True


@pytest.mark.anyio
async def test_refresh_no_cookie():
    app = await _make_client()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/v1/auth/refresh")
    assert res.status_code == 401


@pytest.mark.anyio
async def test_logout_clears_cookie():
    app = await _make_client()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/v1/auth/logout")
    assert res.status_code == 200
    assert res.json()["success"] is True
