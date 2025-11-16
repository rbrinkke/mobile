import React, { useState } from 'react';
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
  Alert,
} from 'react-native';
import { usePasswordChange } from '../hooks/usePasswordChange';

interface PasswordChangeScreenProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PasswordChangeScreen({ onSuccess, onCancel }: PasswordChangeScreenProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [errors, setErrors] = useState({ current: '', new: '' });

  const passwordChangeMutation = usePasswordChange();

  const validateCurrentPassword = (password: string): boolean => {
    if (!password) {
      setErrors(prev => ({ ...prev, current: 'Huidig wachtwoord is verplicht' }));
      return false;
    }
    setErrors(prev => ({ ...prev, current: '' }));
    return true;
  };

  const validateNewPassword = (password: string): boolean => {
    if (!password) {
      setErrors(prev => ({ ...prev, new: 'Nieuw wachtwoord is verplicht' }));
      return false;
    }
    if (password.length < 8) {
      setErrors(prev => ({ ...prev, new: 'Wachtwoord moet minimaal 8 tekens bevatten' }));
      return false;
    }
    if (password === currentPassword) {
      setErrors(prev => ({ ...prev, new: 'Nieuw wachtwoord moet verschillend zijn' }));
      return false;
    }
    setErrors(prev => ({ ...prev, new: '' }));
    return true;
  };

  const handlePasswordChange = () => {
    const isCurrentValid = validateCurrentPassword(currentPassword);
    const isNewValid = validateNewPassword(newPassword);

    if (!isCurrentValid || !isNewValid) {
      return;
    }

    passwordChangeMutation.mutate(
      { current_password: currentPassword, new_password: newPassword },
      {
        onSuccess: () => {
          console.log('✅ Password changed successfully');
          Alert.alert(
            '✅ Gelukt!',
            'Je wachtwoord is succesvol gewijzigd.',
            [{ text: 'OK', onPress: onSuccess }]
          );
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data?.detail || error.message;
          if (errorMessage.toLowerCase().includes('incorrect') || errorMessage.toLowerCase().includes('wrong')) {
            setErrors(prev => ({ ...prev, current: 'Huidig wachtwoord is onjuist' }));
          } else {
            setErrors(prev => ({ ...prev, new: errorMessage }));
          }
        },
      }
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Wachtwoord wijzigen</Text>
          <Text style={styles.subtitle}>Kies een nieuw wachtwoord</Text>
        </View>

        {/* Current Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Huidig wachtwoord</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput, errors.current ? styles.inputError : null]}
              placeholder="••••••••"
              placeholderTextColor="#999"
              value={currentPassword}
              onChangeText={(text) => {
                setCurrentPassword(text);
                setErrors(prev => ({ ...prev, current: '' }));
              }}
              onBlur={() => validateCurrentPassword(currentPassword)}
              secureTextEntry={!showCurrentPassword}
              autoComplete="password"
            />
            <Pressable
              style={styles.eyeIcon}
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              <Text style={styles.eyeText}>{showCurrentPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </Pressable>
          </View>
          {errors.current ? (
            <Text style={styles.errorText}>{errors.current}</Text>
          ) : null}
        </View>

        {/* New Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nieuw wachtwoord</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput, errors.new ? styles.inputError : null]}
              placeholder="Minimaal 8 tekens"
              placeholderTextColor="#999"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                setErrors(prev => ({ ...prev, new: '' }));
              }}
              onBlur={() => validateNewPassword(newPassword)}
              secureTextEntry={!showNewPassword}
              autoComplete="password-new"
            />
            <Pressable
              style={styles.eyeIcon}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Text style={styles.eyeText}>{showNewPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </Pressable>
          </View>
          {errors.new ? (
            <Text style={styles.errorText}>{errors.new}</Text>
          ) : null}
        </View>

        {/* Change Button */}
        <TouchableOpacity
          style={[styles.button, passwordChangeMutation.isPending && styles.buttonDisabled]}
          onPress={handlePasswordChange}
          disabled={passwordChangeMutation.isPending}
          activeOpacity={0.8}
        >
          {passwordChangeMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>WIJZIGEN</Text>
          )}
        </TouchableOpacity>

        {/* Cancel Link */}
        {onCancel && (
          <View style={styles.footer}>
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.footerLink}>Annuleren</Text>
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerLink: {
    fontSize: 14,
    color: TWENTS_RED,
    fontWeight: '600',
  },
});
