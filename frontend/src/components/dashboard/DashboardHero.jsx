import React from 'react';
import { NavigationIcon, ShieldIcon } from '../common/Icons';

function DashboardHero({ user, vehicleCount = 0 }) {
  const roleName = user?.role ? user.role.replace('_', ' ') : 'USER';

  return (
    <div className="dashboard-hero-banner">
      <div className="hero-content">
        <div className="hero-status-pill">
          <span className="hero-live-dot" />
          <span>REAL-TIME TELEMETRICS ACTIVE</span>
        </div>
        <h2 className="hero-title">
          FleetFocus Command Center
        </h2>
        <p className="hero-subtitle">
          Intelligent real-time asset tracking, automated dispatch routing, and live telemetry diagnostics.
        </p>
        <div className="hero-meta-badges">
          <div className="hero-badge">
            <ShieldIcon size={16} color="#38bdf8" />
            <span>Role: <strong>{roleName}</strong></span>
          </div>
          <div className="hero-badge">
            <NavigationIcon size={16} color="#34d399" />
            <span>Telemetry: <strong>5s GPS Polling</strong></span>
          </div>
        </div>
      </div>

      <div className="hero-illustration">
        <svg viewBox="0 0 240 140" className="hero-svg-art">
          {/* Background grid elements */}
          <circle cx="170" cy="70" r="55" fill="rgba(59, 130, 246, 0.12)" />
          <circle cx="170" cy="70" r="40" fill="none" stroke="rgba(59, 130, 246, 0.25)" strokeDasharray="4,4" />
          <line x1="20" y1="110" x2="220" y2="110" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="40" y1="110" x2="200" y2="110" stroke="#60a5fa" strokeWidth="2" strokeDasharray="8,8" />

          {/* Delivery Waypoint pin */}
          <g transform="translate(195, 45)">
            <circle cx="0" cy="0" r="10" fill="#f59e0b" />
            <circle cx="0" cy="0" r="4" fill="#ffffff" />
            <line x1="0" y1="10" x2="0" y2="24" stroke="#f59e0b" strokeWidth="2" />
          </g>

          {/* Animated Delivery Truck graphic */}
          <g transform="translate(75, 52)">
            {/* Truck Body */}
            <rect x="0" y="15" width="60" height="35" rx="4" fill="#2563eb" />
            <polygon points="60,25 78,25 86,38 86,50 60,50" fill="#3b82f6" />
            {/* Window */}
            <polygon points="62,28 75,28 80,38 62,38" fill="#93c5fd" />
            {/* Wheels */}
            <circle cx="18" cy="50" r="8" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
            <circle cx="70" cy="50" r="8" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
            <circle cx="18" cy="50" r="3" fill="#ffffff" />
            <circle cx="70" cy="50" r="3" fill="#ffffff" />
            {/* Speed motion lines behind truck */}
            <line x1="-15" y1="25" x2="-4" y2="25" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
            <line x1="-22" y1="35" x2="-6" y2="35" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
            <line x1="-12" y1="45" x2="-3" y2="45" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
          </g>
        </svg>
      </div>
    </div>
  );
}

export default DashboardHero;
