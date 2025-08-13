import { IUser } from '@app/types/user';
import { createSlice } from '@reduxjs/toolkit';
import { getStoredAccessToken } from '@app/services/http';

export interface AuthState {
  currentUser: IUser | null;
  accessToken: string | null;
  expiresAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    roles: string | string[];
    permissions: string | string[];
  } | null;
  twoFA: {
    pending: boolean;
    challengeId: string | null;
    ttl: number | null;
  };
}

const initialState: AuthState = {
  currentUser: null,
  accessToken: getStoredAccessToken(),
  expiresAt: null,
  user: null,
  twoFA: { pending: false, challengeId: null, ttl: null },
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCurrentUser: (
      state: AuthState,
      { payload }: { payload: IUser | null }
    ) => {
      state.currentUser = payload;
    },
    setCredentials: (
      state: AuthState,
      { payload }: { payload: { accessToken: string; expiresIn?: string | number } }
    ) => {
      state.accessToken = payload.accessToken;
      if (payload.expiresIn != null) {
        const now = Date.now();
        const ms = typeof payload.expiresIn === 'string' ? Number(payload.expiresIn) * 1000 : payload.expiresIn * 1000;
        state.expiresAt = new Date(now + (isNaN(ms) ? 0 : ms)).toISOString();
      }
    },
    clearCredentials: (state: AuthState) => {
      state.accessToken = null;
      state.expiresAt = null;
      state.user = null;
      state.twoFA = { pending: false, challengeId: null, ttl: null };
    },
    setUser: (
      state: AuthState,
      { payload }: { payload: AuthState['user'] }
    ) => {
      state.user = payload;
    },
    setTwoFA: (
      state: AuthState,
      { payload }: { payload: { pending: boolean; challengeId: string | null; ttl: number | null } }
    ) => {
      state.twoFA = payload;
    },
  },
});

export const { setCurrentUser, setCredentials, clearCredentials, setUser, setTwoFA } = authSlice.actions;

export default authSlice.reducer;
