import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import MainNavigator from './src/navigation/MainNavigator';

const queryClient = new QueryClient();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowRegister(false);
  };

  const handleRegisterSuccess = () => {
    // After successful registration, switch to login
    setShowRegister(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer>
          {isLoggedIn ? (
            <MainNavigator />
          ) : showRegister ? (
            <RegisterScreen
              onRegisterSuccess={handleRegisterSuccess}
              onSwitchToLogin={() => setShowRegister(false)}
            />
          ) : (
            <LoginScreen
              onLoginSuccess={handleLoginSuccess}
              onSwitchToRegister={() => setShowRegister(true)}
            />
          )}
        </NavigationContainer>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

