// components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('staffId'); // or your actual auth check
  return token ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
