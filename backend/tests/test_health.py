# tests/test_health.py
from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient


@pytest.mark.anyio
async def test_health_endpoint():
    with (
        patch("backend.database.connection.connect_db", new_callable=AsyncMock),
        patch("backend.database.connection.disconnect_db", new_callable=AsyncMock),
    ):
        from backend.main import app

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data


@pytest.mark.anyio
async def test_404_returns_json():
    with (
        patch("backend.database.connection.connect_db", new_callable=AsyncMock),
        patch("backend.database.connection.disconnect_db", new_callable=AsyncMock),
    ):
        from backend.main import app

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.get("/api/v1/nonexistent")
    assert response.status_code == 404
    body = response.json()
    assert "success" in body
    assert body["success"] is False
