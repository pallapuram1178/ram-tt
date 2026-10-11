import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const CreateAsset = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Laptop',
    model: '',
    serialNumber: '',
    vendor: 'Apple / Dell / Lenovo',
    status: 'In Storage',
    assignedTo: '',
    assignedDepartment: 'Engineering',
    purchaseCost: 1500,
    warrantyMonths: 36,
    location: 'Main Office - Building A',
    processor: '',
    ram: '',
    storage: '',
    os: '',
    notes: '',
  });

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      if (res.data.success) {
        setUsersList(res.data.data);
      }
    } catch (err) {
      console.warn('Could not load user list:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.model.trim() || !formData.serialNumber.trim()) {
      showToast('Please fill in asset name, model, and serial number', 'warning');
      return;
    }

    setLoading(true);
    try {
      const warrantyExpiry = new Date(
        Date.now() + parseInt(formData.warrantyMonths, 10) * 30 * 24 * 60 * 60 * 1000
      );

      const payload = {
        name: formData.name,
        category: formData.category,
        model: formData.model,
        serialNumber: formData.serialNumber,
        vendor: formData.vendor,
        status: formData.assignedTo ? 'In Use' : formData.status,
        assignedTo: formData.assignedTo || null,
        assignedDepartment: formData.assignedDepartment,
        purchaseCost: Number(formData.purchaseCost) || 0,
        warrantyExpiry,
        location: formData.location,
        specifications: {
          processor: formData.processor,
          ram: formData.ram,
          storage: formData.storage,
          os: formData.os,
        },
        notes: formData.notes,
      };

      const res = await api.post('/assets', payload);
      if (res.data.success) {
        showToast(`Asset ${res.data.data.assetTag} registered successfully!`, 'success');
        navigate(`/assets/${res.data.data._id}`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to register asset', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex align-items-center gap-2 mb-4">
        <Link to="/assets" className="btn btn-sm btn-light border text-secondary">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <div>
          <h3 className="fw-bold mb-0">Register New IT Asset</h3>
          <p className="text-muted small mb-0">Add hardware, servers, or commercial software licenses to corporate inventory</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card-custom">
            <div className="card-custom-body p-4">
              <form onSubmit={handleSubmit}>
                {/* Name */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Asset Name / Title *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="e.g. MacBook Pro 16 M3 Max or Dell PowerEdge R750"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="row g-3 mb-3">
                  {/* Category */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">Asset Category *</label>
                    <select
                      name="category"
                      className="form-select"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="Laptop">Laptop</option>
                      <option value="Desktop">Desktop Workstation</option>
                      <option value="Server">Rack Server</option>
                      <option value="Software License">Software License (SaaS)</option>
                      <option value="Network Device">Network Device (Switch/Router)</option>
                      <option value="Peripheral">Peripheral / Monitor</option>
                      <option value="Mobile Device">Mobile Device</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Vendor */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">Vendor / Manufacturer</label>
                    <input
                      type="text"
                      name="vendor"
                      className="form-control"
                      placeholder="e.g. Apple, Dell, Lenovo, Cisco, Microsoft"
                      value={formData.vendor}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  {/* Model */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">Model & Form Factor *</label>
                    <input
                      type="text"
                      name="model"
                      className="form-control"
                      placeholder="e.g. A2991 Space Black or Latitude 5540"
                      value={formData.model}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Serial Number */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">Serial Number / License Key *</label>
                    <input
                      type="text"
                      name="serialNumber"
                      className="form-control"
                      placeholder="e.g. C02G8391MD6T or LIC-ADB-2024"
                      value={formData.serialNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  {/* Purchase Cost */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">Procurement Cost ($)</label>
                    <input
                      type="number"
                      name="purchaseCost"
                      className="form-control"
                      placeholder="1500"
                      value={formData.purchaseCost}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Warranty Period */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">Warranty Period</label>
                    <select
                      name="warrantyMonths"
                      className="form-select"
                      value={formData.warrantyMonths}
                      onChange={handleChange}
                    >
                      <option value="12">1 Year (12 Months)</option>
                      <option value="24">2 Years (24 Months)</option>
                      <option value="36">3 Years (36 Months)</option>
                      <option value="48">4 Years (48 Months)</option>
                      <option value="60">5 Years (60 Months)</option>
                    </select>
                  </div>
                </div>

                {/* Assignment */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">Assign to Employee</label>
                    <select
                      name="assignedTo"
                      className="form-select"
                      value={formData.assignedTo}
                      onChange={handleChange}
                    >
                      <option value="">-- In Storage / Unassigned --</option>
                      {usersList.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">Assigned Department</label>
                    <select
                      name="assignedDepartment"
                      className="form-select"
                      value={formData.assignedDepartment}
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

                {/* Hardware Specifications */}
                <h6 className="fw-bold mt-4 mb-3 text-primary">Technical Specs (Optional)</h6>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small text-muted">CPU / Processor</label>
                    <input
                      type="text"
                      name="processor"
                      className="form-control form-control-sm"
                      placeholder="Apple M3 Max / Intel i7-1370P"
                      value={formData.processor}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Memory (RAM)</label>
                    <input
                      type="text"
                      name="ram"
                      className="form-control form-control-sm"
                      placeholder="32 GB / 64 GB"
                      value={formData.ram}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Storage Drive</label>
                    <input
                      type="text"
                      name="storage"
                      className="form-control form-control-sm"
                      placeholder="1 TB NVMe SSD"
                      value={formData.storage}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Operating System</label>
                    <input
                      type="text"
                      name="os"
                      className="form-control form-control-sm"
                      placeholder="macOS Sonoma / Windows 11 Pro / Ubuntu"
                      value={formData.os}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-4">
                  <label className="form-label small fw-semibold text-muted">Deployment Notes</label>
                  <textarea
                    name="notes"
                    className="form-control"
                    rows="3"
                    placeholder="Initial configuration, accessories included, safe bin number..."
                    value={formData.notes}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <Link to="/assets" className="btn btn-light border px-4">
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="btn btn-primary fw-semibold px-4 shadow-sm"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span> Registering...
                      </>
                    ) : (
                      'Register Asset'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Info Card */}
        <div className="col-12 col-lg-4">
          <div className="card-custom">
            <div className="card-custom-header">
              <span className="fw-bold fs-6">
                <i className="bi bi-info-circle text-primary me-2"></i> Asset Tagging System
              </span>
            </div>
            <div className="card-custom-body small text-muted">
              <p>
                When registered, the system automatically assigns a unique, immutable Asset Tag (e.g., <code>AST-108</code>) with lifecycle tracking.
              </p>
              <p>
                Assets can be linked directly to employee support tickets and monitored for warranty expiration and maintenance schedules.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAsset;
