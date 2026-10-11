import React from 'react';

const SlaBadge = ({ deadline, slaStatus, status }) => {
  const isResolved = status === 'Resolved' || status === 'Closed';

  if (isResolved) {
    return (
      <span className="badge bg-light text-secondary border">
        <i className="bi bi-check-circle me-1"></i> SLA Met
      </span>
    );
  }

  const now = new Date();
  const target = new Date(deadline);
  const diffMs = target - now;
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));

  if (diffMs < 0 || slaStatus === 'Breached') {
    return (
      <span className="badge bg-danger text-white d-inline-flex align-items-center gap-1">
        <i className="bi bi-exclamation-triangle-fill"></i> Breached ({Math.abs(diffHours)}h overdue)
      </span>
    );
  }

  if (diffHours <= 4 || slaStatus === 'At Risk') {
    return (
      <span className="badge bg-warning text-dark d-inline-flex align-items-center gap-1">
        <i className="bi bi-clock-history"></i> At Risk ({diffHours}h left)
      </span>
    );
  }

  return (
    <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1">
      <i className="bi bi-shield-check"></i> Within SLA ({diffHours}h left)
    </span>
  );
};

export default SlaBadge;
