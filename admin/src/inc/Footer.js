import React from 'react';

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
