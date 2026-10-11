import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const AssetDetail = () => {
  const { id } = useParams();
  const { user, isITStaff, isAssetManager, isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [asset, setAsset] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedDept, setSelectedDept] = useState('Engineering');

  // New repair record form
  const [repairData, setRepairData] = useState({
    issue: '',
    cost: 0,
    performedBy: '',
    status: 'Completed',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAsset();
    if (isITStaff || isAssetManager || isAdmin) {
      fetchUsers();
    }
  }, [id]);

  const fetchAsset = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/assets/${id}`);
      if (res.data.success) {
        setAsset(res.data.data);
        setSelectedUser(res.data.data.assignedTo?._id || '');
        setSelectedDept(res.data.data.assignedDepartment || 'Engineering');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch asset details', 'error');
      navigate('/assets');
    } finally {
      setLoading(false);
    }
  };

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

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(`/assets/${asset._id}`, {
        assignedTo: selectedUser || null,
        assignedDepartment: selectedDept,
        status: selectedUser ? 'In Use' : 'In Storage',
      });
      if (res.data.success) {
        showToast('Asset assignment updated successfully', 'success');
        setShowAssignModal(false);
        setAsset(res.data.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update assignment', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddRepairSubmit = async (e) => {
    e.preventDefault();
    if (!repairData.issue.trim()) {
      showToast('Please provide an issue description for the repair log', 'warning');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post(`/assets/${asset._id}/repairs`, repairData);
      if (res.data.success) {
        showToast('Repair record logged successfully!', 'success');
        setShowRepairModal(false);
        setRepairData({ issue: '', cost: 0, performedBy: '', status: 'Completed', notes: '' });
        fetchAsset();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to log repair', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !asset) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading asset details...</span>
        </div>
      </div>
    );
  }

  const now = new Date();
  const expiry = new Date(asset.warrantyExpiry);
  const warrantyExpired = expiry < now;

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Link to="/assets" className="btn btn-sm btn-light border text-secondary">
              <i className="bi bi-arrow-left"></i>
            </Link>
            <h4 className="fw-bold text-dark mb-0">{asset.assetTag}: {asset.name}</h4>
          </div>
          <p className="text-muted small mb-0">
            Category: {asset.category} &bull; Model: {asset.model} &bull; Vendor: {asset.vendor}
          </p>
        </div>

        <div className="d-flex gap-2">
          {(isITStaff || isAssetManager || isAdmin) && (
            <>
              <button
                className="btn btn-outline-primary btn-sm fw-semibold d-flex align-items-center gap-1"
                onClick={() => setShowAssignModal(true)}
              >
                <i className="bi bi-person-gear"></i> Reassign Asset
              </button>
              <button
                className="btn btn-primary btn-sm fw-semibold shadow-sm d-flex align-items-center gap-1"
                onClick={() => setShowRepairModal(true)}
              >
                <i className="bi bi-tools"></i> Log Maintenance
              </button>
            </>
          )}
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Specs & Specifications */}
        <div className="col-12 col-lg-8">
          {/* General Information Card */}
          <div className="card-custom mb-4">
            <div className="card-custom-header">
              <span className="fw-bold fs-6">
                <i className="bi bi-cpu-fill text-primary me-2"></i> Technical Specifications
              </span>
              <span className="badge bg-light text-dark border">{asset.location || 'HQ Office'}</span>
            </div>
            <div className="card-custom-body">
              <div className="row g-3">
                <div className="col-sm-6">
                  <div className="text-muted small">Processor / Architecture</div>
                  <div className="fw-semibold">{asset.specifications?.processor || 'N/A'}</div>
                </div>
                <div className="col-sm-6">
                  <div className="text-muted small">Memory / RAM</div>
                  <div className="fw-semibold">{asset.specifications?.ram || 'N/A'}</div>
                </div>
                <div className="col-sm-6">
                  <div className="text-muted small">Storage Drive</div>
                  <div className="fw-semibold">{asset.specifications?.storage || 'N/A'}</div>
                </div>
                <div className="col-sm-6">
                  <div className="text-muted small">Operating System / Platform</div>
                  <div className="fw-semibold">{asset.specifications?.os || 'N/A'}</div>
                </div>
                {asset.specifications?.ipAddress && (
                  <div className="col-sm-6">
                    <div className="text-muted small">IP Address</div>
                    <div className="fw-semibold"><code>{asset.specifications.ipAddress}</code></div>
                  </div>
                )}
                {asset.specifications?.macAddress && (
                  <div className="col-sm-6">
                    <div className="text-muted small">MAC Address</div>
                    <div className="fw-semibold"><code>{asset.specifications.macAddress}</code></div>
                  </div>
                )}
              </div>

              {asset.notes && (
                <div className="mt-4 pt-3 border-top">
                  <div className="text-muted small fw-semibold mb-1">Asset Operational Notes:</div>
                  <p className="text-secondary small mb-0">{asset.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Repair & Maintenance History */}
          <div className="card-custom mb-4">
            <div className="card-custom-header">
              <span className="fw-bold fs-6">
                <i className="bi bi-wrench-adjustable text-primary me-2"></i> Maintenance & Repair Log ({asset.repairHistory?.length || 0})
              </span>
            </div>
            <div className="table-responsive">
              <table className="table table-custom align-middle">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Issue Description</th>
                    <th>Technician / Vendor</th>
                    <th>Cost</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {asset.repairHistory?.length > 0 ? (
                    asset.repairHistory.map((rep, idx) => (
                      <tr key={idx}>
                        <td className="small">{new Date(rep.date).toLocaleDateString()}</td>
                        <td>
                          <div className="fw-semibold small">{rep.issue}</div>
                          {rep.notes && <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{rep.notes}</div>}
                        </td>
                        <td className="small text-secondary">{rep.performedBy}</td>
                        <td className="small fw-bold">{rep.cost > 0 ? `$${rep.cost}` : 'Warranty / Free'}</td>
                        <td>
                          <span className={`badge ${rep.status === 'Completed' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                            {rep.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted small">
                        No repair records logged for this asset. Device has zero recorded hardware failures.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Assignment, Warranty, Lifecycle */}
        <div className="col-12 col-lg-4">
          {/* Current Custody / Assignment */}
          <div className="card-custom mb-4">
            <div className="card-custom-header">
              <span className="fw-bold fs-6">
                <i className="bi bi-person-badge text-primary me-2"></i> Current Custody
              </span>
            </div>
            <div className="card-custom-body">
              {asset.assignedTo ? (
                <>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-5" style={{ width: '44px', height: '44px' }}>
                      {asset.assignedTo.name?.charAt(0)}
                    </div>
                    <div>
                      <div className="fw-bold">{asset.assignedTo.name}</div>
                      <div className="text-muted small">{asset.assignedDepartment}</div>
                    </div>
                  </div>
                  <div className="small text-muted pt-2 border-top">
                    <div><i className="bi bi-envelope me-2 text-primary"></i>{asset.assignedTo.email}</div>
                  </div>
                </>
              ) : (
                <div className="text-center py-3">
                  <span className="badge bg-secondary-subtle text-secondary fs-6 p-2 mb-2">Unassigned (In Storage)</span>
                  <p className="text-muted small mb-0">Device is available in the IT inventory safe for future assignment.</p>
                </div>
              )}
            </div>
          </div>

          {/* Warranty & Purchase Lifecycle */}
          <div className="card-custom mb-4">
            <div className="card-custom-header">
              <span className="fw-bold fs-6">
                <i className="bi bi-shield-check text-primary me-2"></i> Warranty & Purchase Info
              </span>
            </div>
            <div className="card-custom-body small">
              <div className="mb-3">
                <span className="text-muted d-block">Warranty Status:</span>
                {warrantyExpired ? (
                  <span className="badge bg-danger text-white">Expired ({new Date(asset.warrantyExpiry).toLocaleDateString()})</span>
                ) : (
                  <span className="badge bg-success-subtle text-success border border-success-subtle">
                    Active until {new Date(asset.warrantyExpiry).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div className="mb-2">
                <span className="text-muted d-block">Serial Number:</span>
                <code className="fw-bold fs-6 text-dark">{asset.serialNumber}</code>
              </div>

              <div className="mb-2">
                <span className="text-muted d-block">Purchase Date:</span>
                <strong>{new Date(asset.purchaseDate).toLocaleDateString()}</strong>
              </div>

              <div>
                <span className="text-muted d-block">Procurement Cost:</span>
                <strong className="text-primary">${asset.purchaseCost?.toLocaleString() || 0}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Log Maintenance Modal */}
      {showRepairModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fs-6 fw-bold">
                  <i className="bi bi-tools me-2"></i> Log Maintenance for {asset.assetTag}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowRepairModal(false)}></button>
              </div>
              <form onSubmit={handleAddRepairSubmit}>
                <div className="modal-body p-3">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Issue / Reason for Repair *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Battery swelling replacement"
                      value={repairData.issue}
                      onChange={(e) => setRepairData({ ...repairData, issue: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Repair Cost ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="0"
                        value={repairData.cost}
                        onChange={(e) => setRepairData({ ...repairData, cost: Number(e.target.value) })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Technician / Vendor</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Internal IT or Apple Care"
                        value={repairData.performedBy}
                        onChange={(e) => setRepairData({ ...repairData, performedBy: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Status</label>
                    <select
                      className="form-select"
                      value={repairData.status}
                      onChange={(e) => setRepairData({ ...repairData, status: e.target.value })}
                    >
                      <option value="Completed">Completed</option>
                      <option value="In Progress">In Progress (Sets asset to Under Repair)</option>
                      <option value="Scheduled">Scheduled</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Notes</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Parts replaced, RMA tracking number..."
                      value={repairData.notes}
                      onChange={(e) => setRepairData({ ...repairData, notes: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer bg-light p-2 px-3">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowRepairModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm fw-semibold" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Repair Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reassign Asset Modal */}
      {showAssignModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fs-6 fw-bold">
                  <i className="bi bi-person-gear me-2"></i> Assign Asset {asset.assetTag}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAssignModal(false)}></button>
              </div>
              <form onSubmit={handleAssignSubmit}>
                <div className="modal-body p-3">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Assign To Employee</label>
                    <select
                      className="form-select"
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                    >
                      <option value="">-- In Storage / Unassigned --</option>
                      {usersList.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.department} - {u.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Assigned Department</label>
                    <select
                      className="form-select"
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
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
                <div className="modal-footer bg-light p-2 px-3">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAssignModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm fw-semibold" disabled={saving}>
                    {saving ? 'Updating...' : 'Confirm Assignment'}
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

export default AssetDetail;
