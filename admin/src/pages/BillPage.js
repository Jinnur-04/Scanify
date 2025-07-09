import React, { useEffect, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Sidebar from '../inc/Sidebar';
import Top from '../inc/Top';
import Footer from '../inc/Footer';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function BillPage() {
  const uname = localStorage.getItem("uname") || 'Staff';
  const staffId = localStorage.getItem('staffId'); // Since no staff table for now
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [billSaved, setBillSaved] = useState(false);
  const scannedBarcodes = useRef(new Set());

 useEffect(() => {
  const socket = new WebSocket("ws://localhost:4000");
  const staffId = localStorage.getItem('staffId');

  socket.onopen = () => {
    socket.send(JSON.stringify({
      type: 'register',
      staffId,
      clientType: 'bill'
    }));
  };

  socket.onmessage = async (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'barcode-broadcast' && data.barcode) {
      const barcode = data.barcode;

      if (scannedBarcodes.current.has(barcode)) {
        console.log("🔁 Duplicate barcode ignored:", barcode);
        return;
      }
      scannedBarcodes.current.add(barcode);

      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/products/barcode/${barcode}`);
        const product = res.data;

        console.log("📦 Product fetched:", product);

        let finalPrice = product.price;
        const discount = product.discount || '0%';

        if (discount.endsWith('%')) {
          const percent = parseFloat(discount);
          if (!isNaN(percent)) {
            finalPrice -= (finalPrice * percent) / 100;
          }
        }

        finalPrice = parseFloat(finalPrice.toFixed(2));

        setItems(prev => [
          ...prev,
          {
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
          }
        ]);
      } catch (err) {
        console.error("❌ Product fetch failed:", err);
        toast.error("Product fetch failed.");
      }
    }
  };

  socket.onclose = () => {
    console.log("🔌 WebSocket closed for bill tab");
  };

  return () => {
    socket.close();
  };
}, []);


  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.finalPrice * item.qty, 0);
  };

  const saveBill = async () => {
    if (!customer.name || items.length === 0) {
      toast.error("Customer or items missing");
      return;
    }

    try {
      setSaving(true);
      const total = calculateTotal();

      const billData = {
        date: new Date(),
        staff: staffId,
        customer,
        total,
        items
      };

      await axios.post(`${process.env.REACT_APP_API_URL}/bills`, billData);
      toast.success("✅ Bill saved");
      setBillSaved(true);
    } catch (err) {
      console.error("❌ Bill save failed:", err);
      toast.error("Failed to save bill");
    } finally {
      setSaving(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Scanify Invoice', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Staff: ${uname}`, 14, 30);
    doc.text(`Customer: ${customer.name}`, 14, 38);
    doc.text(`Phone: ${customer.phone}`, 14, 45);

    doc.autoTable({
      startY: 55,
      head: [['#', 'Name', 'Qty', 'Discount', 'Price (₹)']],
      body: items.map((item, idx) => [
        idx + 1,
        item.name,
        item.qty,
        item.discount,
        item.finalPrice.toFixed(2)
      ]),
      headStyles: { fillColor: [78, 115, 223], halign: 'center' },
      bodyStyles: { halign: 'center' }
    });

    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ₹${calculateTotal().toFixed(2)}`, 14, doc.lastAutoTable.finalY + 10);
    doc.save('scanify-invoice.pdf');
  };

  const deleteItem = (barcode) => {
    setItems(prev => prev.filter(item => item.barcode !== barcode));
    scannedBarcodes.current.delete(barcode);
  };

  const resetItems = () => {
    setItems([]);
    scannedBarcodes.current.clear();
    setBillSaved(false);
    setCustomer({ name: '', phone: '' });
  };

  return (
    <div id="wrapper">
      <Sidebar />
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          <Top user={{ name: uname }} />
          <div className="container-fluid">
            <h1 className="h3 mb-4 text-gray-800">Bill Details</h1>

            <div className="card shadow mb-4">
              <div className="card-header py-3 d-flex justify-content-between">
                <h6 className="m-0 font-weight-bold text-primary">Customer Info</h6>
                <div>
                  <button className="btn btn-sm btn-success mr-2" onClick={() => navigate('/scan')}>
                    <i className="fas fa-camera"></i> Scan
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={resetItems}>
                    <i className="fas fa-times-circle"></i> Reset
                  </button>
                </div>
              </div>

              <div className="card-body">
                <form className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Customer Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter full name"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="Enter phone number"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    />
                  </div>
                </form>

                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
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
                      {items.map((item, index) => (
                        <tr key={item.barcode}>
                          <td>{index + 1}</td>
                          <td>{item.name}</td>
                          <td>{item.qty}</td>
                          <td>{item.discount}</td>
                          <td>₹{item.finalPrice.toFixed(2)}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => deleteItem(item.barcode)}
                            >
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

                {!billSaved ? (
                  <button className="btn btn-primary mt-3" onClick={saveBill} disabled={saving}>
                    <i className="fas fa-save mr-2"></i> {saving ? 'Saving...' : 'Generate Bill'}
                  </button>
                ) : (
                  <button className="btn btn-secondary mt-3" onClick={generatePDF}>
                    <i className="fas fa-file-pdf mr-2"></i> Download PDF
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default BillPage;
