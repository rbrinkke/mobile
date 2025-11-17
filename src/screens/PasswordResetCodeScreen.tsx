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
import { authApi } from '../api/auth';

interface PasswordResetCodeScreenProps {
  email: string;
  resetToken: string;
  onResetSuccess?: () => void;
  onResendCode?: () => void;
}

export function PasswordResetCodeScreen({
  email,
  resetToken,
  onResetSuccess,
}: PasswordResetCodeScreenProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ code: '', password: '' });
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const resetMutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      console.log('✅ Password reset successfully');
      // Give user visual feedback before navigation
      setTimeout(() => {
        onResetSuccess?.();
      }, 800);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || error.message;
      console.log('❌ Password reset failed:', errorMessage);
      setErrors(prev => ({ ...prev, code: errorMessage }));
      // Clear code inputs on error for retry
      setCode(['', '', '', '', '', '']);
      // Focus first input for easy retry
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    },
  });

  const handleCodeChange = (text: string, index: number) => {
    // Check if pasted (multiple characters)
    if (text.length > 1) {
      // Paste detected! Extract 6 digits
      const digits = text.replace(/[^0-9]/g, '').slice(0, 6);
      if (digits.length === 6) {
        const newCode = digits.split('');
        setCode(newCode);
        setErrors(prev => ({ ...prev, code: '' }));
        // Focus last input
        inputRefs.current[5]?.focus();
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
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
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
    if (password !== confirmPassword) {
      setErrors(prev => ({ ...prev, password: 'Wachtwoorden komen niet overeen' }));
      return false;
    }
    setErrors(prev => ({ ...prev, password: '' }));
    return true;
  };

  const handleSubmit = () => {
    const finalCode = code.join('');

    if (finalCode.length !== 6) {
      setErrors(prev => ({ ...prev, code: 'Voer de volledige 6-cijferige code in' }));
      return;
    }

    if (!validatePassword(newPassword)) {
      return;
    }

    resetMutation.mutate({
      reset_token: resetToken,
      code: finalCode,
      new_password: newPassword,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Reset je wachtwoord</Text>
          <Text style={styles.subtitle}>
            Voer de code in die je per e-mail hebt ontvangen en kies een nieuw wachtwoord
          </Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        {/* 6-Digit Code Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Verificatiecode</Text>
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
        </View>

        {/* New Password Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Nieuw wachtwoord</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput, errors.password ? styles.inputError : null]}
              placeholder="Minimaal 8 tekens"
              placeholderTextColor="#999"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                setErrors(prev => ({ ...prev, password: '' }));
              }}
              secureTextEntry={!showPassword}
              autoComplete="password-new"
            />
            <Pressable
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </Pressable>
          </View>
        </View>

        {/* Confirm Password Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Bevestig wachtwoord</Text>
          <TextInput
            style={[styles.input, errors.password ? styles.inputError : null]}
            placeholder="Herhaal wachtwoord"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setErrors(prev => ({ ...prev, password: '' }));
            }}
            secureTextEntry={!showPassword}
            autoComplete="password-new"
          />
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
        </View>

        {resetMutation.isSuccess && (
          <View style={styles.successIndicator}>
            <Text style={styles.successText}>✓ Wachtwoord gereset!</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, (resetMutation.isPending || resetMutation.isSuccess) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={resetMutation.isPending || resetMutation.isSuccess || code.join('').length !== 6 || !newPassword || !confirmPassword}
          activeOpacity={0.8}
        >
          {resetMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : resetMutation.isSuccess ? (
            <Text style={styles.buttonText}>✓ GELUKT</Text>
          ) : (
            <Text style={styles.buttonText}>WACHTWOORD RESETTEN</Text>
          )}
        </TouchableOpacity>
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
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: DARK_GRAY,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  email: {
    fontSize: 16,
    textAlign: 'center',
    color: TWENTS_RED,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_GRAY,
    marginBottom: 12,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
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
  successIndicator: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
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
});
