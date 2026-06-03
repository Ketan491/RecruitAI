// src/components/weather/WeatherDashboard.tsx
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import api from "../../services/api";
import { WeatherData } from "../../types/weather";

export function WeatherDashboard() {
  const [city, setCity] = useState("London");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["weather", city],
    queryFn: async () => {
      const response = await api.get<WeatherData>("/weather/current", {
        params: { city },
      });
      return response.data;
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setCity(searchInput.trim());
      setSearchInput("");
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">
          Error: {error instanceof Error ? error.message : "Failed to fetch weather"}
        </p>
      </div>
    );
  }

  const weather = data?.data;

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Enter city name..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Search
        </button>
      </form>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : weather ? (
        <>
          {/* Location Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 rounded-lg shadow-lg">
            <h1 className="text-4xl font-bold">
              {weather.location.city}, {weather.location.country}
            </h1>
            <p className="text-blue-100 mt-2">
              {weather.location.latitude.toFixed(2)}°, {weather.location.longitude.toFixed(2)}° •
              Timezone: {weather.location.timezone}
            </p>
          </div>

          {/* Current Weather */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Current Weather</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Temperature */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
                <p className="text-gray-600 text-sm font-semibold">Temperature</p>
                <p className="text-4xl font-bold text-orange-600 mt-2">
                  {weather.current.temperature}°C
                </p>
                <p className="text-gray-600 mt-1">
                  Feels like {weather.current.feels_like}°C
                </p>
              </div>

              {/* Condition */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <p className="text-gray-600 text-sm font-semibold">Condition</p>
                <p className="text-3xl mt-2">{weather.current.icon}</p>
                <p className="text-xl font-semibold text-blue-700 mt-2">
                  {weather.current.description}
                </p>
              </div>

              {/* Humidity */}
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-lg border border-cyan-200">
                <p className="text-gray-600 text-sm font-semibold">Humidity</p>
                <p className="text-4xl font-bold text-cyan-600 mt-2">{weather.current.humidity}%</p>
              </div>

              {/* Wind Speed */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                <p className="text-gray-600 text-sm font-semibold">Wind Speed</p>
                <p className="text-4xl font-bold text-green-600 mt-2">
                  {weather.current.wind_speed} km/h
                </p>
                <p className="text-gray-600 mt-1">Direction: {weather.current.wind_direction}°</p>
              </div>

              {/* Precipitation */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                <p className="text-gray-600 text-sm font-semibold">Precipitation</p>
                <p className="text-4xl font-bold text-purple-600 mt-2">
                  {weather.current.precipitation} mm
                </p>
              </div>
            </div>
          </div>

          {/* Daily Forecast */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">7-Day Forecast</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {weather.daily.dates.slice(0, 7).map((date, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
                  <p className="font-semibold text-gray-800">
                    {new Date(date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-2xl mt-3">🌡️</p>
                  <p className="text-sm text-gray-600 mt-2">
                    High: <span className="font-bold">{weather.daily.max_temps[idx]}°C</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Low: <span className="font-bold">{weather.daily.min_temps[idx]}°C</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    💧 {weather.daily.precipitation[idx]} mm
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Hourly Forecast */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">24-Hour Forecast</h2>
            <div className="overflow-x-auto">
              <div className="flex gap-4 pb-4">
                {weather.hourly.times.map((time, idx) => (
                  <div
                    key={idx}
                    className="flex-shrink-0 bg-gray-50 p-4 rounded-lg border border-gray-200 text-center min-w-24"
                  >
                    <p className="font-semibold text-sm text-gray-800">
                      {new Date(time).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-xl mt-2">🌡️</p>
                    <p className="text-sm font-bold text-gray-800 mt-1">
                      {weather.hourly.temperatures[idx]}°C
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      💧 {weather.hourly.precipitation[idx]} mm
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
