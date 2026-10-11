import React from 'react';

const StatusBadge = ({ status }) => {
  let badgeStyle = {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
  };

  switch (status) {
    case 'Open':
      return (
        <span style={{ ...badgeStyle, backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}>
          <i className="bi bi-record-circle-fill" style={{ fontSize: '0.65rem' }}></i> Open
        </span>
      );
    case 'In Progress':
      return (
        <span style={{ ...badgeStyle, backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
          <i className="bi bi-arrow-repeat" style={{ fontSize: '0.75rem' }}></i> In Progress
        </span>
      );
    case 'Pending':
      return (
        <span style={{ ...badgeStyle, backgroundColor: '#f3e8ff', color: '#6b21a8', border: '1px solid #e9d5ff' }}>
          <i className="bi bi-hourglass-split" style={{ fontSize: '0.65rem' }}></i> Pending
        </span>
      );
    case 'Resolved':
      return (
        <span style={{ ...badgeStyle, backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }}>
          <i className="bi bi-check2-circle" style={{ fontSize: '0.75rem' }}></i> Resolved
        </span>
      );
    case 'Closed':
      return (
        <span style={{ ...badgeStyle, backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}>
          <i className="bi bi-check-all" style={{ fontSize: '0.75rem' }}></i> Closed
        </span>
      );
    case 'Reopened':
      return (
        <span style={{ ...badgeStyle, backgroundColor: '#ffe4e6', color: '#be123c', border: '1px solid #fecdd3' }}>
          <i className="bi bi-arrow-counterclockwise" style={{ fontSize: '0.75rem' }}></i> Reopened
        </span>
      );
    default:
      return (
        <span style={{ ...badgeStyle, backgroundColor: '#f1f5f9', color: '#475569' }}>
          {status}
        </span>
      );
  }
};

export default StatusBadge;
