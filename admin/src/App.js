// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import MainLayout from './inc/MainLayout';
import PrivateRoute from './utils/PrivateRoute';

import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import ProductManage from './pages/ProductManage';
import ScanPage from './pages/Scan';
import BillPage from './pages/BillPage';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import ForgetPassword from './pages/ForgetPassword';
import StaffManagement from './pages/StaffManagement';
import BillManagement from './pages/BillManagement';
import ProfileManagement from './pages/Profile';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgetpassword" element={<ForgetPassword />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <MainLayout><Dashboard /></MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/products"
            element={
              <PrivateRoute>
                <MainLayout><ProductList /></MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/products/manage/:id?"
            element={
              <PrivateRoute>
                <MainLayout><ProductManage /></MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/bill"
            element={
              <PrivateRoute>
                <MainLayout><BillPage /></MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/scan"
            element={
              <PrivateRoute>
                <MainLayout><ScanPage /></MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <PrivateRoute>
                <MainLayout><StaffManagement /></MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/billmanagement"
            element={
              <PrivateRoute>
                <MainLayout><BillManagement /></MainLayout>
              </PrivateRoute>
            }
          />
        
        <Route
            path="/profile"
            element={
              <PrivateRoute>
                <MainLayout><ProfileManagement /></MainLayout>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
