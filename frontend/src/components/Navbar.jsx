import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onToggleSidebar, onOpenAIChat }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-navbar">
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-light d-lg-none p-1 px-2 border"
          onClick={onToggleSidebar}
        >
          <i className="bi bi-list fs-5"></i>
        </button>

        <div className="d-none d-md-flex align-items-center gap-2">
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
            <i className="bi bi-building me-1"></i>
            {user?.department || 'Enterprise Desk'}
          </span>
          <span className="text-muted small">|</span>
          <span className="text-muted small">
            Signed in as <strong>{user?.name}</strong>
          </span>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2">
        {/* Quick Launch AI Helpdesk */}
        <button
          onClick={onOpenAIChat}
          className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 px-3 rounded-pill fw-semibold shadow-sm"
        >
          <span className="ai-pulse-dot"></span>
          <i className="bi bi-robot"></i>
          <span>Ask AI</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="position-relative">
          <button
            className="btn btn-light rounded-circle position-relative p-2"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <i className="bi bi-bell fs-6 text-secondary"></i>
            <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
              <span className="visually-hidden">New alerts</span>
            </span>
          </button>

          {showNotifications && (
            <div
              className="position-absolute end-0 mt-2 bg-white shadow-lg border rounded-3 p-0"
              style={{ width: '320px', zIndex: 1060 }}
            >
              <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light rounded-top-3">
                <span className="fw-bold small text-dark">System Alerts & SLA</span>
                <span className="badge bg-primary rounded-pill">3 New</span>
              </div>
              <div className="list-group list-group-flush" style={{ maxHeight: '260px', overflowY: 'auto' }}>
                <Link
                  to="/tickets"
                  className="list-group-item list-group-item-action p-2 px-3 small"
                  onClick={() => setShowNotifications(false)}
                >
                  <div className="fw-semibold text-danger d-flex align-items-center gap-1">
                    <i className="bi bi-exclamation-triangle-fill"></i> SLA Warning: TICK-1005
                  </div>
                  <div className="text-muted text-truncate" style={{ fontSize: '0.78rem' }}>
                    Monitor flickering ticket approaching SLA breach.
                  </div>
                </Link>
                <Link
                  to="/tickets"
                  className="list-group-item list-group-item-action p-2 px-3 small"
                  onClick={() => setShowNotifications(false)}
                >
                  <div className="fw-semibold text-primary d-flex align-items-center gap-1">
                    <i className="bi bi-ticket-perforated"></i> New Ticket Assigned
                  </div>
                  <div className="text-muted text-truncate" style={{ fontSize: '0.78rem' }}>
                    Staging container outage assigned to team.
                  </div>
                </Link>
                <Link
                  to="/assets"
                  className="list-group-item list-group-item-action p-2 px-3 small"
                  onClick={() => setShowNotifications(false)}
                >
                  <div className="fw-semibold text-warning d-flex align-items-center gap-1">
                    <i className="bi bi-shield-exclamation"></i> Warranty Expiring Soon
                  </div>
                  <div className="text-muted text-truncate" style={{ fontSize: '0.78rem' }}>
                    Dell PowerEdge R750 warranty expires in 40 days.
                  </div>
                </Link>
              </div>
              <div className="p-2 text-center border-top bg-light">
                <button
                  className="btn btn-link btn-sm text-decoration-none text-muted py-0"
                  onClick={() => setShowNotifications(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile menu shortcut */}
        <Link
          to="/profile"
          className="btn btn-light rounded-pill px-3 py-1 d-flex align-items-center gap-2 border"
        >
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
            style={{ width: '26px', height: '26px', fontSize: '0.75rem' }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="small fw-semibold d-none d-sm-inline">{user?.name?.split(' ')[0]}</span>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
