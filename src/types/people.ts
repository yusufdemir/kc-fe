export type Country = { id: string; name: string; iso2: string };
export type State = { id: string; name: string };
export type City = { id: string; name: string };
export type Currency = { id: string; code: string; name: string };

export interface PersonResource {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  age: number | null;
  citizenship_no: string;
  country?: Country;
  state?: State;
  city?: City;
  currency?: Currency;
  created_at: string;
  updated_at: string;
}

export interface PersonStoreRequest {
  first_name: string;
  last_name: string;
  email: string;
  age?: number | null;
  citizenship_no: string;
  country_id: number;
  state_id?: number | null;
  city_id?: number | null;
  currency_id?: number | null;
}

export interface PersonUpdateRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  age?: number;
  citizenship_no?: string;
  country_id?: number;
  state_id?: number;
  city_id?: number;
  currency_id?: number;
}

export interface PeopleQueryParams {
  q?: string | null; // deprecated in UI
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  citizenship_no?: string | null;
  country_id?: number | null;
  state_id?: number | null;
  city_id?: number | null;
  currency_id?: number | null;
  age_min?: number | null;
  age_max?: number | null;
  sort?: 'id' | '-id' | 'created_at' | '-created_at' | 'last_name' | '-last_name' | 'age' | '-age' | null;
  per_page?: number | null;
  page?: number | null;
}


