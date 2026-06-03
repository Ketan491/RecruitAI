# api/v1/routes/dashboard.py
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from ....auth.deps import get_current_user
from ....database import connection
from ....models.user import User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

STAGE_ORDER = ["Applied", "Screened", "Phone Screen", "Technical", "Final Round", "Offer", "Hired"]


def get_database() -> AsyncIOMotorDatabase:
    return connection.get_db()


async def _stage_counts_since(col, company_id: str, since: datetime) -> dict[str, int]:
    """Return {stage: count} for candidates created on or after `since`."""
    pipeline = [
        {"$match": {"company_id": company_id, "created_at": {"$gte": since}}},
        {"$group": {"_id": "$stage", "count": {"$sum": 1}}},
    ]
    return {doc["_id"]: doc["count"] async for doc in col.aggregate(pipeline)}


def _kpi(stage_counts: dict[str, int]) -> dict[str, int]:
    return {
        "total_applicants": sum(stage_counts.values()),
        "shortlisted": sum(
            stage_counts.get(s, 0)
            for s in ["Screened", "Phone Screen", "Technical", "Final Round", "Offer"]
        ),
        "in_interview": sum(
            stage_counts.get(s, 0) for s in ["Phone Screen", "Technical", "Final Round"]
        ),
        "offers_sent": stage_counts.get("Offer", 0),
        "hired": stage_counts.get("Hired", 0),
        "rejected": stage_counts.get("Rejected", 0),
    }


@router.get("/stats")
async def get_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    col = db["candidates"]
    company_id = str(current_user.id)

    # All-time totals
    pipeline = [
        {"$match": {"company_id": company_id}},
        {"$group": {"_id": "$stage", "count": {"$sum": 1}}},
    ]
    all_counts = {doc["_id"]: doc["count"] async for doc in col.aggregate(pipeline)}

    now = datetime.now(UTC)
    week_ago = now - timedelta(days=7)
    two_weeks_ago = now - timedelta(days=14)

    # Deltas: candidates added this week vs the prior week
    this_week = _kpi(await _stage_counts_since(col, company_id, week_ago))
    prior_week = _kpi(await _stage_counts_since(col, company_id, two_weeks_ago))
    # prior_week covers 14 days back; subtract this_week to get the previous 7-day window
    deltas = {k: this_week[k] - (prior_week[k] - this_week[k]) for k in this_week}

    totals = _kpi(all_counts)
    return {
        "success": True,
        "data": {**totals, "deltas": deltas},
    }


@router.get("/funnel")
async def get_funnel(
    job_id: str | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    col = db["candidates"]
    match: dict = {"company_id": str(current_user.id)}
    if job_id:
        match["job_id"] = job_id

    pipeline = [
        {"$match": match},
        {
            "$group": {
                "_id": "$stage",
                "count": {"$sum": 1},
                "avg_score": {"$avg": "$overall_score"},
            }
        },
    ]
    stage_data = {doc["_id"]: doc async for doc in col.aggregate(pipeline)}

    funnel, prev = [], None
    for stage in STAGE_ORDER:
        d = stage_data.get(stage, {})
        count = d.get("count", 0)
        avg = round(d.get("avg_score") or 0.0, 1)
        conv = round(count / prev * 100, 1) if prev else 0.0
        funnel.append({"stage": stage, "count": count, "avg_score": avg, "conversion_pct": conv})
        prev = count or prev

    return {"success": True, "data": funnel}


@router.get("/sources")
async def get_sources(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    col = db["candidates"]
    pipeline = [
        {"$match": {"company_id": str(current_user.id)}},
        {"$group": {"_id": "$source", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    results = [doc async for doc in col.aggregate(pipeline)]
    total = sum(r["count"] for r in results) or 1
    data = [
        {"source": r["_id"], "count": r["count"], "percentage": round(r["count"] / total * 100, 1)}
        for r in results
    ]
    return {"success": True, "data": data}


@router.get("/activity")
async def get_activity(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    col = db["candidates"]
    pipeline = [
        {"$match": {"company_id": str(current_user.id), "timeline": {"$ne": []}}},
        {"$sort": {"updated_at": -1}},
        {"$limit": 15},
        {"$project": {"name": 1, "timeline": {"$slice": ["$timeline", -3]}}},
    ]
    activity = []
    async for doc in col.aggregate(pipeline):
        for entry in reversed(doc.get("timeline", [])):
            activity.append(
                {
                    "id": entry.get("id", ""),
                    "action": entry.get("action", ""),
                    "actor_name": entry.get("actor_name", ""),
                    "candidate_name": doc.get("name", ""),
                    "candidate_id": str(doc["_id"]),
                    "created_at": entry.get("created_at", ""),
                }
            )
    activity.sort(key=lambda x: x["created_at"], reverse=True)
    return {"success": True, "data": activity[:20]}


@router.get("/top-candidates")
async def get_top_candidates(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    col = db["candidates"]
    pipeline = [
        {"$match": {"company_id": str(current_user.id), "status": "active"}},
        {"$sort": {"overall_score": -1}},
        {"$limit": 5},
        {"$project": {"name": 1, "job_title": 1, "overall_score": 1, "ai_score.summary": 1}},
    ]
    data = [
        {
            "id": str(doc["_id"]),
            "name": doc.get("name", ""),
            "job_title": doc.get("job_title", ""),
            "overall_score": round(doc.get("overall_score", 0), 1),
            "summary": (doc.get("ai_score") or {}).get("summary", ""),
        }
        async for doc in col.aggregate(pipeline)
    ]
    return {"success": True, "data": data}


@router.get("/score-trend")
async def get_score_trend(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    col = db["candidates"]
    pipeline = [
        {"$match": {"company_id": str(current_user.id), "overall_score": {"$gt": 0}}},
        {
            "$group": {
                "_id": {"$dateToString": {"format": "%Y-W%V", "date": "$created_at"}},
                "avg_score": {"$avg": "$overall_score"},
            }
        },
        {"$sort": {"_id": 1}},
        {"$limit": 8},
        {"$project": {"_id": 0, "week": "$_id", "avg_score": {"$round": ["$avg_score", 1]}}},
    ]
    data = [doc async for doc in col.aggregate(pipeline)]
    if not data:
        data = [{"week": f"W{i}", "avg_score": 0} for i in range(1, 9)]
    return {"success": True, "data": data}
