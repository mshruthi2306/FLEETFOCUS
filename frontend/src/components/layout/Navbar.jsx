import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { TruckIcon } from '../common/Icons';

function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const roleDisplay = user.role ? user.role.replace('_', ' ') : 'USER';

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <div className="brand-logo-badge">
          <TruckIcon size={20} color="#ffffff" />
        </div>
        <span className="brand-title">Fleet<span className="brand-accent">Focus</span></span>
      </div>

      <div className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active-link' : '')}>
          Dashboard
        </NavLink>
        {(user.role === 'FLEET_MANAGER' || user.role === 'DISPATCHER' || user.role === 'MAINTENANCE_TECH') && (
          <NavLink to="/vehicles" className={({ isActive }) => (isActive ? 'active-link' : '')}>
            Vehicles
          </NavLink>
        )}
        {(user.role === 'FLEET_MANAGER' || user.role === 'DISPATCHER' || user.role === 'DRIVER') && (
          <NavLink to="/trips" className={({ isActive }) => (isActive ? 'active-link' : '')}>
            Trips
          </NavLink>
        )}
        {(user.role === 'FLEET_MANAGER' || user.role === 'MAINTENANCE_TECH') && (
          <NavLink to="/maintenance" className={({ isActive }) => (isActive ? 'active-link' : '')}>
            Maintenance
          </NavLink>
        )}
        {(user.role === 'FLEET_MANAGER' || user.role === 'DISPATCHER') && (
          <NavLink to="/live" className={({ isActive }) => (isActive ? 'active-link' : '')}>
            Live Fleet
          </NavLink>
        )}
      </div>

      <div className="navbar-user">
        <div className="user-profile-badge">
          <span className="user-name">{user.username}</span>
          <span className="user-role-tag">{roleDisplay}</span>
        </div>
        <button type="button" className="logout-btn" onClick={handleLogout} title="Log out of FleetFocus">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;