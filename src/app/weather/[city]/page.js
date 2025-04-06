// app/weather/[city]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

import axios from 'axios';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export default function CityWeatherPage() {
  const { city } = useParams();
  const [currentWeather, setCurrentWeather] = useState(null);
  const [historyWeather, setHistoryWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSubmit = (e) => {
    e.preventDefault()
    const route = `/weather/${query.toLowerCase().replace(/\s+/g, '-')}`
    router.push(route)
  }

  useEffect(() => {
    async function fetchWeatherData() {
      try {
        setLoading(true);
        
        // Fetch current weather
        const currentRes = await axios.get(`/api/weather?city=${city}&type=current`);
        setCurrentWeather(currentRes.data);
        
        // Fetch history weather (past 7 days)
        const historyRes = await axios.get(`/api/weather?city=${city}&type=history`);
        setHistoryWeather(historyRes.data);
        
        // Process historical data for charts
        if (historyRes.data && historyRes.data.forecast && historyRes.data.forecast.forecastday) {
          const processedData = historyRes.data.forecast.forecastday.map(day => ({
            date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            avgTemp: day.day.avgtemp_c,
            minTemp: day.day.mintemp_c,
            maxTemp: day.day.maxtemp_c,
            humidity: day.day.avghumidity,
            precipitation: day.day.totalprecip_mm,
            uv: day.day.uv 
          }));
          // Sort data by date to ensure correct order
          processedData.sort((a, b) => new Date(a.date) - new Date(b.date));
          setChartData(processedData);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('Failed to load weather data. Please try again later.');
        setLoading(false);
      }
    }

    if (city) {
      fetchWeatherData();
    }
  }, [city]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (!currentWeather || !historyWeather) {
    return null;
  }

  // Get current date and time
  const currentDate = new Date(currentWeather.location.localtime);
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = currentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 p-4">
      <form onSubmit={handleSubmit} className="flex items-center border rounded-full px-4 py-2 shadow-md w-full max-w-md bg-white">
        <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city"
            className="flex-grow outline-none text-sm px-2 text-black"
        />
        <button type="submit" className="ml-2 bg-stone-700 text-white p-2 rounded-full hover:bg-blue-900 transition">
            <Search className="w-4 h-4" />
        </button>
        </form>

    <div className="container mx-auto px-4 py-8 max-w-6xl ">
      {/* Header Section - Simplified */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-4xl font-bold">{currentWeather.location.name}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">{currentWeather.location.region}, {currentWeather.location.country}</p>
            <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">{formattedDate} | {formattedTime}</p>
          </div>
        </div>
      </div>

      {/* Current Weather Details - Enhanced with Current Temp */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Current Conditions</h2>
            <div className="flex items-center">
              <img 
                src={currentWeather.current.condition.icon.replace('//', 'https://')} 
                alt={currentWeather.current.condition.text}
                className="w-12 h-12"
              />
              <span className="text-4xl font-bold ml-2">{currentWeather.current.temp_c}°C</span>
            </div>
          </div>
          
          <p className="text-lg mb-4 text-center font-medium text-gray-600 dark:text-gray-300">
            {currentWeather.current.condition.text}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-gray-500 dark:text-gray-300 text-sm">Feels Like</p>
              <p className="font-medium text-lg">{currentWeather.current.feelslike_c}°C</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-gray-500 dark:text-gray-300 text-sm">Wind</p>
              <p className="font-medium text-lg">{currentWeather.current.wind_kph} km/h</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-gray-500 dark:text-gray-300 text-sm">Humidity</p>
              <p className="font-medium text-lg">{currentWeather.current.humidity}%</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-gray-500 dark:text-gray-300 text-sm">UV Index</p>
              <p className="font-medium text-lg">{currentWeather.current.uv}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-gray-500 dark:text-gray-300 text-sm">Pressure</p>
              <p className="font-medium text-lg">{currentWeather.current.pressure_mb} mb</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-gray-500 dark:text-gray-300 text-sm">Visibility</p>
              <p className="font-medium text-lg">{currentWeather.current.vis_km} km</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-gray-500 dark:text-gray-300 text-sm">Cloud Cover</p>
              <p className="font-medium text-lg">{currentWeather.current.cloud}%</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-gray-500 dark:text-gray-300 text-sm">Precipitation</p>
              <p className="font-medium text-lg">{currentWeather.current.precip_mm} mm</p>
            </div>
          </div>
        </div>

        {/* Sunrise/Sunset Component */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Sunrise & Sunset</h2>
          {historyWeather.forecast && historyWeather.forecast.forecastday && historyWeather.forecast.forecastday[0] ? (
            <>
              <div className="flex justify-between items-center mt-6">
                <div className="text-center">
                  <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full mx-auto mb-2 w-16 h-16 flex items-center justify-center">
                    <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">Sunrise</p>
                  <p className="font-medium text-lg">
                    {historyWeather.forecast.forecastday[0].astro.sunrise}
                  </p>
                </div>
                
                <div className="flex-1 px-4">
                  <div className="h-2 bg-gradient-to-r from-yellow-300 via-blue-400 to-indigo-600 rounded-full"></div>
                </div>
                
                <div className="text-center">
                  <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-full mx-auto mb-2 w-16 h-16 flex items-center justify-center">
                    <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">Sunset</p>
                  <p className="font-medium text-lg">
                    {historyWeather.forecast.forecastday[0].astro.sunset}
                  </p>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="font-medium mb-2">Moon Phase</h3>
                <div className="flex items-center">
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full mr-3">
                    <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                    </svg>
                  </div>
                  <span>{historyWeather.forecast.forecastday[0].astro.moon_phase}</span>
                </div>
              </div>
            </>
          ) : (
            <p>Astronomy data not available</p>
          )}
        </div>
      </div>

      {/* Temperature Chart */}
      {chartData.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Temperature Trend (7 Days)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="maxTemp" stroke="#ef4444" name="Max Temp" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="avgTemp" stroke="#f97316" name="Avg Temp" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="minTemp" stroke="#3b82f6" name="Min Temp" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}

      {/* Additional Charts */}
      {chartData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Precipitation Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Precipitation (7 Days)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: 'Precipitation (mm)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="precipitation" fill="#60a5fa" radius={[4, 4, 0, 0]} name="Precipitation" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Humidity Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Humidity (7 Days)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} label={{ value: 'Humidity (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Line type="monotone" dataKey="humidity" stroke="#8b5cf6" strokeWidth={2} name="Humidity" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : null}

      {/* Historical Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">7-Day Weather History</h2>
        {historyWeather.forecast && historyWeather.forecast.forecastday ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Date</th>
                  <th className="py-3 px-6 text-left">Condition</th>
                  <th className="py-3 px-6 text-center">Max Temp</th>
                  <th className="py-3 px-6 text-center">Min Temp</th>
                  <th className="py-3 px-6 text-center">Avg Temp</th>
                  <th className="py-3 px-6 text-center">Humidity</th>
                  <th className="py-3 px-6 text-center">Precipitation</th>
                  <th className="py-3 px-6 text-center">UV Index</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 dark:text-gray-300">
                {historyWeather.forecast.forecastday.map((day, index) => (
                  <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-6 text-left">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 px-6 text-left flex items-center">
                      <img 
                        src={day.day.condition.icon.replace('//', 'https://')} 
                        alt={day.day.condition.text}
                        className="w-8 h-8 mr-2"
                      />
                      {day.day.condition.text}
                    </td>
                    <td className="py-3 px-6 text-center">{day.day.maxtemp_c}°C</td>
                    <td className="py-3 px-6 text-center">{day.day.mintemp_c}°C</td>
                    <td className="py-3 px-6 text-center">{day.day.avgtemp_c}°C</td>
                    <td className="py-3 px-6 text-center">{day.day.avghumidity}%</td>
                    <td className="py-3 px-6 text-center">{day.day.totalprecip_mm} mm</td>
                    <td className="py-3 px-6 text-center">{day.day.uv}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Historical data not available</p>
        )}
      </div>
    </div>
    </div>
  );
}