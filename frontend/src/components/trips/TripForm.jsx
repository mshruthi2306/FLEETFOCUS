import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import vehicleService from '../../services/vehicleService';
import driverService from '../../services/driverService';
import tripService from '../../services/tripService';

function TripForm({ onRefresh, onClose }) {
  const { user } = useSelector((state) => state.auth);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [currentDriver, setCurrentDriver] = useState(null);
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetches = [vehicleService.getAvailable()];
    if (user?.role === 'DRIVER') {
      fetches.push(driverService.getCurrentDriver());
    } else {
      fetches.push(driverService.getAvailable());
    }

    Promise.allSettled(fetches)
      .then(([vehResult, driverResult]) => {
        if (!isMounted) return;

        if (vehResult.status === 'fulfilled') {
          const vData = vehResult.value;
          setVehicles(Array.isArray(vData) ? vData : (vData?.content || []));
        }

        if (driverResult.status === 'fulfilled') {
          if (user?.role === 'DRIVER') {
            const me = driverResult.value;
            setCurrentDriver(me);
            if (me?.id) {
              setDriverId(me.id.toString());
            }
          } else {
            const dList = Array.isArray(driverResult.value) ? driverResult.value : [];
            setDrivers(dList);
          }
        }
      })
      .finally(() => {
        if (isMounted) setFetchLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const isDriverOnTrip = user?.role === 'DRIVER' && currentDriver?.status === 'ON_TRIP';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setErrorMessage('');
    setSuccessMessage('');

    if (isDriverOnTrip) {
      setErrorMessage('You already have an active trip in progress. Please complete your current trip before starting a new one.');
      return;
    }

    if (!vehicleId) {
      setErrorMessage('Please select an available vehicle.');
      return;
    }

    const effectiveDriverId = user?.role === 'DRIVER' ? (currentDriver?.id || driverId) : driverId;

    if (!effectiveDriverId) {
      setErrorMessage('Driver information is missing. Please refresh and try again.');
      return;
    }

    setLoading(true);
    try {
      await tripService.start({
        vehicleId: parseInt(vehicleId, 10),
        driverId: parseInt(effectiveDriverId, 10),
      });
      setSuccessMessage('Trip started successfully!');
      if (onRefresh) onRefresh();
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Error starting trip.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{user?.role === 'DRIVER' ? 'Start New Journey' : 'Dispatch Vehicle on Trip'}</h2>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>

        {fetchLoading ? (
          <div className="form-loading-state">Checking available fleet and driver profile...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="error-message" role="alert">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="success-message" role="alert">
                {successMessage}
              </div>
            )}

            {isDriverOnTrip && (
              <div className="notice-banner notice-error" style={{ marginBottom: '1rem' }}>
                You currently have an ongoing trip in progress. Please end your active trip from the journey list before dispatching another.
              </div>
            )}

            <label htmlFor="trip-vehicle">Available Vehicle</label>
            <select
              id="trip-vehicle"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              required
              disabled={loading || isDriverOnTrip}
            >
              <option value="">Select an Available Vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.licensePlate} ({v.model}) - {v.currentMileage || 0} km
                </option>
              ))}
            </select>
            {vehicles.length === 0 && (
              <small className="field-hint">No vehicles currently available for dispatch.</small>
            )}

            {user?.role === 'DRIVER' ? (
              <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                <label>Assigned Driver</label>
                <div style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span><strong>{user?.username}</strong> {currentDriver?.licenseNumber ? `(Lic: ${currentDriver.licenseNumber})` : ''}</span>
                  <span className={`status-badge status-${(currentDriver?.status || 'AVAILABLE').toLowerCase()}`}>
                    {currentDriver?.status || 'AVAILABLE'}
                  </span>
                </div>
              </div>
            ) : (
              <>
                <label htmlFor="trip-driver">Available Driver</label>
                <select
                  id="trip-driver"
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">Select a Driver</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.user?.username || `Driver #${d.id}`} (Lic: {d.licenseNumber})
                    </option>
                  ))}
                </select>
                {drivers.length === 0 && (
                  <small className="field-hint">No drivers currently available.</small>
                )}
              </>
            )}

            <div className="modal-actions">
              <button
                type="submit"
                disabled={
                  loading ||
                  vehicles.length === 0 ||
                  isDriverOnTrip ||
                  (user?.role !== 'DRIVER' && drivers.length === 0)
                }
                className="btn-primary"
              >
                {loading ? 'Starting...' : (user?.role === 'DRIVER' ? 'Start Trip' : 'Dispatch Vehicle')}
              </button>
              <button type="button" onClick={onClose} disabled={loading} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default TripForm;