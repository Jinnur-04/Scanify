import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../inc/Sidebar';
import Top from '../inc/Top';
import Footer from '../inc/Footer';

const BASE_URL = process.env.REACT_APP_API_URL;

function StaffManagement() {
    const uname = localStorage.getItem("uname");
    const [showPassword, setShowPassword] = useState(false);
    const [staffList, setStaffList] = useState([]);

    const [newStaff, setNewStaff] = useState({
        name: '',
        role: '',
        status: 'Active',
        username: '',
        password: '',
    });

    const [editStaff, setEditStaff] = useState(null);

    useEffect(() => {
        fetchStaffList();
    }, []);

    const fetchStaffList = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/staff`);
            setStaffList(response.data);
        } catch (error) {
            console.error("Error fetching staff:", error);
        }
    };

    const handleAddStaff = async () => {
        const { name, role, username, password } = newStaff;
        if (!name || !role || !username || !password) {
            alert('Please fill in all required fields.');
            return;
        }

        try {
            const response = await axios.post(`${BASE_URL}/staff`, newStaff);
            setStaffList([...staffList, response.data]);
            setNewStaff({
                name: '',
                role: '',
                status: 'Active',
                username: '',
                password: '',
            });
            window.$('#addStaffModal').modal('hide');
        } catch (error) {
            console.error('Error adding staff:', error);
            alert(error?.response?.data?.message || 'Error adding staff');
        }
    };

    const handleEditSave = async () => {
        try {
            const response = await axios.put(`${BASE_URL}/staff/${editStaff._id}`, editStaff);
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
            await axios.delete(`${BASE_URL}/staff/${id}`);
            setStaffList(staffList.filter((s) => s._id !== id));
        } catch (error) {
            console.error('Error deleting staff:', error);
        }
    };

    const roleOptions = ['Admin', 'Manager', 'Billing'];

    return (
        <div id="wrapper">
            <Sidebar />
            <div id="content-wrapper" className="d-flex flex-column">
                <div id="content">
                    <Top user={{ name: uname }} />
                    <div className="container-fluid">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h1 className="h3 text-gray-800">Staff Management</h1>
                            <button
                                className="btn btn-primary"
                                data-toggle="modal"
                                data-target="#addStaffModal"
                            >
                                <i className="fas fa-user-plus mr-2"></i>Add Staff
                            </button>
                        </div>

                        {/* Staff Table */}
                        <div className="card shadow">
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-bordered" width="100%" cellSpacing="0">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Role</th>
                                                <th>Status</th>
                                                <th>Username</th>
                                                <th>Password</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {staffList.map((staff) => (
                                                <tr key={staff._id}>
                                                    <td>{staff.name}</td>
                                                    <td>{staff.role}</td>
                                                    <td>
                                                        <span className={`badge ${staff.status === 'Active' ? 'badge-success' : 'badge-secondary'}`}>
                                                            {staff.status}
                                                        </span>
                                                    </td>
                                                    <td>{staff.username}</td>
                                                    <td>
                                                        <div className="input-group">
                                                            <input
                                                                type={showPassword ? 'text' : 'password'}
                                                                className="form-control form-control-sm"
                                                                value={staff.password}
                                                                readOnly
                                                            />
                                                            <div className="input-group-append">
                                                                <button
                                                                    className="btn btn-sm btn-outline-secondary"
                                                                    type="button"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                    title="Show/Hide Password"
                                                                >
                                                                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-outline-secondary"
                                                                    type="button"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(staff.password);
                                                                        alert('Password copied to clipboard!');
                                                                    }}
                                                                    title="Copy to Clipboard"
                                                                >
                                                                    <i className="fas fa-copy"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>

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
                                            {staffList.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="text-center text-muted">
                                                        No staff members found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Add Staff Modal */}
                        <div className="modal fade" id="addStaffModal" tabIndex="-1" role="dialog" aria-hidden="true">
                            <div className="modal-dialog" role="document">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Add New Staff</h5>
                                        <button className="close" type="button" data-dismiss="modal">
                                            <span>×</span>
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        <input type="text" className="form-control mb-2" placeholder="Full Name"
                                            value={newStaff.name}
                                            onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} />

                                        <select className="form-control mb-2"
                                            value={newStaff.role}
                                            onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}>
                                            <option value="">Select Role</option>
                                            {roleOptions.map(role => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>

                                        <input type="text" className="form-control mb-2" placeholder="Username"
                                            value={newStaff.username}
                                            onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })} />

                                        <div className="input-group mb-2">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                className="form-control"
                                                placeholder="Password"
                                                value={newStaff.password}
                                                onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                                            />
                                            <div className="input-group-append">
                                                <span
                                                    className="input-group-text"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                </span>
                                            </div>
                                        </div>

                                        <select className="form-control"
                                            value={newStaff.status}
                                            onChange={(e) => setNewStaff({ ...newStaff, status: e.target.value })}>
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                    <div className="modal-footer">
                                        <button className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                                        <button className="btn btn-primary" onClick={handleAddStaff}>Add</button>
                                    </div>
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
                                            <input type="text" className="form-control mb-2" placeholder="Full Name"
                                                value={editStaff.name}
                                                onChange={(e) => setEditStaff({ ...editStaff, name: e.target.value })} />

                                            <select className="form-control mb-2"
                                                value={editStaff.role}
                                                onChange={(e) => setEditStaff({ ...editStaff, role: e.target.value })}>
                                                <option value="">Select Role</option>
                                                {roleOptions.map(role => (
                                                    <option key={role} value={role}>{role}</option>
                                                ))}
                                            </select>

                                            <input type="text" className="form-control mb-2" placeholder="Username"
                                                value={editStaff.username}
                                                onChange={(e) => setEditStaff({ ...editStaff, username: e.target.value })} />

                                            <div className="input-group mb-2">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    className="form-control"
                                                    placeholder="Password"
                                                    value={editStaff.password}
                                                    onChange={(e) =>
                                                        setEditStaff({ ...editStaff, password: e.target.value })
                                                    }
                                                />
                                                <div className="input-group-append">
                                                    <span
                                                        className="input-group-text"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                    </span>
                                                </div>
                                            </div>

                                            <select className="form-control"
                                                value={editStaff.status}
                                                onChange={(e) => setEditStaff({ ...editStaff, status: e.target.value })}>
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                            </select>
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
                <Footer />
            </div>
        </div>
    );
}

export default StaffManagement;
