import React from 'react';

function Top({ toggleSidebar }) {
  const uname = localStorage.getItem("uname");
  return (
    <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
      <button onClick={toggleSidebar} className="btn btn-link d-md-none rounded-circle mr-3">
        <i className="fa fa-bars" />
      </button>

      <ul className="navbar-nav ml-auto">
        <li className="nav-item dropdown no-arrow">
          <span className="nav-link">
            <span className="mr-2 d-sm-inline text-gray-600 small">{uname || " "}</span>

            <img className="img-profile rounded-circle" src="img/undraw_profile.svg" alt="profile" />
          </span>
        </li>
      </ul>
    </nav>
  );
}


export default Top;
