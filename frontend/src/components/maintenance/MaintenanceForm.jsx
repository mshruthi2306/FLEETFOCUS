import React, { useEffect, useState } from 'react';
import vehicleService from '../../services/vehicleService';
import userService from '../../services/userService';
import maintenanceService from '../../services/maintenanceService';

function MaintenanceForm({ log, onRefresh, onClose }) {
  const [vehicles, setVehicles] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [vehicleId, setVehicleId] = useState(log?.vehicle?.id ? String(log.vehicle.id) : '');
  const [technicianId, setTechnicianId] = useState(log?.technician?.id ? String(log.technician.id) : '');
  const [serviceDate, setServiceDate] = useState(
    log?.serviceDate || new Date().toISOString().split('T')[0]
  );
  const [description, setDescription] = useState(log?.description || '');
  const [cost, setCost] = useState(log?.cost != null ? String(log.cost) : '');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([vehicleService.getAll(0, 100), userService.getTechnicians()])
      .then(([vehResult, techResult]) => {
        if (!isMounted) return;

        if (vehResult.status === 'fulfilled') {
          const vData = vehResult.value;
          const vList = Array.isArray(vData) ? vData : (vData?.content || []);
          setVehicles(vList);
        }

        if (techResult.status === 'fulfilled') {
          const tData = techResult.value;
          setTechnicians(Array.isArray(tData) ? tData : []);
        }
      })
      .finally(() => {
        if (isMounted) setInitialLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent duplicate submissions

    setErrorMessage('');
    setSuccessMessage('');

    if (!vehicleId) {
      setErrorMessage('Please select a vehicle.');
      return;
    }
    if (!technicianId) {
      setErrorMessage('Please select a technician.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Please provide a description.');
      return;
    }

    const parsedCost = parseFloat(cost);
    if (isNaN(parsedCost) || parsedCost < 0) {
      setErrorMessage('Please enter a valid non-negative cost.');
      return;
    }

    setLoading(true);

    const payload = {
      vehicle: { id: parseInt(vehicleId, 10) },
      technician: { id: parseInt(technicianId, 10) },
      serviceDate,
      description: description.trim(),
      cost: parsedCost,
    };

    try {
      if (log && log.id) {
        await maintenanceService.update(log.id, payload);
        setSuccessMessage('Maintenance record updated successfully!');
      } else {
        await maintenanceService.log(payload);
        setSuccessMessage('Maintenance record logged successfully!');
      }

      if (onRefresh) {
        onRefresh();
      }

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Error saving maintenance record.';
      setErrorMessage(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{log ? 'Edit Maintenance Record' : 'Log Maintenance'}</h2>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>

        {initialLoading ? (
          <div className="form-loading-state">Loading fleet assets & technicians...</div>
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

            <label htmlFor="maint-vehicle">Vehicle</label>
            <select
              id="maint-vehicle"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              required
              disabled={loading}
            >
              <option value="">Select a Vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.licensePlate} ({v.model})
                </option>
              ))}
            </select>

            <label htmlFor="maint-tech">Technician</label>
            <select
              id="maint-tech"
              value={technicianId}
              onChange={(e) => setTechnicianId(e.target.value)}
              required
              disabled={loading}
            >
              <option value="">Select a Tech</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.username} {t.email ? `(${t.email})` : ''}
                </option>
              ))}
            </select>

            <label htmlFor="maint-date">Service Date</label>
            <input
              id="maint-date"
              type="date"
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              required
              disabled={loading}
            />

            <label htmlFor="maint-desc">Description</label>
            <textarea
              id="maint-desc"
              placeholder="What was fixed or serviced?"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={3}
            />

            <label htmlFor="maint-cost">Cost ($)</label>
            <input
              id="maint-cost"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0.00"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              disabled={loading}
            />

            <div className="modal-actions">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? (log ? 'Updating...' : 'Saving...') : log ? 'Update Record' : 'Save Record'}
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

export default MaintenanceForm;