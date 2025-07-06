import React, { useState } from 'react';
import Top from '../inc/Top'
import Footer from '../inc/Footer';
// import io from 'socket.io-client'; // ⛔ For future use

function ScanPage() {
  const uname = localStorage.getItem("uname");
  const [productCode, setProductCode] = useState('');

  // const socket = io('http://localhost:5000'); // ⛔ Will initialize when backend ready

  const handleScan = () => {
    if (!productCode.trim()) return;

    const scannedData = {
      code: productCode.trim(),
      time: new Date().toLocaleTimeString(),
    };

    console.log("Scanned:", scannedData);

    // socket.emit('scan-product', scannedData); // ⛔ Uncomment when backend ready

    setProductCode('');
  };

  return (
    <>
       <Top user={{name: uname}}/>
    <div className="container-fluid d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <h2 className="mb-4">📲 Mobile Scanner</h2>

      <input
        type="text"
        className="form-control text-center mb-3"
        placeholder="Enter or Scan Product Code"
        value={productCode}
        onChange={(e) => setProductCode(e.target.value)}
        style={{ maxWidth: '300px' }}
      />

      <button className="btn btn-success" onClick={handleScan}>
        Scan Product
      </button>

      {/* <p className="mt-4 text-muted">Waiting for socket connection...</p> */}
      
    </div>
    <Footer/>
    </>
  );
}

export default ScanPage;
