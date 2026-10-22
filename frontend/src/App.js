import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useSelector, Provider } from 'react-redux';
import { store } from './store';
import { NotificationProvider } from './components/common/NotificationStack';
import Navbar from './components/layout/Navbar';
import Login from './components/Login';
import RegisterForm from './components/RegisterForm';
import VehicleList from './components/vehicles/VehicleList';
import TripList from './components/trips/TripList';
import MaintenanceList from './components/maintenance/MaintenanceList';
import LiveFleet from './components/dashboard/LiveFleet';
import StatCards from './components/dashboard/StatCards';
import StatusDonut from './components/dashboard/StatusDonut';
import DashboardHero from './components/dashboard/DashboardHero';
import RecentActivityFeed from './components/dashboard/RecentActivityFeed';
import { TruckIcon, WrenchIcon } from './components/common/Icons';
import vehicleService from './services/vehicleService';

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useSelector((state) => state.auth);
  if (!user) {
    return <Navigate to="/login" />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  return children;
}

function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const [vehicles, setVehicles] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const navigate = useNavigate();

  const loadData = useCallback(() => {
    if (!user) return;
    setFetchError(null);
    vehicleService
      .getAll(0, 100)
      .then((data) => {
        const vList = Array.isArray(data) ? data : data?.content || [];
        setVehicles(vList);
      })
      .catch((err) => {
        console.warn('Unable to load vehicles for dashboard:', err);
        setFetchError('Fleet metrics are temporarily unavailable. Backend is synchronizing.');
        setVehicles([]);
      });
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="dashboard">
      <div className="dashboard-header-row">
        <div>
          <h1>Dashboard Overview</h1>
          <p className="page-subtitle">Central dispatch, vehicle telemetry, and fleet operations metrics</p>
        </div>
        <button type="button" className="btn-secondary refresh-dashboard-btn" onClick={loadData}>
          Refresh Metrics
        </button>
      </div>

      <DashboardHero user={user} vehicleCount={vehicles.length} />

      {fetchError && (
        <div className="error-banner" role="alert">
          {fetchError}
          <button type="button" onClick={loadData} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {user?.role === 'FLEET_MANAGER' && (
        <>
          <StatCards vehicles={vehicles} />
          <StatusDonut vehicles={vehicles} />
          <div className="summary-card">
            <div className="summary-card-header">
              <TruckIcon size={22} color="#1065B4" />
              <h2>Active Fleet Telematics</h2>
            </div>
            <p>Monitor real-time vehicle GPS positions, speed limits, and route progress.</p>
            <button type="button" onClick={() => navigate('/live')}>View Live Fleet Map</button>
          </div>
          <RecentActivityFeed />
        </>
      )}

      {user?.role === 'DISPATCHER' && (
        <>
          <StatCards vehicles={vehicles} />
          <StatusDonut vehicles={vehicles} />
          <div className="summary-card">
            <div className="summary-card-header">
              <TruckIcon size={22} color="#1065B4" />
              <h2>Dispatch Command & Active Journeys</h2>
            </div>
            <p>Coordinate driver assignments, dispatch available vehicles, and monitor active transit routes.</p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => navigate('/trips')} className="btn-primary">
                Go to Trips & Dispatch
              </button>
              <button type="button" onClick={() => navigate('/live')} className="btn-secondary">
                View Live Fleet Map
              </button>
            </div>
          </div>
          <RecentActivityFeed />
        </>
      )}

      {user?.role === 'MAINTENANCE_TECH' && (
        <>
          <StatCards vehicles={vehicles} />
          <div className="summary-card">
            <div className="summary-card-header">
              <WrenchIcon size={22} color="#f59e0b" />
              <h2>Maintenance & Equipment Status</h2>
            </div>
            <p>Review active service tickets, inspection schedules, and cost logs.</p>
            <button type="button" onClick={() => navigate('/maintenance')}>Go to Maintenance Logs</button>
          </div>
          <RecentActivityFeed />
        </>
      )}

      {user?.role === 'DRIVER' && (
        <>
          <div className="summary-card">
            <div className="summary-card-header">
              <TruckIcon size={22} color="#1065B4" />
              <h2>Welcome back, Driver!</h2>
            </div>
            <p>Access your assigned dispatches, update route telemetry, and complete active journeys.</p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => navigate('/trips')} className="btn-primary">
                View Journey Log & Trips
              </button>
              <button
                type="button"
                onClick={() => navigate('/trips', { state: { openForm: true } })}
                className="btn-secondary"
              >
                + Start New Trip
              </button>
            </div>
          </div>
          <RecentActivityFeed />
        </>
      )}
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route
        path="/live"
        element={
          <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'DISPATCHER']}>
            <LiveFleet />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicles"
        element={
          <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'DISPATCHER', 'MAINTENANCE_TECH']}>
            <VehicleList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trips"
        element={
          <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'DISPATCHER', 'DRIVER']}>
            <TripList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/maintenance"
        element={
          <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'MAINTENANCE_TECH']}>
            <MaintenanceList />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <Provider store={store}>
      <NotificationProvider>
        <BrowserRouter>
          <Navbar />
          <AppRoutes />
        </BrowserRouter>
      </NotificationProvider>
    </Provider>
  );
}

export default App;