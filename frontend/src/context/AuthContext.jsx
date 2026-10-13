import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('docupulse_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('docupulse_token');
      const storedUser = localStorage.getItem('docupulse_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Verify with backend silently
          const res = await authAPI.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('docupulse_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session verification failed, clearing auth state');
          localStorage.removeItem('docupulse_token');
          localStorage.removeItem('docupulse_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('docupulse_token', res.token);
      localStorage.setItem('docupulse_user', JSON.stringify(res.user));
    }
    return res;
  };

  const loginAsDemo = async () => {
    return login('demo@docupulse.ai', 'DocuPulse2026!');
  };

  const register = async (name, email, password, role = 'analyst') => {
    const res = await authAPI.register({ name, email, password, role });
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('docupulse_token', res.token);
      localStorage.setItem('docupulse_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('docupulse_token');
    localStorage.removeItem('docupulse_user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        loading,
        login,
        loginAsDemo,
        register,
        logout,
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
