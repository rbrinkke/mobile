import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { EmailVerificationScreen } from './src/screens/EmailVerificationScreen';
import { LoginVerificationScreen } from './src/screens/LoginVerificationScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { PasswordResetCodeScreen } from './src/screens/PasswordResetCodeScreen';
import MainNavigator from './src/navigation/MainNavigator';

const queryClient = new QueryClient();

type AuthScreen = 'login' | 'register' | 'verify-email' | 'login-verification' | 'forgot-password' | 'reset-password';

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
  const [passwordResetData, setPasswordResetData] = useState<{
    email: string;
    resetToken: string;
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

  const handleForgotPassword = () => {
    // Navigate to forgot password screen
    setCurrentScreen('forgot-password');
  };

  const handleResetCodeSent = (email: string, resetToken: string) => {
    // Store reset data and navigate to reset password screen
    setPasswordResetData({ email, resetToken });
    setCurrentScreen('reset-password');
  };

  const handleResetSuccess = () => {
    // After password reset, go back to login
    setPasswordResetData(null);
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
          ) : currentScreen === 'reset-password' && passwordResetData ? (
            <PasswordResetCodeScreen
              email={passwordResetData.email}
              resetToken={passwordResetData.resetToken}
              onResetSuccess={handleResetSuccess}
            />
          ) : currentScreen === 'forgot-password' ? (
            <ForgotPasswordScreen
              onCodeSent={handleResetCodeSent}
              onBack={() => setCurrentScreen('login')}
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
              onForgotPassword={handleForgotPassword}
            />
          )}
        </NavigationContainer>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

