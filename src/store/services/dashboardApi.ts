import { api } from '@app/store/services/api';

type OverviewResponse = unknown;

export const dashboardApi = api.injectEndpoints({
  endpoints: (build) => ({
    getOverview: build.query<OverviewResponse, void>({
      query: () => ({ url: '/v1/dashboard/overview', method: 'get' }),
      // Yavaş yanıtları gereksiz tekrar tetiklememek için otomatik refetch kapalı
      keepUnusedDataFor: 60,
    }),
  }),
});

export const { useGetOverviewQuery } = dashboardApi;


