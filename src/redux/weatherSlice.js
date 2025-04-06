// redux/weatherSlice.js
import { createSlice } from '@reduxjs/toolkit';

const loadStateFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem('weatherState');
    if (serializedState === null) {
      return {
        cities: ['New York', 'London', 'Tokyo'],
        favoriteCities: [],
      };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Could not load state from localStorage:', err);
    return {
      cities: ['New York', 'London', 'Tokyo'],
      favoriteCities: [],
    };
  }
};

const initialState = loadStateFromLocalStorage();

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    addCity: (state, action) => {
      if (!state.cities.includes(action.payload)) {
        state.cities.push(action.payload);
      }
    },
    removeCity: (state, action) => {
      state.cities = state.cities.filter(city => city !== action.payload);
      state.favoriteCities = state.favoriteCities.filter(city => city !== action.payload);
    },
    toggleFavorite: (state, action) => {
      const city = action.payload;
      if (state.favoriteCities.includes(city)) {
        state.favoriteCities = state.favoriteCities.filter(fav => fav !== city);
      } else {
        state.favoriteCities.push(city);
      }
    },
  },
});

export const { addCity, removeCity, toggleFavorite } = weatherSlice.actions;
export default weatherSlice.reducer;