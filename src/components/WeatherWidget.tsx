import React, { useState } from 'react';
import { CloudSun, CloudRain, Sun, Cloud, CloudSnow, CloudLightning, Search } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useWeather } from '../hooks/useWeather';

export const WeatherWidget: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const [cityInput, setCityInput] = useState(settings.weather.city);
  const { data, loading, error, retry } = useWeather(settings.weather.city);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim() !== '') {
      updateSettings({ weather: { city: cityInput.trim() } });
    }
  };

  const getWeatherIcon = (iconCode: string) => {
    if (iconCode.includes('01')) return <Sun className="text-yellow-500" size={32} />;
    if (iconCode.includes('02') || iconCode.includes('03') || iconCode.includes('04')) return <Cloud className="text-gray-400" size={32} />;
    if (iconCode.includes('09') || iconCode.includes('10')) return <CloudRain className="text-blue-400" size={32} />;
    if (iconCode.includes('11')) return <CloudLightning className="text-yellow-600" size={32} />;
    if (iconCode.includes('13')) return <CloudSnow className="text-blue-200" size={32} />;
    return <CloudSun className="text-gray-500" size={32} />;
  };

  return (
    <section className="bg-white/40 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <CloudSun size={20} /> Weather
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="relative mb-4">
        <input
          type="text"
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
          placeholder="Search city..."
          className="w-full bg-white/50 border border-white/30 rounded-xl py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
          aria-label="Search city for weather"
        />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-primary/60 hover:text-primary p-1" aria-label="Search">
          <Search size={16} />
        </button>
      </form>

      {loading && !data && (
        <div className="animate-pulse flex items-center space-x-4">
          <div className="rounded-full bg-primary/10 h-10 w-10"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-primary/10 rounded w-3/4"></div>
            <div className="h-3 bg-primary/10 rounded w-1/2"></div>
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-500 bg-red-50/50 p-3 rounded-xl border border-red-100">
          <p>{error}</p>
          <button onClick={retry} className="text-accent underline mt-1 font-medium hover:text-accent/80">Retry</button>
        </div>
      )}

      {data && !error && (
        <div className="flex items-center gap-4 transition-all">
          <div className="drop-shadow-sm">
            {getWeatherIcon(data.icon)}
          </div>
          <div>
            <div className="text-2xl font-light">{data.temp}°C</div>
            <div className="text-sm font-medium capitalize">{data.description}</div>
            <div className="text-xs opacity-60 mt-0.5">{data.city}</div>
          </div>
        </div>
      )}
    </section>
  );
};
