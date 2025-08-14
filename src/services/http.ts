import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const { VITE_API_BASE_URL, VITE_TOKEN_STORAGE_KEY } = import.meta.env as {
  VITE_API_BASE_URL?: string;
  VITE_TOKEN_STORAGE_KEY?: string;
};

const API_BASE_URL = VITE_API_BASE_URL || '/api';
const TOKEN_KEY = VITE_TOKEN_STORAGE_KEY || 'access_token';

let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

export const getStoredAccessToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setStoredAccessToken = (token: string | null) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // noop
  }
};

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredAccessToken();
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

const processQueue = (token: string | null) => {
  pendingRequests.forEach((cb) => cb(token));
  pendingRequests = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    const status = error.response?.status;
    if (status === 429) {
      // Too many attempts; bubble up and let UI show a toast.
      return Promise.reject(error);
    }

    const url = originalRequest?.url || '';
    const isAuthPath = url.includes('/v1/auth/login') || url.includes('/v1/auth/refresh') || url.includes('/v1/auth/logout');
    const hasToken = Boolean(getStoredAccessToken());
    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthPath && hasToken) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push((token) => {
            if (!token) {
              reject(error);
              return;
            }
            if (originalRequest.headers) (originalRequest.headers as any).Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        const refreshResponse = await apiClient.post('/v1/auth/refresh');
        const newToken = (refreshResponse.data as any)?.access_token as string | undefined;
        if (newToken) {
          setStoredAccessToken(newToken);
          processQueue(newToken);
          if (originalRequest.headers) (originalRequest.headers as any).Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
        setStoredAccessToken(null);
        processQueue(null);
        return Promise.reject(error);
      } catch (refreshErr) {
        setStoredAccessToken(null);
        processQueue(null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;


