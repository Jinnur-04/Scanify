import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = process.env.REACT_APP_API_URL;

function ForgetPassword() {
  const [username, setUsername] = useState('');
  const [userExists, setUserExists] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  const verifyUser = async () => {
    if (!username.trim()) {
      toast.warning('Please enter your username.');
      return;
    }
    if (username.toLowerCase()==="admin") {
      toast.warning('Forget Password for Admin is Not Applicable!');
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/staff/forgot-password`, { username });
      toast.success(res.data.message || 'User found. You can reset password.');
      setUserExists(true);
    } catch (err) {
      console.error(err);
      if (!err.response || err.code === 'ERR_NETWORK') {
        toast.error('Server not reachable. Please try again later.');
      } else {
        toast.error(err.response.data.message || 'Something went wrong.');
      }
      setUserExists(false);
    }
  };

  const resetPassword = async () => {
    if (newPassword.length < 4) {
      toast.warning('Password must be at least 4 characters.');
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/staff/reset-password`, {
        username,
        newPassword,
      });
      toast.success(res.data.message || 'Password reset successful!');
      navigate('/');
    } catch (err) {
      console.error(err);
      if (!err.response || err.code === 'ERR_NETWORK') {
        toast.error('Server not reachable. Please try again later.');
      } else {
        toast.error(err.response.data.message || 'Password reset failed.');
      }
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
                      <p className="mb-4">Enter your username to reset your password securely.</p>
                    </div>

                    {/* Username verification form */}
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
                      {!userExists && (
                        <button
                          type="button"
                          className="btn btn-primary btn-user btn-block"
                          onClick={verifyUser}
                        >
                          Verify Username
                        </button>
                      )}
                    </form>

                    {/* Password reset form */}
                    {userExists && (
                      <form className="user mt-3" onSubmit={(e) => e.preventDefault()}>
                        <div className="form-group">
                          <input
                            type="password"
                            className="form-control form-control-user"
                            placeholder="Enter New Password..."
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          className="btn btn-success btn-user btn-block"
                          onClick={resetPassword}
                        >
                          Reset Password
                        </button>
                      </form>
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
