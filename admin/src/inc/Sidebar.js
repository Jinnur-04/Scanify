// components/inc/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './sidebar.css'; // Create this file for styles

function Sidebar({ isOpen, closeSidebar }) {
  const isMobile = window.innerWidth < 768;

  return (
    <div
      className={`custom-sidebar ${isOpen ? 'open' : ''} ${isMobile ? 'mobile' : ''}`}
    >
      <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion">
        {/* Close button for mobile */}
        {isMobile && (
          <div className="text-right p-2">
            <button
              className="btn btn-sm btn-light"
              onClick={closeSidebar}
              style={{ fontSize: '1.2rem' }}
            >
              &times;
            </button>
          </div>
        )}

        <Link
  className="sidebar-brand d-flex align-items-center justify-content-center flex-column flex-md-row"
  to="/dashboard"
>
  <div className="sidebar-brand-icon rotate-n-15 mb-1 mb-md-0">
    <i className="fas fa-laugh-wink" />
  </div>
  <div className=" mx-0 mx-md-3 text-center">
    Scanify
  </div>
</Link>


        <li className="nav-item">
          <Link className="nav-link" to="/dashboard">
            <i className="fas fa-fw fa-tachometer-alt" />
            <span>Dashboard</span>
          </Link>
        </li>

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

        <li className="nav-item">
          <Link className="nav-link" to="/staff">
            <i className="fas fa-users" />
            <span>Staff</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
