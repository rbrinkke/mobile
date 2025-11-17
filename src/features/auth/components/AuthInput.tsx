import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Platform,
  Pressable,
  Text,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
  useSharedValue,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface AuthInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?:
    | 'email'
    | 'password'
    | 'password-new'
    | 'username'
    | 'name'
    | 'off';
  autoFocus?: boolean;
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'next' | 'send';
  disabled?: boolean;
}

/**
 * Modern authentication input with floating label and smooth animations
 *
 * Features:
 * - Floating label animation (Material Design inspired)
 * - Password visibility toggle
 * - Error state with color transitions
 * - Haptic feedback
 * - Accessibility support
 * - 60 FPS Reanimated 3 animations
 */
export function AuthInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete,
  autoFocus = false,
  onSubmitEditing,
  returnKeyType = 'done',
  disabled = false,
}: AuthInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  // Reanimated shared values
  const labelAnim = useSharedValue(value || isFocused ? 1 : 0);
  const focusAnim = useSharedValue(0);
  const errorAnim = useSharedValue(error ? 1 : 0);

  // Update animations
  useEffect(() => {
    labelAnim.value = withSpring(value || isFocused ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [value, isFocused]);

  useEffect(() => {
    focusAnim.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
  }, [isFocused]);

  useEffect(() => {
    errorAnim.value = withTiming(error ? 1 : 0, { duration: 200 });
  }, [error]);

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // Toggle password visibility
  const toggleSecureEntry = () => {
    setIsSecure(!isSecure);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Animated styles
  const containerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      errorAnim.value,
      [0, 1],
      [
        interpolateColor(focusAnim.value, [0, 1], ['#D1D5DB', '#2563EB']),  // VISIBLE: gray → blue
        '#EF4444', // VISIBLE: bright red for errors
      ]
    );

    return {
      borderColor,
      borderWidth: interpolate(focusAnim.value, [0, 1], [2, 2.5], Extrapolation.CLAMP),  // Thicker for visibility
    };
  });

  const labelStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      labelAnim.value,
      [0, 1],
      [0, -28],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      labelAnim.value,
      [0, 1],
      [1, 0.85],
      Extrapolation.CLAMP
    );

    const color = interpolateColor(
      errorAnim.value,
      [0, 1],
      [
        interpolateColor(focusAnim.value, [0, 1], ['#6B7280', '#2563EB']),  // Darker colors for visibility
        '#EF4444',  // Brighter red for errors
      ]
    );

    return {
      transform: [{ translateY }, { scale }],
      color,
    };
  });

  const errorTextStyle = useAnimatedStyle(() => {
    const opacity = errorAnim.value;
    const translateY = interpolate(
      errorAnim.value,
      [0, 1],
      [10, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.container, containerStyle]}>
        {/* Floating Label */}
        <Animated.Text style={[styles.label, labelStyle]}>
          {label}
        </Animated.Text>

        {/* Input */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={isFocused ? placeholder : ''}
          placeholderTextColor="#C7C7CC"
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          autoCorrect={false}
          autoFocus={autoFocus}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          editable={!disabled}
          style={[
            styles.input,
            disabled && styles.inputDisabled,
          ]}
          accessible={true}
          accessibilityLabel={label}
          accessibilityHint={error || undefined}
          accessibilityState={{
            disabled,
          }}
        />

        {/* Password Toggle */}
        {secureTextEntry && value.length > 0 && (
          <Pressable
            onPress={toggleSecureEntry}
            style={styles.iconButton}
            hitSlop={8}
            accessible={true}
            accessibilityLabel={isSecure ? 'Show password' : 'Hide password'}
            accessibilityRole="button"
          >
            <Feather
              name={isSecure ? 'eye-off' : 'eye'}
              size={20}
              color="#8E8E93"
            />
          </Pressable>
        )}
      </Animated.View>

      {/* Error Message */}
      {error && (
        <Animated.View style={[styles.errorContainer, errorTextStyle]}>
          <Feather name="alert-circle" size={14} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 4,
  },
  container: {
    height: 58,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  label: {
    position: 'absolute',
    left: 18,
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
    transformOrigin: 'left center',
  },
  input: {
    fontSize: 17,
    fontWeight: '500',
    color: '#111827',
    paddingRight: 40,
    letterSpacing: 0.1,
  },
  inputDisabled: {
    color: '#C7C7CC',
  },
  iconButton: {
    position: 'absolute',
    right: 12,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 18,
    gap: 6,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF3B30',
    lineHeight: 18,
  },
});
