import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const decodeJwt = (token) => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;

  const payload = parts[1]
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  // Base64url padding
  const pad = payload.length % 4;
  const padded = pad ? payload + '='.repeat(4 - pad) : payload;

  try {
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeJwt(token);
      const userId = decoded?.id;
      if (userId) {
        setUser({ id: userId, token });
        localStorage.setItem('userId', userId);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/user/login', { email, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      const decoded = decodeJwt(token);
      const userId = decoded?.id;
      if (userId) localStorage.setItem('userId', userId);
      setUser({ id: userId, token });
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const signup = async (username, email, password) => {
    try {
      const response = await api.post('/user/signup', { username, email, password });
      const { token } = response.data;
      localStorage.setItem('token', token);

      const decoded = decodeJwt(token);
      const userId = decoded?.id;
      if (userId) localStorage.setItem('userId', userId);
      setUser({ id: userId, token });

      return response.data;
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUser(null);
  };

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    user,
    loading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
