# services/storage.py
import asyncio
import logging
import uuid

import boto3
from botocore.exceptions import ClientError

from ..config import settings

logger = logging.getLogger(__name__)


def _get_s3_client():
    return boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )


def _put_object_sync(key: str, content: bytes, content_type: str) -> None:
    """Blocking S3 upload — called via asyncio.to_thread to avoid blocking the event loop."""
    s3 = _get_s3_client()
    s3.put_object(
        Bucket=settings.AWS_S3_BUCKET,
        Key=key,
        Body=content,
        ContentType=content_type,
    )


def _delete_object_sync(key: str) -> None:
    """Blocking S3 delete — called via asyncio.to_thread."""
    s3 = _get_s3_client()
    s3.delete_object(Bucket=settings.AWS_S3_BUCKET, Key=key)


async def upload_resume(content: bytes, original_filename: str, candidate_id: str) -> str:
    """Upload resume bytes to S3 without blocking the async event loop."""
    ext = original_filename.rsplit(".", 1)[-1].lower()
    key = f"resumes/{candidate_id}/{uuid.uuid4().hex}.{ext}"
    content_type = (
        "application/pdf"
        if ext == "pdf"
        else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
    try:
        await asyncio.to_thread(_put_object_sync, key, content, content_type)
        return f"https://{settings.AWS_S3_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"
    except ClientError as e:
        logger.error("S3 upload failed: %s", e)
        raise


async def delete_resume(resume_url: str) -> None:
    """Delete a resume from S3 without blocking the async event loop."""
    try:
        key = resume_url.split(f"{settings.AWS_S3_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/")[
            1
        ]
        await asyncio.to_thread(_delete_object_sync, key)
    except Exception as e:
        logger.warning("S3 delete failed: %s", e)
