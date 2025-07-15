import React, { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';
import { Link } from 'react-router-dom';


function StaffManagement() {
  const uname = localStorage.getItem("uname");
  const [showPassword, setShowPassword] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editStaff, setEditStaff] = useState(null);

  useEffect(() => {
    fetchStaffList();
  }, []);

  const fetchStaffList = async () => {
    try {
      const response = await axios.get(`/staff`);
      setStaffList(response.data);
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  const handleEditSave = async () => {
    try {
      const response = await axios.put(`/staff/${editStaff._id}`, editStaff);
      const updated = response.data;
      setStaffList(staffList.map((s) => (s._id === updated._id ? updated : s)));
      setEditStaff(null);
      window.$('#editStaffModal').modal('hide');
    } catch (error) {
      console.error('Error updating staff:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/staff/${id}`);
      setStaffList(staffList.filter((s) => s._id !== id));
    } catch (error) {
      console.error('Error deleting staff:', error);
    }
  };

  const filteredStaff = staffList.filter(staff =>
    [staff.name, staff.email, staff.role, staff.username].some(field =>
      field?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div id="wrapper">
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h1 className="h3 text-gray-800">Staff Management</h1>
            </div>

            <input
              type="text"
              className="form-control mb-3"
              placeholder="Search staff by name, email, role, or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="card shadow">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-bordered" width="100%" cellSpacing="0">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Username</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStaff.map((staff) => (
                        <tr key={staff._id}>
                          <td>{staff.name}</td>
                          <td>{staff.email}</td>
                          <td>{staff.role}</td>
                          <td>
                            <span className={`badge ${staff.status === 'Active' ? 'badge-success' : 'badge-secondary'}`}>
                              {staff.status}
                            </span>
                          </td>
                          <td>{staff.username}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-warning mr-2"
                              onClick={() => setEditStaff({ ...staff })}
                              data-toggle="modal"
                              data-target="#editStaffModal"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(staff._id)}
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredStaff.length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center text-muted">
                            No staff members found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Edit Staff Modal */}
            {editStaff && (
              <div className="modal fade" id="editStaffModal" tabIndex="-1" role="dialog" aria-hidden="true">
                <div className="modal-dialog" role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Edit Staff</h5>
                      <button className="close" type="button" data-dismiss="modal">
                        <span>×</span>
                      </button>
                    </div>
                    <div className="modal-body">
                      <div className="form-group">
                        <p className="mb-1 font-weight-bold">Full Name</p>
                        <input
                          type="text"
                          className="form-control"
                          value={editStaff.name}
                          onChange={(e) => setEditStaff({ ...editStaff, name: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <p className="mb-1 font-weight-bold">Email</p>
                        <input
                          type="email"
                          className="form-control"
                          value={editStaff.email}
                          onChange={(e) => setEditStaff({ ...editStaff, email: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <p className="mb-1 font-weight-bold">Role</p>
                        <select
                          className="form-control"
                          value={editStaff.role}
                          onChange={(e) => setEditStaff({ ...editStaff, role: e.target.value })}
                        >
                          <option value="">Select Role</option>
                          <option value="Manager">Manager</option>
                          <option value="Billing">Billing</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <p className="mb-1 font-weight-bold">Username</p>
                        <input
                          type="text"
                          className="form-control"
                          value={editStaff.username}
                          onChange={(e) => setEditStaff({ ...editStaff, username: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <p className="mb-1 font-weight-bold">Status</p>
                        <select
                          className="form-control"
                          value={editStaff.status}
                          onChange={(e) => setEditStaff({ ...editStaff, status: e.target.value })}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                      <button className="btn btn-primary" onClick={handleEditSave}>Save</button>
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

export default StaffManagement;
