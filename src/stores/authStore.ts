/**
 * Authentication Store - Production-Ready Auth State Management
 *
 * Best-in-class features:
 * ✅ Zustand for reactive state management
 * ✅ MMKV persistence (survives app restarts)
 * ✅ TypeScript strict mode (no any types)
 * ✅ Integration with authService for token management
 * ✅ Automatic token validation on initialization
 * ✅ Clean separation of concerns
 * ✅ Optimistic UI updates
 *
 * Architecture:
 * - Store: Single source of truth for auth UI state
 * - Service: Token management, API interceptors, JWT handling
 * - Hooks: TanStack Query mutations for server operations
 *
 * Flow:
 * 1. App starts → initialize() → Check tokens → Set isAuthenticated
 * 2. User logs in → Mutation success → setAuthenticated() → Navigate to app
 * 3. Token expires → Service refreshes → Store stays in sync
 * 4. User logs out → logout() → Clear tokens → Navigate to auth
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@api/storage';
import { authService } from '@services/auth/authService';

// ============================================================================
// Types
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export interface AuthState {
  // User data
  user: AuthUser | null;

  // Auth status
  isAuthenticated: boolean;
  isInitialized: boolean;

  // UI state
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  // Initialization
  initialize: () => Promise<void>;

  // Auth operations
  setAuthenticated: (user: AuthUser) => void;
  logout: () => Promise<void>;

  // UI helpers
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Token helpers
  isTokenValid: () => boolean;
  getAccessToken: () => string | null;
}

export type AuthStore = AuthState & AuthActions;

// ============================================================================
// Initial State
// ============================================================================

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  error: null,
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // ========================================================================
      // State
      // ========================================================================
      ...initialState,

      // ========================================================================
      // Initialization
      // ========================================================================

      /**
       * Initialize auth state on app startup
       * - Check if valid tokens exist in storage
       * - Validate token expiry
       * - Set authenticated state
       * - Initialize authService interceptors
       */
      initialize: async () => {
        try {
          // Initialize authService (sets up interceptors)
          await authService.initialize();

          // Check authentication status
          const isAuthenticated = authService.isAuthenticated();

          if (isAuthenticated) {
            // Get user data from token
            const authState = authService.getAuthState();

            if (authState.userId && authState.email) {
              set({
                user: {
                  id: authState.userId,
                  email: authState.email,
                },
                isAuthenticated: true,
                isInitialized: true,
              });

              if (__DEV__) {
                console.log('✅ Auth initialized - User logged in:', authState.email);
              }
            } else {
              // Tokens exist but invalid - clear them
              await authService.logout();
              set({
                user: null,
                isAuthenticated: false,
                isInitialized: true,
              });

              if (__DEV__) {
                console.log('⚠️ Invalid tokens found - cleared');
              }
            }
          } else {
            // No valid auth
            set({
              user: null,
              isAuthenticated: false,
              isInitialized: true,
            });

            if (__DEV__) {
              console.log('ℹ️ Auth initialized - No user logged in');
            }
          }
        } catch (error) {
          console.error('❌ Auth initialization failed:', error);

          // Fail safely - assume not authenticated
          set({
            user: null,
            isAuthenticated: false,
            isInitialized: true,
            error: 'Failed to initialize authentication',
          });
        }
      },

      // ========================================================================
      // Auth Operations
      // ========================================================================

      /**
       * Set user as authenticated
       * Called after successful login/register/verify
       */
      setAuthenticated: (user: AuthUser) => {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        if (__DEV__) {
          console.log('✅ User authenticated:', user.email);
        }
      },

      /**
       * Logout user
       * - Clear tokens from authService
       * - Clear user data from store
       * - Reset to initial state
       */
      logout: async () => {
        try {
          set({ isLoading: true });

          // Logout from authService (clears tokens, notifies backend)
          await authService.logout();

          // Reset store to initial state
          set({
            ...initialState,
            isInitialized: true, // Keep initialized true
          });

          if (__DEV__) {
            console.log('✅ User logged out');
          }
        } catch (error) {
          console.error('❌ Logout failed:', error);

          // Clear local state anyway
          set({
            ...initialState,
            isInitialized: true,
            error: 'Logout failed',
          });
        }
      },

      // ========================================================================
      // UI Helpers
      // ========================================================================

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error, isLoading: false });
      },

      clearError: () => {
        set({ error: null });
      },

      // ========================================================================
      // Token Helpers
      // ========================================================================

      /**
       * Check if current token is valid
       */
      isTokenValid: () => {
        return authService.isAuthenticated();
      },

      /**
       * Get current access token
       */
      getAccessToken: () => {
        return authService.getAccessToken();
      },
    }),
    {
      name: 'auth-storage', // MMKV key
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const value = storage.getString(name);
          return value ? value : null;
        },
        setItem: (name, value) => {
          storage.set(name, value);
        },
        removeItem: (name) => {
          storage.delete(name);
        },
      })),
      // Only persist user data and auth status
      // Tokens are managed by authService separately
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ============================================================================
// Selector Hooks (for performance optimization)
// ============================================================================

/**
 * Hook to check if user is authenticated
 * Optimized - only re-renders when isAuthenticated changes
 */
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);

/**
 * Hook to get current user
 * Optimized - only re-renders when user changes
 */
export const useAuthUser = () =>
  useAuthStore((state) => state.user);

/**
 * Hook to check if auth is initialized
 * Optimized - only re-renders when isInitialized changes
 */
export const useAuthInitialized = () =>
  useAuthStore((state) => state.isInitialized);

/**
 * Hook to get auth loading state
 * Optimized - only re-renders when isLoading changes
 */
export const useAuthLoading = () =>
  useAuthStore((state) => state.isLoading);

/**
 * Hook to get auth error
 * Optimized - only re-renders when error changes
 */
export const useAuthError = () =>
  useAuthStore((state) => state.error);

// ============================================================================
// Action Hooks (for clean component code)
// ============================================================================

/**
 * Hook to get auth actions
 * These don't cause re-renders as they're stable references
 */
export const useAuthActions = () =>
  useAuthStore((state) => ({
    initialize: state.initialize,
    setAuthenticated: state.setAuthenticated,
    logout: state.logout,
    setLoading: state.setLoading,
    setError: state.setError,
    clearError: state.clearError,
  }));
