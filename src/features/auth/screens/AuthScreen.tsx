import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';

import { AuthInput } from '../components/AuthInput';
import { CodeInput } from '../components/CodeInput';
import { useAuthFlow } from '../hooks/useAuthFlow';
import {
  loginSchema,
  registerSchema,
  verifyCodeSchema,
  requestPasswordResetSchema,
  newPasswordSchema,
  type LoginFormData,
  type RegisterFormData,
  type VerifyCodeFormData,
  type RequestPasswordResetFormData,
  type NewPasswordFormData,
} from '../validation';
import type { AuthMode, Organization } from '../types';

/**
 * Best-in-class authentication screen with mode switching
 *
 * Features:
 * - Single screen for register/login/reset flows
 * - Smooth Reanimated 3 transitions
 * - React Hook Form + Zod validation
 * - State machine-based flow management
 * - Haptic feedback
 * - Accessibility support
 * - Beautiful modern design
 */

export function AuthScreen() {
  const {
    authState,
    isLoading,
    switchToLogin,
    switchToRegister,
    switchToResetPassword,
    handleRegister,
    handleVerifyEmail,
    handleLogin,
    handle2FACode,
    handleOrgSelection,
    handleRequestPasswordReset,
    handleResetPassword,
    clearError,
  } = useAuthFlow();

  // Render based on current mode
  const renderContent = () => {
    switch (authState.mode) {
      case 'login':
        return (
          <LoginForm
            onSubmit={(data) => handleLogin(data.email, data.password)}
            onSwitchToRegister={switchToRegister}
            onSwitchToReset={switchToResetPassword}
            isLoading={isLoading}
            error={authState.error}
          />
        );

      case 'register':
        return (
          <RegisterForm
            onSubmit={(data) => handleRegister(data.email, data.password)}
            onSwitchToLogin={switchToLogin}
            isLoading={isLoading}
            error={authState.error}
          />
        );

      case 'verify-email':
        return (
          <VerifyEmailForm
            email={authState.email!}
            onSubmit={(data) => handleVerifyEmail(data.code)}
            onBack={switchToRegister}
            isLoading={isLoading}
            error={authState.error}
          />
        );

      case 'enter-code':
        return (
          <EnterCodeForm
            email={authState.email!}
            isResetFlow={!!authState.resetToken}
            onSubmit={(data) => {
              if (authState.resetToken) {
                // Password reset flow - need new password
                // TODO: Show new password input
              } else {
                // 2FA login flow
                handle2FACode(data.code);
              }
            }}
            onBack={authState.resetToken ? switchToResetPassword : switchToLogin}
            isLoading={isLoading}
            error={authState.error}
          />
        );

      case 'reset-password':
        return (
          <ResetPasswordForm
            onSubmit={(data) => handleRequestPasswordReset(data.email)}
            onBack={switchToLogin}
            isLoading={isLoading}
            error={authState.error}
          />
        );

      case 'org-selection':
        return (
          <OrgSelectionForm
            organizations={authState.organizations!}
            onSelect={handleOrgSelection}
            onBack={switchToLogin}
            isLoading={isLoading}
          />
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            key={authState.mode}
            entering={SlideInRight.duration(300)}
            exiting={SlideOutLeft.duration(300)}
            style={styles.content}
          >
            {renderContent()}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ============================================================================
// Login Form
// ============================================================================

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  onSwitchToRegister: () => void;
  onSwitchToReset: () => void;
  isLoading: boolean;
  error?: string;
}

function LoginForm({
  onSubmit,
  onSwitchToRegister,
  onSwitchToReset,
  isLoading,
  error,
}: LoginFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthInput
              label="Email"
              value={value}
              onChangeText={onChange}
              error={errors.email?.message}
              keyboardType="email-address"
              autoComplete="email"
              autoCapitalize="none"
              autoFocus
              returnKeyType="next"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthInput
              label="Password"
              value={value}
              onChangeText={onChange}
              error={errors.password?.message}
              secureTextEntry
              autoComplete="password"
              returnKeyType="send"
              onSubmitEditing={handleSubmit(onSubmit)}
            />
          )}
        />

        {error && <ErrorMessage message={error} />}

        <Pressable onPress={onSwitchToReset}>
          <Text style={styles.forgotPassword}>Forgot password?</Text>
        </Pressable>

        <PrimaryButton
          title="Sign In"
          onPress={handleSubmit(onSubmit)}
          isLoading={isLoading}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Pressable onPress={onSwitchToRegister}>
            <Text style={styles.footerLink}>Sign Up</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

// ============================================================================
// Register Form
// ============================================================================

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => void;
  onSwitchToLogin: () => void;
  isLoading: boolean;
  error?: string;
}

function RegisterForm({
  onSubmit,
  onSwitchToLogin,
  isLoading,
  error,
}: RegisterFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <AuthInput
              label="Email"
              value={value}
              onChangeText={onChange}
              error={errors.email?.message}
              keyboardType="email-address"
              autoComplete="email"
              autoCapitalize="none"
              autoFocus
              returnKeyType="next"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <AuthInput
              label="Password"
              value={value}
              onChangeText={onChange}
              error={errors.password?.message}
              secureTextEntry
              autoComplete="password-new"
              returnKeyType="send"
              onSubmitEditing={handleSubmit(onSubmit)}
            />
          )}
        />

        {error && <ErrorMessage message={error} />}

        <PrimaryButton
          title="Create Account"
          onPress={handleSubmit(onSubmit)}
          isLoading={isLoading}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={onSwitchToLogin}>
            <Text style={styles.footerLink}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

// ============================================================================
// Verify Email Form
// ============================================================================

interface VerifyEmailFormProps {
  email: string;
  onSubmit: (data: VerifyCodeFormData) => void;
  onBack: () => void;
  isLoading: boolean;
  error?: string;
}

function VerifyEmailForm({
  email,
  onSubmit,
  onBack,
  isLoading,
  error,
}: VerifyEmailFormProps) {
  const [code, setCode] = useState('');

  const handleComplete = (completeCode: string) => {
    onSubmit({ code: completeCode });
  };

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Verify Email</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.codeContainer}>
          <CodeInput
            value={code}
            onChange={setCode}
            onComplete={handleComplete}
            error={!!error}
            autoFocus
          />
        </View>

        {error && <ErrorMessage message={error} />}

        <SecondaryButton title="Back" onPress={onBack} />
      </View>
    </>
  );
}

// ============================================================================
// Enter Code Form (2FA or Reset)
// ============================================================================

interface EnterCodeFormProps {
  email: string;
  isResetFlow: boolean;
  onSubmit: (data: VerifyCodeFormData) => void;
  onBack: () => void;
  isLoading: boolean;
  error?: string;
}

function EnterCodeForm({
  email,
  isResetFlow,
  onSubmit,
  onBack,
  isLoading,
  error,
}: EnterCodeFormProps) {
  const [code, setCode] = useState('');

  const handleComplete = (completeCode: string) => {
    onSubmit({ code: completeCode });
  };

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isResetFlow ? 'Reset Password' : 'Enter Code'}
        </Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.codeContainer}>
          <CodeInput
            value={code}
            onChange={setCode}
            onComplete={handleComplete}
            error={!!error}
            autoFocus
          />
        </View>

        {error && <ErrorMessage message={error} />}

        <SecondaryButton title="Back" onPress={onBack} />
      </View>
    </>
  );
}

// ============================================================================
// Reset Password Form
// ============================================================================

interface ResetPasswordFormProps {
  onSubmit: (data: RequestPasswordResetFormData) => void;
  onBack: () => void;
  isLoading: boolean;
  error?: string;
}

function ResetPasswordForm({
  onSubmit,
  onBack,
  isLoading,
  error,
}: ResetPasswordFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestPasswordResetFormData>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: { email: '' },
  });

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email to receive a reset code
        </Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <AuthInput
              label="Email"
              value={value}
              onChangeText={onChange}
              error={errors.email?.message}
              keyboardType="email-address"
              autoComplete="email"
              autoCapitalize="none"
              autoFocus
              returnKeyType="send"
              onSubmitEditing={handleSubmit(onSubmit)}
            />
          )}
        />

        {error && <ErrorMessage message={error} />}

        <PrimaryButton
          title="Send Reset Code"
          onPress={handleSubmit(onSubmit)}
          isLoading={isLoading}
        />

        <SecondaryButton title="Back to Sign In" onPress={onBack} />
      </View>
    </>
  );
}

// ============================================================================
// Organization Selection Form
// ============================================================================

interface OrgSelectionFormProps {
  organizations: Organization[];
  onSelect: (orgId: string) => void;
  onBack: () => void;
  isLoading: boolean;
}

function OrgSelectionForm({
  organizations,
  onSelect,
  onBack,
  isLoading,
}: OrgSelectionFormProps) {
  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Select Organization</Text>
        <Text style={styles.subtitle}>Choose which account to access</Text>
      </View>

      <View style={styles.form}>
        {organizations.map((org) => (
          <Pressable
            key={org.id}
            style={styles.orgButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(org.id);
            }}
            disabled={isLoading}
          >
            <Text style={styles.orgName}>{org.name}</Text>
            {org.role && <Text style={styles.orgRole}>{org.role}</Text>}
          </Pressable>
        ))}

        <SecondaryButton title="Back" onPress={onBack} />
      </View>
    </>
  );
}

// ============================================================================
// Shared Components
// ============================================================================

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
}

function PrimaryButton({ title, onPress, isLoading }: PrimaryButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.primaryButton,
        pressed && styles.primaryButtonPressed,
        isLoading && styles.buttonDisabled,
      ]}
      onPress={() => {
        if (!isLoading) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }
      }}
      disabled={isLoading}
      accessible
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isLoading, busy: isLoading }}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.primaryButtonText}>{title}</Text>
      )}
    </Pressable>
  );
}

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
}

function SecondaryButton({ title, onPress }: SecondaryButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.secondaryButton,
        pressed && styles.secondaryButtonPressed,
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      accessible
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Text style={styles.secondaryButtonText}>{title}</Text>
    </Pressable>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={styles.errorBox}
    >
      <Text style={styles.errorBoxText}>{message}</Text>
    </Animated.View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 32,
    paddingTop: 48,
    paddingBottom: 48,
  },
  content: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  header: {
    marginBottom: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    lineHeight: 40,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '400',
    color: '#8E8E93',
    lineHeight: 24,
    textAlign: 'center',
  },
  email: {
    fontWeight: '600',
    color: '#007AFF',
  },
  form: {
    gap: 20,
  },
  codeContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  forgotPassword: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'right',
    marginTop: -4,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 22,
  },
  footerLink: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
    lineHeight: 22,
  },
  primaryButton: {
    height: 54,
    backgroundColor: '#007AFF',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  primaryButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  secondaryButton: {
    height: 54,
    backgroundColor: 'transparent',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    marginTop: 4,
  },
  secondaryButtonPressed: {
    backgroundColor: '#F9F9F9',
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
    letterSpacing: 0.2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  errorBox: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1.5,
    borderColor: '#FF3B30',
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
  },
  errorBoxText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF3B30',
    textAlign: 'center',
    lineHeight: 20,
  },
  orgButton: {
    padding: 24,
    backgroundColor: '#F9F9F9',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    marginBottom: 12,
  },
  orgName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  orgRole: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
  },
});
