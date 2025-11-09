'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchCityWeatherData } from '@/middleware/page';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function Dashboard() {
  const { user, isLoading: authLoading, error: authError } = useUser();
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchCityWeatherData();
        setWeatherData(data);
        setLastUpdateTime(new Date());
        setError(null);
      } catch (err) {
        setError('Failed to fetch weather data. Please try again later.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="w-16 h-16 border-t-4 border-blue-200 border-solid rounded-full animate-spin"></div>
          <div className="mt-4 text-xl font-semibold text-blue-200">Loading...</div>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-900 to-pink-900">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 max-w-md mx-4">
          <div className="text-xl text-red-200 text-center">Authentication error: {authError.message}</div>
          <a href="/api/auth/login?returnTo=/dashboard" className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors mx-auto block text-center">Login</a>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 max-w-md mx-4 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please login first</h1>
          <a href="/api/auth/login?returnTo=/dashboard" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">Login</a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="w-16 h-16 border-t-4 border-blue-200 border-solid rounded-full animate-spin"></div>
          <div className="mt-4 text-xl font-semibold text-blue-200">Loading weather data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-900 to-pink-900">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 max-w-md mx-4">
          <div className="text-xl text-red-200 text-center">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors mx-auto block"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (timestamp, timezone) => {
    const date = new Date((timestamp + timezone) * 1000);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatLastUpdate = (date) => {
    if (!date) return '';
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-blue-1000 bg-[url('/bg.jpg')] bg-cover bg-fixed bg-center bg-blend-overlay bg-black/50 overscroll-none">
      <main className="grow px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 overscroll-none">
        <div className="max-w-7xl mx-auto flex flex-col gap-6 mb-6">
          {/* Mobile: Time and User Row, Desktop: All Three in Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-center">
            {/* Left - Last Updated */}
            <div className="flex items-center col-start-1">
              <div className="text-white text-sm bg-black/30 backdrop-blur-md px-4 py-2 rounded-full shadow-lg hover:bg-black/40 transition-all">
                <span className="opacity-100 text-blue-200">Last Updated:</span> {formatLastUpdate(lastUpdateTime)}
              </div>
            </div>

            {/* Title - Below on mobile, Center on desktop */}
            <h1 className="col-span-2 md:col-auto text-center order-last md:order-0 text-4xl sm:text-5xl lg:text-6xl font-bold drop-shadow-xl bg-linear-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent md:col-start-2 md:justify-self-center">
              Meteo Earth
            </h1>

            {/* Right - User */}
            <div className="flex justify-end items-center col-start-2 md:col-start-3 gap-3">
              <div className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-full shadow-lg hover:bg-black/40 transition-all">
                <p className="text-white font-medium">{user.name}</p>
              </div>
              <a
                href="/api/auth/logout?returnTo=/"
                className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
              >
                Logout
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-9 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {weatherData.map(city => (
          <div
            key={city.cityCode}
            className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
            <div className="p-6 sm:p-8">
              {/* Header Section */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white truncate">{city.cityName}</h2>
              </div>

              {/* Main Weather Display */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 bg-linear-to-br from-white/10 to-black/5 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                    <Image
                      src={`/weather-icons/${city.weatherIcon}.svg`}
                      alt={city.weatherDescription}
                      fill
                      sizes="96px"
                      className="object-contain p-2 drop-shadow-xl filter brightness-125"
                      priority
                    />
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-white group-hover:text-blue-200 transition-colors">
                      {Math.round(city.temperature)}°
                    </p>
                    <p className="text-sm text-blue-200 capitalize">{city.weatherDescription}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-blue-200">
                    {Math.round(city.feelsLike)}°
                  </p>
                  <p className="text-xs text-blue-300">Feels like</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        </div>
      </main>

      <footer className="py-4 text-center bg-black/20 backdrop-blur-sm mt-8">
        <p className="text-blue-200 text-sm font-medium">
          Powered by Meteo Earth™
        </p>
      </footer>
    </div>
  );
}
