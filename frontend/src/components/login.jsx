import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../store/slices/authSlice';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await dispatch(
      login({
        username,
        password,
      })
    );

    if (!result.error) {
      navigate('/');
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit}>
        <h1>FleetFocus Login</h1>

        {/* Username */}
        <input
          id="username"
          name="username"
          type="text"
          aria-label="username"
          placeholder="Enter your username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* Password */}
        <input
          id="password"
          name="password"
          type="password"
          aria-label="password"
          placeholder="••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Login Button */}
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {/* Error */}
        {error && (
          <div className="error-msg">
            {error}
          </div>
        )}

        <div className="auth-link-box">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;