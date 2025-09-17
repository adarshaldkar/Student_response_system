import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Force localhost for development
const BACKEND_URL = 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;
console.log('AuthContext - Backend URL:', BACKEND_URL);
console.log('AuthContext - API base:', API);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Global axios interceptor for handling auth errors
  const setupAxiosInterceptors = () => {
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          // Only logout if we have a token (avoid infinite loops)
          if (localStorage.getItem('token')) {
            console.log('Auth error detected, logging out');
            logout();
          }
        }
        return Promise.reject(error);
      }
    );
  };

  // Setup interceptors once
  useEffect(() => {
    setupAxiosInterceptors();
  }, []);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isInitialized, setIsInitialized] = useState(false);

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        const newToken = e.newValue;
        if (newToken !== token) {
          console.log('Token changed in another tab, syncing...');
          setToken(newToken);
          if (newToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          } else {
            delete axios.defaults.headers.common['Authorization'];
          }
        }
      }
      
      if (e.key === 'user') {
        const newUser = e.newValue ? JSON.parse(e.newValue) : null;
        console.log('User changed in another tab, syncing...');
        setUser(newUser);
      }
      
      // Handle logout from another tab
      if (e.key === 'logout_event') {
        console.log('Logout detected from another tab');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [token]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // If we have user data saved, we can immediately set loading to false
      if (user) {
        setLoading(false);
        setIsInitialized(true);
        // Still fetch to ensure data is up to date, but don't block UI
        fetchCurrentUser();
      } else {
        // No saved user data, need to fetch
        fetchCurrentUser();
      }
    } else {
      setLoading(false);
      setIsInitialized(true);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setLoading(false);
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      // Only logout if the token is actually invalid (401/403)
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('Token invalid, logging out');
        logout();
      } else {
        // For network errors, keep the user logged in but stop loading
        console.log('Network error, keeping user session');
        setLoading(false);
        setIsInitialized(true);
      }
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, {
        username,
        password
      });
      
      const { access_token, role, user_id } = response.data;
      
      // Set token and headers first
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      
      // Fetch user details
      await fetchCurrentUser();
      
      // Trigger cross-tab sync
      localStorage.setItem('login_event', Date.now().toString());
      
      return { success: true, role };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  const register = async (username, email, password, role = 'admin') => {
    try {
      const response = await axios.post(`${API}/auth/register`, {
        username,
        email,
        password,
        role
      });
      
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Fetch user details
      await fetchCurrentUser();
      
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    // Clear local state first
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    
    // Clear storage and trigger cross-tab sync
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.setItem('logout_event', Date.now().toString());
    
    // Clean up sync event
    setTimeout(() => {
      localStorage.removeItem('logout_event');
    }, 1000);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isInitialized,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};