/**
 * App Store - Global Client State Management
 *
 * Using Zustand + MMKV for persistent client state
 * Handles: theme, authentication, UI preferences
 *
 * Note: Use TanStack Query for server state, Zustand for client state!
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@api/storage';

// MMKV storage adapter for Zustand
const mmkvStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    storage.delete(name);
  },
};

interface AppState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Authentication
  userId: string | null;
  isAuthenticated: boolean;
  setUser: (userId: string) => void;
  logout: () => void;

  // UI State
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (seen: boolean) => void;

  // Preferences
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;

  locationEnabled: boolean;
  setLocationEnabled: (enabled: boolean) => void;

  // Bottom sheet / modal state
  isBottomSheetOpen: boolean;
  setBottomSheetOpen: (open: boolean) => void;

  // Filter preferences (for Discover screen)
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;

  radiusFilter: number; // in km
  setRadiusFilter: (radius: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Theme
      theme: 'system',
      setTheme: (theme) => set({ theme }),

      // Authentication
      userId: null,
      isAuthenticated: false,
      setUser: (userId) => set({ userId, isAuthenticated: true }),
      logout: () => set({ userId: null, isAuthenticated: false }),

      // UI State
      hasSeenOnboarding: false,
      setHasSeenOnboarding: (seen) => set({ hasSeenOnboarding: seen }),

      // Preferences
      notificationsEnabled: true,
      setNotificationsEnabled: (enabled) =>
        set({ notificationsEnabled: enabled }),

      locationEnabled: true,
      setLocationEnabled: (enabled) => set({ locationEnabled: enabled }),

      // Bottom sheet / modal state
      isBottomSheetOpen: false,
      setBottomSheetOpen: (open) => set({ isBottomSheetOpen: open }),

      // Filter preferences
      selectedCategories: [],
      setSelectedCategories: (categories) =>
        set({ selectedCategories: categories }),

      radiusFilter: 10, // Default 10km
      setRadiusFilter: (radius) => set({ radiusFilter: radius }),
    }),
    {
      name: 'app-storage', // Storage key
      storage: createJSONStorage(() => mmkvStorage),
      // Only persist specific keys (exclude transient UI state)
      partialize: (state) => ({
        theme: state.theme,
        userId: state.userId,
        isAuthenticated: state.isAuthenticated,
        hasSeenOnboarding: state.hasSeenOnboarding,
        notificationsEnabled: state.notificationsEnabled,
        locationEnabled: state.locationEnabled,
        selectedCategories: state.selectedCategories,
        radiusFilter: state.radiusFilter,
        // Don't persist: isBottomSheetOpen (transient)
      }),
    }
  )
);
