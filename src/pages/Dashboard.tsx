import { InfoBox } from '@app/components/info-box/InfoBox';
import { ContentHeader, SmallBox } from '@components';
import {
  faBookmark,
  faCartShopping,
  faChartPie,
  faChartSimple,
  faEnvelope,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAppSelector } from '@app/store/store';
import { useGetOverviewQuery } from '@app/store/services/dashboardApi';
import { OverlayLoading } from '@app/components/OverlayLoading';
import { useMemo } from 'react';

const Dashboard = () => {
  const user = useAppSelector((s) => s.auth.user);
  const hasAdminRole = Array.isArray(user?.roles)
    ? (user?.roles as string[]).includes('admin')
    : user?.roles === 'admin';
  const hasPeopleViewPermission = Array.isArray(user?.permissions)
    ? (user?.permissions as string[]).includes('person.view')
    : user?.permissions === 'person.view';

  const {
    data: overview,
    isFetching: overviewLoading,
    isError: overviewError,
  } = useGetOverviewQuery(undefined, {
    skip: !hasAdminRole,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  type Metric = { label: string; value: number };
  type TableSection = { key: string; rows: Record<string, unknown>[] };

  const metrics: Metric[] = useMemo(() => {
    const result: Metric[] = [];
    if (
      !overview ||
      typeof overview !== 'object' ||
      !('total_persons' in overview)
    )
      return result;

    const totalPersons = (overview as { total_persons: unknown }).total_persons;
    if (typeof totalPersons === 'number') {
      result.push({ label: 'Toplam Kişi', value: totalPersons });
    }

    return result;
  }, [overview]);

  const tables: TableSection[] = useMemo(() => {
    const result: TableSection[] = [];
    if (!overview || typeof overview !== 'object') return result;

    Object.entries(overview as Record<string, any>).forEach(([key, value]) => {
      if (
        key === 'age_buckets' &&
        value &&
        typeof value === 'object' &&
        !Array.isArray(value)
      ) {
        const ageRows = Object.entries(value as Record<string, number>).map(
          ([range, count]) => ({
            range: range.replace(/_/g, ' - '),
            count,
          })
        );
        if (ageRows.length > 0) {
          result.push({ key: 'age_buckets', rows: ageRows });
        }
      } else if (
        Array.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === 'object'
      ) {
        result.push({ key, rows: value });
      }
    });
    return result;
  }, [overview]);

  return (
    <div>
      <ContentHeader title="Dashboard" />

      <section className="content">
        <div className="container-fluid">
          
            <div className="row mb-3">
              <div className="col-12">
                <div className="card">
                  <div className="card-body d-flex align-items-center justify-content-between">
                    <div>
                      <h4 className="mb-1">
                        Hoş geldiniz, {user?.name || 'Kullanıcı'} 👋
                      </h4>
                      <div className="text-muted">
                        Gününze hızlı bir başlangıç yapalım.
                      </div>
                    </div>
                    <div className="text-right d-none d-md-block">
                      <FontAwesomeIcon
                        icon={faChartPie}
                        style={{ fontSize: '36px', opacity: 0.2 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          

          {hasAdminRole && (
            <div className="row mb-3">
              <div className="col-12">
                <div className="card position-relative">
                  {overviewLoading && <OverlayLoading type="light" />}
                  <div className="card-header d-flex align-items-center justify-content-between">
                    <h3 className="card-title mb-0">Genel Bakış</h3>
                  </div>
                  <div className="card-body">
                    {overviewError && (
                      <div className="text-danger small">
                        Overview yüklenemedi.
                      </div>
                    )}
                    {!overviewError && !overviewLoading && (
                      <>
                        {metrics.length > 0 && (
                          <div className="row">
                            {metrics.map((m) => (
                              <div
                                className="col-lg-3 col-md-4 col-sm-6 mb-3"
                                key={m.label}
                              >
                                <SmallBox
                                  title={m.label}
                                  text={
                                    typeof m.value === 'number'
                                      ? m.value.toLocaleString('tr-TR')
                                      : String(m.value)
                                  }
                                  variant="info"
                                  icon={{
                                    content: (
                                      <FontAwesomeIcon
                                        icon={faUserPlus}
                                        style={{
                                          fontSize: '48px',
                                          opacity: 0.3,
                                        }}
                                      />
                                    ),
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        {hasPeopleViewPermission && tables.length > 0 && (
                          <div className="mt-3">
                            {tables.map((t) => {
                              if (
                                t.key === 'age_buckets' &&
                                t.rows.length > 0 &&
                                'range' in t.rows[0] &&
                                'count' in t.rows[0]
                              ) {
                                return (
                                  <div className="card mb-3" key={t.key}>
                                    <div className="card-header">
                                      <h3 className="card-title mb-0">
                                        Yaş Aralığına Göre Kişi Sayısı
                                      </h3>
                                    </div>
                                    <div className="card-body table-responsive p-0">
                                      <table className="table table-hover mb-0">
                                        <thead>
                                          <tr>
                                            <th>Yaş Aralığı</th>
                                            <th style={{ textAlign: 'right' }}>
                                              Kişi Sayısı
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {t.rows.map((r, idx) => (
                                            <tr key={idx}>
                                              <td>{String(r.range ?? '-')}</td>
                                              <td
                                                style={{ textAlign: 'right' }}
                                              >
                                                {typeof r.count === 'number'
                                                  ? r.count.toLocaleString(
                                                      'tr-TR'
                                                    )
                                                  : String(r.count ?? '-')}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                );
                              }

                              const rows = t.rows.slice(0, 5);
                              const columns =
                                rows.length > 0
                                  ? Object.keys(rows[0]).slice(0, 6)
                                  : [];

                              if (columns.length === 0) return null;
                                  
                              return (
                                <div className="card mb-3" key={t.key}>
                                  <div className="card-header">
                                    <h3 className="card-title mb-0">{t.key}</h3>
                                  </div>
                                  <div className="card-body table-responsive p-0">
                                    <table className="table table-hover mb-0">
                                      <thead>
                                        <tr>
                                          {columns.map((c) => (
                                            <th key={c}>{c}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {rows.map((r, idx) => (
                                          <tr key={idx}>
                                            {columns.map((c) => (
                                              <td key={c}>
                                                {r[c] != null &&
                                                typeof r[c] === 'object'
                                                  ? JSON.stringify(r[c])
                                                  : String(r[c] ?? '-')}
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                        {!rows.length && (
                                          <tr>
                                            <td
                                              colSpan={columns.length || 1}
                                              className="text-center p-3 text-muted"
                                            >
                                              Kayıt bulunamadı
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  );
};

export default Dashboard;
