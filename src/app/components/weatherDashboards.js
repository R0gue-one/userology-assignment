// components/weatherDashboards.js
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { addCity, removeCity, toggleFavorite } from '../../redux/weatherSlice';
import { getWeather } from '../lib/getWeather';
import {
  Cloud, Droplets, Clock, MapPin, Sun,
  CloudRain, CloudLightning, CloudFog, Star, Plus
} from 'lucide-react';

export default function WeatherDashboard() {
  const [weatherData, setWeatherData] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [newCity, setNewCity] = useState('');
  const dispatch = useDispatch();
  const { cities, favoriteCities } = useSelector((state) => state.weather);
  const router = useRouter();

  const fetchWeatherData = async () => {
    const updated = {};
    for (const city of cities) {
      updated[city] = await getWeather(city);
    }
    setWeatherData(updated);
    setLastUpdated(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 60000);
    return () => clearInterval(interval);
  }, [cities]);

  const getWeatherIcon = (condition, size = 36) => {
    const props = { size };
    if (!condition || condition === '--' || condition === 'Error') return <Cloud {...props} className="text-gray-400" />;
    const c = condition.toLowerCase();
    if (c.includes('sun') || c.includes('clear')) return <Sun {...props} className="text-yellow-400" />;
    if (c.includes('rain')) return <CloudRain {...props} className="text-blue-400" />;
    if (c.includes('storm') || c.includes('thunder')) return <CloudLightning {...props} className="text-purple-400" />;
    if (c.includes('fog') || c.includes('mist')) return <CloudFog {...props} className="text-gray-400" />;
    return <Cloud {...props} className="text-gray-400" />;
  };

  const handleDashboardClick = () => {
    router.push(`/weather/${cities[0]}`);
  };

  const handleCityClick = (city) => {
    router.push(`/weather/${city}`);
  };

  const handleAddCity = (e) => {
    e.preventDefault();
    if (newCity.trim()) {
      dispatch(addCity(newCity.trim()));
      setNewCity('');
    }
  };

  const sortedCities = [
    ...favoriteCities,
    ...cities.filter(city => !favoriteCities.includes(city)),
  ];

  return (
    <section className="space-y-6">
      <div
        onClick={handleDashboardClick}
        className="flex justify-between items-center border-b border-gray-700 pb-4 cursor-pointer hover:opacity-80 transition"
      >
        <div className="flex items-center gap-2">
          <Sun className="text-yellow-400" size={24} />
          <h2 className="text-2xl font-semibold">Weather Dashboard</h2>
        </div>
        {lastUpdated && (
          <span className="text-xs text-gray-400">(Last updated at {lastUpdated})</span>
        )}
      </div>

      {/* Add City Form */}
      <form onSubmit={handleAddCity} className="flex gap-2">
        <input
          type="text"
          value={newCity}
          onChange={(e) => setNewCity(e.target.value)}
          placeholder="Add a city..."
          className="bg-gray-700 text-white p-2 rounded-lg w-full"
        />
        <button type="submit" className="bg-teal-500 text-white p-2 rounded-full hover:bg-blue-600">
          <Plus/>
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedCities.map((city) => {
          const weatherInfo = weatherData[city] || {};
          const isFavorite = favoriteCities.includes(city);
          return (
            <div
              key={city}
              onClick={() => handleCityClick(city)}
              className="bg-gray-800/50 p-6 rounded-2xl backdrop-blur-sm border border-gray-500/50 hover:border-sky-400/30 transition-all duration-300 flex flex-col"
            >
              <div  className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="text-blue-400" size={18} />
                  <h3
                    onClick={() => handleCityClick(city)}
                    className="font-bold text-lg text-white cursor-pointer hover:underline"
                  >
                    {city.charAt(0).toUpperCase()+city.slice(1)}
                  </h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => dispatch(toggleFavorite(city))}
                    className={`p-1 ${isFavorite ? 'text-yellow-400' : 'text-gray-400'} hover:text-yellow-500`}
                  >
                    <Star size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => dispatch(removeCity(city))}
                    className="text-red-400 hover:text-red-500 p-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold text-white">{weatherInfo?.temp ?? '--'}</span>
                <span className="text-xl text-gray-300 ml-1">°C</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="text-3xl">{getWeatherIcon(weatherInfo.condition, 18)}</div>
                  <span>{weatherInfo?.condition ?? '--'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets size={20} className="text-blue-400" />
                  <span>{weatherInfo?.humidity ?? '--'}% humidity</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <Clock size={16} className="text-gray-400" />
                  <span>{weatherInfo?.time?.split(' ')[1] ?? '--'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}