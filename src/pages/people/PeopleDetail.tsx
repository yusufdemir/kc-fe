import { useParams, Link } from 'react-router-dom';
import { useGetPersonQuery } from '@app/store/services/peopleApi';
import ContentHeader from '@app/components/content-header/ContentHeader';

const PeopleDetail = () => {
  const { id } = useParams();
  const personId = Number(id);
  const { data, isFetching } = useGetPersonQuery(personId);
  const p = data?.data;
  return (
    <>
      <ContentHeader title="Kişi Detayı" />
      <section className="content">
      <div className="container-fluid">
        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between">
            <h3 className="card-title">Kişi Detayı</h3>
            <div>
              <Link to={`/people/${personId}/edit`} className="btn btn-info btn-sm mr-2">
                Düzenle
              </Link>
              <Link to="/people" className="btn btn-default btn-sm">
                Listeye Dön
              </Link>
            </div>
          </div>
          <div className="card-body">
            {isFetching && <div>Yükleniyor...</div>}
            {!isFetching && p && (
              <table className="table">
                <tbody>
                  <tr>
                    <th>ID</th>
                    <td>{p.id}</td>
                  </tr>
                  <tr>
                    <th>Ad Soyad</th>
                    <td>{p.full_name}</td>
                  </tr>
                  <tr>
                    <th>Email</th>
                    <td>{p.email}</td>
                  </tr>
                  <tr>
                    <th>Yaş</th>
                    <td>{p.age ?? '-'}</td>
                  </tr>
                  <tr>
                    <th>TC</th>
                    <td>{p.citizenship_no}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

export default PeopleDetail;


