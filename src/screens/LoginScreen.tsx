import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLogin } from '../hooks/useLogin';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('testuser@example.com');
  const [password, setPassword] = useState('SuperSecure2024Password');

  const loginMutation = useLogin();

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Vul email en wachtwoord in');
      return;
    }

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          console.log('✅ Login successful, calling onLoginSuccess callback');
          // Call the callback to navigate to main screen
          onLoginSuccess?.();
        },
        onError: (error: any) => {
          Alert.alert(
            '❌ Login Failed',
            error.response?.data?.detail || error.message
          );
        },
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚀 Activity Platform</Text>
      <Text style={styles.subtitle}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Wachtwoord"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, loginMutation.isPending && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Inloggen</Text>
        )}
      </TouchableOpacity>

      {loginMutation.isError && (
        <Text style={styles.errorText}>
          ❌ {loginMutation.error?.message || 'Login failed'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff3b30',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
});
