import React, { useState } from 'react';
import { TruckIcon, SpeedometerIcon, FuelIcon, MapPinIcon, NavigationIcon } from '../common/Icons';

function LiveFleetMap({ fleet = [] }) {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [filter, setFilter] = useState('ALL');

  // Filter vehicles
  const filteredFleet = fleet.filter((v) => {
    if (filter === 'ALL') return true;
    return v.status === filter;
  });

  // Calculate normalized coordinate position inside SVG 800x400 map canvas
  const getCoordinates = (v, idx) => {
    // If latitude and longitude are valid numbers
    if (typeof v.latitude === 'number' && typeof v.longitude === 'number' && !isNaN(v.latitude)) {
      // Map coordinates to 800x400 viewbox with a standard bounded formula
      const x = Math.abs((v.longitude * 37 + idx * 73) % 700) + 50;
      const y = Math.abs((v.latitude * 43 + idx * 53) % 320) + 40;
      return { x, y };
    }
    // Fallback spread across canvas based on index
    const cols = 4;
    const row = Math.floor(idx / cols);
    const col = idx % cols;
    return {
      x: 100 + col * 180 + ((idx * 17) % 40),
      y: 80 + row * 110 + ((idx * 13) % 30),
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return '#10b981'; // green
      case 'ON_TRIP':
        return '#3b82f6'; // blue
      case 'UNDER_MAINTENANCE':
        return '#f59e0b'; // orange
      default:
        return '#94a3b8';
    }
  };

  return (
    <div className="live-fleet-map-container">
      {/* Top Map Header & Controls */}
      <div className="map-toolbar">
        <div className="map-title-badge">
          <span className="live-radar-ping"></span>
          <span className="map-title-text">REAL-TIME GPS TELEMETRICS RADAR</span>
          <span className="vehicle-counter">{filteredFleet.length} tracked</span>
        </div>

        <div className="map-filter-group">
          <button
            type="button"
            className={`map-filter-btn ${filter === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilter('ALL')}
          >
            All ({fleet.length})
          </button>
          <button
            type="button"
            className={`map-filter-btn filter-blue ${filter === 'ON_TRIP' ? 'active' : ''}`}
            onClick={() => setFilter('ON_TRIP')}
          >
            On Trip ({fleet.filter((v) => v.status === 'ON_TRIP').length})
          </button>
          <button
            type="button"
            className={`map-filter-btn filter-green ${filter === 'AVAILABLE' ? 'active' : ''}`}
            onClick={() => setFilter('AVAILABLE')}
          >
            Available ({fleet.filter((v) => v.status === 'AVAILABLE').length})
          </button>
          <button
            type="button"
            className={`map-filter-btn filter-orange ${filter === 'UNDER_MAINTENANCE' ? 'active' : ''}`}
            onClick={() => setFilter('UNDER_MAINTENANCE')}
          >
            Maintenance ({fleet.filter((v) => v.status === 'UNDER_MAINTENANCE').length})
          </button>
        </div>
      </div>

      {/* SVG Interactive Map Canvas */}
      <div className="svg-map-wrapper">
        <svg viewBox="0 0 800 400" className="fleet-svg-map">
          <defs>
            {/* Map Background Grid Pattern */}
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" />
            </pattern>
            {/* Radial glow filter */}
            <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Dark Radar Background */}
          <rect width="800" height="400" fill="#0b1329" rx="10" />
          <rect width="800" height="400" fill="url(#grid-pattern)" rx="10" />

          {/* City Arteries & Highway Lines */}
          <g className="map-highways" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round">
            <path d="M 0 120 Q 250 140 400 90 T 800 130" stroke="#1e3a5f" strokeWidth="3" fill="none" />
            <path d="M 0 280 Q 200 240 450 310 T 800 260" stroke="#1e3a5f" strokeWidth="3" fill="none" />
            <path d="M 160 0 Q 220 200 180 400" stroke="#1e3a5f" strokeWidth="2" fill="none" />
            <path d="M 620 0 Q 580 180 640 400" stroke="#1e3a5f" strokeWidth="2" fill="none" />
            <path d="M 380 0 L 420 400" stroke="#334155" strokeDasharray="6,6" strokeWidth="1.5" fill="none" />
            <path d="M 0 200 L 800 200" stroke="#334155" strokeDasharray="6,6" strokeWidth="1.5" fill="none" />
          </g>

          {/* Delivery Hub / Waypoints */}
          <g className="map-hubs">
            <circle cx="200" cy="130" r="14" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
            <text x="200" y="134" textAnchor="middle" fill="#93c5fd" fontSize="9" fontWeight="bold">HUB A</text>

            <circle cx="600" cy="270" r="14" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
            <text x="600" y="274" textAnchor="middle" fill="#6ee7b7" fontSize="9" fontWeight="bold">HUB B</text>

            <circle cx="420" cy="200" r="16" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
            <text x="420" y="204" textAnchor="middle" fill="#fcd34d" fontSize="9" fontWeight="bold">CENTRAL</text>
          </g>

          {/* Moving Vehicle Markers with smooth transition */}
          {filteredFleet.map((v, idx) => {
            const { x, y } = getCoordinates(v, idx);
            const color = getStatusColor(v.status);
            const isSelected = selectedVehicle?.vehicleId === v.vehicleId;

            return (
              <g
                key={v.vehicleId || idx}
                className="vehicle-svg-marker"
                transform={`translate(${x}, ${y})`}
                style={{
                  transition: 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedVehicle(v)}
              >
                {/* Pulsing ring for ON_TRIP */}
                {v.status === 'ON_TRIP' && (
                  <circle
                    r="18"
                    fill="none"
                    stroke={color}
                    strokeWidth="1.5"
                    className="marker-radar-ring"
                    opacity="0.75"
                  />
                )}

                {/* Marker Outer Disc */}
                <circle
                  r={isSelected ? 16 : 13}
                  fill="#0f172a"
                  stroke={color}
                  strokeWidth={isSelected ? 3 : 2}
                  style={{ transition: 'all 0.2s ease' }}
                />

                {/* Small Center Vehicle Icon / Indicator */}
                <circle r="4" fill={color} />

                {/* Vehicle Plate Badge */}
                <rect
                  x="-32"
                  y="18"
                  width="64"
                  height="16"
                  rx="4"
                  fill="#0f172a"
                  stroke="#334155"
                  strokeWidth="1"
                  opacity="0.9"
                />
                <text
                  x="0"
                  y="30"
                  textAnchor="middle"
                  fill="#f1f5f9"
                  fontSize="8.5"
                  fontWeight="600"
                  letterSpacing="0.5"
                >
                  {v.licensePlate || `VEH-${v.vehicleId}`}
                </text>

                {/* Speed indicator bubble if on trip */}
                {v.status === 'ON_TRIP' && v.speed > 0 && (
                  <g transform="translate(10, -10)">
                    <rect x="0" y="-12" width="46" height="13" rx="3" fill="#1e293b" stroke={v.speed > 100 ? '#ef4444' : '#3b82f6'} strokeWidth="1" />
                    <text x="23" y="-3" textAnchor="middle" fill="#93c5fd" fontSize="7.5" fontWeight="bold">
                      {v.speed.toFixed(0)} km/h
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Selected Vehicle Telematics HUD Card */}
        {selectedVehicle && (
          <div className="map-vehicle-hud">
            <div className="hud-header">
              <div className="hud-title">
                <TruckIcon size={18} color={getStatusColor(selectedVehicle.status)} />
                <strong>{selectedVehicle.licensePlate}</strong>
                <span className={`status-badge status-${selectedVehicle.status?.toLowerCase()}`}>
                  {selectedVehicle.status}
                </span>
              </div>
              <button
                type="button"
                className="hud-close-btn"
                onClick={() => setSelectedVehicle(null)}
              >
                ×
              </button>
            </div>

            <div className="hud-model">{selectedVehicle.model || 'Commercial Fleet Carrier'}</div>

            <div className="hud-metrics">
              <div className="hud-metric-item">
                <SpeedometerIcon size={14} color="#60a5fa" />
                <span>Speed:</span>
                <strong>{selectedVehicle.speed !== undefined ? selectedVehicle.speed.toFixed(1) : '0.0'} km/h</strong>
              </div>

              <div className="hud-metric-item">
                <FuelIcon size={14} color={(selectedVehicle.fuelLevel || 0) < 20 ? '#ef4444' : '#10b981'} />
                <span>Fuel:</span>
                <strong>{selectedVehicle.fuelLevel !== undefined ? `${selectedVehicle.fuelLevel}%` : 'N/A'}</strong>
              </div>

              <div className="hud-metric-item">
                <MapPinIcon size={14} color="#f59e0b" />
                <span>GPS:</span>
                <span>
                  {selectedVehicle.latitude !== undefined
                    ? `${selectedVehicle.latitude.toFixed(3)}, ${selectedVehicle.longitude.toFixed(3)}`
                    : 'Offline'}
                </span>
              </div>

              <div className="hud-metric-item">
                <NavigationIcon size={14} color="#a78bfa" />
                <span>Last Ping:</span>
                <span>{selectedVehicle.recordedAt ? new Date(selectedVehicle.recordedAt).toLocaleTimeString() : 'Recent'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Footer status legend */}
      <div className="map-footer-legend">
        <div className="legend-entry">
          <span className="legend-dot green"></span>
          <span>Available (Ready for Dispatch)</span>
        </div>
        <div className="legend-entry">
          <span className="legend-dot blue"></span>
          <span>On Trip (Active Delivery Route)</span>
        </div>
        <div className="legend-entry">
          <span className="legend-dot orange"></span>
          <span>Under Maintenance (Service Bay)</span>
        </div>
        <div className="legend-timestamp">
          Auto-refreshing live GPS feed every 5s
        </div>
      </div>
    </div>
  );
}

export default LiveFleetMap;
