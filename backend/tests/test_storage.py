# tests/test_storage.py
"""Tests for async S3 storage service."""

from unittest.mock import patch

import pytest


@pytest.mark.anyio
async def test_upload_uses_asyncio_to_thread():
    """upload_resume must delegate blocking S3 I/O to asyncio.to_thread."""
    calls = []

    async def fake_to_thread(fn, *args, **kwargs):
        calls.append(fn.__name__)
        return None  # Simulate success

    with (
        patch("asyncio.to_thread", side_effect=fake_to_thread),
        patch("backend.services.storage.settings") as mock_settings,
    ):
        mock_settings.AWS_ACCESS_KEY_ID = "key"
        mock_settings.AWS_SECRET_ACCESS_KEY = "secret"
        mock_settings.AWS_REGION = "us-east-1"
        mock_settings.AWS_S3_BUCKET = "test-bucket"

        from backend.services.storage import upload_resume

        url = await upload_resume(b"%PDF fake", "resume.pdf", "cand-id-001")

    assert "_put_object_sync" in calls, "upload_resume must use asyncio.to_thread for S3 I/O"
    assert "test-bucket" in url
    assert url.startswith("https://")


@pytest.mark.anyio
async def test_upload_returns_s3_url():
    """Returned URL must point to the configured S3 bucket."""

    async def fake_to_thread(fn, *args, **kwargs):
        return None

    with (
        patch("asyncio.to_thread", side_effect=fake_to_thread),
        patch("backend.services.storage.settings") as mock_settings,
    ):
        mock_settings.AWS_ACCESS_KEY_ID = "key"
        mock_settings.AWS_SECRET_ACCESS_KEY = "secret"
        mock_settings.AWS_REGION = "ap-south-1"
        mock_settings.AWS_S3_BUCKET = "my-recruit-bucket"

        from backend.services.storage import upload_resume

        url = await upload_resume(b"PK fake docx", "cv.docx", "cand-id-002")

    assert "my-recruit-bucket" in url
    assert "ap-south-1" in url
    assert "resumes/cand-id-002" in url
