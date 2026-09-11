import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('devtrack_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('devtrack_token') || null);
  const [loading, setLoading] = useState(true);

  // Verify token & sync current user on load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('devtrack_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('devtrack_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session verification failed, logging out.');
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('devtrack_token', receivedToken);
      localStorage.setItem('devtrack_user', JSON.stringify(receivedUser));
      return receivedUser;
    }
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('devtrack_token', receivedToken);
      localStorage.setItem('devtrack_user', JSON.stringify(receivedUser));
      return receivedUser;
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('devtrack_token');
    localStorage.removeItem('devtrack_user');
  }, []);

  const updateProfile = async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    if (res?.data?.success && res?.data?.user) {
      setUser(res.data.user);
      localStorage.setItem('devtrack_user', JSON.stringify(res.data.user));
      return res.data.user;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
