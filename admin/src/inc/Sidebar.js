import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">

      {/* Sidebar - Brand */}
      <Link className="sidebar-brand d-flex align-items-center justify-content-center" to="/">
        <div className="sidebar-brand-icon rotate-n-15">
          <i className="fas fa-laugh-wink" />
        </div>
        <div className="sidebar-brand-text mx-3">Scanify</div>
      </Link>

      <hr className="sidebar-divider my-0" />

      {/* Nav Item - Dashboard */}
      <li className="nav-item">
        <Link className="nav-link" to="/dashboard">
          <i className="fas fa-fw fa-tachometer-alt" />
          <span>Dashboard</span>
        </Link>
      </li>

      <hr className="sidebar-divider" />
      <div className="sidebar-heading">Interface</div>

      {/* Components */}
      <li className="nav-item">
        <button
          className="nav-link collapsed"
          data-toggle="collapse"
          data-target="#collapseTwo"
          aria-expanded="false"
          aria-controls="collapseTwo"
          style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: '0.75rem 1rem', color: '#fff' }}
        >
          <i className="fas fa-fw fa-cog" />
          <span>Components</span>
        </button>
        <div id="collapseTwo" className="collapse" data-parent="#accordionSidebar">
          <div className="bg-white py-2 collapse-inner rounded">
            <h6 className="collapse-header">Custom Components:</h6>
            <Link className="collapse-item" to="/">Buttons</Link>
            <Link className="collapse-item" to="/">Cards</Link>
          </div>
        </div>
      </li>

      {/* Utilities */}
      <li className="nav-item">
        <button
          className="nav-link collapsed"
          data-toggle="collapse"
          data-target="#collapseUtilities"
          aria-expanded="false"
          aria-controls="collapseUtilities"
          style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: '0.75rem 1rem', color: '#fff' }}
        >
          <i className="fas fa-fw fa-wrench" />
          <span>Utilities</span>
        </button>
        <div id="collapseUtilities" className="collapse" data-parent="#accordionSidebar">
          <div className="bg-white py-2 collapse-inner rounded">
            <h6 className="collapse-header">Custom Utilities:</h6>
            <Link className="collapse-item" to="/">Colors</Link>
            <Link className="collapse-item" to="/">Borders</Link>
            <Link className="collapse-item" to="/">Animations</Link>
            <Link className="collapse-item" to="/">Other</Link>
          </div>
        </div>
      </li>

      <hr className="sidebar-divider" />
      <div className="sidebar-heading">Addons</div>

      {/* Pages */}
      <li className="nav-item">
        <button
          className="nav-link collapsed"
          data-toggle="collapse"
          data-target="#collapsePages"
          aria-expanded="false"
          aria-controls="collapsePages"
          style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: '0.75rem 1rem', color: '#fff' }}
        >
          <i className="fas fa-fw fa-folder" />
          <span>Pages</span>
        </button>
        <div id="collapsePages" className="collapse" data-parent="#accordionSidebar">
          <div className="bg-white py-2 collapse-inner rounded">
            <h6 className="collapse-header">Login Screens:</h6>
            <Link className="collapse-item" to="/login">Login</Link>
            <Link className="collapse-item" to="/">Register</Link>
            <Link className="collapse-item" to="/">Forgot Password</Link>
            <div className="collapse-divider" />
            <h6 className="collapse-header">Other Pages:</h6>
            <Link className="collapse-item" to="/">404 Page</Link>
            <Link className="collapse-item" to="/products">Product List</Link>
            <Link className="collapse-item" to="/bill">Bill</Link>
            <Link className="collapse-item" to="/scan">Scan</Link>
          </div>
        </div>
      </li>

      {/* Charts */}
      <li className="nav-item">
        <Link className="nav-link" to="/">
          <i className="fas fa-fw fa-chart-area" />
          <span>Charts</span>
        </Link>
      </li>

      {/* Tables */}
      <li className="nav-item">
        <Link className="nav-link" to="/">
          <i className="fas fa-fw fa-table" />
          <span>Tables</span>
        </Link>
      </li>

      <hr className="sidebar-divider d-none d-md-block" />

      {/* Sidebar Toggler */}
      <div className="text-center d-none d-md-inline">
        <button className="rounded-circle border-0" id="sidebarToggle" />
      </div>
    </ul>
  );
}

export default Sidebar;
