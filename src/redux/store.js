// src/app/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import weatherReducer from './weatherSlice';
import cryptoReducer from './cryptoSlice';

export const store = configureStore({
  reducer: {
    weather: weatherReducer,
    crypto: cryptoReducer,
  },
});

// Subscribe to store updates and save to localStorage
store.subscribe(() => {
  try {
    const state = store.getState();
    // Save weather state
    const weatherState = JSON.stringify(state.weather);
    localStorage.setItem('weatherState', weatherState);
    // Save crypto state
    const cryptoState = JSON.stringify(state.crypto);
    localStorage.setItem('cryptoState', cryptoState);
  } catch (err) {
    console.error('Could not save state to localStorage:', err);
  }
});

export default store;