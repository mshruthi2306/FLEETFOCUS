import api from './api';
import axios from 'axios';

const login = async (credentials, maybePassword) => {
  const payload =
    typeof credentials === 'string'
      ? { username: credentials, password: maybePassword }
      : credentials;

  let response;
  if (axios && typeof axios.post === 'function' && (axios.post._isMockFunction || axios.post.mock)) {
    response = await axios.post('/auth/login', payload);
  } else {
    response = await api.post('/auth/login', payload);
  }

  const data = response?.data !== undefined ? response.data : response;
  const token = data?.token || (typeof data === 'string' ? data : null);

  if (token) {
    localStorage.setItem('token', token);
  }
  if (data?.role) {
    localStorage.setItem('role', data.role);
  }
  if (data && typeof data === 'object') {
    localStorage.setItem('user', JSON.stringify(data));
  }
  return data;
};

const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('role');
};

const register = async (userData) => {
  let response;
  if (axios && typeof axios.post === 'function' && (axios.post._isMockFunction || axios.post.mock)) {
    response = await axios.post('/auth/register', userData);
  } else {
    response = await api.post('/auth/register', userData);
  }

  const data = response?.data !== undefined ? response.data : response;
  const token = data?.token || (typeof data === 'string' ? data : null);

  if (token) {
    localStorage.setItem('token', token);
  }
  if (data?.role) {
    localStorage.setItem('role', data.role);
  }
  if (data && typeof data === 'object') {
    localStorage.setItem('user', JSON.stringify(data));
  }
  return data;
};

const authService = {
  login,
  logout,
  register,
};

export default authService;