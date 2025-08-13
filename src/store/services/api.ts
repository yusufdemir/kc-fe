import { createApi } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import apiClient from '@app/services/http';

type AxiosArgs = {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: AxiosRequestConfig['data'];
  params?: AxiosRequestConfig['params'];
  headers?: AxiosRequestConfig['headers'];
};

const axiosBaseQuery = ({ baseUrl = '' }: { baseUrl?: string } = {}): BaseQueryFn<
  AxiosArgs,
  unknown,
  { status?: number; data?: unknown }
> =>
  async ({ url, method = 'get', data, params, headers }) => {
    try {
      const result = await apiClient({ url: baseUrl + url, method, data, params, headers });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data ?? err.message,
        },
      };
    }
  };

const { VITE_API_BASE_URL } = import.meta.env as { VITE_API_BASE_URL?: string };

export const api = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery({ baseUrl: VITE_API_BASE_URL || '/api' }),
  refetchOnFocus: true,
  refetchOnReconnect: true,
  tagTypes: ['People', 'Person', 'Auth', 'User'],
  endpoints: () => ({}),
});


