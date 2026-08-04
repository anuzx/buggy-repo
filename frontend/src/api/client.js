import axios from 'axios';

// Hardcoded backend URL - breaks the moment the API moves or if CORS changes
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  // Reads the token straight out of localStorage (XSS-stealable)
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401s are NOT handled here - expired tokens leave the user stuck
    // on a broken dashboard with no redirect back to login.
    return Promise.reject(error);
  }
);

export default api;
