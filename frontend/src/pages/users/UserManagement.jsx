import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const UserManagement = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [editUser, setEditUser] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        role: roleFilter !== 'all' ? roleFilter : undefined,
        search: search.trim() ? search.trim() : undefined,
      };

      const res = await api.get('/users', { params });
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editUser) return;

    setSaving(true);
    try {
      const res = await api.put(`/users/${editUser._id}`, {
        role: editUser.role,
        department: editUser.department,
        isActive: editUser.isActive,
        specialization: editUser.specialization,
      });

      if (res.data.success) {
        showToast('User permissions updated successfully!', 'success');
        setEditUser(null);
        fetchUsers();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update user', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Admin':
        return 'badge-role-admin';
      case 'IT Manager':
        return 'badge-role-manager';
      case 'Technician':
        return 'badge-role-technician';
      case 'Asset Manager':
        return 'badge-role-asset';
      default:
        return 'badge-role-employee';
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">User Directory & Role Permissions</h3>
          <p className="text-muted small mb-0">Manage corporate staff roles, IT assignments, and account access</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="card-custom mb-4">
        <div className="card-custom-body p-3">
          <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
            <div className="col-12 col-md-6">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search user name, email, department..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="col-6 col-md-4">
              <select
                className="form-select form-select-sm"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="IT Manager">IT Manager</option>
                <option value="Technician">Technician</option>
                <option value="Asset Manager">Asset Manager</option>
                <option value="Employee">Employee</option>
              </select>
            </div>

            <div className="col-6 col-md-2">
              <button type="submit" className="btn btn-primary btn-sm w-100">
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Users Table */}
      <div className="card-custom">
        <div className="table-responsive">
          <table className="table table-custom align-middle">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Department</th>
                <th>Specialization / Focus</th>
                <th>Account Status</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                    <span className="text-muted small">Loading user directory...</span>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold small" style={{ width: '34px', height: '34px' }}>
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="fw-bold small">{u.name}</div>
                          <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getRoleBadgeClass(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td><span className="small fw-semibold">{u.department}</span></td>
                    <td><span className="text-muted small">{u.specialization || 'General'}</span></td>
                    <td>
                      <span className={`badge ${u.isActive ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-light border py-1 px-2"
                        onClick={() => setEditUser(u)}
                        title="Edit Role & Access"
                      >
                        <i className="bi bi-pencil-square"></i> Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted small">
                    No users found matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editUser && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fs-6 fw-bold">
                  <i className="bi bi-person-gear me-2"></i> Edit Permissions for {editUser.name}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setEditUser(null)}></button>
              </div>
              <form onSubmit={handleUpdateUser}>
                <div className="modal-body p-3">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Role</label>
                    <select
                      className="form-select"
                      value={editUser.role}
                      onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                    >
                      <option value="Admin">Admin</option>
                      <option value="IT Manager">IT Manager</option>
                      <option value="Technician">Technician</option>
                      <option value="Asset Manager">Asset Manager</option>
                      <option value="Employee">Employee</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Department</label>
                    <select
                      className="form-select"
                      value={editUser.department}
                      onChange={(e) => setEditUser({ ...editUser, department: e.target.value })}
                    >
                      <option value="IT Support">IT Support</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Sales & Marketing">Sales & Marketing</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Executive">Executive</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Specialization (For IT Technicians)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editUser.specialization || ''}
                      onChange={(e) => setEditUser({ ...editUser, specialization: e.target.value })}
                    />
                  </div>

                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="statusSwitch"
                      checked={editUser.isActive}
                      onChange={(e) => setEditUser({ ...editUser, isActive: e.target.checked })}
                    />
                    <label className="form-check-label small fw-semibold" htmlFor="statusSwitch">
                      Account is Active
                    </label>
                  </div>
                </div>
                <div className="modal-footer bg-light p-2 px-3">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditUser(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm fw-semibold" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Permissions'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
