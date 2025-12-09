import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/apiService';

export const Login: React.FC = () => {
  const { login } = useAuth();

  const onSuccess = async (credentialResponse: any) => {
    try {
      const res = await api.post('/auth/google', {
        token: credentialResponse.credential
      });
      login(res.data.access_token);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Welcome to Crawler</h1>
      <p style={{ color: '#666' }}>Please sign in to continue</p>
      <GoogleLogin
        onSuccess={onSuccess}
        onError={() => {
          console.log('Login Failed');
        }}
      />
    </div>
  );
};
