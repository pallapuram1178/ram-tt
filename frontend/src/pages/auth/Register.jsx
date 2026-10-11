import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: 'Engineering',
    phone: '',
    role: 'Employee',
  });
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'warning');
      return;
    }

    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters', 'warning');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        phone: formData.phone,
        role: formData.role,
      });
      showToast('Account created successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5 px-3">
      <div className="card-custom shadow-lg border-0" style={{ maxWidth: '520px', width: '100%', borderRadius: '16px' }}>
        <div className="p-4 p-md-5">
          <div className="text-center mb-4">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-3 bg-primary text-white shadow-sm mb-3"
              style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}
            >
              <i className="bi bi-person-plus-fill"></i>
            </div>
            <h4 className="fw-bold mb-1">Create an Account</h4>
            <p className="text-muted small">Join ServiceDesk Pro IT Portal</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="e.g. Alex Johnson"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Corporate Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="alex.johnson@company.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="row g-2 mb-3">
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
                  <option value="Human Resources">Human Resources</option>
                  <option value="Operations">Operations</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">Phone (Optional)</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Account Role</label>
              <select
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="Employee">Employee (Self-Service Requester)</option>
                <option value="Technician">Technician (IT Support Resolver)</option>
                <option value="Asset Manager">Asset Manager (Hardware & Licenses)</option>
                <option value="IT Manager">IT Manager (Team Lead & SLAs)</option>
                <option value="Admin">Admin (Full System Administrator)</option>
              </select>
            </div>

            <div className="row g-2 mb-4">
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Min 6 chars"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold shadow-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Creating Account...
                </>
              ) : (
                'Create ServiceDesk Account'
              )}
            </button>
          </form>

          <div className="text-center mt-4 pt-2 border-top">
            <span className="text-muted small">Already registered? </span>
            <Link to="/login" className="small fw-bold text-primary text-decoration-none">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
