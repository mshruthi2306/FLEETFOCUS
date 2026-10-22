import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { TruckIcon } from './common/Icons';

function RegisterForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('DRIVER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.register({
        username,
        email,
        password,
        role,
      });
      // Redirect to login upon successful registration
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message || 'Registration failed';
      setError(typeof msg === 'string' ? msg : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="auth-card-container">
        <div className="auth-brand-badge">
          <TruckIcon size={28} color="#f59e0b" />
          <span>FleetFocus Telematics</span>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <h1>Create Account</h1>
          <p className="auth-subtitle">Join the real-time fleet delivery network</p>

          <label className="input-label">Username</label>
          <input
            type="text"
            placeholder="Choose a username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label className="input-label">Email Address</label>
          <input
            type="email"
            placeholder="you@company.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="input-label">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label className="input-label">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="role-select">
            <option value="DRIVER">Driver (Delivery Operator)</option>
            <option value="DISPATCHER">Dispatcher (Route Coordinator)</option>
            <option value="FLEET_MANAGER">Fleet Manager (Full Access)</option>
            <option value="MAINTENANCE_TECH">Maintenance Technician</option>
          </select>

          <button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

          {error && <div className="error-msg">{error}</div>}
        </form>

        <div className="auth-link-box">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;
