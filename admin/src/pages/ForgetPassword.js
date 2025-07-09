import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL;

function ForgetPassword() {
  const [username, setUsername] = useState('');
  const [result, setResult] = useState(null);

  const handleReset = async () => {
    if (!username) {
      alert('Please enter your username.');
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/staff/forgot-password`, { username });
      setResult(res.data.password || 'Password hidden for security.');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Something went wrong.');
      setResult(null);
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
                <div className="col-lg-6 d-none d-lg-block bg-password-image" />
                <div className="col-lg-6">
                  <div className="p-5">
                    <div className="text-center">
                      <h1 className="h4 text-gray-900 mb-2">Forgot Your Password?</h1>
                      <p className="mb-4">Enter your username and we’ll show your password (for development only).</p>
                    </div>
                    <form className="user" onSubmit={(e) => e.preventDefault()}>
                      <div className="form-group">
                        <input
                          type="text"
                          className="form-control form-control-user"
                          placeholder="Enter Username..."
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary btn-user btn-block"
                        onClick={handleReset}
                      >
                        Show Password
                      </button>
                    </form>

                    {result && (
                      <div className="mt-3 text-center text-success font-weight-bold">
                        Password: {result}
                      </div>
                    )}

                    <hr />
                    <div className="text-center">
                      <Link className="small" to="/register">Create an Account!</Link>
                    </div>
                    <div className="text-center">
                      <Link className="small" to="/">Already have an account? Login!</Link>
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

export default ForgetPassword;
