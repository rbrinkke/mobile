import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolateColor,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface CodeInputProps {
  length?: number;
  value: string;
  onChange: (code: string) => void;
  onComplete?: (code: string) => void;
  autoFocus?: boolean;
  error?: boolean;
  disabled?: boolean;
}

/**
 * Best-in-class OTP code input component
 *
 * Features:
 * - Smooth Reanimated 3 animations
 * - Auto-focus advancement
 * - Haptic feedback (iOS + Android)
 * - Error shake animation
 * - Accessibility support
 * - 60 FPS performance
 */
export function CodeInput({
  length = 6,
  value,
  onChange,
  onComplete,
  autoFocus = true,
  error = false,
  disabled = false,
}: CodeInputProps) {
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(
    autoFocus ? 0 : null
  );

  // Reanimated shared values for animations
  const shakeAnim = useSharedValue(0);
  const errorAnim = useSharedValue(0);

  // Initialize input refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Auto-focus first input
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  // Trigger error shake animation
  useEffect(() => {
    if (error) {
      // Haptic feedback for error
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Shake animation
      shakeAnim.value = withSequence(
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );

      // Error color animation
      errorAnim.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 3000 })
      );
    }
  }, [error]);

  // Handle code change
  const handleChangeText = (text: string, index: number) => {
    // Only allow digits
    const sanitized = text.replace(/[^0-9]/g, '');

    // Handle paste (multiple digits)
    if (sanitized.length > 1) {
      const digits = sanitized.slice(0, length).split('');
      const newCode = value.split('');

      digits.forEach((digit, i) => {
        if (index + i < length) {
          newCode[index + i] = digit;
        }
      });

      const finalCode = newCode.join('');
      onChange(finalCode);

      // Haptic feedback for paste
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Focus next empty or last input
      const nextIndex = Math.min(index + digits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();

      // Check if complete
      if (finalCode.length === length && onComplete) {
        onComplete(finalCode);
      }

      return;
    }

    // Handle single digit
    if (sanitized.length === 1) {
      const newCode = value.split('');
      newCode[index] = sanitized;
      const finalCode = newCode.join('');
      onChange(finalCode);

      // Haptic feedback for input
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Auto-advance to next input
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Check if complete
      if (finalCode.length === length && onComplete) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onComplete(finalCode);
      }
    } else if (sanitized.length === 0) {
      // Handle backspace
      const newCode = value.split('');
      newCode[index] = '';
      onChange(newCode.join(''));
    }
  };

  // Handle backspace
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle focus
  const handleFocus = (index: number) => {
    setFocusedIndex(index);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Handle box press (focus input)
  const handleBoxPress = (index: number) => {
    if (!disabled) {
      inputRefs.current[index]?.focus();
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        useAnimatedStyle(() => ({
          transform: [{ translateX: shakeAnim.value }],
        })),
      ]}
    >
      {Array.from({ length }).map((_, index) => {
        const isFocused = focusedIndex === index;
        const hasValue = !!value[index];

        return (
          <CodeBox
            key={index}
            index={index}
            value={value[index] || ''}
            isFocused={isFocused}
            hasValue={hasValue}
            error={error}
            disabled={disabled}
            errorAnim={errorAnim}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            onFocus={() => handleFocus(index)}
            onPress={() => handleBoxPress(index)}
            inputRef={(ref) => (inputRefs.current[index] = ref)}
          />
        );
      })}
    </Animated.View>
  );
}

interface CodeBoxProps {
  index: number;
  value: string;
  isFocused: boolean;
  hasValue: boolean;
  error: boolean;
  disabled: boolean;
  errorAnim: SharedValue<number>;
  onChangeText: (text: string) => void;
  onKeyPress: (e: any) => void;
  onFocus: () => void;
  onPress: () => void;
  inputRef: (ref: TextInput | null) => void;
}

function CodeBox({
  index,
  value,
  isFocused,
  hasValue,
  error,
  disabled,
  errorAnim,
  onChangeText,
  onKeyPress,
  onFocus,
  onPress,
  inputRef,
}: CodeBoxProps) {
  const scale = useSharedValue(1);
  const focusAnim = useSharedValue(isFocused ? 1 : 0);

  // Update focus animation
  useEffect(() => {
    focusAnim.value = withSpring(isFocused ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [isFocused]);

  // Scale animation on value change
  useEffect(() => {
    if (hasValue) {
      scale.value = withSequence(
        withSpring(1.1, { damping: 10 }),
        withSpring(1, { damping: 10 })
      );
    }
  }, [hasValue]);

  const animatedBoxStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      errorAnim.value,
      [0, 1],
      [
        isFocused ? '#007AFF' : hasValue ? '#34C759' : '#E5E5EA',
        '#FF3B30', // Error red
      ]
    );

    const backgroundColor = interpolateColor(
      focusAnim.value,
      [0, 1],
      ['#FFFFFF', '#F9F9F9']
    );

    return {
      borderColor,
      backgroundColor,
      transform: [{ scale: scale.value }],
      borderWidth: focusAnim.value === 1 ? 2 : 1.5,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      errorAnim.value,
      [0, 1],
      ['#000000', '#FF3B30']
    );

    return { color };
  });

  return (
    <Pressable onPress={onPress} disabled={disabled}>
      <Animated.View style={[styles.box, animatedBoxStyle]}>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          onKeyPress={onKeyPress}
          onFocus={onFocus}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
          editable={!disabled}
          style={styles.hiddenInput}
          accessible={true}
          accessibilityLabel={`Code digit ${index + 1}`}
          accessibilityHint={`Enter digit ${index + 1} of verification code`}
        />
        {hasValue && (
          <Animated.Text style={[styles.text, animatedTextStyle]}>
            {value}
          </Animated.Text>
        )}
        {isFocused && !hasValue && <View style={styles.cursor} />}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  box: {
    width: 48,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    // Shadow for depth
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  text: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
  },
  cursor: {
    width: 2,
    height: 24,
    backgroundColor: '#007AFF',
    borderRadius: 1,
  },
});
