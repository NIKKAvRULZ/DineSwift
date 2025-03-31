import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Route } from 'react-router-dom';
import Orders from '../pages/Orders'; // Update this path

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  console.log('isAuthenticated:', isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  console.log('ProtectedRoute matched');
  return children;
};

export default ProtectedRoute;

<Route path="/orders" element={<Orders />} />