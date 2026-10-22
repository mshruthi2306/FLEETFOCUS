import React, { useEffect, useState, useRef } from 'react';
import monitoringService from '../../services/monitoringService';
import LiveFleetMap from './LiveFleetMap';

function LiveFleet() {
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatedVehicleIds, setUpdatedVehicleIds] = useState({});
  const prevFleetRef = useRef([]);

  useEffect(() => {
    let isMounted = true;
    const fetchLive = async () => {
      try {
        const data = await monitoringService.getLiveFleet();
        if (!isMounted) return;
        const list = Array.isArray(data) ? data : [];

        if (prevFleetRef.current.length > 0) {
          const changed = {};
          list.forEach((item) => {
            const prev = prevFleetRef.current.find((p) => p.vehicleId === item.vehicleId);
            if (
              prev &&
              (prev.speed !== item.speed ||
                prev.latitude !== item.latitude ||
                prev.longitude !== item.longitude ||
                prev.fuelLevel !== item.fuelLevel ||
                prev.status !== item.status)
            ) {
              changed[item.vehicleId] = true;
            }
          });
          if (Object.keys(changed).length > 0) {
            setUpdatedVehicleIds(changed);
            setTimeout(() => {
              if (isMounted) setUpdatedVehicleIds({});
            }, 1800);
          }
        }

        prevFleetRef.current = list;
        setFleet(list);
      } catch (err) {
        console.warn('Live monitoring fetch failed:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLive();
    const interval = setInterval(fetchLive, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return <div>Initializing Live Tracking...</div>;
  }

  return (
    <div className="live-fleet">
      <h1>
        Live Fleet Monitoring <span className="pulse"></span> LIVE
      </h1>
      <LiveFleetMap fleet={fleet} />
      <table>
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Status</th>
            <th>Speed</th>
            <th>Location</th>
            <th>Fuel</th>
            <th>Last Update</th>
          </tr>
        </thead>
        <tbody>
          {fleet.map((v) => (
            <tr
              key={v.vehicleId}
              className={updatedVehicleIds[v.vehicleId] ? 'live-row-updated live-shimmer' : ''}
            >
              <td>{v.licensePlate} {v.model}</td>
              <td>
                <span className={`status-badge status-${v.status?.toLowerCase()}`}>
                  {v.status}
                </span>
              </td>
              <td className={`${v.speed > 100 ? 'text-error' : ''} ${updatedVehicleIds[v.vehicleId] ? 'live-val-glow' : ''}`}>
                {v.speed !== undefined ? v.speed.toFixed(1) : '0.0'} km/h
              </td>
              <td className={updatedVehicleIds[v.vehicleId] ? 'live-val-glow' : ''}>
                {v.latitude !== undefined
                  ? `${v.latitude.toFixed(4)}, ${v.longitude.toFixed(4)}`
                  : 'Offline'}
              </td>
              <td>
                <div className="capacity-bar">
                  <div
                    className="capacity-bar-fill"
                    style={{
                      width: `${v.fuelLevel || 0}%`,
                      backgroundColor: (v.fuelLevel || 0) < 20 ? '#ef4444' : '#10b981',
                    }}
                  ></div>
                </div>
              </td>
              <td>
                {v.recordedAt ? new Date(v.recordedAt).toLocaleTimeString() : 'Never'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LiveFleet;