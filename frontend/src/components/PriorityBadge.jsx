import React from 'react';

const PriorityBadge = ({ priority }) => {
  let badgeStyle = {
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  };

  switch (priority) {
    case 'Urgent':
      return (
        <span style={{ ...badgeStyle, backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171' }}>
          <i className="bi bi-fire"></i> Urgent
        </span>
      );
    case 'High':
      return (
        <span style={{ ...badgeStyle, backgroundColor: '#ffedd5', color: '#c2410c', border: '1px solid #fdba74' }}>
          <i className="bi bi-chevron-double-up"></i> High
        </span>
      );
    case 'Medium':
      return (
        <span style={{ ...badgeStyle, backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
          <i className="bi bi-dash-lg"></i> Medium
        </span>
      );
    case 'Low':
      return (
        <span style={{ ...badgeStyle, backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
          <i className="bi bi-chevron-down"></i> Low
        </span>
      );
    default:
      return <span>{priority}</span>;
  }
};

export default PriorityBadge;
