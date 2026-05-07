import { useState, useEffect, useCallback } from 'react';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || '';

export interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  city: string;
}

export const useWeather = (city: string) => {
  const [data, setData] = useState<WeatherData | null>(() => {
    const cached = localStorage.getItem('weatherCache');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.city.toLowerCase() === city.toLowerCase() && Date.now() - parsed.timestamp < 1000 * 60 * 30) {
        return parsed.data;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async (targetCity: string) => {
    if (!targetCity) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(targetCity)}&units=metric&appid=${API_KEY}`);
      if (!res.ok) {
        throw new Error('City not found or API error');
      }
      const json = await res.json();
      const weatherData: WeatherData = {
        temp: Math.round(json.main.temp),
        description: json.weather[0].description,
        icon: json.weather[0].icon,
        city: json.name,
      };
      setData(weatherData);
      localStorage.setItem('weatherCache', JSON.stringify({
        data: weatherData,
        city: json.name,
        timestamp: Date.now()
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch weather');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!city) return;
    const handler = setTimeout(() => {
      fetchWeather(city);
    }, 1000);

    return () => clearTimeout(handler);
  }, [city, fetchWeather]);

  return { data, loading, error, retry: () => fetchWeather(city) };
};
