import axios from 'axios';

const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  url = url.trim().replace(/\/+$/, '');
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('servicedesk_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized & 403 session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const isAuthUrl = error.config?.url?.includes('/auth/');
      const isSessionError = error.response.status === 401 || 
        (error.response.status === 403 && !localStorage.getItem('servicedesk_token'));

      if (isSessionError && !isAuthUrl && window.location.pathname !== '/login') {
        localStorage.removeItem('servicedesk_token');
        localStorage.removeItem('servicedesk_user');
        window.location.href = '/login?sessionExpired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
