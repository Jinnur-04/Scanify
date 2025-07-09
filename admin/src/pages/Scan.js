import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const BarcodeScanner = () => {
  const scannerRef = useRef(null);
  const socketRef = useRef(null);
  const scannerRunning = useRef(false); // ✅ Track if scanner started

  const [status, setStatus] = useState("Initializing...");
  const [scannedCode, setScannedCode] = useState("");
  const staffId = localStorage.getItem("staffId");

  useEffect(() => {
    const startScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode("scanner");

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
        };

        const devices = await Html5Qrcode.getCameras();
        if (devices.length === 0) {
          setStatus("❌ No camera found");
          return;
        }

        // Setup WebSocket
        socketRef.current = new WebSocket("ws://localhost:4000");

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

        // Start scanning
        const cameraId = devices[0].id;
        await html5QrCode.start(
          cameraId,
          config,
          async (decodedText) => {
            if (decodedText === scannedCode) return;

            setScannedCode(decodedText);
            setStatus("✅ Code scanned: " + decodedText);

            if (socketRef.current?.readyState === WebSocket.OPEN) {
              socketRef.current.send(JSON.stringify({
                type: "barcode-scanned",
                staffId,
                barcode: decodedText,
              }));
              console.log("📤 Sent barcode:", decodedText);
            }

            // ✅ Stop only if scanner is running
            if (scannerRunning.current) {
              await html5QrCode.stop();
              scannerRunning.current = false;
              console.log("⛔ Scanner stopped after scan");
            }
          },
          (error) => {
            if (!error?.name?.includes("NotFoundException")) {
              console.warn("Scan error:", error);
            }
            setStatus("📷 Scanning...");
          }
        );

        scannerRef.current = html5QrCode;
        scannerRunning.current = true; // ✅ Mark scanner started
        setStatus("📷 Scanning...");
      } catch (err) {
        console.error("Failed to start scanner:", err);
        setStatus("❌ Camera access failed");
      }
    };

    startScanner();

    return () => {
      if (scannerRunning.current && scannerRef.current) {
        scannerRef.current.stop().catch((e) =>
          console.warn("⚠️ Stop scanner error:", e.message)
        );
        scannerRunning.current = false;
      }

      if (socketRef.current) {
        socketRef.current.close();
        console.log("🔌 WebSocket disconnected");
      }
    };
  }, []); // ✅ Only run once on mount

  return (
    <div className="container mt-5 text-center">
      <h2 className="mb-3">📦 Barcode Scanner</h2>
      <p>{status}</p>
      <div id="scanner" style={{ width: "300px", margin: "auto" }} />
      {scannedCode && (
        <div className="mt-3 alert alert-success">
          ✅ Scanned: <strong>{scannedCode}</strong>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
