import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user profile on mount if token exists
  const loadUser = useCallback(async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.getMe();
      if (response && response.success) {
        // Backend could return data.user or data directly
        const userData = response.data?.user || response.data;
        setUser(userData);
      } else {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.warn('Failed to restore session:', err?.response?.data?.error?.message || err.message);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();

    // Listen for 401 unauthorized events dispatched by axios interceptor
    const handleUnauthorized = () => {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setLoading(false);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [loadUser]);

  // Login handler
  const login = async (credentials) => {
    const response = await authApi.login(credentials);
    if (response && response.success) {
      const responseToken = response.data?.token;
      const userData = response.data?.user || (response.data?.token ? { ...response.data, token: undefined } : response.data);

      if (responseToken) {
        localStorage.setItem('token', responseToken);
        setToken(responseToken);
      }
      if (userData) {
        setUser(userData);
      }
      return response;
    }
    throw new Error(response?.error?.message || 'Login failed');
  };

  // Register handler
  const register = async (userDataInput) => {
    const response = await authApi.register(userDataInput);
    if (response && response.success) {
      const responseToken = response.data?.token;
      const userData = response.data?.user || (response.data?.token ? { ...response.data, token: undefined } : response.data);

      if (responseToken) {
        localStorage.setItem('token', responseToken);
        setToken(responseToken);
      }
      if (userData) {
        setUser(userData);
      }
      return response;
    }
    throw new Error(response?.error?.message || 'Registration failed');
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Direct user update helper (e.g. after profile edit)
  const updateUser = (newUserData) => {
    setUser((prev) => ({ ...prev, ...newUserData }));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
    updateUser,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
