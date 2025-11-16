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
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';

interface EmailVerificationScreenProps {
  email: string;
  verificationToken: string;
  onVerificationSuccess?: () => void;
  onResendCode?: () => void;
}

export function EmailVerificationScreen({
  email,
  verificationToken,
  onVerificationSuccess,
}: EmailVerificationScreenProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const verifyMutation = useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: () => {
      console.log('✅ Email verified successfully');
      // Give user visual feedback before navigation
      setTimeout(() => {
        onVerificationSuccess?.();
      }, 800); // 800ms delay to show success state
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || error.message;
      console.log('❌ Email verification failed:', errorMessage);
      setError(errorMessage);
      // Clear code inputs on error for retry
      setCode(['', '', '', '', '', '']);
      // Focus first input for easy retry
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    },
  });

  const resendMutation = useMutation({
    mutationFn: authApi.resendVerification,
    onSuccess: () => {
      setError('');
      setCode(['', '', '', '', '', '']);
      // Focus first input
      inputRefs.current[0]?.focus();
    },
    onError: (error: any) => {
      setError(error.response?.data?.detail || error.message);
    },
  });

  const handleCodeChange = (text: string, index: number) => {
    // Check if pasted (multiple characters)
    if (text.length > 1) {
      // Paste detected! Extract 6 digits
      const digits = text.replace(/[^0-9]/g, '').slice(0, 6);
      if (digits.length === 6) {
        // Fill all 6 inputs
        const newCode = digits.split('');
        setCode(newCode);
        setError('');
        // Focus last input
        inputRefs.current[5]?.focus();
        // Auto-submit
        handleVerify(digits);
        return;
      }
    }

    // Normal single digit input
    const digit = text.replace(/[^0-9]/g, '').slice(-1);

    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (digit && index === 5 && newCode.every(d => d)) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = (codeString?: string) => {
    const finalCode = codeString || code.join('');

    if (finalCode.length !== 6) {
      setError('Voer de volledige 6-cijferige code in');
      return;
    }

    verifyMutation.mutate({
      verification_token: verificationToken,
      code: finalCode,
    });
  };

  const handleResend = () => {
    resendMutation.mutate(email);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Verifieer je e-mail</Text>
          <Text style={styles.subtitle}>
            Voer de code in die je per e-mail hebt ontvangen
          </Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => (inputRefs.current[index] = ref)}
              style={[
                styles.codeInput,
                digit ? styles.codeInputFilled : null,
                error ? styles.codeInputError : null,
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

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {verifyMutation.isSuccess && (
          <View style={styles.successIndicator}>
            <Text style={styles.successText}>✓ E-mail geverifieerd!</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, (verifyMutation.isPending || verifyMutation.isSuccess) && styles.buttonDisabled]}
          onPress={() => handleVerify()}
          disabled={verifyMutation.isPending || verifyMutation.isSuccess || code.join('').length !== 6}
          activeOpacity={0.8}
        >
          {verifyMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : verifyMutation.isSuccess ? (
            <Text style={styles.buttonText}>✓ GELUKT</Text>
          ) : (
            <Text style={styles.buttonText}>VERIFIEER</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Code niet ontvangen? </Text>
          <TouchableOpacity
            onPress={handleResend}
            disabled={resendMutation.isPending}
          >
            <Text style={[styles.footerLink, resendMutation.isPending && styles.footerLinkDisabled]}>
              {resendMutation.isPending ? 'Verzenden...' : 'Opnieuw versturen'}
            </Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    textAlign: 'center',
    color: TWENTS_RED,
    fontWeight: '600',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
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
  errorText: {
    color: ERROR_RED,
    fontSize: 12,
    marginTop: -16,
    marginBottom: 16,
    textAlign: 'center',
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
  footerLinkDisabled: {
    opacity: 0.5,
  },
});
