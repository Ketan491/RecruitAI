# tests/test_candidates_integration.py
"""Integration tests for candidate list/search endpoint."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient


def _make_token(user_id: str = "507f1f77bcf86cd799439011") -> str:
    from backend.auth.jwt import create_access_token

    return create_access_token(
        {
            "sub": user_id,
            "email": "t@t.com",
            "name": "Test",
            "role": "recruiter",
            "company_name": "Acme",
            "created_at": "2025-01-01T00:00:00",
        }
    )


async def _app():
    with (
        patch("backend.database.connection.connect_db", new_callable=AsyncMock),
        patch("backend.database.connection.disconnect_db", new_callable=AsyncMock),
    ):
        from backend.main import app

        return app


@pytest.mark.anyio
async def test_list_candidates_requires_auth():
    app = await _app()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/candidates/")
    assert res.status_code == 403


@pytest.mark.anyio
async def test_search_uses_text_not_regex():
    """Searching should build a $text query, not a $regex query."""
    from backend.models.candidate import CandidateDoc
    from backend.models.user import User

    mock_user = MagicMock()
    mock_user.id = "507f1f77bcf86cd799439011"

    captured_queries: list = []

    class FakeQuery:
        def find(self, q):
            captured_queries.append(q)
            return self

        def skip(self, n):
            return self

        def limit(self, n):
            return self

        def sort(self, *a, **kw):
            return self

        def __aiter__(self):
            return iter([])

        async def count(self):
            return 0

        def __await__(self):
            async def _():
                return self

            return _().__await__()

    app = await _app()
    with (
        patch.object(User, "get", new_callable=AsyncMock, return_value=mock_user),
        patch.object(CandidateDoc, "find", return_value=FakeQuery()),
    ):
        token = _make_token()
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            await ac.get(
                "/api/v1/candidates/?search=alice",
                headers={"Authorization": f"Bearer {token}"},
            )

    text_queries = [q for q in captured_queries if "$text" in q]
    regex_queries = [q for q in captured_queries if "$regex" in str(q)]
    assert text_queries, "Expected a $text query but none was issued"
    assert not regex_queries, "Unexpected $regex query — should be using $text index"
    assert text_queries[0]["$text"]["$search"] == "alice"
