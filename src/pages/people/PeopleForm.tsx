import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useCreatePersonMutation, useGetPersonQuery, useUpdatePersonMutation } from '@app/store/services/peopleApi';
import type { PersonStoreRequest, PersonUpdateRequest } from '@app/types/people';
import { toast } from 'react-toastify';
import ContentHeader from '@app/components/content-header/ContentHeader';
import { useGetCountriesQuery, useGetStatesQuery, useGetCitiesQuery, useGetCurrenciesQuery } from '@app/store/services/worldApi';
import { useAppSelector } from '@app/store/store';

const schema = Yup.object({
  first_name: Yup.string().required('Gerekli'),
  last_name: Yup.string().required('Gerekli'),
  email: Yup.string().email('Geçersiz email').required('Gerekli'),
  age: Yup.number().min(0).max(130).nullable(),
  citizenship_no: Yup.string().required('Gerekli'),
  country_id: Yup.number().required('Gerekli'),
  state_id: Yup.number().nullable(),
  city_id: Yup.number().nullable(),
  currency_id: Yup.number().nullable(),
});

const PeopleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const personId = Number(id);

  const user = useAppSelector((s) => s.auth.user);
  const canCreate = (user?.permissions || []).includes('person.create');
  const canUpdate = (user?.permissions || []).includes('person.update');
  const canSubmit = isEdit ? canUpdate : canCreate;

  const { data } = useGetPersonQuery(personId, { skip: !isEdit });
  const [createPerson, { isLoading: creating }] = useCreatePersonMutation();
  const [updatePerson, { isLoading: updating }] = useUpdatePersonMutation();

  const formik = useFormik<PersonStoreRequest | PersonUpdateRequest>({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      age: null as any,
      citizenship_no: '',
      country_id: 0,
      state_id: null as any,
      city_id: null as any,
      currency_id: null as any,
    },
    validationSchema: schema as any,
    onSubmit: async (values) => {
      try {
        if (isEdit) {
          await updatePerson({ id: personId, body: values as PersonUpdateRequest }).unwrap();
          toast.success('Güncellendi');
          navigate(`/people/${personId}`);
        } else {
          await createPerson(values as PersonStoreRequest).unwrap();
          toast.success('Oluşturuldu');
          navigate('/people');
        }
      } catch (e: any) {
        toast.error(e?.data?.message || 'İşlem başarısız');
      }
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    if (isEdit && data?.data) {
      const p = data.data;
      formik.setValues({
        first_name: p.first_name,
        last_name: p.last_name,
        email: p.email,
        age: (p.age ?? null) as any,
        citizenship_no: p.citizenship_no,
        country_id: Number(p.country?.id ?? 0),
        state_id: (p.state?.id ? Number(p.state.id) : null) as any,
        city_id: (p.city?.id ? Number(p.city.id) : null) as any,
        currency_id: (p.currency?.id ? Number(p.currency.id) : null) as any,
      });
    }
  }, [isEdit, data?.data]);

  const { values, handleChange, handleSubmit, touched, errors, setFieldValue } = formik;

  const { data: countriesData } = useGetCountriesQuery();
  const { data: statesData, isFetching: loadingStates } = useGetStatesQuery((values.country_id as number) || 0, {
    skip: !values.country_id,
  });
  const { data: citiesData, isFetching: loadingCities } = useGetCitiesQuery((values.state_id as number) || 0, {
    skip: !values.state_id,
  });
  const { data: currenciesData, isFetching: loadingCurrencies } = useGetCurrenciesQuery(
    values.country_id ? { country_id: values.country_id as number } : undefined
  );

  return (
    <>
      <ContentHeader title={isEdit ? 'Kişi Düzenle' : 'Yeni Kişi'} />
      <section className="content">
      <div className="container-fluid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{isEdit ? 'Kişi Düzenle' : 'Yeni Kişi'}</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="form-group col-md-6">
                  <label>Ad</label>
                  <input name="first_name" className="form-control" value={values.first_name as any} onChange={handleChange} disabled={!canSubmit} />
                  {touched.first_name && errors.first_name && <div className="text-danger">{errors.first_name as any}</div>}
                </div>
                <div className="form-group col-md-6">
                  <label>Soyad</label>
                  <input name="last_name" className="form-control" value={values.last_name as any} onChange={handleChange} disabled={!canSubmit} />
                  {touched.last_name && errors.last_name && <div className="text-danger">{errors.last_name as any}</div>}
                </div>
                <div className="form-group col-md-6">
                  <label>Email</label>
                  <input name="email" type="email" className="form-control" value={values.email as any} onChange={handleChange} disabled={!canSubmit} />
                  {touched.email && errors.email && <div className="text-danger">{errors.email as any}</div>}
                </div>
                <div className="form-group col-md-6">
                  <label>Yaş</label>
                  <input name="age" type="number" className="form-control" value={(values.age as any) ?? ''} onChange={handleChange} disabled={!canSubmit} />
                </div>
                <div className="form-group col-md-6">
                  <label>TC</label>
                  <input name="citizenship_no" className="form-control" value={values.citizenship_no as any} onChange={handleChange} disabled={!canSubmit} />
                  {touched.citizenship_no && errors.citizenship_no && <div className="text-danger">{errors.citizenship_no as any}</div>}
                </div>
                <div className="form-group col-md-6">
                  <label>Ülke</label>
                  <select
                    name="country_id"
                    className="form-control"
                    value={values.country_id as any}
                    onChange={(e) => {
                      const n = e.target.value ? Number(e.target.value) : 0;
                      setFieldValue('country_id', n);
                      setFieldValue('state_id', null);
                      setFieldValue('city_id', null);
                      setFieldValue('currency_id', null);
                    }}
                    disabled={!canSubmit}
                  >
                    <option value={0}>Seçiniz</option>
                    {countriesData?.data?.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {touched.country_id && errors.country_id && <div className="text-danger">{errors.country_id as any}</div>}
                </div>
                <div className="form-group col-md-6">
                  <label>Eyalet</label>
                  <select
                    name="state_id"
                    className="form-control"
                    value={(values.state_id as any) ?? ''}
                    onChange={(e) => {
                      const n = e.target.value ? Number(e.target.value) : null;
                      setFieldValue('state_id', n);
                      setFieldValue('city_id', null);
                    }}
                    disabled={!values.country_id || loadingStates || !canSubmit}
                  >
                    <option value="">Seçiniz</option>
                    {statesData?.data?.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group col-md-6">
                  <label>Şehir</label>
                  <select
                    name="city_id"
                    className="form-control"
                    value={(values.city_id as any) ?? ''}
                    onChange={(e) => setFieldValue('city_id', e.target.value ? Number(e.target.value) : null)}
                    disabled={!values.state_id || loadingCities || !canSubmit}
                  >
                    <option value="">Seçiniz</option>
                    {citiesData?.data?.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group col-md-6">
                  <label>Para Birimi</label>
                  <select
                    name="currency_id"
                    className="form-control"
                    value={(values.currency_id as any) ?? ''}
                    onChange={(e) => setFieldValue('currency_id', e.target.value ? Number(e.target.value) : null)}
                    disabled={loadingCurrencies || !canSubmit}
                  >
                    <option value="">Seçiniz</option>
                    {currenciesData?.data?.map((cur) => (
                      <option key={cur.id} value={cur.id}>{cur.code} - {cur.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                className="btn btn-primary"
                type="submit"
                disabled={creating || updating || !canSubmit}
                title={!canSubmit ? 'Yetkiniz yok' : (isEdit ? 'Değişiklikleri Güncelle' : 'Yeni Kişi Kaydet')}
              >
                {isEdit ? 'Güncelle' : 'Kaydet'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

export default PeopleForm;


