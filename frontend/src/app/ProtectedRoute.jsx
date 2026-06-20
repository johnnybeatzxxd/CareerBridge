import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/index.js';
import { LoadingBlock } from '../components/ui/index.js';

export default function ProtectedRoute() {
  const { ready, user } = useAuth();
  const location = useLocation();

  if (!ready) return <LoadingBlock className="min-h-screen" label="Restoring your session..." />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
