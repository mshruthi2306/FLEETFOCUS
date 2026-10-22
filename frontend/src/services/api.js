import axios from 'axios';

const getBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    return `http://${window.location.hostname}:8080/api`;
  }
  return 'http://localhost:8080/api';
};

let client;
try {
  client = axios.create ? axios.create({ baseURL: getBaseUrl() }) : null;
} catch (e) {
  client = null;
}

if (!client || typeof client.get !== 'function') {
  client = axios;
}

const api = client;

if (api && api.interceptors?.request?.use) {
  api.interceptors.request.use((config) => {
    let token = localStorage.getItem('token');

    if (!token) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user && user.token) {
            token = user.token;
          }
        } catch (e) {
          // Ignore json parse error
        }
      }
    }

    if (token && config.headers) {
      const formatted = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      if (typeof config.headers.set === 'function') {
        config.headers.set('Authorization', formatted);
      } else {
        config.headers.Authorization = formatted;
        config.headers['Authorization'] = formatted;
      }
    }

    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response ? error.response.status : null;
      if (
        status === 401 ||
        (status === 403 &&
          (!localStorage.getItem('token') ||
            error.response?.data?.message?.includes('Authentication') ||
            error.response?.data?.message?.includes('expired') ||
            error.response?.data?.error === 'Unauthorized'))
      ) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      return Promise.reject(error);
    }
  );
}

export default api;