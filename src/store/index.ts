import { configureStore } from '@reduxjs/toolkit';
import calculatorReducer from './slices/calculatorSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    calculator: calculatorReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;