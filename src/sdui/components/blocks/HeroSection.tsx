import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * HeroSection Building Block
 *
 * A gradient hero banner with title, subtitle, and optional CTA button.
 *
 * Expected props from backend:
 * - title: string
 * - subtitle: string
 * - ctaText?: string
 * - ctaAction?: string (navigation target or action)
 * - primaryColor?: string
 * - secondaryColor?: string
 */

export interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaAction?: string;
  primaryColor?: string;
  secondaryColor?: string;
  onCtaPress?: () => void;
}

export default function HeroSection({
  title,
  subtitle,
  ctaText,
  primaryColor = '#FF6B6B',
  secondaryColor = '#4ECDC4',
  onCtaPress,
}: HeroSectionProps) {
  return (
    <LinearGradient
      colors={[primaryColor, secondaryColor]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {ctaText && (
        <TouchableOpacity style={styles.button} onPress={onCtaPress} activeOpacity={0.8}>
          <Text style={styles.buttonText}>{ctaText}</Text>
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    marginHorizontal: 16,
    marginVertical: 8,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // Android shadow
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
});
