'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { fetchCityWeatherData } from '@/middleware/page';
import { useUser } from '@auth0/nextjs-auth0/client';
import { use } from 'react';

export default function CityWeather({ params }) {
  const { cityCode } = use(params);
  const { user, isLoading: authLoading, error: authError } = useUser();

  // State management
  const [city, setCity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch city weather data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchCityWeatherData();
        const cityData = data.find((c) => c.cityCode === cityCode);
        if (!cityData) {
          setError('City not found');
          return;
        }
        setCity(cityData);
        setError(null);
        // Cache city data for offline access
        localStorage.setItem(`cityData_${cityCode}`, JSON.stringify(cityData));
      } catch (err) {
        setError('Failed to fetch weather data');
        console.error('Error fetching city data:', err);
      } finally {
        setLoading(false);
      }
    };

    // Try to load cached data first
    const cachedCity = localStorage.getItem(`cityData_${cityCode}`);
    if (cachedCity) {
      try {
        setCity(JSON.parse(cachedCity));
        setLoading(false);
      } catch (err) {
        console.error('Error loading cached city data:', err);
        fetchData();
      }
    } else {
      fetchData();
    }
  }, [cityCode]);

  // Format ISO time string to 12-hour format
  const formatTime = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (e) {
      return '—';
    }
  };

  // Convert country code to uppercase
  const formatCountryCode = (countryCode) => {
    if (!countryCode) return '';
    try {
      return String(countryCode).toUpperCase();
    } catch (e) {
      return countryCode;
    }
  };

  // Fallback country codes for cities without country data
  const countryFallbacks = {
    Colombo: 'LK',
    Tokyo: 'JP',
    Liverpool: 'GB',
    Paris: 'FR',
    Sydney: 'AU',
    Boston: 'US',
    Shanghai: 'CN',
    Oslo: 'NO',
  };

  // Get country display with fallback option
  const getDisplayCountry = (city) => {
    if (!city) return '';
    if (city.country) return formatCountryCode(city.country);
    if (city.cityName && countryFallbacks[city.cityName]) return countryFallbacks[city.cityName];
    return '';
  };

  // Format visibility distance to km or meters
  const formatVisibility = (meters) => {
    if (meters == null) return '—';
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    return `${meters} m`;
  };

  // Format wind speed in m/s
  const formatWind = (speed) => {
    if (speed == null) return '—';
    const n = Number(speed);
    if (Number.isNaN(n)) return '—';
    return `${n.toFixed(1)} m/s`;
  };

  // Color gradient for the weather card
  const gradient = 'linear-gradient(135deg, #4299E1 0%, #63B3ED 100%)';

  // Show loading spinner while fetching data
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-screen">
        <div className="relative flex flex-col items-center">
          <div className="w-16 h-16 border-t-4 border-blue-200 border-solid rounded-full animate-spin" />
          <div className="mt-4 text-xl font-semibold text-blue-200">Loading weather data...</div>
        </div>
      </div>
    );
  }

  // Show error if data fetch fails
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen from-red-900 to-pink-900">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 max-w-md mx-4">
          <div className="text-xl text-red-200 text-center">{error}</div>
          <Link
            href="/dashboard"
            className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors mx-auto block text-center"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Show error if city data is not found
  if (!city) {
    return (
      <div className="flex items-center justify-center min-h-screen from-red-900 to-pink-900">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 max-w-md mx-4">
          <div className="text-xl text-red-200 text-center">City not found</div>
          <Link
            href="/dashboard"
            className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors mx-auto block text-center"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen flex flex-col relative overflow-hidden"
      style={{
        backgroundImage: "url('/Designer.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Back button */}
      <Link
        href="/dashboard"
        className="absolute left-4 top-4 text-gray-300 hover:text-white flex items-center gap-2 z-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </Link>

      {/* User profile section */}
      {user && (
        <div className="absolute right-4 top-4 flex items-center gap-3 z-50">
          {user.picture && (
            <Image
              src={user.picture}
              alt={user.name || 'User'}
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          )}
          <span className="text-sm text-gray-200 hidden sm:inline">
            Hi, {user.name || user.nickname || user.email}
          </span>
          <a
            href="/api/auth/logout"
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
          >
            Logout
          </a>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center md:block px-4 py-4 sm:py-8 overflow-y-auto relative z-10 w-full">
        {/* App header with logo */}
        <div className="flex justify-center mb-4 sm:mb-8 w-full">
          <div className="flex items-center gap-2 sm:gap-4 text-xl sm:text-2xl md:text-3xl font-bold text-white">
            {/* Weather app icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-yellow-400"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <g fill="currentColor" stroke="none">
                <circle cx="12" cy="8" r="3.2" />
                <path d="M20 15.6A4.4 4.4 0 0116 12a4.2 4.2 0 00-3.9 2.6A3.5 3.5 0 008 16a3.5 3.5 0 000 7h10a3.5 3.5 0 002-6.4z" />
              </g>
              <path
                d="M12 2v1.8"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 20.2V22"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4.2 4.2l1.3 1.3"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M18.5 18.5l1.3 1.3"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M1 12h1.8"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21.2 12H23"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4.2 19.8l1.3-1.3"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M18.5 5.5l1.3-1.3"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Weather App
          </div>
        </div>

        {/* Weather card container */}
        <div className="max-w-5xl w-full mx-auto px-2 sm:px-4">
          <div className="rounded-lg sm:rounded-xl overflow-hidden shadow-2xl">
            {/* Weather card header with temperature */}
            <div className="relative p-4 sm:p-6 md:p-8 text-white" style={{ background: gradient }}>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold relative z-10 text-center">
                {city.cityName}
                {getDisplayCountry(city) ? (
                  <span className="text-sm sm:text-lg font-normal ml-2 sm:ml-3">
                    ({getDisplayCountry(city)})
                  </span>
                ) : null}
              </h2>
              <p className="text-sm sm:text-base md:text-lg mt-1 sm:mt-2 relative z-10 text-center">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mt-6 sm:mt-8 relative z-10">
                {/* Left column - Weather icon and description */}
                <div className="flex flex-col items-center justify-center">
                  <Image
                    src={`/weather-icons/${city.weatherIcon ?? 'na'}.svg`}
                    alt={city.weatherDescription ?? 'weather'}
                    width={80}
                    height={80}
                    className="opacity-95 sm:w-24 sm:h-24 md:w-28 md:h-28 w-20 h-20"
                  />
                  <div className="capitalize text-base sm:text-lg md:text-xl mt-3 sm:mt-4">
                    {city.weatherDescription || '—'}
                  </div>
                </div>

                {/* Right column - Temperature display */}
                <div className="flex flex-col items-center justify-center">
                  <div className="text-4xl sm:text-5xl md:text-6xl font-bold">
                    {city.temperature != null ? Math.round(city.temperature) : '—'}
                    <span className="text-lg sm:text-2xl md:text-2xl ml-2">°C</span>
                  </div>
                  <div className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg">
                    Feels like: {city.feelsLike != null ? `${Math.round(city.feelsLike)}°C` : '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Weather details section */}
            <div className="bg-gray-900/80 backdrop-blur-sm p-4 sm:p-6 md:p-8 text-gray-300 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-sm sm:text-base md:text-lg">
              {/* Left column - Pressure, humidity, visibility */}
              <div className="text-center md:text-left">
                <p>
                  <span className="font-semibold">Pressure:</span>{' '}
                  {city.pressure != null ? `${city.pressure} hPa` : '—'}
                </p>
                <p className="mt-2">
                  <span className="font-semibold">Humidity:</span>{' '}
                  {city.humidity != null ? `${city.humidity}%` : '—'}
                </p>
                <p className="mt-2">
                  <span className="font-semibold">Visibility:</span> {formatVisibility(city.visibility)}
                </p>
              </div>

              {/* Center column - Wind speed */}
              <div className="flex flex-col items-center justify-center">
                <p className="font-semibold">Wind</p>
                <p className="mt-2">{formatWind(city.windSpeed)}</p>
              </div>

              {/* Right column - Sunrise and sunset */}
              <div className="text-center md:text-right">
                <p>
                  <span className="font-semibold">Sunrise:</span> {formatTime(city.sunrise)}
                </p>
                <p className="mt-2">
                  <span className="font-semibold">Sunset:</span> {formatTime(city.sunset)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-5 text-center bg-gray-700 text-amber-50 text-xs">
        2025 Fidenz Technologies
      </footer>
    </div>
  );
}
