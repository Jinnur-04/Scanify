import React, { useEffect, useRef, useState } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function BillPage() {
  const staffId = localStorage.getItem('staffId');
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [billSaved, setBillSaved] = useState(false);
  const [mode, setMode] = useState(null); // 'sell' or 'return'

  const scannedBarcodes = useRef(new Set());

  useEffect(() => {
    if (!staffId) return;
    const socket = new WebSocket("ws://localhost:4000");
    const scanned = scannedBarcodes.current;
    let isMounted = true;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'register', staffId, clientType: 'bill' }));
    };

    socket.onmessage = async (event) => {
      if (!isMounted) return;
      const data = JSON.parse(event.data);
      const { barcode } = data;
      if (scanned.has(barcode)) return;
      scanned.add(barcode);

      try {
        const res = await axios.get(`/products/barcode/${barcode}`);
        const product = res.data;

        // Decide bill mode on first scan
        const productMode = product.sold ? 'return' : 'sell';
        if (!mode) setMode(productMode);

        // Block mismatched types
        if (mode && productMode !== mode) {
          toast.error(`Cannot mix ${productMode.toUpperCase()} items in ${mode.toUpperCase()} bill`);
          return;
        }

        // Compute price after discount
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

        setItems(prev => {
          const existing = prev.find(i => i.barcode === item.barcode);
          return existing
            ? prev.map(i => i.barcode === item.barcode ? { ...i, qty: i.qty + 1 } : i)
            : [...prev, item];
        });

      } catch (err) {
        console.error("❌ Product fetch failed:", err);
        toast.error("Product fetch failed.");
      }
    };

    socket.onerror = (err) => console.error("❌ WebSocket error:", err);
    socket.onclose = (event) => console.warn("🔌 WebSocket closed:", event.reason || 'No reason');

    return () => {
      isMounted = false;
      socket.close();
    };
  }, [staffId, mode]);

  const calculateTotal = () =>
    items.reduce((sum, item) => sum + item.finalPrice * item.qty, 0);

  const saveBill = async () => {
    if (!customer.name || items.length === 0 || !mode) {
      return toast.error("Customer info or items missing");
    }

    setSaving(true);
    try {
      const payloadItems = mode === 'sell'
        ? items
        : items.map(i => ({ ...i, finalPrice: -i.finalPrice }));

      const total = calculateTotal();

      await axios.post(`/bills`, {
        date: new Date(),
        staff: staffId,
        customer,
        total,
        items: payloadItems
      });

      toast.success("✅ Bill saved successfully");
      setBillSaved(true);

      setTimeout(() => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    toast.error("Pop-up blocked! Please allow pop-ups for this site to generate the bill.");
    return;
  }

  const filename = `${customer.name.replace(/\s+/g, '_')}-${new Date().toISOString().slice(0, 10)}.pdf`;
  const billHTML = `
  <html><head><title>${filename}</title><style>
    body { font-family: sans-serif; padding: 20px; }
    h2 { text-align: center; color: #333; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #999; padding: 8px; text-align: center; }
    .text-right { text-align: right; }
    .summary { margin-top: 20px; text-align: right; font-size: 18px; }
    .info { margin-top: 20px; }
    .info strong { display: inline-block; width: 150px; }
    footer { margin-top: 40px; text-align: center; color: #888; }
  </style></head><body>
    <h2>Scanify | Smart Retail System ${mode === 'return' ? 'Return' : 'Bill'}</h2>
    <div class="info">
      <p><strong>Customer Name:</strong> ${customer.name}</p>
      <p><strong>Phone Number:</strong> ${customer.phone}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
    </div>
    <h3>${mode === 'return' ? 'Returning' : 'Selling'} Items</h3>
    <table><thead><tr>
      <th>#</th><th>Name</th><th>Qty</th><th>Discount</th><th>Price</th>
    </tr></thead><tbody>
    ${items.map((item, i) => `
      <tr><td>${i + 1}</td><td>${item.name}</td><td>${item.qty}</td><td>${item.discount}</td>
      <td>₹${(item.finalPrice * item.qty).toFixed(2)}</td></tr>`).join('')}
    <tr><td colspan="4" class="text-right"><strong>Total</strong></td>
    <td><strong>₹${calculateTotal().toFixed(2)}</strong></td></tr>
    </tbody></table>
    <div class="summary"><strong>Net Total:</strong> ₹${calculateTotal().toFixed(2)}</div>
    <footer>Copyright © Scanify 2025</footer>
  </body></html>`;

  printWindow.document.write(billHTML);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  setTimeout(() => printWindow.close(), 1000);
}, 500);


      setItems([]);
      setCustomer({ name: '', phone: '' });
      scannedBarcodes.current.clear();
      setBillSaved(false);
      setMode(null);
    } catch (err) {
      console.error("❌ Bill save failed:", err);
      toast.error("Failed to save bill");
    } finally {
      setSaving(false);
    }
  };

  const removeItem = (barcode) => {
    setItems(prev => prev.filter(i => i.barcode !== barcode));
    scannedBarcodes.current.delete(barcode);
  };

  return (
    <div className="container py-4">
      <h2 className="text-center text-primary mb-4">
        {mode === 'return' ? 'Return Billing' : 'Billing'}
      </h2>
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
          <h5 className="m-0">Customer Info</h5>
          <div className="mt-2 mt-md-0">
            <button className="btn btn-sm btn-success mr-2" onClick={() => navigate('/scan')}>
              <i className="fas fa-camera"></i> Scan
            </button>
            <button className="btn btn-sm btn-danger" onClick={() => {
              setItems([]);
              scannedBarcodes.current.clear();
              setCustomer({ name: '', phone: '' });
              setBillSaved(false);
              setMode(null);
            }}>
              <i className="fas fa-times-circle"></i> Reset
            </button>
          </div>
        </div>

        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label>Customer Name</label>
              <input
                type="text"
                className="form-control"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label>Phone Number</label>
              <input
                type="tel"
                className="form-control"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              />
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
                    <tr>
                      <th>#</th><th>Name</th><th>Qty</th><th>Discount</th><th>Price</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={item.barcode}>
                        <td>{idx + 1}</td>
                        <td>{item.name}</td>
                        <td>{item.qty}</td>
                        <td>{item.discount}</td>
                        <td>₹{(item.finalPrice * item.qty).toFixed(2)}</td>
                        <td>
                          <button className="btn btn-sm btn-danger" onClick={() => removeItem(item.barcode)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr className="font-weight-bold">
                      <td colSpan="4" className="text-right">Total</td>
                      <td colSpan="2">₹{calculateTotal().toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          <h4 className="text-right mt-4">
            Net Total: ₹{calculateTotal().toFixed(2)}
          </h4>

          {!billSaved ? (
            <button className="btn btn-primary mt-3" onClick={saveBill} disabled={saving}>
              {saving ? 'Saving...' : 'Save Bill'}
            </button>
          ) : (
            <button className="btn btn-secondary mt-3" onClick={() => window.print()}>
              Print Bill
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BillPage;
