import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import SlaBadge from '../../components/SlaBadge';

const TicketDetail = () => {
  const { id } = useParams();
  const { user, isITStaff, isEmployee } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status & Assignment Actions
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [actionStatus, setActionStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  // New Comment
  const [commentMessage, setCommentMessage] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchTicket();
    if (isITStaff) {
      fetchTechnicians();
    }
  }, [id]);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/tickets/${id}`);
      if (res.data.success) {
        setTicket(res.data.data);
        setSelectedTechnician(res.data.data.assignedTo?._id || '');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch ticket details', 'error');
      navigate('/tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const res = await api.get('/users/technicians');
      if (res.data.success) {
        setTechnicians(res.data.data);
      }
    } catch (err) {
      console.warn('Could not load technician directory:', err);
    }
  };

  const handleAssignTechnician = async () => {
    setUpdating(true);
    try {
      const res = await api.put(`/tickets/${ticket._id}/assign`, {
        technicianId: selectedTechnician || null,
      });
      if (res.data.success) {
        showToast(res.data.message, 'success');
        setTicket(res.data.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to assign technician', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === 'Resolved') {
      setActionStatus('Resolved');
      setShowResolveModal(true);
      return;
    }

    setUpdating(true);
    try {
      const res = await api.put(`/tickets/${ticket._id}/status`, {
        status: newStatus,
      });
      if (res.data.success) {
        showToast(`Status updated to ${newStatus}`, 'success');
        fetchTicket();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmResolve = async () => {
    if (!resolutionNotes.trim()) {
      showToast('Please provide resolution notes for the ticket record', 'warning');
      return;
    }

    setUpdating(true);
    try {
      const res = await api.put(`/tickets/${ticket._id}/status`, {
        status: 'Resolved',
        resolutionNotes,
      });
      if (res.data.success) {
        showToast('Ticket marked as Resolved!', 'success');
        setShowResolveModal(false);
        setResolutionNotes('');
        fetchTicket();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to resolve ticket', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentMessage.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await api.post(`/tickets/${ticket._id}/comments`, {
        message: commentMessage,
        isInternal: isInternalComment,
      });
      if (res.data.success) {
        showToast('Comment added successfully', 'success');
        setCommentMessage('');
        setIsInternalComment(false);
        fetchTicket();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add comment', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading || !ticket) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading ticket details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      {/* Top Header Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Link to="/tickets" className="btn btn-sm btn-light border py-1 px-2 text-secondary">
              <i className="bi bi-arrow-left"></i>
            </Link>
            <h4 className="fw-bold text-dark mb-0">{ticket.ticketId}: {ticket.title}</h4>
          </div>
          <p className="text-muted small mb-0">
            Created on {new Date(ticket.createdAt).toLocaleString()} &bull; Source: {ticket.source}
          </p>
        </div>

        {/* Quick Action Badges */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
          <SlaBadge deadline={ticket.slaDeadline} slaStatus={ticket.slaStatus} status={ticket.status} />
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Description, Resolution, Comments Timeline */}
        <div className="col-12 col-lg-8">
          {/* Main Ticket Card */}
          <div className="card-custom mb-4">
            <div className="card-custom-header">
              <span className="fw-bold fs-6">
                <i className="bi bi-file-earmark-text-fill text-primary me-2"></i> Issue Description
              </span>
              <span className="badge bg-light text-dark border small">{ticket.category}</span>
            </div>
            <div className="card-custom-body">
              <p className="text-dark mb-3" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {ticket.description}
              </p>

              {/* Tags */}
              {ticket.tags && ticket.tags.length > 0 && (
                <div className="d-flex flex-wrap gap-1 mt-3 pt-3 border-top">
                  {ticket.tags.map((tag, i) => (
                    <span key={i} className="badge bg-light text-secondary border small">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Resolution Notes Box (If Resolved or Closed) */}
          {ticket.resolutionNotes && (
            <div className="card-custom mb-4 border-success-subtle bg-success-subtle">
              <div className="card-custom-header bg-transparent border-success-subtle">
                <span className="fw-bold fs-6 text-success">
                  <i className="bi bi-check-circle-fill me-2"></i> Official Resolution Record
                </span>
                <span className="small text-muted">
                  Resolved on {new Date(ticket.resolvedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="card-custom-body">
                <p className="text-dark mb-0 fw-normal" style={{ whiteSpace: 'pre-wrap' }}>
                  {ticket.resolutionNotes}
                </p>
              </div>
            </div>
          )}

          {/* Associated Asset Info */}
          {ticket.assetId && (
            <div className="card-custom mb-4">
              <div className="card-custom-header">
                <span className="fw-bold fs-6">
                  <i className="bi bi-laptop-fill text-primary me-2"></i> Linked IT Asset
                </span>
                <Link to={`/assets/${ticket.assetId._id}`} className="small text-decoration-none">
                  View Asset Details &rarr;
                </Link>
              </div>
              <div className="card-custom-body">
                <div className="row g-2 small">
                  <div className="col-sm-4">
                    <span className="text-muted d-block">Asset Tag:</span>
                    <strong>{ticket.assetId.assetTag}</strong>
                  </div>
                  <div className="col-sm-4">
                    <span className="text-muted d-block">Device:</span>
                    <strong>{ticket.assetId.name}</strong>
                  </div>
                  <div className="col-sm-4">
                    <span className="text-muted d-block">Category / Model:</span>
                    <strong>{ticket.assetId.category} ({ticket.assetId.model})</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Comments & Discussion Timeline */}
          <div className="card-custom mb-4">
            <div className="card-custom-header">
              <span className="fw-bold fs-6">
                <i className="bi bi-chat-left-dots-fill text-primary me-2"></i> Ticket Discussion & Activity ({ticket.comments?.length || 0})
              </span>
            </div>
            <div className="card-custom-body">
              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="mb-4">
                <div className="mb-2">
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Type an update, question, or diagnostic note..."
                    value={commentMessage}
                    onChange={(e) => setCommentMessage(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  {isITStaff ? (
                    <div className="form-check form-switch small">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="internalSwitch"
                        checked={isInternalComment}
                        onChange={(e) => setIsInternalComment(e.target.checked)}
                      />
                      <label className="form-check-label fw-semibold text-warning" htmlFor="internalSwitch">
                        <i className="bi bi-lock-fill me-1"></i> Post as Internal IT Note (Hidden from employee)
                      </label>
                    </div>
                  ) : <div></div>}

                  <button
                    type="submit"
                    className="btn btn-primary btn-sm px-3 fw-semibold d-flex align-items-center gap-1 shadow-sm"
                    disabled={submittingComment || !commentMessage.trim()}
                  >
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </form>

              {/* Comments Stream */}
              <div className="d-flex flex-column gap-3">
                {ticket.comments?.length > 0 ? (
                  ticket.comments.map((comm) => (
                    <div
                      key={comm._id}
                      className={`p-3 rounded-3 border ${comm.isInternal ? 'bg-warning-subtle border-warning' : 'bg-light'}`}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold small" style={{ width: '28px', height: '28px' }}>
                            {comm.user?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <span className="fw-bold small">{comm.user?.name || 'User'}</span>
                            <span className="badge bg-light text-secondary border ms-2" style={{ fontSize: '0.65rem' }}>
                              {comm.user?.role}
                            </span>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          {comm.isInternal && (
                            <span className="badge bg-warning text-dark small">
                              <i className="bi bi-lock-fill me-1"></i> Internal IT Note
                            </span>
                          )}
                          <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                            {new Date(comm.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-dark small mb-0" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                        {comm.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted small">
                    No comments yet. Write a message above to communicate with the support team.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Workflow Control, Assignment, Requester Info, Audit Log */}
        <div className="col-12 col-lg-4">
          {/* Workflow Status Actions */}
          <div className="card-custom mb-4">
            <div className="card-custom-header">
              <span className="fw-bold fs-6">
                <i className="bi bi-lightning-fill text-warning me-2"></i> Status Workflow Actions
              </span>
            </div>
            <div className="card-custom-body d-flex flex-column gap-2">
              {isITStaff && ticket.status !== 'In Progress' && ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
                <button
                  className="btn btn-warning btn-sm w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  onClick={() => handleStatusChange('In Progress')}
                  disabled={updating}
                >
                  <i className="bi bi-play-circle-fill"></i> Mark In Progress
                </button>
              )}

              {isITStaff && ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
                <button
                  className="btn btn-success btn-sm w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  onClick={() => handleStatusChange('Resolved')}
                  disabled={updating}
                >
                  <i className="bi bi-check-circle-fill"></i> Resolve Ticket
                </button>
              )}

              {ticket.status === 'Resolved' && (
                <button
                  className="btn btn-secondary btn-sm w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  onClick={() => handleStatusChange('Closed')}
                  disabled={updating}
                >
                  <i className="bi bi-archive-fill"></i> Close Ticket
                </button>
              )}

              {(ticket.status === 'Resolved' || ticket.status === 'Closed') && (
                <button
                  className="btn btn-outline-danger btn-sm w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  onClick={() => handleStatusChange('Reopened')}
                  disabled={updating}
                >
                  <i className="bi bi-arrow-counterclockwise"></i> Reopen Ticket
                </button>
              )}
            </div>
          </div>

          {/* Employee Status Banner when Unassigned */}
          {isEmployee && !ticket.assignedTo && (
            <div className="alert alert-warning py-3 px-3 d-flex align-items-center gap-3 mb-4 rounded-3 border-warning">
              <i className="bi bi-clock-history fs-3 text-warning"></i>
              <div>
                <strong className="d-block text-dark">Ticket Queued with IT Management</strong>
                <span className="small text-muted">
                  Your ticket has been received by IT Management. A manager is currently reviewing the issue and will dispatch an appropriate technician shortly.
                </span>
              </div>
            </div>
          )}

          {/* IT Manager & Admin Dispatch Control Center */}
          {(isITStaff) && (
            <div className={`card-custom mb-4 ${!ticket.assignedTo ? 'border-warning shadow-sm' : ''}`}>
              <div className={`card-custom-header ${!ticket.assignedTo ? 'bg-warning-subtle text-dark border-warning' : ''}`}>
                <span className="fw-bold fs-6">
                  <i className="bi bi-person-gear text-primary me-2"></i>
                  {ticket.assignedTo ? 'Assigned Technician & Resolver' : '🚨 Manager Dispatch Station (Pending Assignment)'}
                </span>
                {!ticket.assignedTo && (
                  <span className="badge bg-warning text-dark small fw-bold">Action Required</span>
                )}
              </div>
              <div className="card-custom-body">
                {!ticket.assignedTo && (
                  <p className="small text-muted mb-3">
                    Select an available technician from the directory below to dispatch this ticket and initiate technical troubleshooting:
                  </p>
                )}
                <div className="mb-3">
                  <label className="form-label small text-muted fw-semibold">Assigned Resolver</label>
                  <select
                    className="form-select form-select-sm"
                    value={selectedTechnician}
                    onChange={(e) => setSelectedTechnician(e.target.value)}
                  >
                    <option value="">-- Unassigned (Needs Manager Dispatch) --</option>
                    {technicians.map((tech) => (
                      <option key={tech._id} value={tech._id}>
                        {tech.name} — {tech.specialization || tech.role} ({tech.department})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  className={`btn btn-sm w-100 fw-semibold d-flex align-items-center justify-content-center gap-1 ${!ticket.assignedTo ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={handleAssignTechnician}
                  disabled={updating || (!selectedTechnician && !ticket.assignedTo)}
                >
                  <i className="bi bi-send-check"></i>
                  {ticket.assignedTo ? 'Reassign Technician' : 'Dispatch Ticket to Technician'}
                </button>
              </div>
            </div>
          )}

          {/* Requester Profile */}
          <div className="card-custom mb-4">
            <div className="card-custom-header">
              <span className="fw-bold fs-6">
                <i className="bi bi-person-badge-fill text-primary me-2"></i> Requester Information
              </span>
            </div>
            <div className="card-custom-body">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-5" style={{ width: '44px', height: '44px' }}>
                  {ticket.createdBy?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="fw-bold">{ticket.createdBy?.name}</div>
                  <div className="text-muted small">{ticket.createdBy?.department}</div>
                </div>
              </div>

              <div className="small text-muted d-flex flex-column gap-2 pt-2 border-top">
                <div>
                  <i className="bi bi-envelope me-2 text-primary"></i>
                  <span>{ticket.createdBy?.email}</span>
                </div>
                {ticket.createdBy?.phone && (
                  <div>
                    <i className="bi bi-telephone me-2 text-primary"></i>
                    <span>{ticket.createdBy.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activity Log / Audit Trail */}
          <div className="card-custom">
            <div className="card-custom-header">
              <span className="fw-bold fs-6">
                <i className="bi bi-journal-text text-primary me-2"></i> Audit Trail
              </span>
            </div>
            <div className="card-custom-body p-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <div className="d-flex flex-column gap-3">
                {ticket.activityLog?.map((act, index) => (
                  <div key={index} className="border-start border-2 border-primary ps-3 position-relative">
                    <div className="fw-semibold small">{act.action}</div>
                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{act.details}</div>
                    <div className="text-muted small" style={{ fontSize: '0.7rem' }}>
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; {act.performedBy?.name || 'System'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resolution Notes Modal */}
      {showResolveModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fs-6 fw-bold">
                  <i className="bi bi-check-circle-fill me-2"></i> Resolve Ticket {ticket.ticketId}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowResolveModal(false)}></button>
              </div>
              <div className="modal-body p-3">
                <label className="form-label small fw-semibold text-muted">
                  Resolution Notes & Root Cause Analysis (Required)
                </label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Explain what steps were taken to diagnose and resolve the issue for future knowledge base reference..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="modal-footer bg-light p-2 px-3">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowResolveModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-success btn-sm fw-semibold" onClick={handleConfirmResolve} disabled={updating}>
                  {updating ? 'Saving...' : 'Confirm Resolution'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetail;
