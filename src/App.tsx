import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Main from '@modules/main/Main';
import Login from '@modules/login/Login';
import { lazy, Suspense } from 'react';
const Register = lazy(() => import('@modules/register/Register'));
const ForgetPassword = lazy(() => import('@modules/forgot-password/ForgotPassword'));
const RecoverPassword = lazy(() => import('@modules/recover-password/RecoverPassword'));
import { useWindowSize } from '@app/hooks/useWindowSize';
import { calculateWindowSize } from '@app/utils/helpers';
import { setWindowSize } from '@app/store/reducers/ui';
import ReactGA from 'react-ga4';

import Dashboard from '@pages/Dashboard';
import Blank from '@pages/Blank';
import SubMenu from '@pages/SubMenu';
import Profile from '@pages/profile/Profile';

import PublicRoute from './routes/PublicRoute';
import PrivateRoute from './routes/PrivateRoute';
import { useAppDispatch, useAppSelector } from './store/store';
import { useMeQuery } from './store/services/authApi';
import { toast } from 'react-toastify';
import { clearCredentials } from './store/reducers/auth';
import TwoFactor from '@pages/auth/TwoFactor';
import { Loading } from './components/Loading';

const { VITE_NODE_ENV } = import.meta.env;

const App = () => {
  const windowSize = useWindowSize();
  const screenSize = useAppSelector((state) => state.ui.screenSize);
  const dispatch = useAppDispatch();
  const location = useLocation();

  const [isAppLoading, setIsAppLoading] = useState(false);
  const { error: meError } = useMeQuery(undefined, { skip: false });
  useEffect(() => {
    if (meError) {
      toast.info('Oturum doğrulanamadı. Lütfen tekrar giriş yapın.');
      dispatch(clearCredentials());
    }
  }, [meError]);

  useEffect(() => {
    const size = calculateWindowSize(windowSize.width);
    if (screenSize !== size) {
      dispatch(setWindowSize(size));
    }
  }, [windowSize]);

  useEffect(() => {
    if (location && location.pathname && VITE_NODE_ENV === 'production') {
      ReactGA.send({
        hitType: 'pageview',
        page: location.pathname,
      });
    }
  }, [location]);

  if (isAppLoading) {
    return <Loading />;
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>
        <Route path="/register" element={<PublicRoute />}>
          <Route
            path="/register"
            element={
              <Suspense fallback={<Loading />}>
                <Register />
              </Suspense>
            }
          />
        </Route>
        <Route path="/forgot-password" element={<PublicRoute />}>
          <Route
            path="/forgot-password"
            element={
              <Suspense fallback={<Loading />}>
                <ForgetPassword />
              </Suspense>
            }
          />
        </Route>
        <Route path="/recover-password" element={<PublicRoute />}>
          <Route
            path="/recover-password"
            element={
              <Suspense fallback={<Loading />}>
                <RecoverPassword />
              </Suspense>
            }
          />
        </Route>
        <Route path="/2fa-verify" element={<PublicRoute />}>
          <Route path="/2fa-verify" element={<TwoFactor />} />
        </Route>
        <Route path="/" element={<PrivateRoute />}>
          <Route path="/" element={<Main />}>
            <Route path="/sub-menu-2" element={<Blank />} />
            <Route path="/sub-menu-1" element={<SubMenu />} />
            <Route path="/blank" element={<Blank />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/" element={<Dashboard />} />
          </Route>
        </Route>
      </Routes>
      <ToastContainer
        autoClose={3000}
        draggable={false}
        position="top-right"
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnHover
      />
    </>
  );
};

export default App;
