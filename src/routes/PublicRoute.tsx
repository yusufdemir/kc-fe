import { useAppSelector } from '@app/store/store';
import { Navigate, Outlet } from 'react-router-dom';

const PublicRoute = () => {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  return accessToken ? <Navigate to={`/`} /> : <Outlet />;
};

export default PublicRoute;
