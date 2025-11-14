/**
 * Sentry Configuration
 *
 * Production-ready crash reporting and performance monitoring
 *
 * Setup:
 * 1. Get DSN from https://sentry.io/
 * 2. Add to .env: SENTRY_DSN=your-dsn-here
 * 3. Sentry auto-initializes in App.tsx
 */
import * as Sentry from '@sentry/react-native';

/**
 * Initialize Sentry with production-ready configuration
 */
export function initializeSentry() {
  // Only initialize if DSN is provided
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.warn('⚠️  Sentry DSN not configured. Crash reporting disabled.');
    console.warn('   Add SENTRY_DSN to your .env file for production monitoring.');
    return;
  }

  Sentry.init({
    dsn,

    // Environment detection
    environment: __DEV__ ? 'development' : 'production',

    // Enable automatic crash reporting
    enableAutoSessionTracking: true,

    // Performance monitoring (adjust sample rate for production)
    enableTracing: true,
    tracesSampleRate: __DEV__ ? 1.0 : 0.2, // 100% dev, 20% production

    // Profile slow operations
    profilesSampleRate: __DEV__ ? 1.0 : 0.1, // 100% dev, 10% production

    // Disable in development for better DX
    enabled: !__DEV__,

    // Integrations
    integrations: [
      // React Navigation integration for breadcrumbs
      new Sentry.ReactNavigationInstrumentation(),
    ],

    // Filter out common noise
    beforeSend(event, hint) {
      // Ignore network errors (handled by TanStack Query)
      if (event.exception?.values?.[0]?.type === 'NetworkError') {
        return null;
      }

      // Filter out development errors
      if (__DEV__) {
        return null;
      }

      return event;
    },

    // Attach user context automatically
    beforeBreadcrumb(breadcrumb) {
      // Filter sensitive data from breadcrumbs
      if (breadcrumb.category === 'console') {
        return null; // Don't log console to Sentry
      }
      return breadcrumb;
    },
  });

  console.log('✅ Sentry initialized:', __DEV__ ? 'development' : 'production');
}

/**
 * Set user context for error tracking
 */
export function setSentryUser(userId: string, email?: string, username?: string) {
  Sentry.setUser({
    id: userId,
    email,
    username,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

/**
 * Add custom breadcrumb for debugging
 */
export function addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    data,
  });
}

/**
 * Capture exception manually
 */
export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    contexts: context ? { custom: context } : undefined,
  });
}

/**
 * Capture message for non-error tracking
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * Start performance transaction
 *
 * Usage:
 * const transaction = startTransaction('screen_load', 'ActivityDetail');
 * // ... do work
 * transaction.finish();
 */
export function startTransaction(operation: string, name: string) {
  return Sentry.startTransaction({
    op: operation,
    name,
  });
}

// Export Sentry for advanced usage
export { Sentry };
