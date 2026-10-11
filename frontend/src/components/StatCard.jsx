import React from 'react';

const StatCard = ({ title, value, icon, color = 'blue', subtitle, onClick, badge }) => {
  return (
    <div
      className="stat-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div>
        <div className="text-muted small fw-semibold text-uppercase" style={{ letterSpacing: '0.04em', fontSize: '0.75rem' }}>
          {title}
        </div>
        <div className="d-flex align-items-baseline gap-2 mt-1">
          <h3 className="mb-0 fw-bold" style={{ color: '#0f172a', fontSize: '1.75rem' }}>
            {value}
          </h3>
          {badge && <span className={`badge ${badge.class || 'bg-primary'}`}>{badge.text}</span>}
        </div>
        {subtitle && <div className="text-muted small mt-1" style={{ fontSize: '0.8rem' }}>{subtitle}</div>}
      </div>
      <div className={`stat-icon-wrapper stat-icon-${color}`}>
        <i className={`bi ${icon}`}></i>
      </div>
    </div>
  );
};

export default StatCard;
