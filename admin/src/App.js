import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import MainLayout from './inc/MainLayout';

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

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgetpassword" element={<ForgetPassword />} />

          {/* Protected routes with MainLayout */}
          <Route
            path="/dashboard"
            element={<MainLayout><Dashboard /></MainLayout>}
          />
          <Route
            path="/products"
            element={<MainLayout><ProductList /></MainLayout>}
          />
          <Route
            path="/products/manage/:id?"
            element={<MainLayout><ProductManage /></MainLayout>}
          />
          <Route
            path="/bill"
            element={<MainLayout><BillPage /></MainLayout>}
          />
          <Route
            path="/scan"
            element={<MainLayout><ScanPage /></MainLayout>}
          />
          <Route
            path="/staff"
            element={<MainLayout><StaffManagement /></MainLayout>}
          />
          <Route
            path="/billmanagement"
            element={<MainLayout><BillManagement /></MainLayout>}
          />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
