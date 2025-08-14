import { api } from '@app/store/services/api';

type Country = { id: string; name: string; iso2?: string; iso3?: string };
type State = { id: string; name: string; country_id?: string };
type City = { id: string; name: string; state_id?: string };
type Currency = { id: string; code: string; name: string; symbol?: string; country_id?: string };

type ListResponse<T> = { data: T[] };

export const worldApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCountries: build.query<ListResponse<Country>, void>({
      query: () => ({ url: `/v1/world/countries`, method: 'get' }),
    }),
    getStates: build.query<ListResponse<State>, number>({
      query: (countryId) => ({ url: `/v1/world/countries/${countryId}/states`, method: 'get' }),
    }),
    getCities: build.query<ListResponse<City>, number>({
      query: (stateId) => ({ url: `/v1/world/states/${stateId}/cities`, method: 'get' }),
    }),
    getCurrencies: build.query<ListResponse<Currency>, { country_id?: number } | void>({
      query: (params) => ({ url: `/v1/world/currencies`, method: 'get', params }),
    }),
  }),
});

export const {
  useGetCountriesQuery,
  useGetStatesQuery,
  useGetCitiesQuery,
  useGetCurrenciesQuery,
} = worldApi;


