import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import SlaBadge from '../../components/SlaBadge';

const TicketList = () => {
  const { user, isEmployee, isITStaff, isManager, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [dispatchingId, setDispatchingId] = useState(null);

  // Filters state initialized from URL search params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [priority, setPriority] = useState(searchParams.get('priority') || 'all');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [slaStatus, setSlaStatus] = useState(searchParams.get('slaStatus') || 'all');
  const [scope, setScope] = useState(searchParams.get('scope') || 'all');
  const [assignedFilter, setAssignedFilter] = useState(searchParams.get('assignedTo') || 'all');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  useEffect(() => {
    fetchTickets();
    if (isITStaff) {
      fetchTechnicians();
    }
  }, [status, priority, category, slaStatus, scope, assignedFilter, page]);

  const fetchTechnicians = async () => {
    try {
      const res = await api.get('/users/technicians');
      if (res.data.success) {
        setTechnicians(res.data.data);
      }
    } catch (err) {
      console.warn('Could not load technicians:', err);
    }
  };

  const handleQuickAssign = async (ticketId, technicianId) => {
    if (!technicianId) return;
    setDispatchingId(ticketId);
    try {
      const res = await api.put(`/tickets/${ticketId}/assign`, { technicianId });
      if (res.data.success) {
        showToast(res.data.message || 'Technician assigned successfully', 'success');
        fetchTickets();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to assign technician', 'error');
    } finally {
      setDispatchingId(null);
    }
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        status: status !== 'all' ? status : undefined,
        priority: priority !== 'all' ? priority : undefined,
        category: category !== 'all' ? category : undefined,
        slaStatus: slaStatus !== 'all' ? slaStatus : undefined,
        scope: scope !== 'all' ? scope : undefined,
        assignedTo: assignedFilter !== 'all' ? assignedFilter : undefined,
        search: search.trim() ? search.trim() : undefined,
      };

      const res = await api.get('/tickets', { params });
      if (res.data.success) {
        setTickets(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTickets();
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('all');
    setPriority('all');
    setCategory('all');
    setSlaStatus('all');
    setScope('all');
    setAssignedFilter('all');
    setPage(1);
  };

  return (
    <div className="container-fluid p-0">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">
            {isEmployee ? 'My Support Tickets' : 'Ticket Management & Dispatch'}
          </h3>
          <p className="text-muted small mb-0">
            Track, assign, dispatch, resolve, and monitor SLA deadlines for IT support tickets
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/tickets/create" className="btn btn-primary btn-sm fw-semibold shadow-sm d-flex align-items-center gap-1">
            <i className="bi bi-plus-circle"></i> Create Ticket
          </Link>
          <Link to="/ai-assistant" className="btn btn-outline-primary btn-sm fw-semibold d-flex align-items-center gap-1">
            <i className="bi bi-robot"></i> AI Diagnostic
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="card-custom mb-4">
        <div className="card-custom-body p-3">
          <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
            {/* Search Input */}
            <div className="col-12 col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search Ticket ID, title, description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="col-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
                <option value="Reopened">Reopened</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="col-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Priorities</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="col-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Categories</option>
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Network">Network</option>
                <option value="Access & Security">Access & Security</option>
                <option value="Email & Communication">Email</option>
                <option value="Cloud Services">Cloud Services</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* SLA Filter / Reset */}
            <div className="col-6 col-md-2 d-flex gap-1">
              <select
                className="form-select form-select-sm"
                value={slaStatus}
                onChange={(e) => {
                  setSlaStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All SLA</option>
                <option value="Within SLA">Within SLA</option>
                <option value="At Risk">At Risk</option>
                <option value="Breached">Breached</option>
              </select>

              <button
                type="button"
                className="btn btn-outline-secondary btn-sm px-2"
                onClick={handleResetFilters}
                title="Reset Filters"
              >
                <i className="bi bi-arrow-counterclockwise"></i>
              </button>
            </div>
          </form>

          {/* Role-based Quick Scopes for IT Staff */}
          {!isEmployee && (
            <div className="d-flex flex-wrap gap-2 mt-3 pt-2 border-top align-items-center">
              <span className="small fw-semibold text-muted me-1">Dispatch Queues:</span>
              <button
                className={`btn btn-sm py-1 px-3 rounded-pill fw-semibold ${scope === 'all' && assignedFilter === 'all' ? 'btn-primary' : 'btn-light border'}`}
                onClick={() => { setScope('all'); setAssignedFilter('all'); setPage(1); }}
              >
                All Tickets ({total})
              </button>
              {(isAdmin || isManager) && (
                <button
                  className={`btn btn-sm py-1 px-3 rounded-pill fw-semibold d-flex align-items-center gap-1 ${assignedFilter === 'unassigned' ? 'btn-warning text-dark' : 'btn-light border text-warning-emphasis'}`}
                  onClick={() => { setAssignedFilter('unassigned'); setScope('all'); setPage(1); }}
                >
                  <i className="bi bi-person-exclamation"></i> Needs Manager Assignment
                </button>
              )}
              <button
                className={`btn btn-sm py-1 px-3 rounded-pill fw-semibold ${scope === 'assigned-to-me' ? 'btn-primary' : 'btn-light border'}`}
                onClick={() => { setScope('assigned-to-me'); setAssignedFilter('all'); setPage(1); }}
              >
                Assigned to Me
              </button>
              <button
                className={`btn btn-sm py-1 px-3 rounded-pill fw-semibold ${scope === 'created-by-me' ? 'btn-primary' : 'btn-light border'}`}
                onClick={() => { setScope('created-by-me'); setAssignedFilter('all'); setPage(1); }}
              >
                Created by Me
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tickets Table */}
      <div className="card-custom">
        <div className="table-responsive">
          <table className="table table-custom align-middle">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Subject & Description</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Requester</th>
                <th>Assigned Technician</th>
                <th>SLA Deadline</th>
                <th>Status</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    <span className="text-muted small">Loading support tickets...</span>
                  </td>
                </tr>
              ) : tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <tr key={ticket._id}>
                    <td>
                      <Link to={`/tickets/${ticket._id}`} className="fw-bold text-primary text-decoration-none small">
                        {ticket.ticketId}
                      </Link>
                      {ticket.source === 'AI Chatbot' && (
                        <span className="badge bg-primary-subtle text-primary ms-1" style={{ fontSize: '0.65rem' }}>
                          <i className="bi bi-robot"></i> AI
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="fw-semibold small text-truncate" style={{ maxWidth: '240px' }} title={ticket.title}>
                        {ticket.title}
                      </div>
                      <div className="text-muted text-truncate small" style={{ maxWidth: '240px', fontSize: '0.75rem' }}>
                        {ticket.description}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-secondary border small">{ticket.category}</span>
                    </td>
                    <td>
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td>
                      <div className="small fw-semibold">{ticket.createdBy?.name || 'User'}</div>
                      <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                        {ticket.createdBy?.department || 'Staff'}
                      </div>
                    </td>
                    <td>
                      {ticket.assignedTo ? (
                        <div className="d-flex align-items-center gap-1">
                          <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '22px', height: '22px', fontSize: '0.65rem' }}>
                            {ticket.assignedTo.name.charAt(0)}
                          </div>
                          <span className="small fw-semibold">{ticket.assignedTo.name}</span>
                        </div>
                      ) : (isAdmin || isManager) ? (
                        <div className="d-flex align-items-center gap-1">
                          <select
                            className="form-select form-select-sm py-0 px-2"
                            style={{ fontSize: '0.75rem', minWidth: '130px' }}
                            defaultValue=""
                            disabled={dispatchingId === ticket._id}
                            onChange={(e) => handleQuickAssign(ticket._id, e.target.value)}
                          >
                            <option value="" disabled>⚡ Assign Tech...</option>
                            {technicians.map((t) => (
                              <option key={t._id} value={t._id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span className="badge bg-warning-subtle text-warning">Awaiting Dispatch</span>
                      )}
                    </td>
                    <td>
                      <SlaBadge deadline={ticket.slaDeadline} slaStatus={ticket.slaStatus} status={ticket.status} />
                    </td>
                    <td>
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="text-end">
                      <Link to={`/tickets/${ticket._id}`} className="btn btn-sm btn-light border py-1 px-2" title="View Ticket Details">
                        <i className="bi bi-arrow-right"></i>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-5">
                    <div className="text-muted mb-2"><i className="bi bi-inbox fs-2"></i></div>
                    <div className="fw-semibold text-secondary">No tickets found matching your criteria.</div>
                    <button onClick={handleResetFilters} className="btn btn-link btn-sm text-decoration-none mt-1">
                      Clear filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="card-custom-header border-top d-flex justify-content-between align-items-center py-2 px-3">
            <span className="small text-muted">
              Showing page {page} of {totalPages} ({total} total tickets)
            </span>
            <div className="btn-group btn-group-sm">
              <button
                className="btn btn-outline-secondary"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                &laquo; Prev
              </button>
              <button
                className="btn btn-outline-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next &raquo;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketList;
