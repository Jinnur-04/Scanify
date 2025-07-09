import React, { useState, useEffect } from 'react';
import Sidebar from '../inc/Sidebar';
import Top from '../inc/Top';
import Footer from '../inc/Footer';
import axios from 'axios';
import moment from 'moment';

function BillManagement() {
  const uname = localStorage.getItem("uname");
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [filter, setFilter] = useState('today');
  const [selectedBill, setSelectedBill] = useState(null);

  const BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchBills();
  }, []);

  useEffect(() => {
    filterBills();
  }, [filter, bills]);

  const fetchBills = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/bills`);
      setBills(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch bills", err);
    }
  };

  const filterBills = () => {
    if (filter === 'today') {
      const today = moment().format('YYYY-MM-DD');
      const filtered = bills.filter(bill =>
        moment(bill.date).format('YYYY-MM-DD') === today
      );
      setFilteredBills(filtered);
    } else {
      setFilteredBills(bills);
    }
  };

  const handleModalClose = () => {
    setSelectedBill(null);
    const modalBackdrop = document.querySelector('.modal-backdrop');
    if (modalBackdrop) modalBackdrop.remove();
    document.body.classList.remove('modal-open');
  };

  return (
    <div id="wrapper">
      <Sidebar />
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          <Top user={{ name: uname }} />

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
                <button className="btn btn-sm btn-secondary" onClick={fetchBills}>
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
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-bordered">
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
                      {filteredBills.map((bill, index) => (
                        <tr key={bill._id}>
                          <td>#BILL{(index + 1).toString().padStart(4, '0')}</td>
                          <td>{moment(bill.date).format('YYYY-MM-DD HH:mm')}</td>
                          <td>{bill.staff?.name || 'Unknown'}</td>
                          <td>{bill.customer.name}</td>
                          <td>{bill.customer.phone}</td>
                          <td>{bill.items.length}</td>
                          <td>₹{bill.total.toFixed(2)}</td>
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
                className="modal fade show"
                id="viewBillModal"
                style={{ display: 'block' }}
                tabIndex="-1"
                role="dialog"
                aria-labelledby="viewBillLabel"
                aria-modal="true"
              >
                <div className="modal-dialog modal-lg" role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" id="viewBillLabel">
                        Bill Details – #{selectedBill._id.slice(-4).toUpperCase()}
                      </h5>
                      <button type="button" className="close" onClick={handleModalClose}>
                        <span>&times;</span>
                      </button>
                    </div>
                    <div className="modal-body">
                      <p><strong>Billed By:</strong> {selectedBill.staff?.name || 'Unknown'}</p>
                      <p><strong>Customer:</strong> {selectedBill.customer.name}</p>
                      <p><strong>Phone:</strong> {selectedBill.customer.phone}</p>
                      <p><strong>Date:</strong> {moment(selectedBill.date).format('YYYY-MM-DD HH:mm')}</p>
                      <div className="table-responsive">
                        <table className="table table-bordered">
                          <thead>
                            <tr>
                              <th>Item</th>
                              <th>Qty</th>
                              <th>Price</th>
                              <th>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedBill.items.map((item, i) => (
                              <tr key={i}>
                                <td>{item.name}</td>
                                <td>{item.qty}</td>
                                <td>₹{item.finalPrice.toFixed(2)}</td>
                                <td>₹{(item.qty * item.finalPrice).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <h5 className="text-right mt-3">Total: ₹{selectedBill.total.toFixed(2)}</h5>
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
