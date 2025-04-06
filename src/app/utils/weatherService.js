// utils/weatherService.js
import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_WEATHERAPI_KEY;

export async function getWeather(city) {
  try {
    const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}&aqi=no`;
    const res = await axios.get(url);
    const data = res.data;

    return {
      location: {
        name: data.location.name,
        region: data.location.region,
        country: data.location.country,
        localtime: data.location.localtime,
      },
      current: {
        temp_c: data.current.temp_c,
        temp_f: data.current.temp_f,
        condition: data.current.condition.text,
        conditionIcon: data.current.condition.icon,
        humidity: data.current.humidity,
        wind_kph: data.current.wind_kph,
        wind_dir: data.current.wind_dir,
        pressure_mb: data.current.pressure_mb,
        precip_mm: data.current.precip_mm,
        feelslike_c: data.current.feelslike_c,
        uv: data.current.uv,
        vis_km: data.current.vis_km,
        cloud: data.current.cloud,
      }
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw new Error("Failed to fetch weather data");
  }
}

export async function getWeatherHistory(city) {
  try {
    // Calculate date 7 days ago
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6); // Get 7 days including today
    
    const endDate = today.toISOString().split('T')[0];
    const startDate = sevenDaysAgo.toISOString().split('T')[0];
    
    const url = `https://api.weatherapi.com/v1/history.json?key=${API_KEY}&q=${city}&dt=${startDate}&end_dt=${endDate}`;
    const res = await axios.get(url);
    return res.data;
  } catch (error) {
    console.error("Error fetching weather history data:", error);
    throw new Error("Failed to fetch weather history data");
  }
}