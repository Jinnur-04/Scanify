import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = process.env.REACT_APP_API_URL;

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordMatch = confirmPassword && newPassword === confirmPassword;
  const passwordTooShort = newPassword.length > 0 && newPassword.length < 4;

  const handleReset = async () => {
    if (passwordTooShort) {
      toast.warning('Password must be at least 4 characters.');
      return;
    }
    if (!passwordMatch) {
      toast.warning('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/staff/reset-password/${token}`, {
        newPassword,
      });

      toast.success(res.data.message || 'Password reset successful!');
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Reset failed or link expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-xl-10 col-lg-12 col-md-9">
          <div className="card o-hidden border-0 shadow-lg my-5">
            <div className="card-body p-0">
              <div className="row">
                <div className="col-lg-6 d-none d-lg-block bg-password-image" />
                <div className="col-lg-6">
                  <div className="p-5">
                    <div className="text-center">
                      <h1 className="h4 text-gray-900 mb-2">Reset Your Password</h1>
                      <p className="mb-4">Enter a new password to secure your account.</p>
                    </div>

                    <form className="user" onSubmit={(e) => e.preventDefault()}>
                      <div className="form-group">
                        <input
                          type="password"
                          className="form-control form-control-user"
                          placeholder="New Password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        {passwordTooShort && (
                          <small className="text-danger ml-2">
                            Password must be at least 4 characters.
                          </small>
                        )}
                      </div>

                      <div className="form-group">
                    <div className="input-group align-items-center">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="form-control form-control-user"
                        placeholder="Confirm Password"
                        name="confirmpassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <div className="input-group-append d-flex align-items-center">
                        {/* Eye icon */}
                        <span
                          className="input-group-text bg-white border-0"
                          style={{ cursor: 'pointer' }}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                        </span>
                      </div>
                    </div>
                    {confirmPassword && (
                      <small className={`ml-2 ${passwordMatch ? 'text-success' : 'text-danger'}`}>
                        {passwordMatch ? 'Passwords match.' : 'Passwords do not match.'}
                      </small>
                    )}
                  </div>


                      <button
                        type="button"
                        className="btn btn-success btn-user btn-block"
                        onClick={handleReset}
                        disabled={loading}
                      >
                        {loading ? 'Resetting...' : 'Reset Password'}
                      </button>
                    </form>

                    <hr />
                    <div className="text-center">
                      <a className="small" href="/">Back to Login</a>
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

export default ResetPassword;
