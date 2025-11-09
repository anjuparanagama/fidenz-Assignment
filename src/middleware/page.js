export async function fetchCityWeatherData() {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  if (!apiKey) throw new Error('Check OpenWeather API key.');

  try {
    const response = await fetch('/cities.json');
    if (!response.ok) throw new Error('Failed to load cities.json');
    const citiesData = await response.json();

    const weatherPromises = citiesData.List.map(async (city) => {
      const url = `https://api.openweathermap.org/data/2.5/weather?id=${city.CityCode}&appid=${apiKey}&units=metric`;
      const res = await fetch(url);

      if (!res.ok) {
        console.error(`OpenWeather API error for city ${city.CityCode}:`, res.status);
        return {
          cityCode: city.CityCode,
          cityName: city.CityName,
          error: true,
          isUserAdded: false,
        };
      }

      const data = await res.json();

      return {
        cityCode: city.CityCode,
        cityName: city.CityName,
        temperature: data?.main?.temp ?? null,
        feelsLike: data?.main?.feels_like ?? null,
        weatherDescription: data?.weather?.[0]?.description ?? '',
        weatherIcon: data?.weather?.[0]?.icon ?? 'na',
        country: data?.sys?.country ?? null,
        windSpeed: data?.wind?.speed ?? null,
        pressure: data?.main?.pressure ?? null,
        humidity: data?.main?.humidity ?? null,
        visibility: data?.visibility ?? null,
        sunrise: data?.sys?.sunrise ? new Date(data.sys.sunrise * 1000).toISOString() : null,
        sunset: data?.sys?.sunset ? new Date(data.sys.sunset * 1000).toISOString() : null,
        isUserAdded: false,
      };
    });

    return await Promise.all(weatherPromises);

  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

export async function fetchWeatherByCity(cityName) {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  if (!apiKey) throw new Error('Check OpenWeather API key.');

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${apiKey}&units=metric`;
    const res = await fetch(url);

    if (!res.ok) {
      console.error(`OpenWeather API error for city ${cityName}:`, res.status);
      return null;
    }

    const data = await res.json();

    return {
      cityCode: `user_${data?.id ?? Date.now()}`,
      cityName: data?.name ?? cityName,
      temperature: data?.main?.temp ?? null,
      feelsLike: data?.main?.feels_like ?? null,
      weatherDescription: data?.weather?.[0]?.description ?? '',
      weatherIcon: data?.weather?.[0]?.icon ?? 'na',
      country: data?.sys?.country ?? null,
      windSpeed: data?.wind?.speed ?? null,
      pressure: data?.main?.pressure ?? null,
      humidity: data?.main?.humidity ?? null,
      visibility: data?.visibility ?? null,
      sunrise: data?.sys?.sunrise ? new Date(data.sys.sunrise * 1000).toISOString() : null,
      sunset: data?.sys?.sunset ? new Date(data.sys.sunset * 1000).toISOString() : null,
      isUserAdded: true,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}
