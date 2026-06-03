# tests/conftest.py
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest_asyncio.fixture
async def client():
    """HTTP test client with mocked MongoDB."""
    with (
        patch("backend.database.connection.connect_db", new_callable=AsyncMock),
        patch("backend.database.connection.disconnect_db", new_callable=AsyncMock),
    ):
        from backend.main import app

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            yield ac


@pytest.fixture
def mock_user():
    user = MagicMock()
    user.id = "507f1f77bcf86cd799439011"
    user.name = "Test Recruiter"
    user.email = "test@example.com"
    user.role = "recruiter"
    user.company_name = "Acme Corp"
    user.hashed_password = "$2b$12$placeholder"
    return user
