import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import tripService from '../../services/tripService';
import TripForm from './TripForm';
import TripTimeline from './TripTimeline';
import { TruckIcon, ClockIcon } from '../common/Icons';

function TripList() {
  const { user } = useSelector((state) => state.auth);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedTripId, setExpandedTripId] = useState(null);
  const [endingTrip, setEndingTrip] = useState(null);
  const [distanceInput, setDistanceInput] = useState('');
  const [endLoading, setEndLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const location = useLocation();
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (location.state?.openForm) {
      setShowForm(true);
    }
  }, [location.state]);

  const fetchTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tripService.getAll();
      setTrips(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Trip fetch error:', err);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setError('Session expired or unauthorized. Please log in again.');
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Unable to load trip records. Please check the backend connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user]);

  const openEndTripModal = (trip) => {
    setEndingTrip(trip);
    setDistanceInput('10.0');
  };

  const handleConfirmEndTrip = async (e) => {
    e.preventDefault();
    if (!endingTrip) return;
    const distance = parseFloat(distanceInput);
    if (isNaN(distance) || distance < 0) {
      alert('Please enter a valid distance.');
      return;
    }

    setEndLoading(true);
    try {
      await tripService.end(endingTrip.id, distance);
      setNotice({ type: 'success', text: `Trip TRP-${endingTrip.id} completed successfully!` });
      setEndingTrip(null);
      fetchTrips();
    } catch (err) {
      setNotice({
        type: 'error',
        text: err.response?.data?.message || 'Error ending trip: ' + err.message,
      });
    } finally {
      setEndLoading(false);
      setTimeout(() => setNotice(null), 4000);
    }
  };

  const filteredTrips = useMemo(() => {
    if (filter === 'ALL') return trips;
    return trips.filter((t) => t.status === filter);
  }, [trips, filter]);

  return (
    <div className="trip-list">
      <div className="list-header">
        <div className="header-title-group">
          <div className="header-icon-badge">
            <TruckIcon size={24} color="#1065B4" />
          </div>
          <div>
            <h1>Fleet Journeys & Dispatch</h1>
            <p className="page-subtitle">Track active journeys, driver assignments, and completed routes</p>
          </div>
        </div>

        <div className="header-actions">
          <button type="button" className="btn-secondary" onClick={fetchTrips}>
            Refresh
          </button>
          {(user?.role === 'FLEET_MANAGER' || user?.role === 'DISPATCHER' || user?.role === 'DRIVER') && (
            <button type="button" className="btn-primary" onClick={() => setShowForm(true)}>
              {user?.role === 'DRIVER' ? '+ Start Trip' : '+ Dispatch Vehicle'}
            </button>
          )}
        </div>
      </div>

      {notice && (
        <div className={`notice-banner ${notice.type === 'success' ? 'notice-success' : 'notice-error'}`}>
          {notice.text}
        </div>
      )}

      {error && (
        <div className="error-banner" role="alert">
          {error}
          <button type="button" onClick={fetchTrips} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-pills-row">
        <button
          type="button"
          className={`filter-pill ${filter === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilter('ALL')}
        >
          All ({trips.length})
        </button>
        <button
          type="button"
          className={`filter-pill pill-ontrip ${filter === 'ACTIVE' ? 'active' : ''}`}
          onClick={() => setFilter('ACTIVE')}
        >
          Active ({trips.filter((t) => t.status === 'ACTIVE').length})
        </button>
        <button
          type="button"
          className={`filter-pill pill-available ${filter === 'COMPLETED' ? 'active' : ''}`}
          onClick={() => setFilter('COMPLETED')}
        >
          Completed ({trips.filter((t) => t.status === 'COMPLETED').length})
        </button>
      </div>

      {loading && trips.length === 0 ? (
        <div className="state-card loading-card">Loading Journeys...</div>
      ) : filteredTrips.length === 0 ? (
        <div className="state-card empty-card">
          <TruckIcon size={32} color="#94a3b8" />
          <h3>{user?.role === 'DRIVER' ? 'No journeys found' : 'No journeys found'}</h3>
          <p>
            {user?.role === 'DRIVER'
              ? 'Start a trip to begin logging journey telemetry.'
              : 'Dispatch a vehicle to begin tracking trip telemetry.'}
          </p>
          {(user?.role === 'FLEET_MANAGER' || user?.role === 'DISPATCHER' || user?.role === 'DRIVER') && (
            <button
              type="button"
              className="btn-primary"
              style={{ marginTop: '0.75rem' }}
              onClick={() => setShowForm(true)}
            >
              {user?.role === 'DRIVER' ? '+ Start Trip' : '+ Dispatch Vehicle'}
            </button>
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Trip ID</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Start Time</th>
                <th>Status</th>
                <th>Distance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.map((trip) => (
                <React.Fragment key={trip.id}>
                  <tr
                    onClick={() =>
                      setExpandedTripId(expandedTripId === trip.id ? null : trip.id)
                    }
                    style={{ cursor: 'pointer' }}
                    title="Click to toggle journey timeline"
                  >
                    <td>
                      <span className="record-tag">TRP-{trip.id}</span>
                    </td>
                    <td>
                      <div className="vehicle-cell-info">
                        <strong>{trip.vehicle?.licensePlate || 'N/A'}</strong>
                        <span className="sub-model">{trip.vehicle?.model || ''}</span>
                      </div>
                    </td>
                    <td>
                      <span className="driver-name-badge">
                        {trip.driver?.user?.username || 'Assigned Driver'}
                      </span>
                    </td>
                    <td>
                      <span className="date-cell">
                        <ClockIcon size={13} color="#64748b" />
                        {trip.startTime ? new Date(trip.startTime).toLocaleString() : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${trip.status?.toLowerCase()}`}>
                        {trip.status}
                      </span>
                      <TripTimeline status={trip.status} compact />
                    </td>
                    <td>
                      <span className="distance-val">{trip.distanceCovered || 0} km</span>
                    </td>
                    <td>
                      {trip.status === 'ACTIVE' && (
                        <button
                          type="button"
                          className="btn-action end-trip-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEndTripModal(trip);
                          }}
                        >
                          End Trip
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedTripId === trip.id && (
                    <tr className="trip-timeline-expanded-row">
                      <td colSpan={7}>
                        <div className="timeline-expanded-container">
                          <h4>Journey Progression Details</h4>
                          <TripTimeline status={trip.status} />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* End Trip Modal Dialog */}
      {endingTrip && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Complete Trip TRP-{endingTrip.id}</h2>
              <button
                type="button"
                className="close-btn"
                onClick={() => setEndingTrip(null)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleConfirmEndTrip}>
              <p>
                Confirm completion for vehicle{' '}
                <strong>{endingTrip.vehicle?.licensePlate}</strong> driven by{' '}
                <strong>{endingTrip.driver?.user?.username}</strong>.
              </p>
              <label htmlFor="end-trip-distance">Distance Covered (km)</label>
              <input
                id="end-trip-distance"
                type="number"
                step="0.1"
                min="0"
                required
                value={distanceInput}
                onChange={(e) => setDistanceInput(e.target.value)}
                disabled={endLoading}
              />
              <div className="modal-actions">
                <button type="submit" className="btn-primary" disabled={endLoading}>
                  {endLoading ? 'Completing...' : 'Confirm End Trip'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEndingTrip(null)}
                  disabled={endLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showForm && (
        <TripForm onRefresh={fetchTrips} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}

export default TripList;