import React, { useEffect, useRef, useState } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
const socket_url=process.env.REACT_APP_SOCKET_URL || "ws://localhost:4000";

function BillPage() {
  const staffId = useSelector((state)=>state.user.staffId)
  const navigate = useNavigate();
  const scannedBarcodes = useRef(new Set());

  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState(null);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [pdfURL, setPdfURL] = useState(null);

  useEffect(() => {
    if (!staffId) return;

    const socket = new WebSocket(`${socket_url}`);
    //const socket = new WebSocket("wss://scanify-3vfo.onrender.com");
    const scanned = scannedBarcodes.current;
    let isMounted = true;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'register', staffId, clientType: 'bill' }));
    };

    socket.onmessage = async (event) => {
      if (!isMounted) return;
      const { barcode } = JSON.parse(event.data);
      if (scanned.has(barcode)) return;
      scanned.add(barcode);

      try {
        const { data } = await axios.get(`/products/barcode/${barcode}`);
        const product = data.product;
        const customerFromBill = data.customer;

        const productMode = product.sold ? 'return' : 'sell';

        if (!mode) {
          setMode(productMode);
          if (productMode === 'return') {
            setPaymentMode('Cash'); // force cash on return
          }
        }


        // ✅ Set customer if return mode and customer found
        if (productMode === 'return' && customerFromBill?.name && !customer.name) {
          setCustomer({ name: customerFromBill.name, phone: customerFromBill.phone });
        }

        let finalPrice = product.price;
        const discount = product.discount || '0%';
        if (discount.endsWith('%')) {
          const percent = parseFloat(discount);
          if (!isNaN(percent)) finalPrice -= (finalPrice * percent) / 100;
        }

        const item = {
          barcode,
          name: product.name,
          brand: product.brand,
          category: product.category,
          unit: product.unit,
          imageUrl: product.imageUrl,
          originalPrice: parseFloat(product.price.toFixed(2)),
          discount,
          finalPrice: parseFloat(finalPrice.toFixed(2)),
          qty: 1
        };

        setItems(prev =>
          prev.some(i => i.barcode === barcode)
            ? prev.map(i => i.barcode === barcode ? { ...i, qty: i.qty + 1 } : i)
            : [...prev, item]
        );

      } catch (err) {
        console.error("❌ Product fetch failed:", err);
        toast.error("Product fetch failed.");
      }
    };

    socket.onerror = (err) => console.error("❌ WebSocket error:", err);
    socket.onclose = () => console.warn("🔌 WebSocket closed");

    return () => {
      isMounted = false;
      socket.close();
    };
  }, [staffId, mode]);

  const calculateTotal = () => items.reduce((sum, item) => sum + item.finalPrice * item.qty, 0);

  const resetState = () => {
    setItems([]);
    setCustomer({ name: '', phone: '' });
    scannedBarcodes.current.clear();
    setMode(null);
    setPdfURL(null);
  };

  const removeItem = (barcode) => {
    setItems(prev => prev.filter(i => i.barcode !== barcode));
    scannedBarcodes.current.delete(barcode);
  };

const saveBill = async () => {
  if (!customer.name || items.length === 0 || !mode || !paymentMode) {
    return toast.error("Customer info, items, or mode missing");
  }

  setSaving(true);
  toast.dismiss(); // Clear any previous toasts
  toast.info("Saving bill...", { toastId: "saving" });

  const payload = {
    customer,
    staff: staffId,
    paymentMode,
    items: items.map(item => ({ ...item, action: mode })),
    mode,
  };

  try {
    if (paymentMode === 'Online') {
      // Step 1: Create Razorpay order
      const { data } = await axios.post('/bills/payment/create-order-from-products', payload);

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: data.razorpayOrder.amount,
        currency: 'INR',
        name: 'Scanify',
        description: 'Customer Bill Payment',
        order_id: data.razorpayOrder.id,

        handler: async (response) => {
          try {
            // Step 2: Verify payment & receive PDF
            const verifyRes = await axios.post(
              '/bills/payment/verify',
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              },
              { responseType: 'blob' }
            );

            const blob = new Blob([verifyRes.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setPdfURL(url); // 👈 Show in viewer instead of popup

            toast.dismiss("saving");
            toast.success("✅ Payment successful, bill generated.");
          } catch (err) {
            console.error("❌ Payment verification failed", err);
            toast.dismiss("saving");
            toast.error("Payment verification failed. Please contact support.");
          } finally {
            setSaving(false);
          }
        },

        prefill: {
          name: customer.name,
          contact: customer.phone
        },

        modal: {
          ondismiss: () => {
            setSaving(false);
            toast.dismiss("saving");
            toast.warning("Payment cancelled.");
          }
        },

        theme: { color: '#3399cc' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } else {
      // Step: Save bill & get PDF (Cash Mode)
      const res = await axios.post('/bills', payload, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfURL(url); // 👈 Show in viewer instead of popup

      toast.dismiss("saving");
      toast.success("✅ Bill saved successfully (Cash)");
      setSaving(false);
    }
  } catch (err) {
    console.error("❌ Failed to save bill", err);
    toast.dismiss("saving");
    toast.error("Failed to save bill. Please try again.");
    setSaving(false);
  }
};




  const handlePrint = () => {
    if (!pdfURL) return;
    const win = window.open(pdfURL, '_blank');
    if (!win) {
      toast.error("⚠️ Pop-up blocked! Please allow pop-ups.");
    } else {
      resetState();
    }
  };

  return (
    <div className="container py-4">
      <h2 className="text-center text-primary mb-4">{mode === 'return' ? 'Return Billing' : 'Billing'}</h2>
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
          <h5 className="m-0">Customer Info</h5>
          <div className="mt-2 mt-md-0">
            <button className="btn btn-sm btn-success mr-2" onClick={() => navigate('/scan')}>
              <i className="fas fa-camera"></i> Scan
            </button>
            <button className="btn btn-sm btn-danger" onClick={resetState}>
              <i className="fas fa-times-circle"></i> Reset
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4 mb-3">
              <label>Customer Name</label>
              <input type="text" className="form-control" value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
            </div>
            <div className="col-md-4 mb-3">
              <label>Phone Number</label>
              <input type="tel" className="form-control" value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
            </div>
            <div className="col-md-4 mb-3">
              <label>Payment Mode</label>
              <select className="form-control" value={paymentMode}
                onChange={e => setPaymentMode(e.target.value)}
                disabled={mode === 'return'}>
                <option value="Cash">Cash</option>
                <option value="Online">Online</option>
              </select>
            </div>
          </div>

          {items.length > 0 && (
            <>
              <h5 className={`mt-4 text-${mode === 'return' ? 'warning' : 'success'}`}>
                {mode === 'return' ? 'Returning Items' : 'Selling Items'}
              </h5>
              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead className={`thead-${mode === 'return' ? 'warning' : 'success'}`}>
                    <tr><th>#</th><th>Name</th><th>Qty</th><th>Discount</th><th>Price</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={item.barcode}>
                        <td>{idx + 1}</td><td>{item.name}</td><td>{item.qty}</td>
                        <td>{item.discount}</td>
                        <td>₹{(item.finalPrice * item.qty).toFixed(2)}</td>
                        <td>
                          <button className="btn btn-sm btn-danger" onClick={() => removeItem(item.barcode)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                    <tr><td colSpan="4" className="text-right">Total</td>
                      <td colSpan="2">₹{calculateTotal().toFixed(2)}</td></tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          <h4 className="text-right mt-4">Net Total: ₹{calculateTotal().toFixed(2)}</h4>
          <button className="btn btn-primary mt-3" onClick={pdfURL ? handlePrint : saveBill} disabled={saving}>
            {saving ? 'Saving...' : pdfURL ? '🖨️ Print' : 'Save Bill'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BillPage;
