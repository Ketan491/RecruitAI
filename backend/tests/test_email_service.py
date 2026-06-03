# tests/test_email_service.py
"""Tests for async email service (aiosmtplib-backed)."""

from unittest.mock import AsyncMock, patch

import pytest


@pytest.mark.anyio
async def test_send_email_calls_aiosmtplib():
    """send_email must use aiosmtplib.send, not smtplib."""
    with (
        patch("backend.services.email_service.settings") as mock_settings,
        patch("aiosmtplib.send", new_callable=AsyncMock) as mock_send,
    ):
        mock_settings.SMTP_HOST = "smtp.example.com"
        mock_settings.SMTP_PORT = 587
        mock_settings.SMTP_FROM = "no-reply@recruitai.com"
        mock_settings.SMTP_USER = "user"
        mock_settings.SMTP_PASSWORD = "pass"
        mock_settings.SMTP_TLS = True

        from backend.services.email_service import send_email

        result = await send_email("candidate@example.com", "Test Subject", "<p>Hello</p>")

    assert result is True
    mock_send.assert_called_once()
    _, kwargs = mock_send.call_args
    assert kwargs["hostname"] == "smtp.example.com"
    assert kwargs["start_tls"] is True


@pytest.mark.anyio
async def test_send_email_skips_when_unconfigured():
    """If SMTP_HOST is empty, send_email must skip gracefully and return False."""
    with patch("backend.services.email_service.settings") as mock_settings:
        mock_settings.SMTP_HOST = ""

        from backend.services.email_service import send_email

        result = await send_email("a@b.com", "Subject", "<p>body</p>")

    assert result is False


@pytest.mark.anyio
async def test_send_email_returns_false_on_smtp_error():
    """SMTP errors must be caught; send_email must return False (non-fatal)."""
    with (
        patch("backend.services.email_service.settings") as mock_settings,
        patch(
            "aiosmtplib.send", new_callable=AsyncMock, side_effect=Exception("Connection refused")
        ),
    ):
        mock_settings.SMTP_HOST = "smtp.example.com"
        mock_settings.SMTP_PORT = 587
        mock_settings.SMTP_FROM = "no-reply@recruitai.com"
        mock_settings.SMTP_USER = ""
        mock_settings.SMTP_PASSWORD = ""
        mock_settings.SMTP_TLS = False

        from backend.services.email_service import send_email

        result = await send_email("a@b.com", "Subject", "<p>body</p>")

    assert result is False


def test_password_reset_html_contains_link():
    from backend.services.email_service import password_reset_html

    html = password_reset_html("Alice", "https://app.recruitai.com/reset?token=abc")
    assert "https://app.recruitai.com/reset?token=abc" in html
    assert "Alice" in html
