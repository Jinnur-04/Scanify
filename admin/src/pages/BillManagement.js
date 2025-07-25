import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import { fetchBills } from '../redux/slices/dashboardSlice';

function BillManagement() {
  const dispatch = useDispatch();
  const bills = useSelector(state => state.dashboard.stats.bills);

  const [filter, setFilter] = useState('today'); // 'today', 'all', or { startDate, endDate }
  const [filteredBills, setFilteredBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);

  // Fetch bills if empty
  useEffect(() => {
    if (!bills || bills.length === 0) {
      dispatch(fetchBills());
    }
  }, [dispatch, bills?.length]);

  // Filter logic
  useEffect(() => {
    let result = [...bills];

    // 📅 Filter by date
    if (filter === 'today') {
      const today = moment().format('YYYY-MM-DD');
      result = result.filter(bill =>
        moment(bill.date).format('YYYY-MM-DD') === today
      );
    } else if (filter?.startDate && filter?.endDate) {
      const start = moment(filter.startDate).startOf('day');
      const end = moment(filter.endDate).endOf('day');
      result = result.filter(bill => {
        const billDate = moment(bill.date);
        return billDate.isBetween(start, end, null, '[]');
      });
    }

    // 🔍 Search filter
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(bill =>
        bill?.customer?.name?.toLowerCase()?.includes(lower) ||
        bill?.staff?.name?.toLowerCase()?.includes(lower) ||
        bill?.customer?.phone?.includes(searchTerm)
      );
    }

    setFilteredBills(result);
  }, [filter, bills, searchTerm]);

  const handleRefresh = () => dispatch(fetchBills());

  const handleModalClose = () => {
    setSelectedBill(null);
    document.body.classList.remove('modal-open');
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.remove();
  };

  return (
    <div id="wrapper">
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          <div className="container-fluid">

            {/* Header */}
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
                <button className="btn btn-sm btn-secondary" onClick={handleRefresh}>
                  <i className="fas fa-sync-alt mr-1" /> Refresh
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search by customer/staff name or phone"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Bills Table */}
            <div className="card shadow mb-4">
              <div className="card-header py-3">
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
                      {filteredBills.length > 0 ? (
                        filteredBills.map((bill, index) => (
                          <tr key={bill._id}>
                            <td>#BILL{(index + 1).toString().padStart(4, '0')}</td>
                            <td>{moment(bill.date).format('YYYY-MM-DD HH:mm')}</td>
                            <td>{bill.staff?.name || 'Unknown'}</td>
                            <td>{bill.customer?.name || '-'}</td>
                            <td>{bill.customer?.phone || '-'}</td>
                            <td>{bill.items?.length || 0}</td>
                            <td>₹{bill.total?.toFixed(2)}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-info"
                                data-toggle="modal"
                                data-target="#viewBillModal"
                                onClick={() => setSelectedBill(bill)}
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center text-muted">No bills found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Bill View Modal */}
            {selectedBill && (
              <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-lg" role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">
                        Bill Details – #{selectedBill._id.slice(-4).toUpperCase()}
                      </h5>
                      <button type="button" className="close" onClick={handleModalClose}>
                        <span>&times;</span>
                      </button>
                    </div>
                    <div className="modal-body">
                      <p><strong>Billed By:</strong> {selectedBill.staff?.name || 'Unknown'}</p>
                      <p><strong>Customer:</strong> {selectedBill.customer?.name || '-'}</p>
                      <p><strong>Phone:</strong> {selectedBill.customer?.phone || '-'}</p>
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
      </div>
    </div>
  );
}

export default BillManagement;
