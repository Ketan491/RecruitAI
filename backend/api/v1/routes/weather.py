# api/v1/routes/weather.py
import logging

from fastapi import APIRouter, HTTPException, Query

from ....services.weather_service import fetch_weather_by_city

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/weather", tags=["weather"])


@router.get("/current")
async def get_current_weather(city: str = Query(..., min_length=1, description="City name")):
    """
    Get current weather and forecast for a city.
    
    - **city**: City name (e.g., "London", "New York", "Tokyo")
    
    Returns current weather, daily forecast, and hourly forecast.
    """
    if not city or len(city.strip()) == 0:
        raise HTTPException(status_code=400, detail="City name is required")

    result = await fetch_weather_by_city(city.strip())
    
    if not result.get("success"):
        raise HTTPException(
            status_code=404,
            detail=result.get("error", "Failed to fetch weather data"),
        )
    
    return result
