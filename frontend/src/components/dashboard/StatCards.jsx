import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { TruckIcon, WrenchIcon, CheckCircleIcon, NavigationIcon } from '../common/Icons';

function StatCards({ vehicles = [] }) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const vList = Array.isArray(vehicles) ? vehicles : [];

  const total = vList.length;
  const onTrip = vList.filter((v) => v.status === 'ON_TRIP').length;
  const maintenance = vList.filter((v) => v.status === 'UNDER_MAINTENANCE').length;
  const available = vList.filter((v) => v.status === 'AVAILABLE').length;

  const isDispatcher = user?.role === 'DISPATCHER';

  const stats = [
    {
      label: 'Total Fleet',
      value: total,
      sub: 'Tracked Assets',
      color: '#2563eb',
      icon: <TruckIcon size={20} color="#2563eb" />,
      path: '/vehicles',
    },
    {
      label: 'On Trip',
      value: onTrip,
      sub: 'En Route Active',
      color: '#1065B4',
      icon: <NavigationIcon size={20} color="#1065B4" />,
      path: '/trips',
    },
    {
      label: 'Maintenance',
      value: maintenance,
      sub: isDispatcher ? 'Restricted to Techs' : 'Service In Progress',
      color: '#f59e0b',
      icon: <WrenchIcon size={20} color="#f59e0b" />,
      path: isDispatcher ? null : '/maintenance',
    },
    {
      label: 'Available',
      value: available,
      sub: 'Ready for Dispatch',
      color: '#10b981',
      icon: <CheckCircleIcon size={20} color="#10b981" />,
      path: isDispatcher ? '/trips' : '/vehicles',
    },
  ];

  return (
    <div className="stat-cards-row">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="stat-card"
          style={{ borderLeft: `4px solid ${stat.color}`, cursor: stat.path ? 'pointer' : 'default' }}
          onClick={() => {
            if (stat.path) navigate(stat.path);
          }}
          role="button"
          tabIndex={stat.path ? 0 : -1}
          onKeyDown={(e) => {
            if (stat.path && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              navigate(stat.path);
            }
          }}
        >
          <div className="stat-card-top">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-icon-wrap">{stat.icon}</div>
          </div>
          <div className="stat-value">{stat.value}</div>
          <div className="stat-sub">{stat.sub}</div>
        </div>
      ))}
    </div>
  );
}

export default StatCards;