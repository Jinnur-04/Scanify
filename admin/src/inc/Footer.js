import React from 'react';
import { useNavigate } from 'react-router-dom';

function Footer() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove Bootstrap modal backdrop manually
    const modal = document.getElementById('logoutModal');
    const backdrop = document.querySelector('.modal-backdrop');

    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    }

    if (backdrop) {
      backdrop.parentNode.removeChild(backdrop);
    }

    document.body.classList.remove('modal-open');
    document.body.style = '';

    // Clear storage and navigate
    localStorage.removeItem('uname');
    localStorage.removeItem('role');
    localStorage.removeItem('staffId');
    navigate('/');
  };

  return (
    <>
      <footer className="sticky-footer bg-white">
        <div className="container my-auto">
          <div className="copyright text-center my-auto">
            <span>Copyright © Scanify 2025</span>
          </div>
        </div>
      </footer>

      {/* Logout Modal */}
      <div
        className="modal fade"
        id="logoutModal"
        tabIndex={-1}
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
              <button className="btn btn-secondary" type="button" data-dismiss="modal">Cancel</button>
              <button className="btn btn-primary" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="scroll-to-top rounded"
        title="Scroll to Top"
       
      >
        <i className="fas fa-angle-up"></i>
      </button>
    </>
  );
}

export default Footer;
