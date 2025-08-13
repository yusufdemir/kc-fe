import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@app/store/store';

type Props = {
  requiredRoles?: string[];
};

const hasRole = (userRoles: string | string[] | undefined | null, required: string[]) => {
  if (!required || required.length === 0) return true;
  if (!userRoles) return false;
  const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];
  return required.some((r) => rolesArray.includes(r));
};

const PrivateRoute = ({ requiredRoles = [] }: Props) => {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const user = useAppSelector((state) => state.auth.user);
  if (!accessToken) {
    return <Navigate to={`/login`} />;
  }
  if (requiredRoles.length > 0 && !hasRole(user?.roles, requiredRoles)) {
    return <Navigate to={`/`} />;
  }
  return <Outlet />;
};

export default PrivateRoute;
