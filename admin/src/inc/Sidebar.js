import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './sidebar.css';
import { useSelector } from 'react-redux';

function Sidebar({ isOpen, closeSidebar }) {
  const [vh, setVh] = useState(window.innerHeight);
  const isMobile = window.innerWidth < 768;
  const role = useSelector((state)=>state.user.role);

  useEffect(() => {
    const handleResize = () => setVh(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isAdmin = role === 'Admin' || role === 'Manager';

  return (
    <div
      className={`custom-sidebar ${isOpen ? 'open' : ''} ${isMobile ? 'mobile' : ''}`}
      style={{ height: isMobile ? vh : '100%' }}
    >
      <ul className="sidebar-list">
        {isMobile && (
          <div className="text-right p-2">
            <button
              className="btn btn-light rounded-circle close-btn"
              onClick={closeSidebar}
              style={{
                width: '36px',
                height: '36px',
                padding: 0,
                fontSize: '1.2rem',
                fontWeight: 'bold',
                lineHeight: '1',
                textAlign: 'center',
              }}
            >
              &times;
            </button>
          </div>
        )}

        <Link
          className="sidebar-brand d-flex align-items-center justify-content-center flex-column flex-md-row"
          to={isAdmin ? "/dashboard" : "/bill"}
        >
          <div className="sidebar-brand-icon rotate-n-15 mb-1 mb-md-0">
            <i className="fas fa-laugh-wink" />
          </div>
          <div className="mx-0 mx-md-3 text-center">Scanify</div>
        </Link>

        {/* Dashboard - only for Admin/Manager */}
        {isAdmin && (
          <li className="nav-item">
            <Link className="nav-link" to="/dashboard">
              <i className="fas fa-fw fa-tachometer-alt" />
              <span>Dashboard</span>
            </Link>
          </li>
        )}

        {/* Products, Bill, Scan - visible to all roles */}
        <li className="nav-item">
          <Link className="nav-link" to="/products">
            <i className="fas fa-box" />
            <span>Products</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link" to="/bill">
            <i className="fas fa-file-invoice" />
            <span>Bill</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link" to="/scan">
            <i className="fas fa-qrcode" />
            <span>Scan</span>
          </Link>
        </li>

        {/* Staff - only for Admin/Manager */}
        {isAdmin && (
          <li className="nav-item">
            <Link className="nav-link" to="/staff">
              <i className="fas fa-users" />
              <span>Staff</span>
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}

export default Sidebar;
