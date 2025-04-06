// src/app/redux/cryptoSlice.js
import { createSlice } from '@reduxjs/toolkit';

const loadStateFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem('cryptoState');
    if (serializedState === null) {
      return {
        coins: ['Bitcoin', 'Ethereum', 'Solana'],
        favoriteCoins: [],
      };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Could not load crypto state from localStorage:', err);
    return {
      coins: ['Bitcoin', 'Ethereum', 'Solana'],
      favoriteCoins: [],
    };
  }
};

const initialState = loadStateFromLocalStorage();

const cryptoSlice = createSlice({
  name: 'crypto',
  initialState,
  reducers: {
    addCoin: (state, action) => {
      if (!state.coins.includes(action.payload)) {
        state.coins.push(action.payload);
      }
    },
    removeCoin: (state, action) => {
      state.coins = state.coins.filter(coin => coin !== action.payload);
      state.favoriteCoins = state.favoriteCoins.filter(coin => coin !== action.payload);
    },
    toggleFavoriteCoin: (state, action) => {
      const coin = action.payload;
      if (state.favoriteCoins.includes(coin)) {
        state.favoriteCoins = state.favoriteCoins.filter(fav => fav !== coin);
      } else {
        state.favoriteCoins.push(coin);
      }
    },
  },
});

export const { addCoin, removeCoin, toggleFavoriteCoin } = cryptoSlice.actions;
export default cryptoSlice.reducer;