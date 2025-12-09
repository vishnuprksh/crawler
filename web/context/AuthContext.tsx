import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleOAuthProvider, googleLogout } from '@react-oauth/google';
import { api } from '../services/apiService';

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Replace with your actual Google Client ID
const GOOGLE_CLIENT_ID = "143497994262-um82rk2bphabp8bjsojig4qn1vu4cdeh.apps.googleusercontent.com";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      // Set default header for all requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      api.get('/auth/me')
         .then(res => setUser(res.data))
         .catch((err) => {
           console.error("Auth check failed", err);
           logout();
         });
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    googleLogout();
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
