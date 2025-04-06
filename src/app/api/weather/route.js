// app/api/weather/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_WEATHERAPI_KEY;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const type = searchParams.get('type');

  if (!city) {
    return NextResponse.json({ error: 'City parameter is required' }, { status: 400 });
  }

  try {
    if (type === 'current') {
      // Get current weather data
      const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}&aqi=no`;
      const response = await axios.get(url);
      return NextResponse.json(response.data);
    } 
    else if (type === 'history') {
      // Calculate date 7 days ago
      const today = new Date();
      
      // Create an array to store all responses
      const historicalData = { forecast: { forecastday: [] } };
      
      // We'll need to make 7 separate API calls for the past 7 days
      // because the history endpoint only returns one day at a time
      for (let i = 6; i >= 0; i--) {
        const historyDate = new Date(today);
        historyDate.setDate(today.getDate() - i);
        const formattedDate = historyDate.toISOString().split('T')[0];
        
        const url = `https://api.weatherapi.com/v1/history.json?key=${API_KEY}&q=${city}&dt=${formattedDate}`;
        const response = await axios.get(url);
        
        // Add this day's data to our collection
        if (response.data && response.data.forecast && response.data.forecast.forecastday) {
          historicalData.forecast.forecastday.push(...response.data.forecast.forecastday);
        }
        
        // Include location data from the most recent response
        if (response.data.location) {
          historicalData.location = response.data.location;
        }
      }
      
      return NextResponse.json(historicalData);
    }
    
    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    console.error('Weather API error:', error.response?.data || error.message);
    return NextResponse.json({ 
      error: 'Failed to fetch weather data', 
      details: error.response?.data || error.message 
    }, { status: 500 });
  }
}