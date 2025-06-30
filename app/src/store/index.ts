// Export store configuration
export { store } from './store';
export type { RootState, AppDispatch } from './store';

// Export typed hooks
export { useAppDispatch, useAppSelector } from './hooks';

// Export slice actions with namespace to avoid conflicts
export * as userActions from './userSlice';
export * as ticketsActions from './ticketsSlice';
export * as callsActions from './callsSlice';
export * as analyticsActions from './analyticsSlice';

// Export individual reducers if needed
export { default as userReducer } from './userSlice';
export { default as ticketsReducer } from './ticketsSlice';
export { default as callsReducer } from './callsSlice';
export { default as analyticsReducer } from './analyticsSlice';
