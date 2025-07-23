import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = process.env.REACT_APP_API_URL;

function ForgetPassword() {
  const [email, setemail] = useState('');

  const sendResetLink = async () => {
    if (!email.trim()) {
      toast.warning('Please enter your email.');
      return;
    }

    if (email.toLowerCase() === "admin") {
      toast.warning('Forget Password for Admin is not applicable!');
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/staff/send-reset-link`, { email });
      toast.success(res.data.message || 'Reset link sent to your registered email.');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <div className="container">
      {/* Outer Row */}
      <div className="row justify-content-center">
        <div className="col-xl-10 col-lg-12 col-md-9">
          <div className="card o-hidden border-0 shadow-lg my-5">
            <div className="card-body p-0">
              <div className="row">
                <div className="col-lg-6 d-none d-lg-block bg-password-image" />
                <div className="col-lg-6">
                  <div className="p-5">
                    <div className="text-center">
                      <h1 className="h4 text-gray-900 mb-2">Forgot Your Password?</h1>
                      <p className="mb-4">Enter your email and we’ll send a reset link to your email.</p>
                    </div>

                    <form className="user" onSubmit={(e) => e.preventDefault()}>
                      <div className="form-group">
                        <input
                          type="text"
                          className="form-control form-control-user"
                          placeholder="Enter email..."
                          value={email}
                          onChange={(e) => setemail(e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary btn-user btn-block"
                        onClick={sendResetLink}
                      >
                        Send Reset Link
                      </button>
                    </form>

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
