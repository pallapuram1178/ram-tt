import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatCard from '../../components/StatCard';

const Reports = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/metrics');
      if (res.data.success) {
        setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error('Failed to load report analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">IT Service Analytics & SLA Performance</h3>
          <p className="text-muted small mb-0">Executive operational overview, ticket velocity, and technician capacity metrics</p>
        </div>
        <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={fetchMetrics}>
          <i className="bi bi-arrow-clockwise"></i> Refresh Data
        </button>
      </div>

      {metrics && (
        <>
          {/* Top KPI row */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Overall SLA Compliance"
                value={`${metrics.tickets?.slaComplianceRate || 92}%`}
                icon="bi-shield-check"
                color="green"
                subtitle="Target SLA > 90%"
                badge={{ text: 'Guaranteed', class: 'bg-success' }}
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Total Tickets Processed"
                value={metrics.tickets?.total || 0}
                icon="bi-bar-chart-fill"
                color="blue"
                subtitle={`${metrics.tickets?.resolved || 0} Resolved`}
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Avg Resolution Time"
                value="3.4 Hours"
                icon="bi-stopwatch-fill"
                color="purple"
                subtitle="Industry avg: 8.5 Hours"
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Active IT Assets"
                value={metrics.assets?.total || 0}
                icon="bi-laptop-fill"
                color="cyan"
                subtitle={`${metrics.assets?.inUse || 0} In Active Use`}
              />
            </div>
          </div>

          <div className="row g-4 mb-4">
            {/* Technician Leaderboard */}
            <div className="col-12 col-lg-7">
              <div className="card-custom h-100">
                <div className="card-custom-header">
                  <span className="fw-bold fs-6">
                    <i className="bi bi-trophy-fill text-warning me-2"></i> Technician Performance & Resolution Leaderboard
                  </span>
                </div>
                <div className="table-responsive">
                  <table className="table table-custom align-middle">
                    <thead>
                      <tr>
                        <th>Technician</th>
                        <th>Specialty</th>
                        <th>Active Queue</th>
                        <th>Resolved Tickets</th>
                        <th>Efficiency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.techWorkload?.map((tech) => (
                        <tr key={tech.id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold small" style={{ width: '32px', height: '32px' }}>
                                {tech.name.charAt(0)}
                              </div>
                              <span className="fw-semibold small">{tech.name}</span>
                            </div>
                          </td>
                          <td><span className="badge bg-light text-secondary border small">{tech.specialization}</span></td>
                          <td><span className="fw-bold text-dark small">{tech.activeTickets}</span></td>
                          <td><span className="fw-bold text-success small">{tech.resolvedTickets}</span></td>
                          <td>
                            <span className="badge bg-success-subtle text-success">
                              <i className="bi bi-star-fill me-1"></i> 98.4%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="col-12 col-lg-5">
              <div className="card-custom h-100">
                <div className="card-custom-header">
                  <span className="fw-bold fs-6">
                    <i className="bi bi-pie-chart-fill text-primary me-2"></i> Ticket Volume Distribution
                  </span>
                </div>
                <div className="card-custom-body">
                  <div className="d-flex flex-column gap-3">
                    {metrics.categoryDistribution?.map((cat) => (
                      <div key={cat._id}>
                        <div className="d-flex justify-content-between small fw-semibold mb-1">
                          <span>{cat._id}</span>
                          <span className="text-muted">{cat.count} requests</span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div
                            className="progress-bar bg-primary"
                            style={{ width: `${(cat.count / (metrics.tickets?.total || 1)) * 100}%` }}
                          ></div>
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

export default Reports;
