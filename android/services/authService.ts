import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

let GoogleSignin: any;

if (Platform.OS === 'web') {
  console.warn('Using mock Google Sign-In for Web');
  GoogleSignin = {
    configure: () => {},
    hasPlayServices: async () => true,
    signIn: async () => {
      return {
        data: {
          user: {
            id: 'web-mock-id',
            email: 'web-mock@example.com',
            name: 'Web Mock User',
            photo: 'https://via.placeholder.com/150',
            familyName: 'User',
            givenName: 'Web Mock'
          }
        }
      };
    },
    getTokens: async () => ({ idToken: 'mock-web-id-token' }),
    signOut: async () => {},
  };
} else {
  try {
    const googleSigninModule = require('@react-native-google-signin/google-signin');
    GoogleSignin = googleSigninModule.GoogleSignin;
  } catch (error) {
    console.warn('GoogleSignin module not found, using mock implementation');
    GoogleSignin = {
      configure: () => {},
      hasPlayServices: async () => true,
      signIn: async () => {
        throw new Error('Google Sign-In is not supported in Expo Go. Please use a development build.');
      },
      getTokens: async () => ({ idToken: '' }),
      signOut: async () => {},
    };
  }
}

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://192.168.1.100:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios interceptor to attach JWT token to all requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Axios interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('token');
      // Redirect to login screen
    }
    return Promise.reject(error);
  }
);

export const initializeGoogleSignIn = async (clientId: string) => {
  try {
    GoogleSignin.configure({
      webClientId: clientId, // Web client ID for backend communication
      scopes: ['profile', 'email'],
    });
  } catch (error) {
    console.error('Google Sign-In initialization failed:', error);
    throw error;
  }
};

export const googleSignIn = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    // Get the ID token
    const tokens = await GoogleSignin.getTokens();
    const idToken = tokens.idToken;
    
    if (!idToken) {
      throw new Error('No ID token received from Google');
    }
    
    // Send to backend for verification and JWT creation
    const response = await api.post('/auth/google', { token: idToken });
    
    // Store the JWT locally
    await AsyncStorage.setItem('token', response.data.access_token);
    
    return response.data;
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    throw error;
  }
};

export const googleSignOut = async () => {
  try {
    await GoogleSignin.signOut();
    await AsyncStorage.removeItem('token');
  } catch (error) {
    console.error('Google Sign-Out failed:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      return null;
    }
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
};

export const isUserAuthenticated = async () => {
  const token = await AsyncStorage.getItem('token');
  return !!token;
};
