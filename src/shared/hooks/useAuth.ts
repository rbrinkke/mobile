/**
 * useAuth Hook - Authentication State Management
 *
 * Features:
 * - React hook for authentication state
 * - Automatic state updates
 * - Type-safe authentication actions
 * - Loading and error states
 */

import { useState, useEffect, useCallback } from 'react';
import { authService } from '@services/auth/authService';

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  email: string | null;
  isLoading: boolean;
}

interface UseAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

/**
 * Hook for authentication state management
 *
 * @example
 * ```tsx
 * function LoginScreen() {
 *   const { login, isLoading, error, isAuthenticated } = useAuth();
 *
 *   const handleLogin = async () => {
 *     await login(email, password);
 *   };
 *
 *   if (isAuthenticated) {
 *     return <Navigate to="/home" />;
 *   }
 *
 *   return (
 *     <View>
 *       <TextInput placeholder="Email" />
 *       <TextInput placeholder="Password" secureTextEntry />
 *       <Button onPress={handleLogin} disabled={isLoading}>
 *         {isLoading ? 'Logging in...' : 'Login'}
 *       </Button>
 *       {error && <Text style={{ color: 'red' }}>{error}</Text>}
 *     </View>
 *   );
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const state = authService.getAuthState();
    return {
      ...state,
      isLoading: false,
    };
  });

  const [error, setError] = useState<string | null>(null);

  // Update auth state when changes occur
  useEffect(() => {
    const updateAuthState = () => {
      const state = authService.getAuthState();
      setAuthState((prev) => ({
        ...prev,
        ...state,
      }));
    };

    // Check auth state on mount
    updateAuthState();

    // Set up interval to check for token expiry
    const interval = setInterval(updateAuthState, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  /**
   * Login with email and password
   */
  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    try {
      const state = await authService.login(email, password);

      setAuthState({
        ...state,
        isLoading: false,
      });
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
      }));
      throw err;
    }
  }, []);

  /**
   * Register new user
   */
  const register = useCallback(
    async (email: string, password: string, name: string) => {
      setError(null);
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      try {
        await authService.register(email, password, name);

        setAuthState((prev) => ({ ...prev, isLoading: false }));
      } catch (err: any) {
        setError(err.message || 'Registration failed');
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        throw err;
      }
    },
    []
  );

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    setError(null);
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    try {
      await authService.logout();

      setAuthState({
        isAuthenticated: false,
        userId: null,
        email: null,
        isLoading: false,
      });
    } catch (err: any) {
      setError(err.message || 'Logout failed');
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      throw err;
    }
  }, []);

  /**
   * Manually refresh access token
   */
  const refreshToken = useCallback(async () => {
    setError(null);

    try {
      await authService.refreshAccessToken();

      // Update auth state
      const state = authService.getAuthState();
      setAuthState((prev) => ({
        ...prev,
        ...state,
      }));
    } catch (err: any) {
      setError(err.message || 'Token refresh failed');

      // Token refresh failed - user is no longer authenticated
      setAuthState({
        isAuthenticated: false,
        userId: null,
        email: null,
        isLoading: false,
      });

      throw err;
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
    refreshToken,
    error,
    clearError,
  };
}

/**
 * Hook to get current user ID
 * - Returns null if not authenticated
 */
export function useUserId(): string | null {
  const { userId, isAuthenticated } = useAuth();
  return isAuthenticated ? userId : null;
}

/**
 * Hook to check if user is authenticated
 * - Simple boolean check
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}
