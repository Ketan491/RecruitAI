# tests/test_token_revocation.py
"""Integration tests for refresh token revocation (logout + blocklist)."""

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


@pytest.mark.anyio
async def test_revoke_and_check():
    """A revoked JTI must be detected as revoked."""
    expires_at = datetime.now(UTC) + timedelta(days=7)

    mock_col = MagicMock()
    mock_col.insert_one = AsyncMock(return_value=None)
    mock_col.find_one = AsyncMock(return_value={"jti": "test-jti-123"})

    mock_db = MagicMock()
    mock_db.__getitem__ = MagicMock(return_value=mock_col)

    with patch("backend.auth.token_blocklist.get_db", return_value=mock_db):
        from backend.auth.token_blocklist import is_revoked, revoke_token

        await revoke_token("test-jti-123", expires_at)
        mock_col.insert_one.assert_called_once()
        result = await is_revoked("test-jti-123")
        assert result is True


@pytest.mark.anyio
async def test_not_revoked_jti():
    """A JTI that was never revoked must not be flagged."""
    mock_col = MagicMock()
    mock_col.find_one = AsyncMock(return_value=None)

    mock_db = MagicMock()
    mock_db.__getitem__ = MagicMock(return_value=mock_col)

    with patch("backend.auth.token_blocklist.get_db", return_value=mock_db):
        from backend.auth.token_blocklist import is_revoked

        result = await is_revoked("never-seen-jti")
        assert result is False


@pytest.mark.anyio
async def test_refresh_token_has_jti():
    """Every issued refresh token must carry a non-empty JTI."""
    from backend.auth.jwt import create_refresh_token, decode_refresh_token

    token, jti, expires_at = create_refresh_token("user-abc")
    assert jti, "JTI must not be empty"
    payload = decode_refresh_token(token)
    assert payload["jti"] == jti
    assert expires_at > datetime.now(UTC)


@pytest.mark.anyio
async def test_each_refresh_token_has_unique_jti():
    """Two tokens for the same user must have different JTIs."""
    from backend.auth.jwt import create_refresh_token

    _, jti1, _ = create_refresh_token("user-x")
    _, jti2, _ = create_refresh_token("user-x")
    assert jti1 != jti2, "JTIs must be unique per token issuance"
