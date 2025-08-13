import { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppSelector } from '@app/store/store';
import { useVerifyTwoFactorMutation } from '@app/store/services/authApi';

const TwoFactor = () => {
  const navigate = useNavigate();
  const twoFA = useAppSelector((s) => s.auth.twoFA);
  const [verify, { isLoading, isSuccess }] = useVerifyTwoFactorMutation();

  useEffect(() => {
    if (!twoFA.pending || !twoFA.challengeId) {
      navigate('/login');
    }
  }, [twoFA, navigate]);

  const formik = useFormik({
    initialValues: { code: '' },
    validationSchema: Yup.object({
      code: Yup.string().length(6, '6 haneli olmalı').required('Gerekli'),
    }),
    onSubmit: async ({ code }) => {
      try {
        await verify({ challenge_id: twoFA.challengeId!, code }).unwrap();
        toast.success('Giriş başarılı');
        navigate('/');
      } catch (e: any) {
        toast.error(e?.data?.message || 'Doğrulama başarısız');
      }
    },
  });

  return (
    <div className="login-box">
      <div className="card card-outline card-primary">
        <div className="card-header text-center">
          <span className="h1">
            <b>2FA</b> Doğrulama
          </span>
        </div>
        <div className="card-body">
          <p className="login-box-msg">Lütfen 6 haneli kodu girin</p>
          <form onSubmit={formik.handleSubmit}>
            <div className="mb-3">
              <input
                name="code"
                maxLength={6}
                className="form-control"
                placeholder="000000"
                value={formik.values.code}
                onChange={formik.handleChange}
              />
              {formik.touched.code && formik.errors.code ? (
                <div className="text-danger mt-1">{formik.errors.code}</div>
              ) : null}
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={isLoading}>
              Doğrula
            </button>
          </form>
          {twoFA.ttl ? (
            <div className="mt-2 text-muted">Kod süresi: {twoFA.ttl} sn</div>
          ) : null}
          {isSuccess ? <div className="text-success mt-2">Başarılı</div> : null}
        </div>
      </div>
    </div>
  );
};

export default TwoFactor;


