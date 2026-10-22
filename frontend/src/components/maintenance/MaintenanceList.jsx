import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import maintenanceService from '../../services/maintenanceService';
import MaintenanceForm from './MaintenanceForm';
import { WrenchIcon, ClockIcon } from '../common/Icons';

function MaintenanceList() {
  const { user } = useSelector((state) => state.auth);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionNotice, setActionNotice] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await maintenanceService.getAll();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Unable to load maintenance records. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user]);

  const handleCreate = () => {
    setSelectedLog(null);
    setShowForm(true);
  };

  const handleEdit = (log) => {
    setSelectedLog(log);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await maintenanceService.delete(id);
      setActionNotice({ type: 'success', text: 'Maintenance record deleted successfully.' });
      setDeleteConfirmId(null);
      fetchLogs();
    } catch (err) {
      setActionNotice({
        type: 'error',
        text: err.response?.data?.message || 'Failed to delete maintenance record.',
      });
    } finally {
      setDeletingId(null);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const filteredLogs = useMemo(() => {
    if (!searchTerm.trim()) return logs;
    const term = searchTerm.toLowerCase();
    return logs.filter((log) => {
      const plate = log.vehicle?.licensePlate?.toLowerCase() || '';
      const model = log.vehicle?.model?.toLowerCase() || '';
      const tech = log.technician?.username?.toLowerCase() || '';
      const desc = log.description?.toLowerCase() || '';
      const date = log.serviceDate?.toString() || '';
      return (
        plate.includes(term) ||
        model.includes(term) ||
        tech.includes(term) ||
        desc.includes(term) ||
        date.includes(term)
      );
    });
  }, [logs, searchTerm]);

  const totalCost = useMemo(() => {
    return logs.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
  }, [logs]);

  return (
    <div className="maintenance-list">
      <div className="list-header">
        <div className="header-title-group">
          <div className="header-icon-badge">
            <WrenchIcon size={24} color="#1065B4" />
          </div>
          <div>
            <h1>Fleet Maintenance Records</h1>
            <p className="page-subtitle">Track servicing, repairs, and associated maintenance costs</p>
          </div>
        </div>

        <div className="header-actions">
          <button type="button" onClick={fetchLogs} className="btn-secondary" title="Refresh records">
            Refresh
          </button>
          {(user?.role === 'FLEET_MANAGER' || user?.role === 'MAINTENANCE_TECH') && (
            <button type="button" className="btn-primary" onClick={handleCreate}>
              + Log Maintenance
            </button>
          )}
        </div>
      </div>

      {actionNotice && (
        <div className={`notice-banner ${actionNotice.type === 'success' ? 'notice-success' : 'notice-error'}`}>
          {actionNotice.text}
        </div>
      )}

      {error && (
        <div className="error-banner" role="alert">
          {error}
          <button type="button" onClick={fetchLogs} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* Metrics Bar */}
      <div className="maintenance-metrics-bar">
        <div className="m-metric-card">
          <span className="metric-label">Total Records</span>
          <span className="metric-val">{logs.length}</span>
        </div>
        <div className="m-metric-card">
          <span className="metric-label">Total Servicing Cost</span>
          <span className="metric-val text-cost">
            ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="m-metric-card">
          <span className="metric-label">Active Technicians</span>
          <span className="metric-val">
            {new Set(logs.map((l) => l.technician?.username).filter(Boolean)).size}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="table-controls-row">
        <input
          type="text"
          className="search-input"
          placeholder="Search by vehicle, technician, date or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button type="button" className="clear-btn" onClick={() => setSearchTerm('')}>
            Clear
          </button>
        )}
      </div>

      {/* Table Content */}
      {loading && logs.length === 0 ? (
        <div className="state-card loading-card">Loading Service Records...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="state-card empty-card">
          <WrenchIcon size={32} color="#94a3b8" />
          <h3>No maintenance records found</h3>
          <p>{searchTerm ? 'Try adjusting your search query.' : 'Click "+ Log Maintenance" to record service.'}</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Vehicle</th>
                <th>Technician</th>
                <th>Description</th>
                <th>Cost</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <span className="record-tag">MNT-{log.id}</span>
                  </td>
                  <td>
                    <span className="date-cell">
                      <ClockIcon size={13} color="#64748b" />
                      {log.serviceDate
                        ? new Date(log.serviceDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'N/A'}
                    </span>
                  </td>
                  <td>
                    <div className="vehicle-cell-info">
                      <strong>{log.vehicle?.licensePlate || 'N/A'}</strong>
                      <span className="sub-model">{log.vehicle?.model || ''}</span>
                    </div>
                  </td>
                  <td>
                    <span className="tech-badge">
                      {log.technician?.username || 'Unassigned'}
                    </span>
                  </td>
                  <td className="desc-cell">{log.description || '-'}</td>
                  <td className="cost-cell text-error">
                    ${(Number(log.cost) || 0).toFixed(2)}
                  </td>
                  <td className="actions-cell">
                    {(user?.role === 'FLEET_MANAGER' || user?.role === 'MAINTENANCE_TECH') ? (
                      <div className="action-buttons-group">
                        <button
                          type="button"
                          className="btn-action edit-btn"
                          onClick={() => handleEdit(log)}
                        >
                          Edit
                        </button>
                        {deleteConfirmId === log.id ? (
                          <div className="confirm-delete-inline">
                            <span className="confirm-text">Delete?</span>
                            <button
                              type="button"
                              className="btn-danger-confirm"
                              disabled={deletingId === log.id}
                              onClick={() => handleDelete(log.id)}
                            >
                              {deletingId === log.id ? 'Deleting...' : 'Yes'}
                            </button>
                            <button
                              type="button"
                              className="btn-cancel-confirm"
                              onClick={() => setDeleteConfirmId(null)}
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn-action delete-btn"
                            onClick={() => setDeleteConfirmId(log.id)}
                          >
                            Delete
                          </button>
                        )}
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

      {showForm && (
        <MaintenanceForm
          log={selectedLog}
          onRefresh={fetchLogs}
          onClose={() => {
            setShowForm(false);
            setSelectedLog(null);
          }}
        />
      )}
    </div>
  );
}

export default MaintenanceList;