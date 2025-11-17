/**
 * Authentication Store - KISS Version
 *
 * Simple, fast, works everywhere.
 * Direct localStorage/AsyncStorage - NO fancy middleware!
 */

import { create } from 'zustand';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface UserInfo {
  userId: string;
  email: string;
}

interface AuthState {
  tokens: AuthTokens | null;
  user: UserInfo | null;
  isAuthenticated: boolean;

  setTokens: (accessToken: string, refreshToken: string, expiresIn: number) => void;
  setUser: (userId: string, email: string) => void;
  logout: () => Promise<void>;
  getAccessToken: () => string | null;
  isTokenExpired: () => boolean;

  // Persistence
  _hydrate: () => Promise<void>;
}

// Direct storage - NO middleware!
const storage = {
  async save(state: any) {
    try {
      const data = JSON.stringify({
        tokens: state.tokens,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      });

      if (Platform.OS === 'web') {
        localStorage.setItem('auth-storage', data);
      } else {
        await AsyncStorage.setItem('auth-storage', data);
      }
    } catch (e) {
      console.error('Save error:', e);
    }
  },

  async load() {
    try {
      const data = Platform.OS === 'web'
        ? localStorage.getItem('auth-storage')
        : await AsyncStorage.getItem('auth-storage');

      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Load error:', e);
      return null;
    }
  },

  async clear() {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem('auth-storage');
      } else {
        await AsyncStorage.removeItem('auth-storage');
      }
    } catch (e) {
      console.error('Clear error:', e);
    }
  },
};

export const useAuthStore = create<AuthState>((set, get) => ({
  tokens: null,
  user: null,
  isAuthenticated: false,

  setTokens: (accessToken: string, refreshToken: string, expiresIn: number) => {
    const expiresAt = Date.now() + (expiresIn * 1000);
    const newState = {
      tokens: { accessToken, refreshToken, expiresAt },
      isAuthenticated: true,
    };

    set(newState);
    storage.save({ ...get(), ...newState }); // Save immediately
    console.log('🔐 Tokens stored');
  },

  setUser: (userId: string, email: string) => {
    const newState = { user: { userId, email } };
    set(newState);
    storage.save({ ...get(), ...newState });
    console.log('👤 User stored:', email);
  },

  logout: async () => {
    set({ tokens: null, user: null, isAuthenticated: false });
    await storage.clear();
    console.log('👋 Logged out');
  },

  isTokenExpired: () => {
    const { tokens } = get();
    if (!tokens) return true;
    return Date.now() >= (tokens.expiresAt - 60000);
  },

  getAccessToken: () => {
    const { tokens, isTokenExpired } = get();
    if (!tokens || isTokenExpired()) return null;
    return tokens.accessToken;
  },

  _hydrate: async () => {
    const saved = await storage.load();
    if (saved) {
      set({
        tokens: saved.tokens,
        user: saved.user,
        isAuthenticated: saved.isAuthenticated,
      });
      console.log('💧 Hydrated from storage');
    }
  },
}));

// Hydrate on load
if (typeof window !== 'undefined') {
  useAuthStore.getState()._hydrate();
}

export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectUser = (state: AuthState) => state.user;
export const selectAccessToken = (state: AuthState) => state.getAccessToken();
