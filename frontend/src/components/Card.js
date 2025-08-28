import React from 'react';

const Card = ({ title, value, icon: Icon, trend, trendValue, className = '' }) => {
  return (
    <div className={`card glass ${className}`}>
      <div className="card-header">
        <div className="card-icon">
          {Icon && <Icon size={24} />}
        </div>
        <div className="card-content">
          <h3 className="card-title">{title}</h3>
          <p className="card-value">{value}</p>
          {trend && (
            <div className={`card-trend ${trend}`}>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
