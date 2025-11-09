'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { fetchCityWeatherData, fetchWeatherByCity } from '@/middleware/page';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function Dashboard() {
  const { user, isLoading: authLoading, error: authError } = useUser();

  // State management
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCity, setNewCity] = useState('');
  const [addingCity, setAddingCity] = useState(false);
  const [addError, setAddError] = useState(null);

  // Fetch weather data on component mount and setup auto-refresh
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const defaultData = await fetchCityWeatherData();
        
        // Load user-added cities from localStorage
        const savedUserCities = localStorage.getItem('userAddedCities');
        let userCities = [];
        if (savedUserCities) {
          try {
            userCities = JSON.parse(savedUserCities);
          } catch (err) {
            console.error('Error parsing user cities:', err);
          }
        }
        
        // Combine default and user-added cities
        const allData = [...defaultData, ...userCities];
        setWeatherData(allData);
        setError(null);
        // Cache data for offline access
        localStorage.setItem('weatherData', JSON.stringify(allData));
      } catch (err) {
        setError('Failed to fetch weather data. Please try again later.');
        console.error('Error fetching weather data:', err);
      } finally {
        setLoading(false);
      }
    };

    // Load cached data on first visit
    const cachedData = localStorage.getItem('weatherData');
    if (cachedData) {
      try {
        setWeatherData(JSON.parse(cachedData));
        setLoading(false);
      } catch (err) {
        console.error('Error loading cached data:', err);
        fetchData();
      }
    } else {
      fetchData();
    }

    // Auto-refresh every 5 minutes (300000 ms)
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  // Show loading spinner during authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-screen">
        <div className="relative flex flex-col items-center">
          <div className="w-16 h-16 border-t-4 border-blue-200 border-solid rounded-full animate-spin" />
          <div className="mt-4 text-xl font-semibold text-blue-200">Loading weather data...</div>
        </div>
      </div>
    );
  }

  // Show error if authentication fails
  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen from-red-900 to-pink-900">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 max-w-md mx-4">
          <div className="text-xl text-red-200 text-center">Authentication error: {authError.message}</div>
          <a href="/api/auth/login?returnTo=/dashboard" className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors mx-auto block text-center">
            Login
          </a>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen from-gray-900 to-black">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 max-w-md mx-4 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please login first</h1>
          <a href="/api/auth/login?returnTo=/dashboard" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            Login
          </a>
        </div>
      </div>
    );
  }

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-screen">
        <div className="relative flex flex-col items-center">
          <div className="w-16 h-16 border-t-4 border-blue-200 border-solid rounded-full animate-spin" />
          <div className="mt-4 text-xl font-semibold text-blue-200">Loading weather data...</div>
        </div>
      </div>
    );
  }

  // Show error message if data fetch fails
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen from-red-900 to-pink-900">
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

  // Handle city addition (placeholder for now)
  const handleAddCity = async (e) => {
    e.preventDefault();
    if (!newCity.trim()) return;

    setAddingCity(true);
    setAddError(null);

    try {
      const cityWeather = await fetchWeatherByCity(newCity.trim());
      
      if (!cityWeather) {
        setAddError(`City "${newCity}" not found. Please check the spelling and try again.`);
        setAddingCity(false);
        return;
      }

      // Check if city is already added
      const alreadyExists = weatherData.some(
        (city) => city.cityCode === cityWeather.cityCode || 
                  city.cityName.toLowerCase() === cityWeather.cityName.toLowerCase()
      );

      if (alreadyExists) {
        setAddError(`"${cityWeather.cityName}" is already added.`);
        setAddingCity(false);
        return;
      }

      // Update weather data
      const updatedData = [...weatherData, cityWeather];
      setWeatherData(updatedData);
      
      // Save user-added cities to localStorage
      const userCities = updatedData.filter((city) => city.isUserAdded);
      localStorage.setItem('userAddedCities', JSON.stringify(userCities));
      localStorage.setItem('weatherData', JSON.stringify(updatedData));
      
      setNewCity('');
      setAddError(null);
    } catch (err) {
      setAddError('Failed to add city. Please try again later.');
      console.error('Error adding city:', err);
    } finally {
      setAddingCity(false);
    }
  };

  // Handle city removal
  const handleRemoveCity = (e, cityCode) => {
    e.preventDefault();
    e.stopPropagation();
    
    const updatedData = weatherData.filter((city) => city.cityCode !== cityCode);
    setWeatherData(updatedData);
    
    // Save user-added cities to localStorage
    const userCities = updatedData.filter((city) => city.isUserAdded);
    localStorage.setItem('userAddedCities', JSON.stringify(userCities));
    localStorage.setItem('weatherData', JSON.stringify(updatedData));
  };

  // Color gradients for weather cards
  const gradients = [
    'linear-gradient(135deg, #4299E1 0%, #63B3ED 100%)',
    'linear-gradient(135deg, #6B46C1 0%, #805AD5 100%)',
    'linear-gradient(135deg, #38A169 0%, #48BB78 100%)',
    'linear-gradient(135deg, #DD6B20 0%, #ED8936 100%)',
    'linear-gradient(135deg, #9B2C2C 0%, #C53030 100%)',
  ];

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col relative dashboard-bg">
      {/* User profile section */}
      {user && (
        <div className="absolute right-4 top-4 flex items-center gap-3 z-50">
          {user.picture && (
            <Image
              src={user.picture}
              alt={user.name || 'User'}
              width={32}
              height={32}
              className="rounded-full object-cover hidden sm:block"
            />
          )}
          <span className="text-sm text-gray-200 hidden sm:inline">
            Hi, {user.name || user.nickname || user.email}
          </span>
          <a
            href="/api/auth/logout"
            className="px-2 py-0.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
          >
            Logout
          </a>
        </div>
      )}

      {/* Header with logo and search form */}
      <header className="pt-10 px-4 sm:px-0 flex flex-col items-center text-gray-200">
        <div className="flex items-center gap-4 mb-6 text-3xl font-bold">
          {/* Weather app icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-400"
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

        {/* City search form */}
        <form
          className="w-full max-w-md flex flex-col sm:flex-row gap-2 px-4 sm:px-0"
          onSubmit={handleAddCity}
        >
          <input
            type="text"
            placeholder="Enter a city"
            value={newCity}
            onChange={(e) => setNewCity(e.target.value)}
            disabled={addingCity}
            className="flex-1 px-4 py-2 rounded-md sm:rounded-l-md sm:rounded-r-none text-sm bg-gray-800 text-gray-300 placeholder-gray-500 focus:outline-none w-full disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={addingCity}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 px-4 py-2 font-semibold rounded-md sm:rounded-r-md text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingCity ? 'Adding...' : 'Add City'}
          </button>
        </form>
        
        {/* Error message for adding city */}
        {addError && (
          <div className="w-full max-w-md px-4 sm:px-0">
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-md text-sm">
              {addError}
            </div>
          </div>
        )}
      </header>

      {/* Main content - weather cards grid */}
      <main className="w-full mt-10 px-2 sm:px-4 md:px-8 lg:px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 pb-20 max-w-7xl mx-auto">
        {weatherData.map((city, index) => (
          <Link
            key={city.cityCode}
            href={`/dashboard/${city.cityCode}`}
            className="rounded-md overflow-hidden shadow-xl w-full hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-150"
          >
            <article className="rounded-md overflow-hidden w-full cursor-pointer relative">
              {/* Close button for user-added cities */}
              {city.isUserAdded && (
                <button
                  onClick={(e) => handleRemoveCity(e, city.cityCode)}
                  className="absolute top-3 right-3 z-30  text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                  aria-label="Remove city"
                  title="Remove city"
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
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
              {/* Weather card header section */}
              <div
                className="relative p-6 sm:p-6 md:p-8 text-white"
                style={{ background: gradients[index % gradients.length] }}
              >
                {/* Decorative cloud background */}
                <div className="absolute bottom-0 left-0 right-0 top-12" aria-hidden="true">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 300 100"
                    preserveAspectRatio="none"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient id="fadeGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="white" stopOpacity="0.5" />
                        <stop offset="25%" stopColor="white" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                      </linearGradient>
                      <mask id="fadeMask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse">
                        <rect x="0" y="0" width="100%" height="100%" fill="url(#fadeGradient)" />
                      </mask>
                    </defs>

                    <g mask="url(#fadeMask)" transform="translate(-40,0) scale(1.6)">
                      <circle cx="50" cy="50" r="25" fill="white" />
                      <circle cx="90" cy="50" r="40" fill="white" />
                      <circle cx="140" cy="50" r="30" fill="white" />
                      <circle cx="190" cy="50" r="45" fill="white" />
                      <circle cx="250" cy="50" r="35" fill="white" />
                    </g>
                  </svg>
                </div>

                {/* City name and country */}
                <h3 className="text-2xl font-bold relative z-10">
                  {city.cityName}
                  {getDisplayCountry(city) ? (
                    <span className="text-sm font-normal ml-2">({getDisplayCountry(city)})</span>
                  ) : null}
                </h3>
                <p className="text-sm mt-1 relative z-10">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>

                {/* Weather icon and description */}
                <div className="flex items-center gap-4 mt-6 relative z-10">
                  <Image
                    src={`/weather-icons/${city.weatherIcon ?? 'na'}.svg`}
                    alt={city.weatherDescription ?? 'weather'}
                    width={40}
                    height={40}
                    className="opacity-90"
                  />
                  <span className="opacity-90 capitalize text-lg">
                    {city.weatherDescription || '—'}
                  </span>
                </div>

                {/* Temperature display */}
                <div className="relative sm:absolute sm:right-8 sm:top-12 text-4xl sm:text-5xl font-bold z-10 flex items-baseline gap-2 justify-center sm:justify-end mt-4 sm:mt-0">
                  <span>{city.temperature != null ? Math.round(city.temperature) : '—'}</span>
                  <span className="text-2xl">°C</span>
                </div>

                {/* Feels like temperature */}
                <div className="relative sm:absolute sm:right-8 sm:top-36 text-sm text-right z-10 mt-2 sm:mt-0">
                  <p>
                    Feels like: {city.feelsLike != null ? `${Math.round(city.feelsLike)}°C` : '—'}
                  </p>
                </div>

                {/* Error indicator */}
                {city.error && (
                  <div className="absolute left-3 top-3 text-xs bg-red-600/80 px-2 py-1 rounded text-white z-20">
                    No data
                  </div>
                )}
              </div>

              {/* Weather card details section */}
              <div className="bg-gray-800 p-6 text-gray-300 flex flex-col md:flex-row text-sm gap-6 md:divide-x divide-gray-700">
                {/* Left column - pressure, humidity, visibility */}
                <div className="flex flex-col gap-1 flex-1">
                  <p>
                    <span className="font-semibold">Pressure:</span>{' '}
                    {city.pressure != null ? `${city.pressure} hPa` : '—'}
                  </p>
                  <p>
                    <span className="font-semibold">Humidity:</span>{' '}
                    {city.humidity != null ? `${city.humidity}%` : '—'}
                  </p>
                  <p>
                    <span className="font-semibold">Visibility:</span> {formatVisibility(city.visibility)}
                  </p>
                </div>

                {/* Middle column - wind speed (hidden on mobile) */}
                <div className="hidden md:flex flex-col gap-1 flex-1 items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mb-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                  </svg>
                  <p>{formatWind(city.windSpeed)}</p>
                </div>

                {/* Right column - sunrise and sunset (hidden on mobile) */}
                <div className="hidden md:flex flex-col gap-1 flex-1 items-center justify-center">
                  <p>
                    <span className="font-semibold">Sunrise:</span> {formatTime(city.sunrise)}
                  </p>
                  <p>
                    <span className="font-semibold">Sunset:</span> {formatTime(city.sunset)}
                  </p>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-5 text-center bg-gray-700 text-amber-50 text-xs">
        2025 Fidenz Technologies
      </footer>
    </div>
  );
}
