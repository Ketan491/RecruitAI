# database/indexes.py
# MongoDB indexes — all defined here, created on startup
# Spec requirement: never scatter index definitions across models
import logging

from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)


async def create_indexes(db: AsyncIOMotorDatabase) -> None:
    """Create all MongoDB indexes. Idempotent — safe to call on every startup."""

    # ── users ────────────────────────────────────────────────────────────────
    await db["users"].create_index("email", unique=True, background=True)

    # ── jobs ─────────────────────────────────────────────────────────────────
    await db["jobs"].create_index("created_by", background=True)
    await db["jobs"].create_index("status", background=True)
    await db["jobs"].create_index([("created_by", 1), ("status", 1)], background=True)

    # ── candidates ───────────────────────────────────────────────────────────
    await db["candidates"].create_index("company_id", background=True)
    await db["candidates"].create_index("job_id", background=True)
    await db["candidates"].create_index("stage", background=True)
    await db["candidates"].create_index("overall_score", background=True)
    await db["candidates"].create_index([("company_id", 1), ("stage", 1)], background=True)
    await db["candidates"].create_index([("company_id", 1), ("overall_score", -1)], background=True)
    await db["candidates"].create_index(
        [("company_id", 1), ("status", 1), ("overall_score", -1)],
        background=True,
    )
    # Duplicate detection: email uniqueness per company
    await db["candidates"].create_index(
        [("company_id", 1), ("email", 1)],
        unique=True,
        sparse=True,
        background=True,
    )
    # Text search on name + email
    await db["candidates"].create_index(
        [("name", "text"), ("email", "text")],
        background=True,
        name="candidates_text_search",
    )

    logger.info("MongoDB indexes created ✓")

    # ── revoked_tokens (refresh token blocklist) ─────────────────────────────
    # TTL index auto-deletes documents when expires_at passes — no manual cleanup needed.
    await db["revoked_tokens"].create_index("jti", unique=True, background=True)
    await db["revoked_tokens"].create_index(
        "expires_at",
        expireAfterSeconds=0,  # delete the document when expires_at is reached
        background=True,
    )

    logger.info("MongoDB indexes created ✓")
