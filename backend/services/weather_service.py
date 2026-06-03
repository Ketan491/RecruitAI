# services/weather_service.py
import logging
from typing import Any

import httpx
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from ..config import settings

logger = logging.getLogger(__name__)

# Using Open-Meteo (free, no API key required) and OpenWeatherMap as fallback
OPEN_METEO_API = "https://api.open-meteo.com/v1/forecast"
GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/search"


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(Exception),
)
async def get_coordinates(city: str) -> dict[str, Any]:
    """Get latitude and longitude from city name using Open-Meteo Geocoding API."""
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(
            GEOCODING_API,
            params={"name": city, "count": 1, "language": "en", "format": "json"},
        )
        response.raise_for_status()
        data = response.json()

        if not data.get("results"):
            raise ValueError(f"City '{city}' not found")

        result = data["results"][0]
        return {
            "latitude": result["latitude"],
            "longitude": result["longitude"],
            "city": result.get("name", city),
            "country": result.get("country", ""),
            "timezone": result.get("timezone", "UTC"),
        }


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(Exception),
)
async def get_weather(latitude: float, longitude: float) -> dict[str, Any]:
    """Fetch weather data from Open-Meteo API (free, no authentication required)."""
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(
            OPEN_METEO_API,
            params={
                "latitude": latitude,
                "longitude": longitude,
                "current": "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m",
                "hourly": "temperature_2m,precipitation,weather_code",
                "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code",
                "timezone": "auto",
            },
        )
        response.raise_for_status()
        return response.json()


def interpret_weather_code(code: int) -> dict[str, str]:
    """Convert WMO weather code to human-readable description."""
    weather_map = {
        0: {"description": "Clear sky", "icon": "☀️"},
        1: {"description": "Mainly clear", "icon": "🌤️"},
        2: {"description": "Partly cloudy", "icon": "⛅"},
        3: {"description": "Overcast", "icon": "☁️"},
        45: {"description": "Foggy", "icon": "🌫️"},
        48: {"description": "Foggy", "icon": "🌫️"},
        51: {"description": "Light drizzle", "icon": "🌧️"},
        53: {"description": "Moderate drizzle", "icon": "🌧️"},
        55: {"description": "Heavy drizzle", "icon": "🌧️"},
        61: {"description": "Slight rain", "icon": "🌧️"},
        63: {"description": "Moderate rain", "icon": "🌧️"},
        65: {"description": "Heavy rain", "icon": "⛈️"},
        71: {"description": "Slight snow", "icon": "❄️"},
        73: {"description": "Moderate snow", "icon": "❄️"},
        75: {"description": "Heavy snow", "icon": "❄️"},
        77: {"description": "Snow grains", "icon": "❄️"},
        80: {"description": "Slight rain showers", "icon": "🌧️"},
        81: {"description": "Moderate rain showers", "icon": "🌧️"},
        82: {"description": "Violent rain showers", "icon": "⛈️"},
        85: {"description": "Slight snow showers", "icon": "❄️"},
        86: {"description": "Heavy snow showers", "icon": "❄️"},
        95: {"description": "Thunderstorm", "icon": "⛈️"},
        96: {"description": "Thunderstorm with hail", "icon": "⛈️"},
        99: {"description": "Thunderstorm with hail", "icon": "⛈️"},
    }
    return weather_map.get(code, {"description": "Unknown", "icon": "🌍"})


async def fetch_weather_by_city(city: str) -> dict[str, Any]:
    """Main function to fetch weather by city name."""
    try:
        # Get coordinates
        coords = await get_coordinates(city)
        logger.info(f"Got coordinates for {coords['city']}: {coords['latitude']}, {coords['longitude']}")

        # Get weather data
        weather_data = await get_weather(coords["latitude"], coords["longitude"])

        # Parse response
        current = weather_data.get("current", {})
        daily = weather_data.get("daily", {})
        hourly = weather_data.get("hourly", {})

        weather_code = current.get("weather_code", 0)
        weather_info = interpret_weather_code(weather_code)

        return {
            "success": True,
            "data": {
                "location": {
                    "city": coords["city"],
                    "country": coords["country"],
                    "latitude": coords["latitude"],
                    "longitude": coords["longitude"],
                    "timezone": coords["timezone"],
                },
                "current": {
                    "temperature": current.get("temperature_2m"),
                    "feels_like": current.get("apparent_temperature"),
                    "humidity": current.get("relative_humidity_2m"),
                    "precipitation": current.get("precipitation"),
                    "wind_speed": current.get("wind_speed_10m"),
                    "wind_direction": current.get("wind_direction_10m"),
                    "weather_code": weather_code,
                    "description": weather_info["description"],
                    "icon": weather_info["icon"],
                },
                "daily": {
                    "dates": daily.get("time", []),
                    "max_temps": daily.get("temperature_2m_max", []),
                    "min_temps": daily.get("temperature_2m_min", []),
                    "precipitation": daily.get("precipitation_sum", []),
                    "weather_codes": daily.get("weather_code", []),
                },
                "hourly": {
                    "times": hourly.get("time", [])[:24],  # Next 24 hours
                    "temperatures": hourly.get("temperature_2m", [])[:24],
                    "precipitation": hourly.get("precipitation", [])[:24],
                    "weather_codes": hourly.get("weather_code", [])[:24],
                },
            },
        }
    except Exception as e:
        logger.error(f"Weather fetch failed for {city}: {e}")
        return {
            "success": False,
            "error": str(e),
        }
