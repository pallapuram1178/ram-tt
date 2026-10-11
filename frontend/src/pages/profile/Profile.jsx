import React, { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Profile = () => {
  const { user, updateUserContext } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || 'Engineering',
    specialization: user?.specialization || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      showToast('New passwords do not match', 'warning');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        department: formData.department,
        specialization: formData.specialization,
      };

      if (formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const res = await api.put('/auth/profile', payload);
      if (res.data.success) {
        showToast('Profile updated successfully!', 'success');
        updateUserContext(res.data.user);
        setFormData((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold mb-0">My Profile & Account Settings</h3>
          <p className="text-muted small mb-0">Manage contact information, preferences, and password</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column Profile Card */}
        <div className="col-12 col-lg-4">
          <div className="card-custom text-center p-4">
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-2 mx-auto mb-3 shadow"
              style={{ width: '80px', height: '80px' }}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
            <h5 className="fw-bold mb-1">{user?.name}</h5>
            <p className="text-muted small mb-2">{user?.email}</p>
            <div className="d-flex justify-content-center gap-2 mb-3">
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1">
                {user?.role}
              </span>
              <span className="badge bg-light text-secondary border px-3 py-1">
                {user?.department}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column Edit Form */}
        <div className="col-12 col-lg-8">
          <div className="card-custom">
            <div className="card-custom-body p-4">
              <form onSubmit={handleProfileSubmit}>
                <h6 className="fw-bold text-primary mb-3">Personal Information</h6>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">Email Address (Locked)</label>
                    <input
                      type="email"
                      className="form-control bg-light"
                      value={formData.email}
                      disabled
                    />
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      className="form-control"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">Department</label>
                    <select
                      name="department"
                      className="form-select"
                      value={formData.department}
                      onChange={handleChange}
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="IT Support">IT Support</option>
                      <option value="Sales & Marketing">Sales & Marketing</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Executive">Executive</option>
                    </select>
                  </div>
                </div>

                <h6 className="fw-bold text-primary mb-3 pt-3 border-top">Change Password (Optional)</h6>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    className="form-control"
                    placeholder="Enter current password if changing"
                    value={formData.currentPassword}
                    onChange={handleChange}
                  />
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      className="form-control"
                      placeholder="Min 6 characters"
                      value={formData.newPassword}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control"
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end">
                  <button
                    type="submit"
                    className="btn btn-primary fw-semibold px-4 shadow-sm"
                    disabled={loading}
                  >
                    {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
