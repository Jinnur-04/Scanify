import { configureStore, combineReducers } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import dashboardReducer from './slices/dashboardSlice'; // ✅ Add this
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';

// 🔒 Redux Persist Config
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'], // ✅ Only persist user (you typically don't persist dashboard data)
};

// 🔗 Combine all reducers
const rootReducer = combineReducers({
  user: userReducer,
  dashboard: dashboardReducer,
});

// 🔁 Persisted Reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 🏗️ Configure Store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // ✅ Required for redux-persist
    }),
});

// 🔃 Create Persistor
export const persistor = persistStore(store);
