import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const demoAccounts = [
    { role: 'Admin', email: 'admin@servicedesk.pro', pass: 'Admin@123', color: 'danger', icon: 'bi-shield-lock-fill' },
    { role: 'IT Manager', email: 'manager@servicedesk.pro', pass: 'Manager@123', color: 'purple', icon: 'bi-person-workspace' },
    { role: 'Technician', email: 'tech.alex@servicedesk.pro', pass: 'Tech@123', color: 'primary', icon: 'bi-tools' },
    { role: 'Asset Manager', email: 'asset.john@servicedesk.pro', pass: 'Asset@123', color: 'info', icon: 'bi-box-seam-fill' },
    { role: 'Employee', email: 'employee.jane@servicedesk.pro', pass: 'Emp@123', color: 'secondary', icon: 'bi-person-fill' },
  ];

  const handleQuickLogin = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    try {
      await login(demoEmail, demoPass);
      showToast('Logged in successfully!', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in both email and password', 'warning');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      showToast('Welcome back to ServiceDesk Pro!', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5 px-3">
      <div className="card-custom shadow-lg border-0" style={{ maxWidth: '480px', width: '100%', borderRadius: '16px' }}>
        <div className="p-4 p-md-5">
          {/* Header & Logo */}
          <div className="text-center mb-4">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-3 bg-primary text-white shadow-sm mb-3"
              style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}
            >
              <i className="bi bi-shield-check"></i>
            </div>
            <h4 className="fw-bold mb-1">ServiceDesk Pro</h4>
            <p className="text-muted small">AI-Powered IT Helpdesk & Asset Management System</p>
          </div>

          {/* Quick Demo Switcher */}
          <div className="mb-4 p-3 bg-light rounded-3 border">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small fw-bold text-dark">
                <i className="bi bi-lightning-charge-fill text-warning me-1"></i> Quick Demo Login
              </span>
              <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.65rem' }}>1-Click Roles</span>
            </div>
            <div className="d-flex flex-wrap gap-1">
              {demoAccounts.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  className="btn btn-outline-secondary btn-sm flex-fill d-flex align-items-center justify-content-center gap-1 py-1"
                  style={{ fontSize: '0.78rem' }}
                  onClick={() => handleQuickLogin(account.email, account.pass)}
                  disabled={loading}
                >
                  <i className={`bi ${account.icon}`}></i>
                  <span>{account.role}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Standard Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-envelope text-muted"></i>
                </span>
                <input
                  type="email"
                  className="form-control border-start-0"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-semibold text-muted mb-0">Password</label>
              </div>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-lock text-muted"></i>
                </span>
                <input
                  type="password"
                  className="form-control border-start-0"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Signing In...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          <div className="text-center mt-4 pt-2 border-top">
            <span className="text-muted small">Don't have an account? </span>
            <Link to="/register" className="small fw-bold text-primary text-decoration-none">
              Register New Employee
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
