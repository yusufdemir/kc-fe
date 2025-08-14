import { useEffect, useMemo, useRef, useState } from 'react';
import { useGetPeopleQuery, useDeletePersonMutation } from '@app/store/services/peopleApi';
import type { PeopleQueryParams, PersonResource } from '@app/types/people';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ContentHeader from '@app/components/content-header/ContentHeader';
import { OverlayLoading } from '@app/components/OverlayLoading';
import { useGetCountriesQuery, useGetStatesQuery, useGetCitiesQuery, useGetCurrenciesQuery } from '@app/store/services/worldApi';

const PeopleList = () => {
  // q devre dışı
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [ageMin, setAgeMin] = useState<number | null>(null);
  const [ageMax, setAgeMax] = useState<number | null>(null);
  const [countryId, setCountryId] = useState<number | null>(null);
  const [stateId, setStateId] = useState<number | null>(null);
  const [cityId, setCityId] = useState<number | null>(null);
  const [currencyId, setCurrencyId] = useState<number | null>(null);
  const [sort, setSort] = useState<PeopleQueryParams['sort']>('-id');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [citizenshipNo, setCitizenshipNo] = useState('');
  // Uygulanan filtreler (Ara tıklanınca güncellenir)
  const [appliedFilters, setAppliedFilters] = useState<PeopleQueryParams>({});
  const [showFilters, setShowFilters] = useState(true);
  const [autoSearch, setAutoSearch] = useState(true);
  const debounceTimerRef = useRef<number | null>(null);

  const params: PeopleQueryParams = useMemo(
    () => ({
      ...appliedFilters,
      page,
      per_page: perPage,
    }),
    [appliedFilters, page, perPage]
  );

  const { data, isFetching, refetch } = useGetPeopleQuery(params, {
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  const { data: countriesData, isFetching: loadingCountries } = useGetCountriesQuery();
  const { data: statesData, isFetching: loadingStates } = useGetStatesQuery(countryId ?? 0, { skip: !countryId });
  const { data: citiesData, isFetching: loadingCities } = useGetCitiesQuery(stateId ?? 0, { skip: !stateId });
  const { data: currenciesData, isFetching: loadingCurrencies } = useGetCurrenciesQuery(
    countryId ? { country_id: countryId } : undefined
  );

  // Debounced auto search
  useEffect(() => {
    if (!autoSearch) return;
    if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = window.setTimeout(() => {
      const next: PeopleQueryParams = {
        first_name: firstName || null,
        last_name: lastName || null,
        email: email || null,
        citizenship_no: citizenshipNo || null,
        age_min: ageMin,
        age_max: ageMax,
        country_id: countryId,
        state_id: stateId,
        city_id: cityId,
        currency_id: currencyId,
        sort: sort || null,
      };
      setAppliedFilters(next);
      setPage(1);
    }, 600);
    return () => {
      if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    };
  }, [firstName, lastName, email, citizenshipNo, ageMin, ageMax, countryId, stateId, cityId, currencyId, sort, perPage, autoSearch]);
  const [del, { isLoading: deleting }] = useDeletePersonMutation();
  const navigate = useNavigate();

  const onDelete = async (id: number) => {
    try {
      const ok = window.confirm('Bu kişiyi silmek istediğinize emin misiniz?');
      if (!ok) return;
      await del(id).unwrap();
      toast.success('Silindi');
      refetch();
    } catch (e: any) {
      toast.error(e?.data?.message || 'Silinemedi');
    }
  };

  const appliedFiltersCount = useMemo(() => {
    return Object.entries(appliedFilters).reduce((acc, [key, value]) => {
      if (value === null || value === undefined || value === '' || key === 'page' || key === 'per_page') return acc;
      return acc + 1;
    }, 0);
  }, [appliedFilters]);

  const getInitials = (p: PersonResource) => {
    const a = (p.first_name || '').trim();
    const b = (p.last_name || '').trim();
    const ai = a ? a[0] : '';
    const bi = b ? b[0] : '';
    return (ai + bi).toUpperCase() || 'K';
  };

  const colorFromId = (id: number) => {
    const colors = ['#6366F1', '#1D4ED8', '#059669', '#D97706', '#EF4444', '#0EA5E9', '#8B5CF6', '#14B8A6'];
    return colors[id % colors.length];
  };

  return (
    <>
      <ContentHeader title="Kişiler" />
      <section className="content">
        <div className="container-fluid">
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <button className="btn btn-default btn-sm mr-2" onClick={() => setShowFilters((s) => !s)}>
                  <i className={`fa ${showFilters ? 'fa-chevron-up' : 'fa-chevron-down'} mr-1`} />
                  Filtreler {appliedFiltersCount > 0 ? `(${appliedFiltersCount})` : ''}
                </button>
              </div>
              <div className="d-flex align-items-center flex-grow-1 justify-content-end">
                <div className="mr-2 d-none d-md-flex align-items-center">
                  <div className="custom-control custom-switch mr-3">
                    <input type="checkbox" className="custom-control-input" id="autoSearchSwitch" checked={autoSearch} onChange={(e) => setAutoSearch(e.target.checked)} />
                    <label className="custom-control-label" htmlFor="autoSearchSwitch">Auto</label>
                  </div>
                  <span className="mr-2 text-muted small">Sayfa Başına</span>
                  <select className="form-control form-control-sm" value={perPage} onChange={(e) => setPerPage(Number(e.target.value))}>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/people/new')}>
                  <i className="fa fa-user-plus mr-2" /> Yeni Kişi
                </button>
              </div>
            </div>
            {showFilters && (
              <div className="card-body pt-0">
                <div className="row">
                  <div className="col-md-3 mb-2">
                    <label className="small text-muted">Ad</label>
                    <input className="form-control form-control-sm" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div className="col-md-3 mb-2">
                    <label className="small text-muted">Soyad</label>
                    <input className="form-control form-control-sm" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                  <div className="col-md-3 mb-2">
                    <label className="small text-muted">Email</label>
                    <input className="form-control form-control-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="col-md-3 mb-2">
                    <label className="small text-muted">TC</label>
                    <input className="form-control form-control-sm" value={citizenshipNo} onChange={(e) => setCitizenshipNo(e.target.value)} />
                  </div>
                <div className="col-md-4 mb-2">
                  <label className="small text-muted d-block">Konum</label>
                  <div className="d-flex">
                    <select
                      className="form-control form-control-sm mr-1"
                      value={countryId ?? ''}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : null;
                        setCountryId(val);
                        setStateId(null);
                        setCityId(null);
                      }}
                    >
                      <option value="">Ülke</option>
                      {countriesData?.data?.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <select
                      className="form-control form-control-sm mr-1"
                      value={stateId ?? ''}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : null;
                        setStateId(val);
                        setCityId(null);
                      }}
                      disabled={!countryId || loadingStates}
                    >
                      <option value="">Eyalet</option>
                      {statesData?.data?.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <select
                      className="form-control form-control-sm"
                      value={cityId ?? ''}
                      onChange={(e) => setCityId(e.target.value ? Number(e.target.value) : null)}
                      disabled={!stateId || loadingCities}
                    >
                      <option value="">Şehir</option>
                      {citiesData?.data?.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                  <div className="col-md-3 mb-2">
                    <label className="small text-muted">Yaş Aralığı</label>
                    <div className="d-flex">
                      <input className="form-control form-control-sm mr-1" placeholder="Min" type="number" value={ageMin ?? ''} onChange={(e) => setAgeMin(e.target.value ? Number(e.target.value) : null)} />
                      <input className="form-control form-control-sm" placeholder="Max" type="number" value={ageMax ?? ''} onChange={(e) => setAgeMax(e.target.value ? Number(e.target.value) : null)} />
                    </div>
                  </div>
                <div className="col-md-2 mb-2">
                  <label className="small text-muted">Para Birimi</label>
                  <select
                    className="form-control form-control-sm"
                    value={currencyId ?? ''}
                    onChange={(e) => setCurrencyId(e.target.value ? Number(e.target.value) : null)}
                    disabled={loadingCurrencies}
                  >
                    <option value="">Seçiniz</option>
                    {currenciesData?.data?.map((cur) => (
                      <option key={cur.id} value={cur.id}>{cur.code} - {cur.name}</option>
                    ))}
                  </select>
                </div>
                  <div className="col-md-3 mb-2">
                    <label className="small text-muted">Sırala</label>
                    <select className="form-control form-control-sm" value={sort ?? ''} onChange={(e) => setSort((e.target.value || null) as any)}>
                      <option value="">-</option>
                      <option value="id">ID (Artan)</option>
                      <option value="-id">ID (Azalan)</option>
                      <option value="created_at">Oluşturma (Artan)</option>
                      <option value="-created_at">Oluşturma (Azalan)</option>
                      <option value="age">Yaş (Artan)</option>
                      <option value="-age">Yaş (Azalan)</option>
                    </select>
                  </div>
                  <div className="col-md-9" />
                </div>
                <div className="d-flex justify-content-end mt-2">
                  <button
                    className="btn btn-default mr-2"
                    onClick={() => {
                      setFirstName('');
                      setLastName('');
                      setEmail('');
                      setCitizenshipNo('');
                      setAgeMin(null);
                      setAgeMax(null);
                      setCountryId(null);
                      setStateId(null);
                      setCityId(null);
                      setCurrencyId(null);
                      setSort('-id');
                      setAppliedFilters({});
                      setPage(1);
                    }}
                  >
                    Sıfırla
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      const next: PeopleQueryParams = {
                        first_name: firstName || null,
                        last_name: lastName || null,
                        email: email || null,
                        citizenship_no: citizenshipNo || null,
                        age_min: ageMin,
                        age_max: ageMax,
                        country_id: countryId,
                        state_id: stateId,
                        city_id: cityId,
                        currency_id: currencyId,
                        sort: sort || null,
                      };
                      setAppliedFilters(next);
                      setPage(1);
                    }}
                  >
                    <i className="fa fa-search mr-2" /> Ara
                  </button>
                </div>
              </div>
            )}
            <div className="card-body table-responsive p-0 position-relative">
              {isFetching && <OverlayLoading type="light" />}
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Kişi</th>
                    <th>Yaş</th>
                    <th>Konum</th>
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data?.map((p: PersonResource) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div
                            className="mr-2 d-flex align-items-center justify-content-center"
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              backgroundColor: colorFromId(p.id),
                              color: '#fff',
                              fontWeight: 700,
                            }}
                          >
                            {getInitials(p)}
                          </div>
                          <div className="d-flex flex-column">
                            <Link to={`/people/${p.id}`} className="font-weight-bold text-dark">
                              {p.first_name} {p.last_name}
                            </Link>
                            <a href={`mailto:${p.email}`} className="text-muted small">{p.email}</a>
                          </div>
                        </div>
                      </td>
                      <td>
                        {p.age != null ? <span className="badge badge-info">{p.age}</span> : <span className="text-muted">-</span>}
                      </td>
                      <td>
                        <span className="text-muted small">
                          {p.country?.name || '-'}{p.city?.name ? `, ${p.city.name}` : ''}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm" role="group">
                          <Link to={`/people/${p.id}`} className="btn btn-default" title="Detay">
                            <i className="fa fa-eye" />
                          </Link>
                          <Link to={`/people/${p.id}/edit`} className="btn btn-info" title="Düzenle">
                            <i className="fa fa-edit" />
                          </Link>
                          <button className="btn btn-danger" title="Sil" disabled={deleting} onClick={() => onDelete(p.id)}>
                            <i className="fa fa-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!data?.data?.length && (
                    <tr>
                      <td colSpan={6} className="text-center p-4">
                        {isFetching ? (
                          <span><i className="fa fa-spinner fa-spin mr-2" />Yükleniyor...</span>
                        ) : (
                          <span className="text-muted"><i className="fa fa-users mr-2" />Kayıt bulunamadı</span>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          <div className="card-footer d-flex align-items-center justify-content-between">
            <div className="text-muted small">Toplam: {data?.meta?.total ?? data?.data?.length ?? 0}</div>
            <div className="d-flex align-items-center">
              <div className="mr-2">Sayfa: {data?.meta?.current_page ?? page}</div>
              <button
                className="btn btn-default btn-sm mr-2"
                disabled={!data?.links?.prev && (data?.meta ? data.meta.current_page <= 1 : page <= 1)}
                onClick={() => setPage((p) => Math.max(1, (data?.meta?.current_page ?? p) - 1))}
              >
                <i className="fa fa-chevron-left" /> Önceki
              </button>
              <button
                className="btn btn-default btn-sm"
                disabled={!data?.links?.next && (data?.meta ? data.meta.current_page >= (data.meta.last_page || 1) : false)}
                onClick={() => setPage((p) => (data?.meta ? Math.min(data.meta.last_page || p + 1, (data.meta.current_page || p) + 1) : p + 1))}
              >
                Sonraki <i className="fa fa-chevron-right" />
              </button>
            </div>
          </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PeopleList;


