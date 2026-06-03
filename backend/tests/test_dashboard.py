# tests/test_dashboard.py
"""Integration tests for dashboard endpoints using a mocked Motor database."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient


async def _app():
    with (
        patch("backend.database.connection.connect_db", new_callable=AsyncMock),
        patch("backend.database.connection.disconnect_db", new_callable=AsyncMock),
    ):
        from backend.main import app

        return app


def _make_agg_cursor(docs: list[dict]):
    """Return an object that behaves like an AsyncIOMotorCommandCursor."""

    class _FakeCursor:
        def __init__(self, items):
            self._items = iter(items)

        def __aiter__(self):
            return self

        async def __anext__(self):
            try:
                return next(self._items)
            except StopIteration:
                raise StopAsyncIteration from None

    return _FakeCursor(docs)


@pytest.mark.anyio
async def test_stats_requires_auth():
    app = await _app()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/dashboard/stats")
    assert res.status_code == 403  # No Bearer token


@pytest.mark.anyio
async def test_stats_returns_real_deltas():
    """Deltas must reflect actual DB data, not hardcoded values."""
    from backend.auth.jwt import create_access_token
    from backend.models.user import User

    mock_user = MagicMock()
    mock_user.id = "507f1f77bcf86cd799439011"
    mock_user.name = "Test"
    mock_user.email = "t@t.com"
    mock_user.role = "recruiter"
    mock_user.company_name = "Acme"
    mock_user.created_at.isoformat.return_value = "2025-01-01T00:00:00"

    token = create_access_token(
        {
            "sub": str(mock_user.id),
            "email": mock_user.email,
            "name": mock_user.name,
            "role": mock_user.role,
            "company_name": mock_user.company_name,
            "created_at": "2025-01-01T00:00:00",
        }
    )

    # Simulate: 3 Applied, 1 Hired across all time
    all_time_docs = [{"_id": "Applied", "count": 3}, {"_id": "Hired", "count": 1}]
    # This week: 1 Applied
    this_week_docs = [{"_id": "Applied", "count": 1}]
    # Prior two weeks: 2 Applied
    prior_docs = [{"_id": "Applied", "count": 2}]

    call_count = 0

    def fake_aggregate(_pipeline):
        nonlocal call_count
        call_count += 1
        if call_count == 1:
            return _make_agg_cursor(all_time_docs)
        elif call_count == 2:
            return _make_agg_cursor(this_week_docs)
        else:
            return _make_agg_cursor(prior_docs)

    app = await _app()
    with (
        patch.object(User, "get", new_callable=AsyncMock, return_value=mock_user),
        patch("backend.database.connection.get_db") as mock_get_db,
    ):
        mock_col = MagicMock()
        mock_col.aggregate.side_effect = fake_aggregate
        mock_db = MagicMock()
        mock_db.__getitem__ = MagicMock(return_value=mock_col)
        mock_get_db.return_value = mock_db

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            res = await ac.get(
                "/api/v1/dashboard/stats",
                headers={"Authorization": f"Bearer {token}"},
            )

    assert res.status_code == 200
    data = res.json()["data"]
    assert data["total_applicants"] == 4  # 3 Applied + 1 Hired
    assert data["hired"] == 1
    # Deltas must not be the old hardcoded values
    assert data["deltas"]["total_applicants"] != 12
    assert "hired" in data["deltas"]
