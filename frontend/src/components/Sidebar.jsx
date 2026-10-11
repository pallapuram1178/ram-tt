import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isITStaff, isAdmin, isAssetManager, isEmployee } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
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
    <aside className={`app-sidebar ${isOpen ? 'show' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <i className="bi bi-shield-check"></i>
        </div>
        <div className="flex-grow-1">
          <div className="d-flex align-items-center gap-2">
            <h5 className="sidebar-brand-title">ServiceDesk</h5>
            <span className="sidebar-brand-badge">PRO</span>
          </div>
          <small className="text-secondary" style={{ fontSize: '0.7rem' }}>
            Enterprise IT & Assets
          </small>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="sidebar-nav">
        <div className="sidebar-section-title">Core Workspace</div>
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <i className="bi bi-grid-1x2-fill"></i>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/ai-assistant"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <i className="bi bi-robot"></i>
          <span>AI Helpdesk</span>
          <span className="badge bg-primary ms-auto" style={{ fontSize: '0.65rem' }}>AI RAG</span>
        </NavLink>

        <div className="sidebar-section-title">Ticket Operations</div>
        <NavLink
          to="/tickets"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <i className="bi bi-ticket-detailed-fill"></i>
          <span>{isEmployee ? 'My Tickets' : 'Ticket Management'}</span>
        </NavLink>

        <NavLink
          to="/tickets/create"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <i className="bi bi-plus-circle-fill"></i>
          <span>New Support Ticket</span>
        </NavLink>

        <div className="sidebar-section-title">Assets & Inventory</div>
        <NavLink
          to="/assets"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <i className="bi bi-laptop"></i>
          <span>{isEmployee ? 'My Assigned Assets' : 'Asset Inventory'}</span>
        </NavLink>

        {(isITStaff || isAssetManager) && (
          <NavLink
            to="/assets/create"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <i className="bi bi-node-plus"></i>
            <span>Register Asset</span>
          </NavLink>
        )}

        <div className="sidebar-section-title">Knowledge & Docs</div>
        <NavLink
          to="/kb"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <i className="bi bi-journal-bookmark-fill"></i>
          <span>Knowledge Base</span>
        </NavLink>

        {(isAdmin || isITStaff) && (
          <NavLink
            to="/reports"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <i className="bi bi-bar-chart-line-fill"></i>
            <span>Analytics & Reports</span>
          </NavLink>
        )}

        {isAdmin && (
          <>
            <div className="sidebar-section-title">Administration</div>
            <NavLink
              to="/users"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <i className="bi bi-people-fill"></i>
              <span>User Directory</span>
            </NavLink>
          </>
        )}
      </div>

      {/* User Card & Logout */}
      <div className="sidebar-user-card">
        <div className="sidebar-user-avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="flex-grow-1 overflow-hidden">
          <div
            className="text-white text-truncate fw-semibold"
            style={{ fontSize: '0.85rem' }}
            title={user?.name}
          >
            {user?.name || 'User'}
          </div>
          <div className="d-flex align-items-center gap-1">
            <span
              className={`badge ${getRoleBadgeClass(user?.role)}`}
              style={{ fontSize: '0.65rem' }}
            >
              {user?.role}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-sm btn-outline-light border-0 p-1 text-secondary"
          title="Sign Out"
        >
          <i className="bi bi-box-arrow-right fs-5"></i>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
