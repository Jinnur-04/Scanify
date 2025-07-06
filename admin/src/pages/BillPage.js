import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Sidebar from '../inc/Sidebar';
import Top from '../inc/Top';
import Footer from '../inc/Footer';

function BillPage() {
  const uname = localStorage.getItem("uname");
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [items, setItems] = useState([
    { name: 'Dairy Milk 100g', quantity: 2, price: 50 },
    { name: 'Shampoo 200ml', quantity: 1, price: 120 },
    { name: 'Rice 1kg', quantity: 3, price: 80 },
  ]);

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.quantity * item.price, 0);
  };

 const generatePDF = () => {
  const doc = new jsPDF();

  // Set fonts and center header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Scanify Invoice', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Customer Name: ${customer.name || 'N/A'}`, 14, 35);
  doc.text(`Phone: ${customer.phone || 'N/A'}`, 14, 42);

  // Product table
  doc.autoTable({
    startY: 50,
    head: [['Product Name', 'Quantity', 'Price ', 'Subtotal ']],
    body: items.map(item => [
      item.name,
      item.quantity,
      item.price,
      item.quantity * item.price
    ]),
    headStyles: {
      fillColor: [78, 115, 223], // SB Admin blue
      halign: 'center'
    },
    bodyStyles: {
      halign: 'center'
    }
  });

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total:Rupees ${calculateTotal()} only`, 14, doc.lastAutoTable.finalY + 10);

  doc.save('scanify-invoice.pdf');
};


  return (
    <div id="wrapper">
      <Sidebar />
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
             <Top user={{name: uname}}/>
          <div className="container-fluid">
            <h1 className="h3 mb-4 text-gray-800">Bill Details</h1>
            <div className="card shadow mb-4">
              <div className="card-header py-3 flex">
                <h6 className="m-0 font-weight-bold text-primary w-20">Customer Info</h6>
                <span className="float-right">
                  <button className="btn btn-sm btn-primary" onClick={() => setCustomer({ name: '', phone: '' })}>
                    <img className='h-10' src="https://cdn-icons-png.flaticon.com/512/1550/1550324.png"/> Scan
                  </button>
                </span>
              </div>
              <div className="card-body">
                <form className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label htmlFor="customerName" className="form-label">Customer Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="customerName"
                      placeholder="Enter full name"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="customerPhone" className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      id="customerPhone"
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
                        <th>Product Name</th>
                        <th>Quantity</th>
                        <th>Price (₹)</th>
                        <th>Subtotal (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                          <td>{item.price}</td>
                          <td>{item.quantity * item.price}</td>
                        </tr>
                      ))}
                      <tr className="font-weight-bold">
                        <td colSpan="4" className="text-right">Total</td>
                        <td>₹{calculateTotal()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <button className="btn btn-primary mt-3" onClick={generatePDF}>
                  <i className="fas fa-file-pdf mr-2"></i>Generate Bill (PDF)
                </button>
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
