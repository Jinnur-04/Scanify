import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Top = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [uname, setUname] = useState(localStorage.getItem('uname') || '');
  const [profileImage, setProfileImage] = useState(localStorage.getItem('photo') || '/img/undraw_profile.svg');

  const formattedName = uname ? uname[0].toUpperCase() + uname.slice(1) : '';

  useEffect(() => {
    const handleStorageChange = () => {
      setUname(localStorage.getItem('uname') || '');
      setProfileImage(localStorage.getItem('photo') || '/img/undraw_profile.svg');
    };

    // Listen to storage change (optional for cross-tab)
    window.addEventListener('storage', handleStorageChange);

    // Manual refresh on component mount
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    const modalEl = document.getElementById('logoutModal');
    if (modalEl) {
      window.$(modalEl).modal('hide');
    }
    localStorage.clear();
    navigate('/');
  };

  return (
    <>
      <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
        <button onClick={toggleSidebar} className="btn btn-link d-md-none rounded-circle mr-3">
          <i className="fa fa-bars" />
        </button>

        <button className="btn btn-outline-primary mr-3" onClick={() => navigate(-1)}>
          &lt;
        </button>

        <ul className="navbar-nav ml-auto">
          <li className="nav-item dropdown no-arrow">
            <a
              className="nav-link dropdown-toggle"
              href="#!"
              id="userDropdown"
              role="button"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <span className="mr-2 d-none d-lg-inline text-gray-600 small">
                {formattedName}
              </span>
              <img
                className="img-profile rounded-circle"
                src={profileImage}
                alt="User profile"
              />
            </a>

            <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="userDropdown">
              <button className="dropdown-item" onClick={() => navigate('/profile')}>
                <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400" />
                My Profile
              </button>

              <div className="dropdown-divider" />

              <a
                className="dropdown-item"
                href="#!"
                data-toggle="modal"
                data-target="#logoutModal"
              >
                <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400" />
                Logout
              </a>
            </div>
          </li>
        </ul>
      </nav>

      {/* Logout Confirmation Modal */}
      <div
        className="modal fade"
        id="logoutModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="logoutModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="logoutModalLabel">Ready to Leave?</h5>
              <button className="close" type="button" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              Select "Logout" below if you are ready to end your current session.
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" type="button" data-dismiss="modal">
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Top;
