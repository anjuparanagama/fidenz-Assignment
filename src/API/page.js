export async function fetchCityWeatherData() {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  if (!apiKey) throw new Error('Check OpenWeather API key.');

  try {
    const response = await fetch('/cities.json');
    const citiesData = await response.json();

    const weatherPromises = citiesData.List.map(async (city) => {
      const url = `https://api.openweathermap.org/data/2.5/weather?id=${city.CityCode}&appid=${apiKey}&units=metric`;
      const res = await fetch(url);
      const data = await res.json();

      return {
        cityCode: city.CityCode,
        cityName: city.CityName,
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        weatherDescription: data.weather[0].description,
        weatherIcon: data.weather[0].icon,
      };
    });

    return await Promise.all(weatherPromises);

  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}
