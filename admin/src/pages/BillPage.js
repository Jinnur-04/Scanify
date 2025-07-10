import React, { useEffect, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// ...imports same as before
function BillPage() {
  const uname = localStorage.getItem("uname") || 'Staff';
  const staffId = localStorage.getItem('staffId');
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [sellItems, setSellItems] = useState([]);
  const [returnItems, setReturnItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [billSaved, setBillSaved] = useState(false);

  const scannedBarcodes = useRef(new Set());

  useEffect(() => {
    //const socket = new WebSocket("ws://localhost:4000");
    const socket = new WebSocket("wss://scanify-3vfo.onrender.com");

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'register', staffId, clientType: 'bill' }));
    };

    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'barcode-broadcast' && data.barcode && data.action) {
        const { barcode, action } = data;
        if (scannedBarcodes.current.has(`${action}-${barcode}`)) return;
        scannedBarcodes.current.add(`${action}-${barcode}`);

        try {
          const res = await axios.get(`${process.env.REACT_APP_API_URL}/products/barcode/${barcode}`);
          const product = res.data;

          let finalPrice = product.price;
          const discount = product.discount || '0%';
          if (discount.endsWith('%')) {
            const percent = parseFloat(discount);
            if (!isNaN(percent)) finalPrice -= (finalPrice * percent) / 100;
          }
          finalPrice = parseFloat(finalPrice.toFixed(2));

          const item = {
            barcode,
            name: product.name,
            brand: product.brand,
            category: product.category,
            unit: product.unit,
            imageUrl: product.imageUrl,
            originalPrice: parseFloat(product.price.toFixed(2)),
            discount,
            finalPrice,
            qty: 1
          };

          if (action === 'return') {
            setReturnItems(prev => [...prev, item]);
          } else {
            setSellItems(prev => [...prev, item]);
          }

        } catch (err) {
          console.error("❌ Product fetch failed:", err);
          toast.error("Product fetch failed.");
        }
      }
    };

    return () => socket.close();
  }, [staffId]);

  const calculateTotal = (arr) => arr.reduce((sum, item) => sum + item.finalPrice * item.qty, 0);

  const saveBill = async () => {
    if (!customer.name || (sellItems.length === 0 && returnItems.length === 0)) {
      return toast.error("Customer or items missing");
    }
    setSaving(true);
    try {
      const total = calculateTotal(sellItems) - calculateTotal(returnItems);
      await axios.post(`${process.env.REACT_APP_API_URL}/bills`, {
        date: new Date(),
        staff: staffId,
        customer,
        total,
        items: [...sellItems, ...returnItems.map(i => ({ ...i, finalPrice: -i.finalPrice }))]
      });
      toast.success("✅ Bill saved");
      setBillSaved(true);
    } catch (err) {
      console.error("❌ Bill save failed:", err);
      toast.error("Failed to save bill");
    } finally {
      setSaving(false);
    }
  };

  const renderTable = (title, items, color, onDelete) => (
    <>
      <h5 className={`mt-4 text-${color}`}>{title}</h5>
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className={`thead-${color}`}>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Qty</th>
              <th>Discount</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.barcode}>
                <td>{idx + 1}</td>
                <td>{item.name}</td>
                <td>{item.qty}</td>
                <td>{item.discount}</td>
                <td>₹{item.finalPrice.toFixed(2)}</td>
                <td>
                  <button className="btn btn-sm btn-danger" onClick={() => onDelete(item.barcode)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            <tr className="font-weight-bold">
              <td colSpan="4" className="text-right">Total</td>
              <td colSpan="2">₹{calculateTotal(items).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );

  return (
    <div className="container py-4">
      <h2 className="text-center text-primary mb-4">Bill / Return Page</h2>
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
          <h5 className="m-0">Customer Info</h5>
          <div className="mt-2 mt-md-0">
            <button className="btn btn-sm btn-success mr-2" onClick={() => navigate('/scan')}>
              <i className="fas fa-camera"></i> Scan
            </button>
            <button className="btn btn-sm btn-danger" onClick={() => {
              setSellItems([]); setReturnItems([]);
              scannedBarcodes.current.clear();
              setCustomer({ name: '', phone: '' });
              setBillSaved(false);
            }}>
              <i className="fas fa-times-circle"></i> Reset
            </button>
          </div>
        </div>
        <div className="card-body">
          {/* Customer Inputs */}
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

          {/* Tables */}
          {renderTable("Selling Items", sellItems, "success", (barcode) => {
            setSellItems(prev => prev.filter(i => i.barcode !== barcode));
            scannedBarcodes.current.delete(`sell-${barcode}`);
          })}
          {renderTable("Returning Items", returnItems, "warning", (barcode) => {
            setReturnItems(prev => prev.filter(i => i.barcode !== barcode));
            scannedBarcodes.current.delete(`return-${barcode}`);
          })}

          <h4 className="text-right mt-4">
            Net Total: ₹{(calculateTotal(sellItems) - calculateTotal(returnItems)).toFixed(2)}
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
