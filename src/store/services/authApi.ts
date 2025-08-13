import { api } from '@app/store/services/api';
import { setCredentials, setTwoFA, setUser, clearCredentials } from '@app/store/reducers/auth';
import { setStoredAccessToken } from '@app/services/http';

type LoginBody = { email: string; password: string };
type VerifyBody = { challenge_id: string; code: string };

type TokenResponse = {
  access_token: string;
  token_type: 'bearer';
  expires_in: string;
};

type Pending2FAResponse = {
  status: 'pending_2fa';
  challenge_id: string;
  ttl: number;
};

type MeResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    roles: string | string[];
    permissions: string | string[];
  };
};

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    register: build.mutation<{ message: string }, { name: string; email: string; password: string }>({
      query: (body) => ({ url: '/v1/auth/register', method: 'post', data: body }),
    }),
    login: build.mutation<TokenResponse | Pending2FAResponse, LoginBody>({
      query: (body) => ({ url: '/v1/auth/login', method: 'post', data: body }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if ((data as Pending2FAResponse).status === 'pending_2fa') {
            const pending = data as Pending2FAResponse;
            dispatch(
              setTwoFA({ pending: true, challengeId: pending.challenge_id, ttl: pending.ttl })
            );
            return;
          }
          const token = data as TokenResponse;
          setStoredAccessToken(token.access_token);
          dispatch(setTwoFA({ pending: false, challengeId: null, ttl: null }));
          dispatch(
            setCredentials({ accessToken: token.access_token, expiresIn: token.expires_in })
          );
          // Fetch user profile
          await dispatch(authApi.endpoints.me.initiate(undefined, { forceRefetch: true }));
        } catch (e) {
          // noop, handled by UI
        }
      },
    }),
    verifyTwoFactor: build.mutation<TokenResponse, VerifyBody>({
      query: (body) => ({ url: '/v1/auth/2fa/verify', method: 'post', data: body }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const token = data as TokenResponse;
          setStoredAccessToken(token.access_token);
          dispatch(setTwoFA({ pending: false, challengeId: null, ttl: null }));
          dispatch(
            setCredentials({ accessToken: token.access_token, expiresIn: token.expires_in })
          );
          await dispatch(authApi.endpoints.me.initiate(undefined, { forceRefetch: true }));
        } catch (e) {
          // noop
        }
      },
    }),
    me: build.query<MeResponse, void>({
      query: () => ({ url: '/v1/auth/me', method: 'get' }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data.user));
        } catch (e) {
          // invalid token likely
          setStoredAccessToken(null);
          dispatch(clearCredentials());
        }
      },
      providesTags: ['User', 'Auth'],
    }),
    refresh: build.mutation<TokenResponse, void>({
      query: () => ({ url: '/v1/auth/refresh', method: 'post' }),
    }),
    logout: build.mutation<{ message: string }, void>({
      query: () => ({ url: '/v1/auth/logout', method: 'post' }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          setStoredAccessToken(null);
          dispatch(clearCredentials());
        }
      },
    }),
  }),
});

export const { useRegisterMutation, useLoginMutation, useVerifyTwoFactorMutation, useMeQuery, useLogoutMutation } = authApi;


