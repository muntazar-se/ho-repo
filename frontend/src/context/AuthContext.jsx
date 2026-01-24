import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService.js';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setLoading(false);
        // Verify token is still valid (don't wait for it)
        authService
          .getMe()
          .then((userData) => {
            setUser((prev) => {
              const next = {
                ...(prev || {}),
                ...(userData || {}),
              };
              // Preserve role if API response doesn't include it
              if (!next.role && prev?.role) {
                next.role = prev.role;
              }
              // Preserve token if API response doesn't include it
              if (!next.token && prev?.token) {
                next.token = prev.token;
              }
              localStorage.setItem('user', JSON.stringify(next));
              return next;
            });
          })
          .catch((err) => {
            const status = err?.response?.status;
            // Only logout when token is actually invalid/unauthorized.
            // Avoid logging users out on transient/network/server errors.
            if (status === 401 || status === 403) {
              logout();
            }
          });
      } catch (error) {
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      console.log('Attempting login with:', { username, API_URL: import.meta.env.VITE_API_URL });
      const response = await authService.login(username, password);
      console.log('Login response:', response);
      
      if (!response || !response.token) {
        throw new Error('Invalid response from server');
      }
      
      // Store in localStorage first
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response));
      
      // Update state immediately
      setUser(response);
      
      console.log('User state updated, isAuthenticated:', !!response);
      
      toast.success('Login successful!');
      return response;
    } catch (error) {
      console.error('Login error details:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

