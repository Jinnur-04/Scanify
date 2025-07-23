import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = process.env.REACT_APP_API_URL;

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    username: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const { name,email, role, username, password } = formData;

    if (!name || !email || !role || !username || !password) {
      toast.error('Please fill in all fields.');
      return;
    }

    if (password.length < 4) {
      toast.error('Password must be at least 4 characters.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      await axios.post(`${BASE_URL}/staff/register`, {
        ...formData,
        status: 'Inactive',
      });

      toast.success('Registration successful. You can now login.');
      navigate('/');
    } catch (error) {
      console.error(error);
      if (
        error.code === 'ERR_NETWORK' ||
        error.message === 'Network Error' ||
        !error.response
      ) {
        toast.error('❌ Server not reachable. Please check your internet or backend.');
      } else {
        toast.error(error.response?.data?.message || 'Registration failed.');
      }
    }
  };

  const isPasswordShort = formData.password.length > 0 && formData.password.length < 4;
  const passwordsMatch = confirmPassword && confirmPassword === formData.password;

  return (
    <div className="container">
      <div className="card o-hidden border-0 shadow-lg my-5">
        <div className="card-body p-0">
          <div className="row">
            <div className="col-lg-5 d-none d-lg-block bg-register-image" />
            <div className="col-lg-7">
              <div className="p-5">
                <div className="text-center">
                  <h1 className="h4 text-gray-900 mb-4">Create an Account!</h1>
                </div>
                <form className="user" onSubmit={handleRegister}>
                  {/* Name */}
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control form-control-user"
                      placeholder="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Email */}
                  <div className="form-group">
                    <input
                      type="email"
                      className="form-control form-control-user"
                      placeholder="Enter Your Email..."
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Role */}
                  <div className="form-group">
                    <select
                      className="form-control rounded-pill"
                      style={{ fontSize: '0.8rem', height: '3rem' }}
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Role</option>
                      <option value="Billing">Billing</option>
                      <option value="Manager">Manager</option>
                    </select>
                  </div>

                  {/* Username */}
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control form-control-user"
                      placeholder="Username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Password */}
                  <div className="form-group">
                    <div className="input-group">
                      <input
                        type="password"
                        className="form-control form-control-user"
                        placeholder="Password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                      />
                    </div>
                    {isPasswordShort && (
                      <small className="text-danger ml-2">
                        Password must be at least 4 characters.
                      </small>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="form-group">
                    <div className="input-group align-items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
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
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                        </span>
                      </div>
                    </div>
                    {confirmPassword && (
                      <small className={`ml-2 ${passwordsMatch ? 'text-success' : 'text-danger'}`}>
                        {passwordsMatch ? 'Passwords match.' : 'Passwords do not match.'}
                      </small>
                    )}
                  </div>

                  <button type="submit" className="btn btn-primary btn-user btn-block">
                    Register Account
                  </button>
                </form>

                <hr />

                <div className="text-center">
                  <Link className="small" to="/forgetpassword">
                    Forgot Password?
                  </Link>
                </div>
                <div className="text-center">
                  <Link className="small" to="/">
                    Already have an account? Login!
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
