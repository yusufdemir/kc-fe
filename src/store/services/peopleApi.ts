import { api } from '@app/store/services/api';
import type { PeopleQueryParams, PersonResource, PersonStoreRequest, PersonUpdateRequest } from '@app/types/people';

type PaginationLinks = {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
};

type MetaLinksItem = { url: string | null; label: string; page: number | null; active: boolean };

type PaginationMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  links: MetaLinksItem[];
  path: string;
  per_page: number;
  to: number | null;
  total: number;
};

type ListResponse = { data: PersonResource[]; links?: PaginationLinks; meta?: PaginationMeta };
type ItemResponse = { data: PersonResource };

const buildQueryString = (p: PeopleQueryParams = {}) => {
  const params = new URLSearchParams();
  if (p.q) params.append('filter[q]', p.q);
  if (p.first_name) params.append('filter[first_name]', p.first_name);
  if (p.last_name) params.append('filter[last_name]', p.last_name);
  if (p.email) params.append('filter[email]', p.email);
  if (p.citizenship_no) params.append('filter[citizenship_no]', p.citizenship_no);
  if (p.country_id != null) params.append('filter[country_id]', String(p.country_id));
  if (p.state_id != null) params.append('filter[state_id]', String(p.state_id));
  if (p.city_id != null) params.append('filter[city_id]', String(p.city_id));
  if (p.currency_id != null) params.append('filter[currency_id]', String(p.currency_id));
  if (p.age_min != null) params.append('filter[age_min]', String(p.age_min));
  if (p.age_max != null) params.append('filter[age_max]', String(p.age_max));
  if (p.sort) params.append('sort', p.sort);
  if (p.per_page != null) params.append('per_page', String(p.per_page));
  if (p.page != null) params.append('page', String(p.page));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

export const peopleApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPeople: build.query<ListResponse, PeopleQueryParams | void>({
      query: (params) => ({ url: `/v1/people${buildQueryString(params || {})}`, method: 'get' }),
      // Listeler için otomatik refetch ayarları endpoint kullanımında override edilecek
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((p) => ({ type: 'Person' as const, id: p.id })),
              { type: 'People' as const, id: 'LIST' },
            ]
          : [{ type: 'People' as const, id: 'LIST' }],
    }),
    getPerson: build.query<ItemResponse, number>({
      query: (id) => ({ url: `/v1/people/${id}`, method: 'get' }),
      providesTags: (r, e, id) => [{ type: 'Person', id }],
    }),
    createPerson: build.mutation<ItemResponse, PersonStoreRequest>({
      query: (body) => ({ url: `/v1/people`, method: 'post', data: body }),
      invalidatesTags: [{ type: 'People', id: 'LIST' }],
    }),
    updatePerson: build.mutation<ItemResponse, { id: number; body: PersonUpdateRequest }>({
      query: ({ id, body }) => ({ url: `/v1/people/${id}`, method: 'put', data: body }),
      invalidatesTags: (r, e, arg) => [{ type: 'Person', id: arg.id }],
    }),
    deletePerson: build.mutation<{ success: boolean }, number>({
      query: (id) => ({ url: `/v1/people/${id}`, method: 'delete' }),
      invalidatesTags: (r, e, id) => [{ type: 'Person', id }, { type: 'People', id: 'LIST' }],
    }),
  }),
});

export const { useGetPeopleQuery, useLazyGetPeopleQuery, useGetPersonQuery, useCreatePersonMutation, useUpdatePersonMutation, useDeletePersonMutation } = peopleApi;


