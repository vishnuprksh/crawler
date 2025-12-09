import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { useAuth } from '../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [error, setError] = React.useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setError(null);
      await login();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Crawler</Text>
        <Text style={styles.subtitle}>Stay updated with personalized news feeds</Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <TouchableOpacity onPress={handleSignIn} style={styles.signInButton}>
            <Text style={styles.signInText}>Sign in with Google</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    gap: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  errorContainer: {
    backgroundColor: '#fee',
    borderColor: '#f88',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    width: '100%',
  },
  errorText: {
    color: '#c33',
    fontSize: 14,
    textAlign: 'center',
  },
  signInButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 10,
  },
  signInText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
