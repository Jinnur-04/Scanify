// components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const token = useSelector((state) => state.user.token);
  return token ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
