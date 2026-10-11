import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import SlaBadge from '../../components/SlaBadge';

const Dashboard = () => {
  const { user, isITStaff, isAdmin, isManager, isTechnician, isAssetManager, isEmployee } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/metrics');
      if (res.data.success) {
        setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      {/* Welcome Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">
            Welcome back, {user?.name} 👋
          </h3>
          <p className="text-muted small mb-0">
            {user?.role} Workspace &bull; {user?.department} &bull; ServiceDesk Pro Enterprise
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/tickets/create" className="btn btn-primary btn-sm fw-semibold shadow-sm d-flex align-items-center gap-1">
            <i className="bi bi-plus-circle"></i> Create Ticket
          </Link>
          <Link to="/ai-assistant" className="btn btn-outline-primary btn-sm fw-semibold d-flex align-items-center gap-1">
            <i className="bi bi-robot"></i> Ask AI Helpdesk
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. ADMIN & IT MANAGER DASHBOARD VIEW */}
      {/* ========================================================================= */}
      {(isAdmin || isManager) && metrics && (
        <>
          {/* Top KPI Cards */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Needs Manager Dispatch"
                value={metrics.tickets.unassignedCount || 0}
                icon="bi-person-exclamation"
                color={metrics.tickets.unassignedCount > 0 ? 'amber' : 'green'}
                subtitle={metrics.tickets.unassignedCount > 0 ? 'Pending Technician Assignment' : 'All Tickets Dispatched'}
                badge={metrics.tickets.unassignedCount > 0 ? { text: 'Action Required', class: 'bg-warning text-dark' } : { text: 'Queue Clear', class: 'bg-success' }}
                onClick={() => navigate('/tickets?assignedTo=unassigned')}
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Total Active Tickets"
                value={metrics.tickets.open + metrics.tickets.inProgress}
                icon="bi-ticket-perforated-fill"
                color="blue"
                subtitle={`${metrics.tickets.open} Open • ${metrics.tickets.inProgress} In Progress`}
                onClick={() => navigate('/tickets')}
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="SLA Compliance Rate"
                value={`${metrics.tickets.slaComplianceRate}%`}
                icon="bi-shield-check"
                color={metrics.tickets.slaComplianceRate > 85 ? 'green' : 'amber'}
                subtitle={`${metrics.tickets.breachedSla} SLA Breached`}
                badge={{ text: metrics.tickets.breachedSla === 0 ? 'Optimal' : 'Attention Needed', class: metrics.tickets.breachedSla === 0 ? 'bg-success' : 'bg-danger' }}
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Urgent & At Risk"
                value={metrics.tickets.urgent + metrics.tickets.atRiskSla}
                icon="bi-exclamation-triangle-fill"
                color="red"
                subtitle={`${metrics.tickets.urgent} Urgent Priority • ${metrics.tickets.atRiskSla} At Risk`}
                onClick={() => navigate('/tickets?priority=Urgent')}
              />
            </div>
          </div>

          {/* Unassigned Dispatch Banner (if any unassigned tickets) */}
          {metrics.unassignedTickets?.length > 0 && (
            <div className="card-custom mb-4 border-warning shadow-sm">
              <div className="card-custom-header bg-warning-subtle text-dark border-warning d-flex justify-content-between align-items-center">
                <span className="fw-bold fs-6">
                  <i className="bi bi-bell-fill text-warning me-2"></i>
                  Manager Dispatch Queue — {metrics.tickets.unassignedCount} Ticket(s) Awaiting Technician Assignment
                </span>
                <Link to="/tickets?assignedTo=unassigned" className="btn btn-sm btn-warning fw-semibold shadow-sm py-1 px-3 text-dark">
                  View Full Dispatch Queue &rarr;
                </Link>
              </div>
              <div className="table-responsive">
                <table className="table table-custom align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Subject</th>
                      <th>Requester</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>SLA Target</th>
                      <th className="text-end">Manager Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.unassignedTickets.map((t) => (
                      <tr key={t._id}>
                        <td><span className="fw-bold text-primary small">{t.ticketId}</span></td>
                        <td><div className="fw-semibold small text-truncate" style={{ maxWidth: '220px' }}>{t.title}</div></td>
                        <td><span className="small text-muted">{t.createdBy?.name} ({t.createdBy?.department})</span></td>
                        <td><span className="badge bg-light text-secondary border small">{t.category}</span></td>
                        <td><PriorityBadge priority={t.priority} /></td>
                        <td><SlaBadge deadline={t.slaDeadline} slaStatus={t.slaStatus} status={t.status} /></td>
                        <td className="text-end">
                          <Link to={`/tickets/${t._id}`} className="btn btn-sm btn-primary py-1 px-3 fw-semibold">
                            Dispatch Technician &rarr;
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="row g-3 mb-4">
            {/* Technician Workload Leaderboard */}
            <div className="col-12 col-lg-7">
              <div className="card-custom h-100">
                <div className="card-custom-header">
                  <span className="fw-bold fs-6">
                    <i className="bi bi-people-fill text-primary me-2"></i> Technician Workload & Capacity
                  </span>
                  <Link to="/tickets" className="small text-decoration-none fw-semibold">View Queue &rarr;</Link>
                </div>
                <div className="table-responsive">
                  <table className="table table-custom align-middle">
                    <thead>
                      <tr>
                        <th>Technician</th>
                        <th>Specialization</th>
                        <th>Active Tickets</th>
                        <th>Resolved</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.techWorkload?.map((tech) => (
                        <tr key={tech.id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                                {tech.name.charAt(0)}
                              </div>
                              <span className="fw-semibold small">{tech.name}</span>
                            </div>
                          </td>
                          <td><span className="badge bg-light text-secondary border small">{tech.specialization}</span></td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div className="progress flex-grow-1" style={{ height: '6px', width: '70px' }}>
                                <div
                                  className={`progress-bar ${tech.activeTickets > 3 ? 'bg-danger' : tech.activeTickets > 1 ? 'bg-warning' : 'bg-success'}`}
                                  style={{ width: `${Math.min(tech.activeTickets * 25, 100)}%` }}
                                ></div>
                              </div>
                              <span className="fw-bold small">{tech.activeTickets}</span>
                            </div>
                          </td>
                          <td><span className="text-success fw-bold small">{tech.resolvedTickets}</span></td>
                          <td>
                            <span className={`badge ${tech.activeTickets > 4 ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>
                              {tech.activeTickets > 4 ? 'Heavy' : 'Available'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Category & Priority Distribution */}
            <div className="col-12 col-lg-5">
              <div className="card-custom h-100">
                <div className="card-custom-header">
                  <span className="fw-bold fs-6">
                    <i className="bi bi-pie-chart-fill text-primary me-2"></i> Tickets by Category
                  </span>
                </div>
                <div className="card-custom-body">
                  <div className="d-flex flex-column gap-3">
                    {metrics.categoryDistribution?.map((cat) => (
                      <div key={cat._id}>
                        <div className="d-flex justify-content-between small fw-semibold mb-1">
                          <span>{cat._id}</span>
                          <span className="text-muted">{cat.count} tickets</span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div
                            className="progress-bar bg-primary"
                            style={{ width: `${(cat.count / metrics.tickets.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Live Ticket Feed */}
          <div className="card-custom mb-4">
            <div className="card-custom-header">
              <span className="fw-bold fs-6">
                <i className="bi bi-clock-history text-primary me-2"></i> Recent Live Tickets
              </span>
              <Link to="/tickets" className="btn btn-sm btn-outline-primary py-1">View All Tickets</Link>
            </div>
            <div className="table-responsive">
              <table className="table table-custom align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title & Requester</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Assigned To</th>
                    <th>SLA Deadline</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.recentTickets?.map((t) => (
                    <tr key={t._id}>
                      <td><span className="fw-bold text-primary small">{t.ticketId}</span></td>
                      <td>
                        <div className="fw-semibold small text-truncate" style={{ maxWidth: '240px' }}>{t.title}</div>
                        <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{t.createdBy?.name} ({t.createdBy?.department})</div>
                      </td>
                      <td><span className="badge bg-light text-dark border">{t.category}</span></td>
                      <td><PriorityBadge priority={t.priority} /></td>
                      <td>
                        {t.assignedTo ? (
                          <span className="small fw-semibold text-secondary">{t.assignedTo.name}</span>
                        ) : (
                          <span className="badge bg-warning-subtle text-warning">Unassigned</span>
                        )}
                      </td>
                      <td><SlaBadge deadline={t.slaDeadline} slaStatus={t.slaStatus} status={t.status} /></td>
                      <td><StatusBadge status={t.status} /></td>
                      <td>
                        <Link to={`/tickets/${t._id}`} className="btn btn-sm btn-light border py-1 px-2">
                          <i className="bi bi-eye"></i>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. TECHNICIAN DASHBOARD VIEW */}
      {/* ========================================================================= */}
      {isTechnician && metrics && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Assigned to Me"
                value={metrics.assignedToMe}
                icon="bi-person-badge-fill"
                color="blue"
                subtitle={`${metrics.inProgressMe} In Progress`}
                onClick={() => navigate('/tickets?scope=assigned-to-me')}
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Urgent & At Risk"
                value={metrics.urgentMe + metrics.atRiskMe}
                icon="bi-exclamation-diamond-fill"
                color="red"
                subtitle="Requires Immediate Action"
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Unassigned Queue"
                value={metrics.unassignedQueue}
                icon="bi-inbox-fill"
                color="amber"
                subtitle="Open Tickets Ready to Claim"
                onClick={() => navigate('/tickets?assignedTo=unassigned')}
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="My Resolved Tickets"
                value={metrics.resolvedMe}
                icon="bi-check2-circle"
                color="green"
                subtitle="Successfully Closed"
              />
            </div>
          </div>

          <div className="row g-3 mb-4">
            {/* My Active Queue */}
            <div className="col-12 col-lg-7">
              <div className="card-custom h-100">
                <div className="card-custom-header">
                  <span className="fw-bold fs-6">
                    <i className="bi bi-person-lines-fill text-primary me-2"></i> My Active Assigned Tickets
                  </span>
                  <Link to="/tickets?scope=assigned-to-me" className="small text-decoration-none">View All</Link>
                </div>
                <div className="table-responsive">
                  <table className="table table-custom align-middle">
                    <thead>
                      <tr>
                        <th>Ticket</th>
                        <th>Priority</th>
                        <th>SLA Status</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.myActiveTickets?.length > 0 ? (
                        metrics.myActiveTickets.map((t) => (
                          <tr key={t._id}>
                            <td>
                              <div className="fw-bold text-primary small">{t.ticketId}</div>
                              <div className="small fw-semibold text-truncate" style={{ maxWidth: '200px' }}>{t.title}</div>
                            </td>
                            <td><PriorityBadge priority={t.priority} /></td>
                            <td><SlaBadge deadline={t.slaDeadline} slaStatus={t.slaStatus} status={t.status} /></td>
                            <td><StatusBadge status={t.status} /></td>
                            <td>
                              <Link to={`/tickets/${t._id}`} className="btn btn-sm btn-primary py-1 px-2">
                                Work On &rarr;
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center py-4 text-muted small">
                            No active tickets assigned to you right now. Great job!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Unassigned Claim Queue */}
            <div className="col-12 col-lg-5">
              <div className="card-custom h-100">
                <div className="card-custom-header">
                  <span className="fw-bold fs-6">
                    <i className="bi bi-hand-index-thumb-fill text-warning me-2"></i> Claim Unassigned Tickets
                  </span>
                </div>
                <div className="card-custom-body p-0">
                  <div className="list-group list-group-flush">
                    {metrics.unassignedTickets?.map((t) => (
                      <div key={t._id} className="list-group-item p-3 d-flex justify-content-between align-items-center">
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="fw-bold text-primary small">{t.ticketId}</span>
                            <PriorityBadge priority={t.priority} />
                          </div>
                          <div className="fw-semibold small text-truncate" style={{ maxWidth: '220px' }}>{t.title}</div>
                          <div className="text-muted small" style={{ fontSize: '0.75rem' }}>By {t.createdBy?.name}</div>
                        </div>
                        <Link to={`/tickets/${t._id}`} className="btn btn-sm btn-outline-primary py-1 px-2">
                          Claim
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 3. ASSET MANAGER DASHBOARD VIEW */}
      {/* ========================================================================= */}
      {isAssetManager && metrics && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Total Assets"
                value={metrics.totalAssets}
                icon="bi-boxes"
                color="blue"
                subtitle={`Total Value: $${metrics.totalInventoryValue?.toLocaleString()}`}
                onClick={() => navigate('/assets')}
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Assets In Use"
                value={metrics.inUse}
                icon="bi-person-check-fill"
                color="green"
                subtitle="Assigned to Staff"
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Under Maintenance"
                value={metrics.underRepair}
                icon="bi-tools"
                color="amber"
                subtitle="Currently in Repair"
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Expiring Warranties"
                value={metrics.expiringSoon}
                icon="bi-shield-exclamation"
                color="red"
                subtitle="Next 60 Days"
                onClick={() => navigate('/assets?warrantyStatus=expiring-soon')}
              />
            </div>
          </div>

          <div className="row g-3 mb-4">
            {/* Category Breakdown */}
            <div className="col-12 col-lg-6">
              <div className="card-custom h-100">
                <div className="card-custom-header">
                  <span className="fw-bold fs-6">
                    <i className="bi bi-pie-chart-fill text-primary me-2"></i> Inventory by Category & Value
                  </span>
                </div>
                <div className="table-responsive">
                  <table className="table table-custom align-middle">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Units</th>
                        <th>Total Cost Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.categoryBreakdown?.map((item) => (
                        <tr key={item._id}>
                          <td><span className="fw-semibold small">{item._id}</span></td>
                          <td><span className="badge bg-light text-dark border">{item.count}</span></td>
                          <td className="fw-bold text-primary small">${item.totalCost?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Upcoming Warranties */}
            <div className="col-12 col-lg-6">
              <div className="card-custom h-100">
                <div className="card-custom-header">
                  <span className="fw-bold fs-6">
                    <i className="bi bi-clock-history text-danger me-2"></i> Warranties Requiring Renewal
                  </span>
                  <Link to="/assets" className="small text-decoration-none">View All</Link>
                </div>
                <div className="table-responsive">
                  <table className="table table-custom align-middle">
                    <thead>
                      <tr>
                        <th>Asset Tag</th>
                        <th>Name</th>
                        <th>Assigned</th>
                        <th>Warranty Expiry</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.upcomingWarrantyAssets?.map((a) => (
                        <tr key={a._id}>
                          <td><span className="fw-bold text-primary small">{a.assetTag}</span></td>
                          <td><span className="fw-semibold small text-truncate d-inline-block" style={{ maxWidth: '160px' }}>{a.name}</span></td>
                          <td><span className="small text-muted">{a.assignedTo?.name || 'In Storage'}</span></td>
                          <td>
                            <span className="badge bg-danger-subtle text-danger">
                              {new Date(a.warrantyExpiry).toLocaleDateString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 4. EMPLOYEE DASHBOARD VIEW */}
      {/* ========================================================================= */}
      {isEmployee && metrics && (
        <>
          {/* Quick AI Assistance Hero Banner */}
          <div className="p-4 mb-4 rounded-4 text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #0b192c 0%, #1e3e62 50%, #2563eb 100%)' }}>
            <div className="row align-items-center">
              <div className="col-md-8">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="badge bg-info-subtle text-info border px-2 py-1">AI-Powered IT Support</span>
                  <span className="ai-pulse-dot"></span>
                </div>
                <h4 className="fw-bold text-white mb-2">Need Instant IT Troubleshooting?</h4>
                <p className="text-light opacity-75 small mb-3">
                  Ask our AI Helpdesk to diagnose VPN drops, Outlook email sync issues, system crashes, or request software licenses in seconds.
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <Link to="/ai-assistant" className="btn btn-light btn-sm fw-bold px-3 py-2 text-primary shadow-sm">
                    <i className="bi bi-robot me-1"></i> Launch AI Assistant
                  </Link>
                  <Link to="/kb" className="btn btn-outline-light btn-sm fw-semibold px-3 py-2">
                    <i className="bi bi-search me-1"></i> Search Knowledge Base
                  </Link>
                </div>
              </div>
              <div className="col-md-4 text-center d-none d-md-block">
                <i className="bi bi-cpu text-white opacity-25" style={{ fontSize: '6rem' }}></i>
              </div>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="My Total Tickets"
                value={metrics.myTotalTickets}
                icon="bi-ticket-detailed-fill"
                color="blue"
                subtitle="All time requests"
                onClick={() => navigate('/tickets')}
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Active Tickets"
                value={metrics.myOpenTickets}
                icon="bi-hourglass-split"
                color="amber"
                subtitle="Currently being resolved"
                onClick={() => navigate('/tickets')}
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Resolved Tickets"
                value={metrics.myResolvedTickets}
                icon="bi-check-circle-fill"
                color="green"
                subtitle="Completed successfully"
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Assigned IT Assets"
                value={metrics.myAssignedAssetsCount}
                icon="bi-laptop"
                color="cyan"
                subtitle="Laptops & licenses"
                onClick={() => navigate('/assets')}
              />
            </div>
          </div>

          <div className="row g-3 mb-4">
            {/* My Active Tickets */}
            <div className="col-12 col-lg-7">
              <div className="card-custom h-100">
                <div className="card-custom-header">
                  <span className="fw-bold fs-6">
                    <i className="bi bi-clock-history text-primary me-2"></i> My Support Requests
                  </span>
                  <Link to="/tickets" className="small text-decoration-none">View All</Link>
                </div>
                <div className="table-responsive">
                  <table className="table table-custom align-middle">
                    <thead>
                      <tr>
                        <th>Ticket ID</th>
                        <th>Subject</th>
                        <th>Technician</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.myTickets?.length > 0 ? (
                        metrics.myTickets.map((t) => (
                          <tr key={t._id}>
                            <td><span className="fw-bold text-primary small">{t.ticketId}</span></td>
                            <td><div className="fw-semibold small text-truncate" style={{ maxWidth: '200px' }}>{t.title}</div></td>
                            <td><span className="small text-muted">{t.assignedTo?.name || 'Pending assignment'}</span></td>
                            <td><StatusBadge status={t.status} /></td>
                            <td>
                              <Link to={`/tickets/${t._id}`} className="btn btn-sm btn-light border py-1 px-2">
                                Track &rarr;
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center py-4 text-muted small">
                            You have no open tickets. Need help? Click 'Create Ticket' above!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* My Assigned Hardware & Software */}
            <div className="col-12 col-lg-5">
              <div className="card-custom h-100">
                <div className="card-custom-header">
                  <span className="fw-bold fs-6">
                    <i className="bi bi-hdd-network text-primary me-2"></i> My Company Assets
                  </span>
                </div>
                <div className="card-custom-body p-0">
                  <div className="list-group list-group-flush">
                    {metrics.myAssets?.map((a) => (
                      <div key={a._id} className="list-group-item p-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold text-primary small">{a.assetTag}</span>
                          <span className="badge bg-light text-secondary border small">{a.category}</span>
                        </div>
                        <div className="fw-semibold small">{a.name}</div>
                        <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                          Serial: {a.serialNumber} &bull; Warranty: {new Date(a.warrantyExpiry).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
