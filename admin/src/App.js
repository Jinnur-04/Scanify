
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import Scan from './pages/ScanProduct';
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
      <Route path='/' element={<LoginPage/>}/>
      <Route path="/dashboard" element={<Dashboard/>} />
      <Route path="/products" element={<ProductList/>} />
      <Route path="/products/manage/:id?" element={<ProductManage/>} />
      <Route path="/bill" element={<BillPage/>} />
      <Route path='/scan' element={<ScanPage/>}/>
      <Route path='/register' element={<RegisterPage/>}/>
      <Route path='/forgetpassword' element={<ForgetPassword/>}/>
      <Route path='/staff' element={<StaffManagement/>}/>
      <Route path='/billmanagement' element={<BillManagement/>}/>
      {/* Add more routes as needed */}
    </Routes>
</BrowserRouter>
    </>

  );
}

export default App;
