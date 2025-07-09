import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL;

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    username: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const { name, role, username, password } = formData;
    console.log(formData)
    if (!name || !role || !username || !password) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      await axios.post(`${BASE_URL}/staff/register`, {
        ...formData,
        status: 'Active',
      });
      alert('Registration successful. You can now login.');
      navigate('/');
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || 'Registration failed.');
    }
  };

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

                  <div className="form-group">
                    <select
                      className="form-control form-control-user"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>Select Role</option>
                      <option value="Billing">Billing</option>
                      <option value="Manager">Manager</option>
                    </select>
                  </div>

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

                  <div className="form-group">
                    <div className="input-group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control form-control-user"
                        placeholder="Password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <div className="input-group-append">
                        <span
                          className="input-group-text"
                          style={{ cursor: 'pointer' }}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                        </span>
                      </div>
                    </div>
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
