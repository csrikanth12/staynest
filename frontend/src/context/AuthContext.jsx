import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on mount
    const loadUserFromStorage = async () => {
      try {
        const storedUser = localStorage.getItem('stayguard_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Optionally verify with server
          try {
            const meRes = await authService.getMe();
            if (meRes.success) {
              const updated = { ...parsedUser, ...meRes.data };
              setUser(updated);
              localStorage.setItem('stayguard_user', JSON.stringify(updated));
            }
          } catch (e) {
            console.warn('Session verification notice:', e.message);
          }
        }
      } catch (err) {
        console.error('Error loading user session:', err);
        localStorage.removeItem('stayguard_user');
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res.success && res.data) {
      setUser(res.data);
      localStorage.setItem('stayguard_user', JSON.stringify(res.data));
      return res.data;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success && res.data) {
      setUser(res.data);
      localStorage.setItem('stayguard_user', JSON.stringify(res.data));
      return res.data;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('stayguard_user');
  };

  const updateUser = (updatedData) => {
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem('stayguard_user', JSON.stringify(updated));
  };

  const isOwner = user?.role === 'owner' || user?.role === 'admin';
  const isCustomer = user?.role === 'customer';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isOwner,
        isCustomer,
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

export default AuthContext;
