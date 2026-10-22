import React from 'react';

function StatusDonut({ vehicles = [] }) {
  const vList = Array.isArray(vehicles) ? vehicles : [];

  if (vList.length === 0) {
    return (
      <div className="status-donut empty-donut">
        <h2>Vehicle Status Distribution</h2>
        <div className="donut-empty-notice">No vehicle fleet data available.</div>
      </div>
    );
  }

  const total = vList.length;
  const onTrip = vList.filter((v) => v.status === 'ON_TRIP').length;
  const maint = vList.filter((v) => v.status === 'UNDER_MAINTENANCE').length;
  const available = Math.max(0, total - onTrip - maint);

  const onTripPct = total > 0 ? (onTrip / total) * 100 : 0;
  const maintPct = total > 0 ? (maint / total) * 100 : 0;
  const availablePct = total > 0 ? (available / total) * 100 : 0;

  const circumference = 2 * Math.PI * 15.9155;
  const onTripDash = (onTripPct / 100) * circumference;
  const maintDash = (maintPct / 100) * circumference;
  const availableDash = (availablePct / 100) * circumference;

  return (
    <div className="status-donut">
      <h2>Vehicle Status Distribution</h2>
      <div className="donut-chart-container">
        <svg width="160" height="160" viewBox="0 0 42 42" className="donut-svg">
          {/* Background circle */}
          <circle
            cx="21"
            cy="21"
            r="15.9155"
            fill="transparent"
            stroke="#e2e8f0"
            strokeWidth="4"
          />
          {/* Available segment */}
          <circle
            cx="21"
            cy="21"
            r="15.9155"
            fill="transparent"
            stroke="#10b981"
            strokeWidth="4"
            strokeDasharray={`${availableDash} ${circumference}`}
            strokeDashoffset="0"
          />
          {/* On Trip segment */}
          <circle
            cx="21"
            cy="21"
            r="15.9155"
            fill="transparent"
            stroke="#1065B4"
            strokeWidth="4"
            strokeDasharray={`${onTripDash} ${circumference}`}
            strokeDashoffset={-availableDash}
          />
          {/* Maintenance segment */}
          <circle
            cx="21"
            cy="21"
            r="15.9155"
            fill="transparent"
            stroke="#f59e0b"
            strokeWidth="4"
            strokeDasharray={`${maintDash} ${circumference}`}
            strokeDashoffset={-(availableDash + onTripDash)}
          />
        </svg>

        <div className="legend">
          <div className="legend-item">
            <span className="dot available"></span> Available ({available} - {Math.round(availablePct)}%)
          </div>
          <div className="legend-item">
            <span className="dot on-trip"></span> On Trip ({onTrip} - {Math.round(onTripPct)}%)
          </div>
          <div className="legend-item">
            <span className="dot maintenance"></span> Maintenance ({maint} - {Math.round(maintPct)}%)
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatusDonut;