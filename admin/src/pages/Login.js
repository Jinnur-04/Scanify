import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (userName === 'admin' && password === '123') {
      localStorage.setItem("uname", "Admin");
      navigate('/dashboard');
    } 
    else if (userName === 'staff' && password === '123') {
      localStorage.setItem("uname", "Staff");
      navigate('/bill');
    } 
    else {
      alert('Invalid username or password');
    }
  };

  return (
    <div className="container">
      {/* Outer Row */}
      <div className="row justify-content-center">
        <div className="col-xl-10 col-lg-12 col-md-9">
          <div className="card o-hidden border-0 shadow-lg my-5">
            <div className="card-body p-0">
              {/* Nested Row within Card Body */}
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
                          aria-describedby="emailHelp"
                        />
                      </div>
                      <div className="form-group">
                        <input
                          type="password"
                          className="form-control form-control-user"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <div className="custom-control custom-checkbox small">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id="customCheck"
                          />
                          <label className="custom-control-label" htmlFor="customCheck">
                            Remember Me
                          </label>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary btn-user btn-block"
                        onClick={handleLogin}
                      >
                        Login
                      </button>
                      <hr />
                      <a href="index.html" className="btn btn-google btn-user btn-block">
                        <i className="fab fa-google fa-fw" /> Login with Google
                      </a>
                      <a href="index.html" className="btn btn-facebook btn-user btn-block">
                        <i className="fab fa-facebook-f fa-fw" /> Login with Facebook
                      </a>
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
