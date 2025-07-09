import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL;

function Login() {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!userName || !password) {
      alert("Please enter both username and password.");
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/staff/login`, {
        username: userName,
        password: password,
      });

      const staff = res.data;

      if (staff.status !== 'Active') {
        alert('Your account is inactive. Please contact admin.');
        return;
      }

      localStorage.setItem('uname', staff.name || staff.username);
      localStorage.setItem('role', staff.role);
      localStorage.setItem('staffId', staff._id);

      if (staff.role === 'Admin' || staff.role === 'Manager') {
        navigate('/dashboard');
      } else if (staff.role === 'Billing') {
        navigate('/bill');
      } else {
        alert("Invalid role. Access denied.");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Invalid username or password');
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-xl-10 col-lg-12 col-md-9">
          <div className="card o-hidden border-0 shadow-lg my-5">
            <div className="card-body p-0">
              <div className="row">
                <div className="col-lg-6 d-none d-lg-block bg-login-image" />
                <div className="col-lg-6">
                  <div className="p-5">
                    <div className="text-center">
                      <h1 className="h4 text-gray-900 mb-4">Welcome Back!</h1>
                    </div>
                    <form className="user" onSubmit={(e) => e.preventDefault()}>
                      <div className="form-group">
                        <input
                          type="text"
                          className="form-control form-control-user"
                          placeholder="Enter Your Username..."
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <div className="input-group">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="form-control form-control-user"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          <div className="input-group-append">
                            <span
                              className="input-group-text"
                              style={{ cursor: 'pointer' }}
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary btn-user btn-block"
                        onClick={handleLogin}
                      >
                        Login
                      </button>
                    </form>
                    <hr />
                    <div className="text-center">
                      <Link className="small" to="/forgetpassword">
                        Forgot Password?
                      </Link>
                    </div>
                    <div className="text-center">
                      <Link className="small" to="/register">
                        Create an Account!
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
