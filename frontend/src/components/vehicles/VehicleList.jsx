import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVehicles, deleteVehicle } from '../../store/slices/vehicleSlice';
import VehicleForm from './VehicleForm';
import { TruckIcon, VanIcon } from '../common/Icons';

function VehicleList() {
  const dispatch = useDispatch();
  const { items, pagination, loading } = useSelector((state) => state.vehicles);
  const { user } = useSelector((state) => state.auth);
  const [showForm, setShowForm] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('none');

  useEffect(() => {
    if (user) {
      dispatch(fetchVehicles({ page, size: 10 }));
    }
  }, [dispatch, page, user]);

  const handleAdd = () => {
    setSelectedVehicle(null);
    setShowForm(true);
  };

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to decommission this vehicle?')) {
      try {
        await dispatch(deleteVehicle(id)).unwrap();
        dispatch(fetchVehicles({ page, size: 10 }));
      } catch (err) {
        console.error('Failed to delete vehicle:', err);
      }
    }
  };

  const filteredVehicles = useMemo(() => {
    let result = [...items];

    if (statusFilter !== 'ALL') {
      result = result.filter((v) => v.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (v) =>
          v.licensePlate?.toLowerCase().includes(term) ||
          v.model?.toLowerCase().includes(term) ||
          v.vin?.toLowerCase().includes(term)
      );
    }

    if (sortBy === 'mileage-desc') {
      result.sort((a, b) => (b.currentMileage || 0) - (a.currentMileage || 0));
    } else if (sortBy === 'mileage-asc') {
      result.sort((a, b) => (a.currentMileage || 0) - (b.currentMileage || 0));
    } else if (sortBy === 'model') {
      result.sort((a, b) => (a.model || '').localeCompare(b.model || ''));
    }

    return result;
  }, [items, searchTerm, statusFilter, sortBy]);

  const counts = useMemo(() => {
    return {
      all: items.length,
      available: items.filter((v) => v.status === 'AVAILABLE').length,
      onTrip: items.filter((v) => v.status === 'ON_TRIP').length,
      maintenance: items.filter((v) => v.status === 'UNDER_MAINTENANCE').length,
    };
  }, [items]);

  return (
    <div className="vehicle-list">
      <div className="list-header">
        <div className="header-title-group">
          <div className="header-icon-badge">
            <TruckIcon size={24} color="#1065B4" />
          </div>
          <div>
            <h1>Vehicle Inventory</h1>
            <p className="page-subtitle">Manage fleet vehicles, operational status, and mileage metrics</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => dispatch(fetchVehicles({ page, size: 10 }))}
          >
            Refresh
          </button>
          {user?.role === 'FLEET_MANAGER' && (
            <button type="button" className="btn-primary" onClick={handleAdd}>
              + Add Vehicle
            </button>
          )}
        </div>
      </div>

      {/* Quick Summary Filters */}
      <div className="filter-pills-row">
        <button
          type="button"
          className={`filter-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => setStatusFilter('ALL')}
        >
          All ({counts.all})
        </button>
        <button
          type="button"
          className={`filter-pill pill-available ${statusFilter === 'AVAILABLE' ? 'active' : ''}`}
          onClick={() => setStatusFilter('AVAILABLE')}
        >
          Available ({counts.available})
        </button>
        <button
          type="button"
          className={`filter-pill pill-ontrip ${statusFilter === 'ON_TRIP' ? 'active' : ''}`}
          onClick={() => setStatusFilter('ON_TRIP')}
        >
          On Trip ({counts.onTrip})
        </button>
        <button
          type="button"
          className={`filter-pill pill-maintenance ${statusFilter === 'UNDER_MAINTENANCE' ? 'active' : ''}`}
          onClick={() => setStatusFilter('UNDER_MAINTENANCE')}
        >
          Under Maintenance ({counts.maintenance})
        </button>
      </div>

      {/* Search & Sort Controls */}
      <div className="table-controls-row">
        <input
          type="text"
          className="search-input"
          placeholder="Search by license plate, model, or VIN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="controls-right">
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="none">Sort: Default</option>
            <option value="mileage-desc">Mileage: High to Low</option>
            <option value="mileage-asc">Mileage: Low to High</option>
            <option value="model">Model: A to Z</option>
          </select>
          {searchTerm && (
            <button type="button" className="clear-btn" onClick={() => setSearchTerm('')}>
              Clear
            </button>
          )}
        </div>
      </div>

      {loading && items.length === 0 ? (
        <div className="state-card loading-card">Loading Fleet Assets...</div>
      ) : filteredVehicles.length === 0 ? (
        <div className="state-card empty-card">
          <TruckIcon size={32} color="#94a3b8" />
          <h3>No vehicles match your criteria</h3>
          <p>Try changing the filter or search keyword.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>VIN</th>
                <th>Plate</th>
                <th>Model</th>
                <th>Status</th>
                <th>Mileage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>
                    <span className="vin-cell">{vehicle.vin}</span>
                  </td>
                  <td>
                    <strong className="plate-badge">{vehicle.licensePlate}</strong>
                  </td>
                  <td>
                    <span className="vehicle-model-pill">
                      {vehicle.model?.toLowerCase().includes('van') ? (
                        <VanIcon size={16} color="#64748b" className="vehicle-row-icon" />
                      ) : (
                        <TruckIcon size={16} color="#1065B4" className="vehicle-row-icon" />
                      )}
                      <span className="model-name">{vehicle.model}</span>
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${vehicle.status?.toLowerCase()}`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="mileage-cell">
                    {(vehicle.currentMileage || 0).toLocaleString()} km
                  </td>
                  <td>
                    {user?.role === 'FLEET_MANAGER' ? (
                      <div className="action-buttons-group">
                        <button
                          type="button"
                          className="btn-action edit-btn"
                          onClick={() => handleEdit(vehicle)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-action delete-btn"
                          onClick={() => handleDelete(vehicle.id)}
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <span className="read-only-tag">View Only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span>
            Page {pagination.currentPage + 1} of {pagination.totalPages}
          </span>
          <button
            disabled={page >= pagination.totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {showForm && (
        <VehicleForm
          vehicle={selectedVehicle}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

export default VehicleList;