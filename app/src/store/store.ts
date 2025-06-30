import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import ticketsReducer from './ticketsSlice';
import callsReducer from './callsSlice';
import analyticsReducer from './analyticsSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    tickets: ticketsReducer,
    calls: callsReducer,
    analytics: analyticsReducer,
  },
});

// Types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
