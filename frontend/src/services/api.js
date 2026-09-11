import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('devtrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error formatting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Clear invalid token if expired
        if (error.response.data?.code === 'TOKEN_EXPIRED' || error.response.data?.code === 'INVALID_TOKEN') {
          localStorage.removeItem('devtrack_token');
          localStorage.removeItem('devtrack_user');
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
            window.location.href = '/login?expired=true';
          }
        }
      }
      return Promise.reject(new Error(error.response.data?.message || 'A server error occurred.'));
    }
    if (error.request) {
      return Promise.reject(new Error('Cannot reach the DevTrack server. Please check your network or server connection.'));
    }
    return Promise.reject(error);
  }
);

export default api;
