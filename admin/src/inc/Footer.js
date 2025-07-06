import React from 'react'
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <>
       <footer className="sticky-footer bg-white">
        <div className="container my-auto">
          <div className="copyright text-center my-auto">
            <span>Copyright © Scanify 2025</span>
          </div>
        </div>
      </footer>
       <div className="modal fade" id="logoutModal" tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div className="modal-dialog" role="document">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title" id="exampleModalLabel">Ready to Leave?</h5>
          <button className="close" type="button" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="modal-body">Select "Logout" below if you are ready to end your current session.</div>
        <div className="modal-footer">
          <button className="btn btn-secondary" type="button" data-dismiss="modal">Cancel</button>
          <Link className="btn btn-primary" to="/">Logout</Link>
        </div>
      </div>
    </div>
  </div>
  <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="scroll-to-top rounded"
        title="Scroll to Top"
      >
        <i className="fas fa-angle-up"></i>
      </button>
    </>
  )
}

export default Footer
