import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { EmailVerificationScreen } from './src/screens/EmailVerificationScreen';
import { LoginVerificationScreen } from './src/screens/LoginVerificationScreen';
import MainNavigator from './src/navigation/MainNavigator';

const queryClient = new QueryClient();

type AuthScreen = 'login' | 'register' | 'verify-email' | 'login-verification';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('login');
  const [verificationData, setVerificationData] = useState<{
    email: string;
    token: string;
  } | null>(null);
  const [loginVerificationData, setLoginVerificationData] = useState<{
    email: string;
    userId: string;
  } | null>(null);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLoginCodeSent = (email: string, userId: string) => {
    // Store login verification data and navigate to login verification
    setLoginVerificationData({ email, userId });
    setCurrentScreen('login-verification');
  };

  const handleLoginVerificationSuccess = (accessToken: string, refreshToken: string) => {
    // After login code verified, user is logged in
    console.log('✅ Login verification complete, tokens received');
    // TODO: Store tokens securely
    setLoginVerificationData(null);
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
          ) : currentScreen === 'login-verification' && loginVerificationData ? (
            <LoginVerificationScreen
              email={loginVerificationData.email}
              userId={loginVerificationData.userId}
              onVerificationSuccess={handleLoginVerificationSuccess}
            />
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
              onLoginCodeSent={handleLoginCodeSent}
              onSwitchToRegister={() => setCurrentScreen('register')}
            />
          )}
        </NavigationContainer>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

