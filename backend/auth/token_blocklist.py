# auth/token_blocklist.py
"""
Refresh token revocation via a MongoDB blocklist.

On logout (or password reset), the token's JTI is stored here with its
original expiry. MongoDB's TTL index automatically removes expired entries
so the collection never grows unboundedly.
"""

from datetime import datetime

from ..database.connection import get_db


async def revoke_token(jti: str, expires_at: datetime) -> None:
    """Add a JTI to the blocklist. expires_at controls automatic TTL deletion."""
    db = get_db()
    await db["revoked_tokens"].insert_one({"jti": jti, "expires_at": expires_at})


async def is_revoked(jti: str) -> bool:
    """Return True if this JTI has been explicitly revoked."""
    db = get_db()
    doc = await db["revoked_tokens"].find_one({"jti": jti})
    return doc is not None
