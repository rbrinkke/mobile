import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useLogin } from '../hooks/useLogin';
import { authApi } from '../api/auth';
import { useAuthStore } from '../stores/authStore';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
  onLoginCodeSent?: (email: string, userId: string) => void;
  onSwitchToRegister?: () => void;
  onForgotPassword?: () => void;
}

export function LoginScreen({ onLoginSuccess, onLoginCodeSent, onSwitchToRegister, onForgotPassword }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '', code: '' });

  // Inline code verification state
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [loginUserId, setLoginUserId] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const loginMutation = useLogin();

  const verifyCodeMutation = useMutation({
    mutationFn: authApi.verifyLoginCode,
    onSuccess: (data) => {
      console.log('✅ Login code verified successfully');

      // Store tokens securely
      const expiresIn = data.expires_in || 900; // Default 15 minutes
      useAuthStore.getState().setTokens(
        data.access_token,
        data.refresh_token,
        expiresIn
      );

      // Give user visual feedback before navigation
      setTimeout(() => {
        onLoginSuccess?.();
      }, 800); // 800ms delay to show success state
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || error.message;
      console.log('❌ Login code verification failed:', errorMessage);
      setErrors(prev => ({ ...prev, code: errorMessage }));
      // Clear code inputs on error for retry
      setCode(['', '', '', '', '', '']);
      // Focus first input for easy retry
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    },
  });

  const resendCodeMutation = useMutation({
    mutationFn: () => authApi.resendLoginCode(email),
    onSuccess: () => {
      setErrors(prev => ({ ...prev, code: '' }));
      setCode(['', '', '', '', '', '']);
      // Focus first code input
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    },
    onError: (error: any) => {
      setErrors(prev => ({ ...prev, code: error.response?.data?.detail || error.message }));
    },
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'E-mailadres is verplicht' }));
      return false;
    }
    if (!emailRegex.test(email)) {
      setErrors(prev => ({ ...prev, email: 'Voer een geldig e-mailadres in' }));
      return false;
    }
    setErrors(prev => ({ ...prev, email: '' }));
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setErrors(prev => ({ ...prev, password: 'Wachtwoord is verplicht' }));
      return false;
    }
    if (password.length < 8) {
      setErrors(prev => ({ ...prev, password: 'Wachtwoord moet minimaal 8 tekens bevatten' }));
      return false;
    }
    setErrors(prev => ({ ...prev, password: '' }));
    return true;
  };

  const handleLogin = () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data: any) => {
          // Check if verification code was sent (multi-step login)
          if (data.requires_code) {
            console.log('✅ Login code sent, showing inline verification');
            setShowCodeInput(true);
            setLoginUserId(data.user_id);
            // Focus first code input after a brief delay
            setTimeout(() => inputRefs.current[0]?.focus(), 300);
          } else if (data.access_token) {
            // Direct login success (tokens received)
            console.log('✅ Direct login successful');
            onLoginSuccess?.();
          } else {
            // Organization selection or other flow (future implementation)
            console.log('⚠️ Unhandled login response type');
          }
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data?.detail || error.message;
          setErrors(prev => ({ ...prev, password: errorMessage }));
        },
      }
    );
  };

  const handleCodeChange = (text: string, index: number) => {
    // Check if pasted (multiple characters)
    if (text.length > 1) {
      // Paste detected! Extract 6 digits
      const digits = text.replace(/[^0-9]/g, '').slice(0, 6);
      if (digits.length === 6) {
        // Fill all 6 inputs
        const newCode = digits.split('');
        setCode(newCode);
        setErrors(prev => ({ ...prev, code: '' }));
        // Focus last input
        inputRefs.current[5]?.focus();
        // Auto-submit
        handleVerifyCode(digits);
        return;
      }
    }

    // Normal single digit input
    const digit = text.replace(/[^0-9]/g, '').slice(-1);

    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setErrors(prev => ({ ...prev, code: '' }));

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (digit && index === 5 && newCode.every(d => d)) {
      handleVerifyCode(newCode.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = (codeString?: string) => {
    const finalCode = codeString || code.join('');

    if (finalCode.length !== 6) {
      setErrors(prev => ({ ...prev, code: 'Voer de volledige 6-cijferige code in' }));
      return;
    }

    verifyCodeMutation.mutate({
      user_id: loginUserId,
      code: finalCode,
    });
  };

  const handleTryDifferentMethod = () => {
    setShowCodeInput(false);
    setCode(['', '', '', '', '', '']);
    setErrors({ email: '', password: '', code: '' });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Welkom terug</Text>
          <Text style={styles.subtitle}>Log in op je account</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>E-mailadres</Text>
          <TextInput
            style={[styles.input, errors.email ? styles.inputError : null]}
            placeholder="naam@bedrijf.nl"
            placeholderTextColor="#999"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrors(prev => ({ ...prev, email: '' }));
            }}
            onBlur={() => validateEmail(email)}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            editable={!showCodeInput}
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Wachtwoord</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput, errors.password ? styles.inputError : null]}
              placeholder="••••••••"
              placeholderTextColor="#999"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors(prev => ({ ...prev, password: '' }));
              }}
              onBlur={() => validatePassword(password)}
              secureTextEntry={!showPassword}
              autoComplete="password"
              editable={!showCodeInput}
            />
            <Pressable
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </Pressable>
          </View>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
        </View>

        {!showCodeInput && (
          <TouchableOpacity
            style={styles.forgotPasswordLink}
            onPress={onForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Wachtwoord vergeten?</Text>
          </TouchableOpacity>
        )}

        {!showCodeInput && (
          <TouchableOpacity
            style={[styles.button, loginMutation.isPending && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loginMutation.isPending}
            activeOpacity={0.8}
          >
            {loginMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>INLOGGEN</Text>
            )}
          </TouchableOpacity>
        )}

        {/* INLINE CODE VERIFICATION - Appears after login */}
        {showCodeInput && (
          <View style={styles.codeSection}>
            <View style={styles.codeSectionHeader}>
              <Text style={styles.codeSectionTitle}>Verificatiecode</Text>
              <Text style={styles.codeSectionSubtitle}>
                Voer de 6-cijferige code in die je per e-mail hebt ontvangen
              </Text>
            </View>

            <View style={styles.codeContainer}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => { inputRefs.current[index] = ref; }}
                  style={[
                    styles.codeInput,
                    digit ? styles.codeInputFilled : null,
                    errors.code ? styles.codeInputError : null,
                  ]}
                  value={digit}
                  onChangeText={text => handleCodeChange(text, index)}
                  onKeyPress={e => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  autoFocus={index === 0}
                />
              ))}
            </View>

            {errors.code ? <Text style={styles.errorText}>{errors.code}</Text> : null}

            {verifyCodeMutation.isSuccess && (
              <View style={styles.successIndicator}>
                <Text style={styles.successText}>✓ Code geverifieerd!</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, (verifyCodeMutation.isPending || verifyCodeMutation.isSuccess) && styles.buttonDisabled]}
              onPress={() => handleVerifyCode()}
              disabled={verifyCodeMutation.isPending || verifyCodeMutation.isSuccess || code.join('').length !== 6}
              activeOpacity={0.8}
            >
              {verifyCodeMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : verifyCodeMutation.isSuccess ? (
                <Text style={styles.buttonText}>✓ GELUKT</Text>
              ) : (
                <Text style={styles.buttonText}>VERIFIËREN</Text>
              )}
            </TouchableOpacity>

            <View style={styles.codeFooter}>
              <TouchableOpacity
                onPress={() => resendCodeMutation.mutate()}
                disabled={resendCodeMutation.isPending}
              >
                <Text style={[styles.codeFooterLink, resendCodeMutation.isPending && styles.codeFooterLinkDisabled]}>
                  {resendCodeMutation.isPending ? 'Verzenden...' : 'Code opnieuw versturen'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.codeFooterSeparator}> • </Text>
              <TouchableOpacity onPress={handleTryDifferentMethod}>
                <Text style={styles.codeFooterLink}>Andere methode</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!showCodeInput && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>Geen account? </Text>
            <TouchableOpacity onPress={onSwitchToRegister}>
              <Text style={styles.footerLink}>Registreer hier</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const TWENTS_RED = '#E6001A';
const LIGHT_GRAY = '#F8F8F8';
const DARK_GRAY = '#333333';
const BORDER_GRAY = '#E5E5E5';
const ERROR_RED = '#FF3B30';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: LIGHT_GRAY,
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: DARK_GRAY,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_GRAY,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: DARK_GRAY,
  },
  inputError: {
    borderColor: ERROR_RED,
    borderWidth: 2,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  eyeText: {
    fontSize: 20,
  },
  errorText: {
    color: ERROR_RED,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  button: {
    backgroundColor: TWENTS_RED,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: TWENTS_RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  forgotPasswordLink: {
    alignItems: 'flex-end',
    marginTop: 8,
    marginBottom: 4,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: TWENTS_RED,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  footerLink: {
    fontSize: 14,
    color: TWENTS_RED,
    fontWeight: '600',
  },
  // Inline code verification styles
  codeSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: BORDER_GRAY,
  },
  codeSectionHeader: {
    marginBottom: 20,
  },
  codeSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DARK_GRAY,
    marginBottom: 8,
    textAlign: 'center',
  },
  codeSectionSubtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  codeInput: {
    width: 45,
    height: 55,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: BORDER_GRAY,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: DARK_GRAY,
    marginHorizontal: 4,
  },
  codeInputFilled: {
    borderColor: TWENTS_RED,
    backgroundColor: '#FFF3F4',
  },
  codeInputError: {
    borderColor: ERROR_RED,
  },
  successIndicator: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  successText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  codeFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  codeFooterLink: {
    fontSize: 13,
    color: TWENTS_RED,
    fontWeight: '600',
  },
  codeFooterLinkDisabled: {
    opacity: 0.5,
  },
  codeFooterSeparator: {
    fontSize: 13,
    color: '#666',
    marginHorizontal: 8,
  },
});
