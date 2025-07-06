import React, { useState } from 'react';
import Sidebar from '../inc/Sidebar';
import Top from '../inc/Top';
import Footer from '../inc/Footer';

function StaffManagement() {
    const uname = localStorage.getItem("uname");
    const [showPassword, setShowPassword] = useState(false);
    const [staffList, setStaffList] = useState([
        {
            id: 1,
            name: 'John Doe',
            role: 'Billing',
            status: 'Active',
            username: 'john123',
            password: '123456',
        },
        {
            id: 2,
            name: 'Ayesha Singh',
            role: 'Stock Manager',
            status: 'Active',
            username: 'ayesha789',
            password: 'pass789',
        },
    ]);

    const [newStaff, setNewStaff] = useState({
        name: '',
        role: '',
        status: 'Active',
        username: '',
        password: '',
    });

    const [editStaff, setEditStaff] = useState(null);

    const handleAddStaff = () => {
        if (
            newStaff.name &&
            newStaff.role &&
            newStaff.username &&
            newStaff.password
        ) {
            setStaffList([...staffList, { ...newStaff, id: Date.now() }]);
            setNewStaff({
                name: '',
                role: '',
                status: 'Active',
                username: '',
                password: '',
            });
            window.$('#addStaffModal').modal('hide');
        } else {
            alert('Please fill in all fields');
        }
    };

    const handleEditSave = () => {
        setStaffList(
            staffList.map((staff) =>
                staff.id === editStaff.id ? editStaff : staff
            )
        );
        setEditStaff(null);
        window.$('#editStaffModal').modal('hide');
    };

    const handleDelete = (id) => {
        setStaffList(staffList.filter((s) => s.id !== id));
    };

    return (
        <div id="wrapper">
            <Sidebar />
            <div id="content-wrapper" className="d-flex flex-column">
                <div id="content">
                       <Top user={{name: uname}}/>
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
                                    <table
                                        className="table table-bordered"
                                        width="100%"
                                        cellSpacing="0"
                                    >
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Role</th>
                                                <th>Status</th>
                                                <th>Username</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {staffList.map((staff) => (
                                                <tr key={staff.id}>
                                                    <td>{staff.name}</td>
                                                    <td>{staff.role}</td>
                                                    <td>
                                                        <span
                                                            className={`badge ${staff.status === 'Active'
                                                                    ? 'badge-success'
                                                                    : 'badge-secondary'
                                                                }`}
                                                        >
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
                                                            onClick={() => handleDelete(staff.id)}
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
                        <div
                            className="modal fade"
                            id="addStaffModal"
                            tabIndex="-1"
                            role="dialog"
                            aria-labelledby="addStaffLabel"
                            aria-hidden="true"
                        >
                            <div className="modal-dialog" role="document">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title" id="addStaffLabel">
                                            Add New Staff
                                        </h5>
                                        <button
                                            className="close"
                                            type="button"
                                            data-dismiss="modal"
                                            aria-label="Close"
                                        >
                                            <span aria-hidden="true">×</span>
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        <input
                                            type="text"
                                            className="form-control mb-2"
                                            placeholder="Full Name"
                                            value={newStaff.name}
                                            onChange={(e) =>
                                                setNewStaff({ ...newStaff, name: e.target.value })
                                            }
                                        />
                                        <input
                                            type="text"
                                            className="form-control mb-2"
                                            placeholder="Role"
                                            value={newStaff.role}
                                            onChange={(e) =>
                                                setNewStaff({ ...newStaff, role: e.target.value })
                                            }
                                        />
                                        <input
                                            type="text"
                                            className="form-control mb-2"
                                            placeholder="Username"
                                            value={newStaff.username}
                                            onChange={(e) =>
                                                setNewStaff({ ...newStaff, username: e.target.value })
                                            }
                                        />
                                        <input
                                            type="password"
                                            className="form-control mb-2"
                                            placeholder="Password"
                                            value={newStaff.password}
                                            onChange={(e) =>
                                                setNewStaff({ ...newStaff, password: e.target.value })
                                            }
                                        />
                                        <select
                                            className="form-control"
                                            value={newStaff.status}
                                            onChange={(e) =>
                                                setNewStaff({ ...newStaff, status: e.target.value })
                                            }
                                        >
                                            <option>Active</option>
                                            <option>Inactive</option>
                                        </select>
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            className="btn btn-secondary"
                                            type="button"
                                            data-dismiss="modal"
                                        >
                                            Cancel
                                        </button>
                                        <button className="btn btn-primary" onClick={handleAddStaff}>
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Edit Staff Modal */}
                        {editStaff && (
                            <div
                                className="modal fade"
                                id="editStaffModal"
                                tabIndex="-1"
                                role="dialog"
                                aria-labelledby="editStaffLabel"
                                aria-hidden="true"
                            >
                                <div className="modal-dialog" role="document">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title" id="editStaffLabel">
                                                Edit Staff
                                            </h5>
                                            <button
                                                className="close"
                                                type="button"
                                                data-dismiss="modal"
                                                aria-label="Close"
                                            >
                                                <span aria-hidden="true">×</span>
                                            </button>
                                        </div>
                                        <div className="modal-body">
                                            <input
                                                type="text"
                                                className="form-control mb-2"
                                                placeholder="Full Name"
                                                value={editStaff.name}
                                                onChange={(e) =>
                                                    setEditStaff({ ...editStaff, name: e.target.value })
                                                }
                                            />
                                            <input
                                                type="text"
                                                className="form-control mb-2"
                                                placeholder="Role"
                                                value={editStaff.role}
                                                onChange={(e) =>
                                                    setEditStaff({ ...editStaff, role: e.target.value })
                                                }
                                            />
                                            <input
                                                type="text"
                                                className="form-control mb-2"
                                                placeholder="Username"
                                                value={editStaff.username}
                                                onChange={(e) =>
                                                    setEditStaff({ ...editStaff, username: e.target.value })
                                                }
                                            />
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

                                            <select
                                                className="form-control"
                                                value={editStaff.status}
                                                onChange={(e) =>
                                                    setEditStaff({ ...editStaff, status: e.target.value })
                                                }
                                            >
                                                <option>Active</option>
                                                <option>Inactive</option>
                                            </select>
                                        </div>
                                        <div className="modal-footer">
                                            <button
                                                className="btn btn-secondary"
                                                type="button"
                                                data-dismiss="modal"
                                            >
                                                Cancel
                                            </button>
                                            <button className="btn btn-primary" onClick={handleEditSave}>
                                                Save Changes
                                            </button>
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
