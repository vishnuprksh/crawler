import React, { useEffect, createContext, useContext, useState } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeGoogleSignIn, googleSignOut as signOutGoogle } from '../services/authService';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Replace with your actual Android Google Client ID
const GOOGLE_ANDROID_CLIENT_ID = '143497994262-r450c42d28tnpk16jdbtn9a7h3530d8p.apps.googleusercontent.com';

// Replace with your Web Client ID (backend communication)
const GOOGLE_WEB_CLIENT_ID = '143497994262-um82rk2bphabp8bjsojig4qn1vu4cdeh.apps.googleusercontent.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('token');
        if (savedToken) {
          setToken(savedToken);
          // Optionally verify token with backend
          // const userInfo = await fetchUserInfo(savedToken);
          // setUser(userInfo);
        }
        // Initialize Google Sign-In
        await initializeGoogleSignIn(GOOGLE_WEB_CLIENT_ID);
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async () => {
    try {
      setIsLoading(true);
      // Import the auth service function
      const { googleSignIn } = await import('../services/authService');
      const result = await googleSignIn();
      
      setToken(result.access_token);
      // Set user from token data or fetch from backend
      setUser({
        id: result.user_id || '',
        email: result.email || '',
        name: result.name || '',
        picture: result.picture,
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await signOutGoogle();
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuth = async () => {
    const savedToken = await AsyncStorage.getItem('token');
    return !!savedToken;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        logout,
        checkAuth,
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
