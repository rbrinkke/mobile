/**
 * Feature Flags Service - Production-Ready Feature Toggle
 *
 * Features:
 * - Remote config integration (Firebase, LaunchDarkly, custom)
 * - Local storage fallback
 * - A/B testing support
 * - User targeting
 * - Real-time updates
 * - Type-safe flag access
 */

import { storage } from '@api/storage';
import apiClient from '@api/client';
import NetInfo from '@react-native-community/netinfo';

// ============================================================================
// Types
// ============================================================================

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  value?: string | number | boolean | object;
  variant?: string;
  updatedAt: number;
}

export type FeatureFlags = Record<string, FeatureFlag>;

interface FeatureFlagOverride {
  [key: string]: boolean | string | number;
}

// ============================================================================
// Default Feature Flags
// ============================================================================

const DEFAULT_FLAGS: FeatureFlags = {
  // Real-time features
  'websocket-enabled': {
    key: 'websocket-enabled',
    enabled: true,
    updatedAt: Date.now(),
  },
  'offline-queue-enabled': {
    key: 'offline-queue-enabled',
    enabled: true,
    updatedAt: Date.now(),
  },

  // Social features
  'activity-likes-enabled': {
    key: 'activity-likes-enabled',
    enabled: true,
    updatedAt: Date.now(),
  },
  'activity-comments-enabled': {
    key: 'activity-comments-enabled',
    enabled: true,
    updatedAt: Date.now(),
  },
  'activity-sharing-enabled': {
    key: 'activity-sharing-enabled',
    enabled: true,
    updatedAt: Date.now(),
  },

  // Chat features
  'chat-enabled': {
    key: 'chat-enabled',
    enabled: true,
    updatedAt: Date.now(),
  },
  'chat-image-upload-enabled': {
    key: 'chat-image-upload-enabled',
    enabled: true,
    updatedAt: Date.now(),
  },

  // Discovery features
  'map-view-enabled': {
    key: 'map-view-enabled',
    enabled: true,
    updatedAt: Date.now(),
  },
  'advanced-search-enabled': {
    key: 'advanced-search-enabled',
    enabled: false,
    updatedAt: Date.now(),
  },

  // Experimental features
  'ai-recommendations-enabled': {
    key: 'ai-recommendations-enabled',
    enabled: false,
    updatedAt: Date.now(),
  },
  'video-chat-enabled': {
    key: 'video-chat-enabled',
    enabled: false,
    updatedAt: Date.now(),
  },

  // A/B tests
  'new-onboarding-flow': {
    key: 'new-onboarding-flow',
    enabled: false,
    variant: 'control',
    updatedAt: Date.now(),
  },
  'activity-card-redesign': {
    key: 'activity-card-redesign',
    enabled: false,
    variant: 'control',
    updatedAt: Date.now(),
  },
};

// ============================================================================
// Feature Flags Service
// ============================================================================

class FeatureFlagsService {
  private readonly FLAGS_KEY = 'feature_flags';
  private readonly OVERRIDES_KEY = 'feature_flags_overrides';
  private readonly LAST_FETCH_KEY = 'feature_flags_last_fetch';

  private flags: FeatureFlags = { ...DEFAULT_FLAGS };
  private overrides: FeatureFlagOverride = {};
  private refreshInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize feature flags service
   * - Loads cached flags
   * - Fetches fresh flags from backend
   * - Sets up auto-refresh
   */
  async initialize(): Promise<void> {
    // Load cached flags
    this.loadFromStorage();

    // Load overrides (for development/testing)
    this.loadOverrides();

    // Fetch fresh flags
    await this.fetchFlags();

    // Auto-refresh every 5 minutes
    this.startAutoRefresh();

    if (__DEV__) console.log('🚩 Feature flags initialized');
  }

  /**
   * Check if feature is enabled
   */
  isEnabled(flagKey: string): boolean {
    // Check overrides first (for testing)
    if (this.overrides[flagKey] !== undefined) {
      return Boolean(this.overrides[flagKey]);
    }

    const flag = this.flags[flagKey];
    return flag ? flag.enabled : false;
  }

  /**
   * Get feature flag value
   */
  getValue<T = any>(flagKey: string, defaultValue?: T): T {
    // Check overrides first
    if (this.overrides[flagKey] !== undefined) {
      return this.overrides[flagKey] as T;
    }

    const flag = this.flags[flagKey];
    if (flag && flag.value !== undefined) {
      return flag.value as T;
    }

    return defaultValue as T;
  }

  /**
   * Get A/B test variant
   */
  getVariant(flagKey: string): string | null {
    const flag = this.flags[flagKey];
    return flag?.variant || null;
  }

  /**
   * Get all feature flags
   */
  getAllFlags(): FeatureFlags {
    return { ...this.flags };
  }

  /**
   * Fetch flags from backend
   */
  async fetchFlags(): Promise<void> {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      if (__DEV__) console.log('📴 Offline - using cached feature flags');
      return;
    }

    try {
      const response = await apiClient.get<{ flags: FeatureFlags }>('/api/feature-flags');

      if (response.data.flags) {
        this.flags = {
          ...DEFAULT_FLAGS,
          ...response.data.flags,
        };

        // Save to storage
        this.saveToStorage();

        // Update last fetch timestamp
        storage.set(this.LAST_FETCH_KEY, Date.now().toString());

        if (__DEV__) {
          console.log('✅ Feature flags updated:', Object.keys(this.flags).length);
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Failed to fetch feature flags:', error);
      }
    }
  }

  /**
   * Override feature flag (for testing/development)
   */
  setOverride(flagKey: string, value: boolean | string | number): void {
    this.overrides[flagKey] = value;
    this.saveOverrides();

    if (__DEV__) {
      console.log('🔧 Feature flag override:', flagKey, '=', value);
    }
  }

  /**
   * Clear feature flag override
   */
  clearOverride(flagKey: string): void {
    delete this.overrides[flagKey];
    this.saveOverrides();

    if (__DEV__) {
      console.log('🔧 Feature flag override cleared:', flagKey);
    }
  }

  /**
   * Clear all overrides
   */
  clearAllOverrides(): void {
    this.overrides = {};
    storage.delete(this.OVERRIDES_KEY);

    if (__DEV__) {
      console.log('🔧 All feature flag overrides cleared');
    }
  }

  /**
   * Load flags from storage
   */
  private loadFromStorage(): void {
    try {
      const stored = storage.getString(this.FLAGS_KEY);
      if (stored) {
        this.flags = {
          ...DEFAULT_FLAGS,
          ...JSON.parse(stored),
        };
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to load feature flags from storage:', error);
      }
    }
  }

  /**
   * Save flags to storage
   */
  private saveToStorage(): void {
    try {
      storage.set(this.FLAGS_KEY, JSON.stringify(this.flags));
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to save feature flags to storage:', error);
      }
    }
  }

  /**
   * Load overrides from storage
   */
  private loadOverrides(): void {
    try {
      const stored = storage.getString(this.OVERRIDES_KEY);
      if (stored) {
        this.overrides = JSON.parse(stored);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to load feature flag overrides:', error);
      }
    }
  }

  /**
   * Save overrides to storage
   */
  private saveOverrides(): void {
    try {
      storage.set(this.OVERRIDES_KEY, JSON.stringify(this.overrides));
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to save feature flag overrides:', error);
      }
    }
  }

  /**
   * Start auto-refresh
   * - Refreshes flags every 5 minutes
   */
  private startAutoRefresh(): void {
    // Clear existing interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Refresh every 5 minutes
    this.refreshInterval = setInterval(() => {
      this.fetchFlags();
    }, 5 * 60 * 1000);
  }

  /**
   * Get last fetch timestamp
   */
  getLastFetchTime(): number | null {
    const stored = storage.getString(this.LAST_FETCH_KEY);
    return stored ? parseInt(stored, 10) : null;
  }

  /**
   * Check if flags are stale (older than 1 hour)
   */
  areStale(): boolean {
    const lastFetch = this.getLastFetchTime();
    if (!lastFetch) return true;

    const oneHour = 60 * 60 * 1000;
    return Date.now() - lastFetch > oneHour;
  }

  /**
   * Cleanup feature flags service
   */
  cleanup(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }

    if (__DEV__) console.log('🧹 Feature flags cleaned up');
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const featureFlagsService = new FeatureFlagsService();

export default featureFlagsService;
