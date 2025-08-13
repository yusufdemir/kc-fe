import { useMemo, useState, useEffect } from 'react';
import { useGetPeopleQuery, useDeletePersonMutation } from '@app/store/services/peopleApi';
import type { PeopleQueryParams, PersonResource } from '@app/types/people';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ContentHeader from '@app/components/content-header/ContentHeader';

const PeopleList = () => {
  // q devre dışı: arayüzde kullanmıyoruz, backend geriye uyum için param duruyor
  const [q] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [ageMin, setAgeMin] = useState<number | null>(null);
  const [ageMax, setAgeMax] = useState<number | null>(null);
  const [countryId, setCountryId] = useState<number | null>(null);
  const [stateId, setStateId] = useState<number | null>(null);
  const [cityId, setCityId] = useState<number | null>(null);
  const [currencyId, setCurrencyId] = useState<number | null>(null);
  const [sort, setSort] = useState<PeopleQueryParams['sort']>('last_name');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [citizenshipNo, setCitizenshipNo] = useState('');
  
  // debounce for search
  const [debouncedFirstName, setDebouncedFirstName] = useState(firstName);
  const [debouncedLastName, setDebouncedLastName] = useState(lastName);
  const [debouncedEmail, setDebouncedEmail] = useState(email);
  const [debouncedCitizenshipNo, setDebouncedCitizenshipNo] = useState(citizenshipNo);
  useEffect(() => { const t = setTimeout(() => setDebouncedFirstName(firstName), 400); return () => clearTimeout(t); }, [firstName]);
  useEffect(() => { const t = setTimeout(() => setDebouncedLastName(lastName), 400); return () => clearTimeout(t); }, [lastName]);
  useEffect(() => { const t = setTimeout(() => setDebouncedEmail(email), 400); return () => clearTimeout(t); }, [email]);
  useEffect(() => { const t = setTimeout(() => setDebouncedCitizenshipNo(citizenshipNo), 400); return () => clearTimeout(t); }, [citizenshipNo]);

  const params: PeopleQueryParams = useMemo(
    () => ({
      q: null,
      first_name: debouncedFirstName || null,
      last_name: debouncedLastName || null,
      email: debouncedEmail || null,
      citizenship_no: debouncedCitizenshipNo || null,
      page,
      per_page: perPage,
      sort: sort || null,
      age_min: ageMin,
      age_max: ageMax,
      country_id: countryId,
      state_id: stateId,
      city_id: cityId,
      currency_id: currencyId,
    }),
    [debouncedFirstName, debouncedLastName, debouncedEmail, debouncedCitizenshipNo, page, perPage, sort, ageMin, ageMax, countryId, stateId, cityId, currencyId]
  );

  const { data, isFetching, refetch } = useGetPeopleQuery(params);
  const [del, { isLoading: deleting }] = useDeletePersonMutation();
  const navigate = useNavigate();

  const onDelete = async (id: number) => {
    try {
      await del(id).unwrap();
      toast.success('Silindi');
      refetch();
    } catch (e: any) {
      toast.error(e?.data?.message || 'Silinemedi');
    }
  };

  return (
    <>
      <ContentHeader title="Kişiler" />
      <section className="content">
      <div className="container-fluid">
        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between">
            <div className="input-group" style={{ maxWidth: 360 }}>
              <input
                className="form-control"
                placeholder="Ara"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <div className="input-group-append">
                <button className="btn btn-default" onClick={() => refetch()}>
                  <i className="fas fa-search" />
                </button>
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/people/new')}>
              Yeni Kişi
            </button>
          </div>
          <div className="card-body pt-0">
            <div className="row">
              <div className="col-md-3 mb-2">
                <label className="small text-muted">Ad</label>
                <input className="form-control" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="col-md-3 mb-2">
                <label className="small text-muted">Soyad</label>
                <input className="form-control" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div className="col-md-3 mb-2">
                <label className="small text-muted">Email</label>
                <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="col-md-3 mb-2">
                <label className="small text-muted">TC</label>
                <input className="form-control" value={citizenshipNo} onChange={(e) => setCitizenshipNo(e.target.value)} />
              </div>
              <div className="col-md-2 mb-2">
                <label className="small text-muted">Yaş Min</label>
                <input className="form-control" type="number" value={ageMin ?? ''} onChange={(e) => setAgeMin(e.target.value ? Number(e.target.value) : null)} />
              </div>
              <div className="col-md-2 mb-2">
                <label className="small text-muted">Yaş Max</label>
                <input className="form-control" type="number" value={ageMax ?? ''} onChange={(e) => setAgeMax(e.target.value ? Number(e.target.value) : null)} />
              </div>
              <div className="col-md-2 mb-2">
                <label className="small text-muted">Ülke ID</label>
                <input className="form-control" type="number" value={countryId ?? ''} onChange={(e) => setCountryId(e.target.value ? Number(e.target.value) : null)} />
              </div>
              <div className="col-md-2 mb-2">
                <label className="small text-muted">Eyalet ID</label>
                <input className="form-control" type="number" value={stateId ?? ''} onChange={(e) => setStateId(e.target.value ? Number(e.target.value) : null)} />
              </div>
              <div className="col-md-2 mb-2">
                <label className="small text-muted">Şehir ID</label>
                <input className="form-control" type="number" value={cityId ?? ''} onChange={(e) => setCityId(e.target.value ? Number(e.target.value) : null)} />
              </div>
              <div className="col-md-2 mb-2">
                <label className="small text-muted">Para Birimi ID</label>
                <input className="form-control" type="number" value={currencyId ?? ''} onChange={(e) => setCurrencyId(e.target.value ? Number(e.target.value) : null)} />
              </div>
              <div className="col-md-3 mb-2">
                <label className="small text-muted">Sırala</label>
                <select className="form-control" value={sort ?? ''} onChange={(e) => setSort((e.target.value || null) as any)}>
                  <option value="">-</option>
                  <option value="id">ID</option>
                  <option value="created_at">Oluşturma (Artan)</option>
                  <option value="-created_at">Oluşturma (Azalan)</option>
                  <option value="last_name">Soyad (A-Z)</option>
                  <option value="-last_name">Soyad (Z-A)</option>
                  <option value="age">Yaş (Artan)</option>
                  <option value="-age">Yaş (Azalan)</option>
                </select>
              </div>
              <div className="col-md-2 mb-2">
                <label className="small text-muted">Sayfa Başına</label>
                <select className="form-control" value={perPage} onChange={(e) => setPerPage(Number(e.target.value))}>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
          <div className="card-body table-responsive p-0">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ad</th>
                  <th>Soyad</th>
                  <th>Email</th>
                  <th>Yaş</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((p: PersonResource) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.first_name}</td>
                    <td>{p.last_name}</td>
                    <td>{p.email}</td>
                    <td>{p.age ?? '-'}</td>
                    <td>
                      <Link to={`/people/${p.id}`} className="btn btn-xs btn-default mr-2">
                        Detay
                      </Link>
                      <Link to={`/people/${p.id}/edit`} className="btn btn-xs btn-info mr-2">
                        Düzenle
                      </Link>
                      <button className="btn btn-xs btn-danger" disabled={deleting} onClick={() => onDelete(p.id)}>
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
                {!data?.data?.length && (
                  <tr>
                    <td colSpan={6} className="text-center p-4">
                      {isFetching ? 'Yükleniyor...' : 'Kayıt bulunamadı'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="card-footer d-flex align-items-center">
            <div className="mr-2">Sayfa: {page}</div>
            <button className="btn btn-default btn-sm mr-2" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Önceki
            </button>
            <button className="btn btn-default btn-sm" onClick={() => setPage((p) => p + 1)}>
              Sonraki
            </button>
          </div>
        </div>
      </div>
      </section>
    </>
  );
};

export default PeopleList;


