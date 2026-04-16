import axios from 'axios';

// Base API configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token header to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Backend expects `req.headers.authorization` (see `backend/middleware/authMiddleware.js`)
      config.headers.authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global response handling for auth failures
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      // Let AuthContext react to logout so protected routes update immediately.
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export const generateCommitMessage = async (changes) => {
  const response = await api.post('/generate-commit-message', { changes });
  // Return the messages array from the backend response
  if (response.data.messages && Array.isArray(response.data.messages)) {
    return response.data.messages;
  }
  // Fallback parsing for different response formats
  if (Array.isArray(response.data)) return response.data;
  if (response.data.suggestions) return response.data.suggestions;
  if (response.data.message) return [response.data.message];
  return ["Failed to parse AI response"];
};

export default api;
