import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps every page that requires login.
// If there is no logged-in user -> redirect to /login.
// Otherwise -> render the page (<Outlet /> means "the child route").
export default function ProtectedRoute() {
  const { token, user } = useAuth();
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
