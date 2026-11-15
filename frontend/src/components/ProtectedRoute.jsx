import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// usage: <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
// without roles it just needs any logged in user
const ProtectedRoute = ({ roles, children }) => {
  const { user } = useAuth();
  const location = useLocation();

  // remember where they were going so we can send them back after login
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
