import { Action, ThunkAction, configureStore } from '@reduxjs/toolkit';

import { authSlice } from '@app/store/reducers/auth';
import { uiSlice } from '@app/store/reducers/ui';
import { createLogger } from 'redux-logger';
import { api } from '@app/store/services/api';
import { setupListeners } from '@reduxjs/toolkit/query';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    ui: uiSlice.reducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    const base = getDefaultMiddleware({ serializableCheck: false }).concat(
      api.middleware
    );
    if (import.meta.env.DEV) {
      return base.concat(createLogger());
    }
    return base;
  },
});

export default store;

export const useAppDispatch = () => useDispatch<ReduxDispatch>();
export const useAppSelector: TypedUseSelectorHook<ReduxState> = useSelector;

/* Types */
export type ReduxStore = typeof store;
export type ReduxState = ReturnType<typeof store.getState>;
export type ReduxDispatch = typeof store.dispatch;
export type ReduxThunkAction<ReturnType = void> = ThunkAction<
  ReturnType,
  ReduxState,
  unknown,
  Action
>;

// Enable refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);
