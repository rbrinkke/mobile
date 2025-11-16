import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { EmailVerificationScreen } from './src/screens/EmailVerificationScreen';
import MainNavigator from './src/navigation/MainNavigator';

const queryClient = new QueryClient();

type AuthScreen = 'login' | 'register' | 'verify-email';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('login');
  const [verificationData, setVerificationData] = useState<{
    email: string;
    token: string;
  } | null>(null);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleRegisterSuccess = (email: string, verificationToken: string) => {
    // Store verification data and navigate to email verification
    setVerificationData({ email, token: verificationToken });
    setCurrentScreen('verify-email');
  };

  const handleVerificationSuccess = () => {
    // After email verified, go to login
    setVerificationData(null);
    setCurrentScreen('login');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer>
          {isLoggedIn ? (
            <MainNavigator />
          ) : currentScreen === 'verify-email' && verificationData ? (
            <EmailVerificationScreen
              email={verificationData.email}
              verificationToken={verificationData.token}
              onVerificationSuccess={handleVerificationSuccess}
            />
          ) : currentScreen === 'register' ? (
            <RegisterScreen
              onRegisterSuccess={handleRegisterSuccess}
              onSwitchToLogin={() => setCurrentScreen('login')}
            />
          ) : (
            <LoginScreen
              onLoginSuccess={handleLoginSuccess}
              onSwitchToRegister={() => setCurrentScreen('register')}
            />
          )}
        </NavigationContainer>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

