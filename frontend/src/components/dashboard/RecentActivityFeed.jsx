import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import tripService from '../../services/tripService';
import maintenanceService from '../../services/maintenanceService';
import { TruckIcon, WrenchIcon, ClockIcon } from '../common/Icons';

function RecentActivityFeed() {
  const { user } = useSelector((state) => state.auth);
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const canViewTrips = user.role === 'FLEET_MANAGER' || user.role === 'DISPATCHER' || user.role === 'DRIVER' || user.role === 'MAINTENANCE_TECH';
        const canViewMaintenance = user.role === 'FLEET_MANAGER' || user.role === 'MAINTENANCE_TECH';

        const [tripsData, maintenanceData] = await Promise.allSettled([
          canViewTrips ? tripService.getAll() : Promise.resolve([]),
          canViewMaintenance ? maintenanceService.getAll() : Promise.resolve([]),
        ]);

        const trips = tripsData.status === 'fulfilled' && Array.isArray(tripsData.value) ? tripsData.value : [];
        const logs = maintenanceData.status === 'fulfilled' && Array.isArray(maintenanceData.value) ? maintenanceData.value : [];

        const combined = [
          ...trips.map((t) => ({
            id: `trip-${t.id}`,
            type: 'TRIP',
            title: `Trip TRP-${t.id}`,
            subtitle: `${t.vehicle?.licensePlate || 'Fleet vehicle'} • Driver: ${t.driver?.user?.username || 'Assigned Driver'}`,
            status: t.status,
            timestamp: t.startTime ? new Date(t.startTime) : new Date(),
            distance: t.distanceCovered ? `${t.distanceCovered} km` : null,
          })),
          ...logs.map((m) => ({
            id: `maint-${m.id}`,
            type: 'MAINTENANCE',
            title: `Maintenance Log #${m.id}`,
            subtitle: `${m.vehicle?.licensePlate || 'Fleet vehicle'} • ${m.description || 'Routine Inspection'}`,
            status: m.status || 'LOGGED',
            timestamp: m.serviceDate ? new Date(m.serviceDate) : new Date(),
            cost: m.cost ? `$${m.cost}` : null,
          })),
        ];

        // Sort descending by timestamp
        combined.sort((a, b) => b.timestamp - a.timestamp);
        setActivities(combined.slice(0, 8));
      } catch (err) {
        console.error('Failed to load recent activities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user]);

  const filteredActivities = activities.filter((a) => {
    if (user?.role === 'DISPATCHER' && a.type === 'MAINTENANCE') return false;
    if (filter === 'ALL') return true;
    return a.type === filter;
  });

  return (
    <div className="recent-activity-card">
      <div className="activity-card-header">
        <div className="activity-title-group">
          <ClockIcon size={18} color="#2563eb" />
          <h3>Recent Fleet Activity</h3>
        </div>

        <div className="activity-filter-tabs">
          <button
            type="button"
            className={`activity-tab ${filter === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilter('ALL')}
          >
            All
          </button>
          <button
            type="button"
            className={`activity-tab ${filter === 'TRIP' ? 'active' : ''}`}
            onClick={() => setFilter('TRIP')}
          >
            Trips
          </button>
          {user?.role !== 'DISPATCHER' && (
            <button
              type="button"
              className={`activity-tab ${filter === 'MAINTENANCE' ? 'active' : ''}`}
              onClick={() => setFilter('MAINTENANCE')}
            >
              Maintenance
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="activity-loading">Loading telemetry stream...</div>
      ) : filteredActivities.length === 0 ? (
        <div className="activity-empty">No recent activity found.</div>
      ) : (
        <ul className="activity-list">
          {filteredActivities.map((act) => (
            <li key={act.id} className="activity-item">
              <div className={`activity-icon-wrap ${act.type.toLowerCase()}`}>
                {act.type === 'TRIP' ? (
                  <TruckIcon size={16} color="#ffffff" />
                ) : (
                  <WrenchIcon size={16} color="#ffffff" />
                )}
              </div>

              <div className="activity-info">
                <div className="activity-item-title-row">
                  <span className="activity-item-title">{act.title}</span>
                  <span className="activity-time">
                    {act.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="activity-item-sub">
                  <span>{act.subtitle}</span>
                  {act.distance && <span className="activity-metric-pill">{act.distance}</span>}
                  {act.cost && <span className="activity-metric-pill">{act.cost}</span>}
                </div>
              </div>

              <div className="activity-badge-cell">
                <span className={`status-badge status-${act.status?.toLowerCase()}`}>
                  {act.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RecentActivityFeed;
