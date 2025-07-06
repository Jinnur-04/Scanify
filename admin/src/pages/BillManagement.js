import React, { useState, useEffect } from 'react';
import Sidebar from '../inc/Sidebar';
import Top from '../inc/Top';
import Footer from '../inc/Footer';

function BillManagement() {
  const uname = localStorage.getItem("uname");
  const allBills = [
    {
      id: 1,
      date: '2025-07-05',
      staff: 'John Doe',
      customer: { name: 'Ravi Kumar', phone: '9876543210' },
      total: 850,
      items: [
        { name: 'Toothpaste', qty: 2, price: 100 },
        { name: 'Soap', qty: 3, price: 150 },
      ],
    },
    {
      id: 2,
      date: '2025-07-05',
      staff: 'Ayesha Singh',
      customer: { name: 'Neha Sharma', phone: '9123456780' },
      total: 1230,
      items: [
        { name: 'Shampoo', qty: 2, price: 300 },
        { name: 'Milk', qty: 3, price: 210 },
      ],
    },
    {
      id: 3,
      date: '2025-07-04',
      staff: 'Rahul',
      customer: { name: 'Sanjay Patel', phone: '9988776655' },
      total: 430,
      items: [
        { name: 'Pen', qty: 4, price: 20 },
        { name: 'Notebook', qty: 2, price: 150 },
      ],
    },
  ];
  const [filter, setFilter] = useState('today');
  const [filteredBills, setFilteredBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const filtered =
      filter === 'today'
        ? allBills.filter((bill) => bill.date === today)
        : allBills;
    setFilteredBills(filtered);
  }, [filter]);

  return (
    <div id="wrapper">
      <Sidebar />
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          <Top user={{name: uname}}/>
          <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">Bill Management</h1>
              <div>
                <button
                  className={`btn btn-sm ${filter === 'today' ? 'btn-primary' : 'btn-outline-primary'} mr-2`}
                  onClick={() => setFilter('today')}
                >
                  Today’s Bills
                </button>
                <button
                  className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'} mr-2`}
                  onClick={() => setFilter('all')}
                >
                  All Bills
                </button>
                <button className="btn btn-sm btn-secondary">
                  <i className="fas fa-sync-alt mr-1"></i> Refresh
                </button>
              </div>
            </div>

            {/* Bills Table */}
            <div className="card shadow mb-4">
              <div className="card-header py-3 d-flex justify-content-between">
                <h6 className="m-0 font-weight-bold text-primary">
                  {filter === 'today' ? "Today's Bills" : 'All Bills'} ({filteredBills.length})
                </h6>
                <button className="btn btn-sm btn-success">
                  <i className="fas fa-download mr-1"></i> Download PDF
                </button>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-bordered" width="100%" cellSpacing="0">
                    <thead>
                      <tr>
                        <th>Bill ID</th>
                        <th>Date</th>
                        <th>Billed By</th>
                        <th>Customer</th>
                        <th>Phone</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBills.map((bill) => (
                        <tr key={bill.id}>
                          <td>#BILL{bill.id.toString().padStart(4, '0')}</td>
                          <td>{bill.date}</td>
                          <td>{bill.staff}</td>
                          <td>{bill.customer.name}</td>
                          <td>{bill.customer.phone}</td>
                          <td>{bill.items.length}</td>
                          <td>₹{bill.total}</td>
                          <td>
                            <div className="d-flex">
                              <button
                                className="btn btn-sm btn-info me-2"
                                data-toggle="modal"
                                data-target="#viewBillModal"
                                onClick={() => setSelectedBill(bill)}
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button className="btn btn-sm btn-danger">
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredBills.length === 0 && (
                        <tr>
                          <td colSpan="8" className="text-center text-muted">
                            No bills found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* View Bill Modal */}
            {selectedBill && (
              <div
                className="modal fade"
                id="viewBillModal"
                tabIndex="-1"
                role="dialog"
                aria-labelledby="viewBillLabel"
                aria-hidden="true"
              >
                <div className="modal-dialog modal-lg" role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" id="viewBillLabel">
                        Bill Details – #{selectedBill.id.toString().padStart(4, '0')}
                      </h5>
                      <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">×</span>
                      </button>
                    </div>
                    <div className="modal-body">
                      <p><strong>Billed By:</strong> {selectedBill.staff}</p>
                      <p><strong>Customer:</strong> {selectedBill.customer.name}</p>
                      <p><strong>Phone:</strong> {selectedBill.customer.phone}</p>
                      <p><strong>Date:</strong> {selectedBill.date}</p>
                      <div className="table-responsive">
                        <table className="table table-bordered">
                          <thead className="thead-light">
                            <tr>
                              <th>Item Name</th>
                              <th>Quantity</th>
                              <th>Price</th>
                              <th>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedBill.items.map((item, idx) => (
                              <tr key={idx}>
                                <td>{item.name}</td>
                                <td>{item.qty}</td>
                                <td>₹{item.price}</td>
                                <td>₹{item.qty * item.price}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="text-right mt-3">
                        <h5>Total Amount: ₹{selectedBill.total}</h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default BillManagement;
