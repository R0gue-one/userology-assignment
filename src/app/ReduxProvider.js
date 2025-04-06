'use client';

import { Provider } from 'react-redux';
import { store } from '../redux/store'; // Adjust path based on your structure

export default function ReduxProvider({ children }) {
  return <Provider store={store}>{children}</Provider>;
}