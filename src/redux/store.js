import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import rootReducer from './rootReducer';

const persistConfig = {
  key: 'root',
  version: 2,
  storage,
  whitelist: [],
  blacklist: [],
};
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user'],
};
const settingsPersistConfig = {
  key: 'settings',
  storage,
  whitelist: ['settings'],
};
const themePersistConfig = {
  key: 'theme',
  storage,
  whitelist: ['theme'],
};

const persistedReducer = combineReducers({
  ...rootReducer,
  auth: persistReducer(authPersistConfig, rootReducer.auth),
  globalSettings: persistReducer(
    settingsPersistConfig,
    rootReducer.globalSettings
  ),
  theme: persistReducer(themePersistConfig, rootReducer.theme),
});

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
