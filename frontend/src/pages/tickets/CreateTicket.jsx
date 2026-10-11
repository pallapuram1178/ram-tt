import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const CreateTicket = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Software',
    priority: 'Medium',
    assetId: '',
    description: '',
    tags: '',
  });

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMyAssets();
  }, []);

  const fetchMyAssets = async () => {
    try {
      const res = await api.get('/assets');
      if (res.data.success) {
        setAssets(res.data.data);
      }
    } catch (err) {
      console.warn('Could not load assets:', err);
    }
  };

  const getSlaHours = (priority) => {
    switch (priority) {
      case 'Urgent':
        return '4 Hours (Critical Outage SLA)';
      case 'High':
        return '12 Hours (High Priority SLA)';
      case 'Medium':
        return '24 Hours (Standard SLA)';
      case 'Low':
        return '48 Hours (General Request SLA)';
      default:
        return '24 Hours';
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      showToast('Please provide both title and description', 'warning');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        priority: formData.priority,
        assetId: formData.assetId || null,
        description: formData.description,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
        source: 'Portal',
      };

      const res = await api.post('/tickets', payload);
      if (res.data.success) {
        showToast(`Ticket ${res.data.data.ticketId} created successfully!`, 'success');
        navigate(`/tickets/${res.data.data._id}`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create ticket', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex align-items-center gap-2 mb-4">
        <Link to="/tickets" className="btn btn-sm btn-light border text-secondary">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <div>
          <h3 className="fw-bold mb-0">Create IT Support Ticket</h3>
          <p className="text-muted small mb-0">Submit an issue for technician review and resolution</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card-custom">
            <div className="card-custom-body p-4">
              <form onSubmit={handleSubmit}>
                {/* Subject Title */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Ticket Subject *</label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    placeholder="e.g. Cannot connect to corporate VPN after password change"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="row g-3 mb-3">
                  {/* Category */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">Category *</label>
                    <select
                      name="category"
                      className="form-select"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="Hardware">Hardware (Laptops, Monitors, Peripherals)</option>
                      <option value="Software">Software & Operating System</option>
                      <option value="Network">Network & Wi-Fi / VPN</option>
                      <option value="Access & Security">Access & Security (Passwords, 2FA)</option>
                      <option value="Email & Communication">Email & Communication (Outlook, Teams)</option>
                      <option value="Cloud Services">Cloud Services & Servers</option>
                      <option value="Other">Other General IT Request</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">Priority Level</label>
                    <select
                      name="priority"
                      className="form-select"
                      value={formData.priority}
                      onChange={handleChange}
                    >
                      <option value="Low">Low - Minor request or question</option>
                      <option value="Medium">Medium - Normal workflow impact</option>
                      <option value="High">High - Significant work blockage</option>
                      <option value="Urgent">Urgent - Complete work stoppage / Critical</option>
                    </select>
                  </div>
                </div>

                {/* Linked IT Asset */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Linked IT Asset (Optional)</label>
                  <select
                    name="assetId"
                    className="form-select"
                    value={formData.assetId}
                    onChange={handleChange}
                  >
                    <option value="">-- None / General Issue --</option>
                    {assets.map((asset) => (
                      <option key={asset._id} value={asset._id}>
                        {asset.assetTag}: {asset.name} ({asset.category})
                      </option>
                    ))}
                  </select>
                  <div className="form-text small">Linking your affected laptop or software helps technicians diagnose faster.</div>
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Detailed Issue Description *</label>
                  <textarea
                    name="description"
                    className="form-control"
                    rows="6"
                    placeholder="Please explain the problem, what error messages appear, when it started, and what steps you've already attempted..."
                    value={formData.description}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                {/* Tags */}
                <div className="mb-4">
                  <label className="form-label small fw-semibold text-muted">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    name="tags"
                    className="form-control"
                    placeholder="e.g. vpn, cisco, remote-work, urgent"
                    value={formData.tags}
                    onChange={handleChange}
                  />
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <Link to="/tickets" className="btn btn-light border px-4">
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="btn btn-primary fw-semibold px-4 shadow-sm"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span> Submitting...
                      </>
                    ) : (
                      'Submit Support Ticket'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Info Column */}
        <div className="col-12 col-lg-4">
          {/* AI First Callout */}
          <div className="p-4 rounded-4 text-white shadow-sm mb-4" style={{ background: 'linear-gradient(135deg, #0b192c 0%, #1e3e62 100%)' }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="ai-pulse-dot"></span>
              <span className="fw-bold small text-info">Need a fix in 30 seconds?</span>
            </div>
            <h5 className="fw-bold text-white mb-2">Try AI Helpdesk First</h5>
            <p className="small text-light opacity-75 mb-3">
              Our AI diagnostic assistant can immediately search approved company guides to resolve VPN, Outlook, or battery issues without waiting in the technician queue.
            </p>
            <Link to="/ai-assistant" className="btn btn-light btn-sm fw-bold text-primary w-100 py-2 shadow-sm">
              <i className="bi bi-robot me-1"></i> Open AI Assistant
            </Link>
          </div>

          {/* Expected SLA Box */}
          <div className="card-custom">
            <div className="card-custom-header">
              <span className="fw-bold fs-6">
                <i className="bi bi-clock-history text-primary me-2"></i> Service Level Agreement (SLA)
              </span>
            </div>
            <div className="card-custom-body small">
              <div className="mb-2">
                <span className="text-muted d-block">Expected Target Resolution:</span>
                <strong className="text-primary fs-6">{getSlaHours(formData.priority)}</strong>
              </div>
              <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>
                Urgent and High priority tickets immediately alert on-duty technicians and generate escalation logs if nearing breach thresholds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTicket;
