import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_WEATHERAPI_KEY;

export async function getWeather(city) {
  console.log("WeatherAPI Key:", API_KEY);
  const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}&aqi=no`;

  const res = await axios.get(url);
  const data = res.data;

  return {
    temp: data.current.temp_c,
    condition: data.current.condition.text,
    humidity: data.current.humidity,
    time: data.location.localtime,
  };
}
