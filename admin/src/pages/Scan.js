import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const BarcodeScanner = () => {
  const scannerRef = useRef(null);
  const socketRef = useRef(null);
  const scannerRunning = useRef(false);

  const [status, setStatus] = useState("Initializing...");
  const [scannedCode, setScannedCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  const staffId = localStorage.getItem("staffId");

  useEffect(() => {
    const initScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode("scanner");
        const cameras = await Html5Qrcode.getCameras();
        if (!cameras.length) {
          setStatus("❌ No camera found");
          return;
        }

        setDevices(cameras);
        setSelectedDevice(cameras[0].id);
        scannerRef.current = html5QrCode;
        socketRef.current = new WebSocket("ws://localhost:4000");
        // socketRef.current = new WebSocket("wss://scanify-3vfo.onrender.com");
        socketRef.current.onopen = () => {
          socketRef.current.send(JSON.stringify({
            type: "register",
            staffId,
            clientType: "scan",
          }));
          console.log("🟢 WebSocket connected");
        };

        socketRef.current.onerror = (err) => {
          console.error("❌ WebSocket error:", err);
          setStatus("❌ WebSocket connection failed");
        };
      } catch (err) {
        console.error("Scanner init failed:", err);
        setStatus("❌ Initialization error");
      }
    };

    initScanner();

    return () => {
      stopScan();
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  const startScan = async () => {
    if (!scannerRef.current || !selectedDevice) return;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
    };

    try {
      await scannerRef.current.start(
        selectedDevice,
        config,
        async (decodedText) => {
          if (decodedText === scannedCode) return;

          setScannedCode(decodedText);
          setStatus(`✅ Scanned: ${decodedText}`);

          if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
              type: "barcode-scanned",
              staffId,
              barcode: decodedText
            }));
            console.log(`📤 Sent barcode:`, decodedText);
          }
        },
        (error) => {
          console.warn("Scan error:", error);
          setStatus("📷 Scanning...");
        }
      );
      scannerRunning.current = true;
      setIsScanning(true);
      setStatus("📷 Scanning...");
    } catch (err) {
      console.error("Start scan failed:", err);
      setStatus("❌ Failed to start scanning");
    }
  };

  const stopScan = async () => {
    if (scannerRunning.current && scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRunning.current = false;
        setIsScanning(false);
        setStatus("⛔ Scanner stopped");
      } catch (err) {
        console.warn("Stop scan error:", err);
      }
    }
  };

  const toggleScan = () => {
    if (isScanning) stopScan();
    else startScan();
  };

  return (
    <div className="container mt-4 text-center">
      <h4 className="mb-3">📦 Barcode Scanner</h4>

      <div className="d-flex justify-content-center gap-2 flex-wrap mb-3">
        <button
          className={`btn btn-${isScanning ? "danger" : "success"}`}
          onClick={toggleScan}
        >
          {isScanning ? "Stop Scan" : "Start Scan"}
        </button>
      </div>

      {devices.length > 1 && (
        <div className="form-group mb-3">
          <select
            className="form-control w-auto mx-auto"
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            disabled={isScanning}
          >
            {devices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.label || `Camera ${device.id}`}
              </option>
            ))}
          </select>
        </div>
      )}

      <p className="text-muted">{status}</p>

      <div id="scanner" style={{ width: "320px", margin: "auto" }} />

      {scannedCode && (
        <div className="alert alert-info mt-3">
          ✅ <strong>{scannedCode}</strong> scanned
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
