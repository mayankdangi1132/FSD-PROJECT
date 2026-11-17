import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, dashboardPath } from '../context/AuthContext';

// usage: <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
// without roles it just needs any logged in user.
// (the backend checks the role again on every request, this only keeps the UI tidy)
const ProtectedRoute = ({ roles, children }) => {
  const { user } = useAuth();
  const location = useLocation();

  // remember where they were going so we can send them back after login
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;

  // a temporary password has to be changed before anything else
  if (user.mustChangePassword && location.pathname !== '/settings') return <Navigate to="/settings" replace />;

  // wrong role -> send them to their own dashboard
  if (roles && !roles.includes(user.role)) return <Navigate to={dashboardPath(user)} replace />;

  return children;
};

export default ProtectedRoute;
