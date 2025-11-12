/**
 * Mock API Service
 *
 * Simulates backend API responses for development and testing.
 * Replace this with real API calls when backend is ready.
 */

import type { AppStructure } from '../sdui';

// Mock structure.json
const MOCK_STRUCTURE: AppStructure = {
  version: '1.0.0',
  meta: {
    appName: 'Activity App',
    defaultPage: 'demo',
    theme: {
      primaryColor: '#FF6B6B',
      secondaryColor: '#4ECDC4',
      backgroundColor: '#FFFFFF',
      surfaceColor: '#F7F7F7',
      textColor: '#333333',
      textSecondary: '#666666',
      borderColor: '#E0E0E0',
      statusBarStyle: 'dark-content' as const,
    },
    topBarConfig: {
      left: {
        type: 'icon',
        id: 'app-logo',
        icon: 'activity',
        action: 'navigate://demo',
      },
      center: {
        type: 'search',
        id: 'global-search',
        action: 'none',
        placeholder: 'Zoek activiteiten...',
      },
      right: [
        {
          type: 'icon',
          id: 'notifications',
          icon: 'bell',
          action: 'navigate://notifications',
          badge: true,
          badgeSource: 'api://notifications/unread-count',
        },
        {
          type: 'avatar',
          id: 'profile-avatar',
          icon: 'user',
          action: 'navigate://profile',
        },
      ],
      contextualActions: {
        demo: {
          overflow: {
            type: 'menu',
            id: 'demo-overflow-menu',
            icon: 'more-vertical',
            action: 'none',
            items: [
              {
                id: 'menu-activity',
                label: 'Ga naar Activiteit',
                icon: 'map',
                action: 'navigate://activity',
              },
              {
                id: 'menu-reset',
                label: 'Reset Mock Data',
                icon: 'refresh-ccw',
                action: 'api://reset-data',
                destructive: true,
              },
            ],
          },
        },
        discover: {
          filter: {
            type: 'icon',
            id: 'filter-action',
            icon: 'filter',
            action: 'bottomsheet://discovery-filters',
          },
        },
        activity: {
          overflow: {
            type: 'menu',
            id: 'activity-overflow-menu',
            icon: 'more-vertical',
            action: 'none',
            items: [
              {
                id: 'menu-share',
                label: 'Deel activiteit',
                icon: 'share-2',
                action: 'share://activity',
              },
            ],
          },
        },
      },
    },
  },
  buildingBlocks: [
    {
      id: 'hero',
      componentName: 'HeroSection',
      defaultProps: {
        primaryColor: '#FF6B6B',
        secondaryColor: '#4ECDC4',
      },
      description: 'Hero banner with gradient background',
    },
    {
      id: 'activity-card',
      componentName: 'ActivityCard',
      defaultProps: {
        showDistance: true,
        showParticipants: true,
      },
      description: 'Activity card with image and details',
    },
  ],
  pages: [
    {
      id: 'demo',
      title: 'SDUI Demo',
      screenName: 'DemoScreen',
      containerLayout: {
        flex: 1,
        backgroundColor: '#F7F7F7',
      },
      sections: [
        {
          id: 'hero-section',
          buildingBlockId: 'hero',
          layout: {
            marginTop: 0,
            marginBottom: 16,
          },
          dataSource: {
            queryName: 'get_demo_hero',
            cachePolicy: {
              strategy: 'static',
              staleTimeMs: 3600000,
              persist: true,
            },
          },
        },
        {
          id: 'activity-1',
          buildingBlockId: 'activity-card',
          layout: {
            marginBottom: 12,
          },
          dataSource: {
            queryName: 'get_activity_1',
            cachePolicy: {
              strategy: 'static',
              staleTimeMs: 3600000,
              persist: true,
            },
          },
        },
        {
          id: 'activity-2',
          buildingBlockId: 'activity-card',
          layout: {
            marginBottom: 12,
          },
          dataSource: {
            queryName: 'get_activity_2',
            cachePolicy: {
              strategy: 'static',
              staleTimeMs: 3600000,
              persist: true,
            },
          },
        },
        {
          id: 'activity-3',
          buildingBlockId: 'activity-card',
          layout: {
            marginBottom: 12,
          },
          dataSource: {
            queryName: 'get_activity_3',
            cachePolicy: {
              strategy: 'static',
              staleTimeMs: 3600000,
              persist: true,
            },
          },
        },
      ],
      meta: {
        requiresAuth: false,
        headerShown: true,
        tabBarVisible: true,
      },
    },
  ],
  navigation: [
    {
      id: 'nav-demo',
      label: 'Demo',
      icon: 'home',
      pageId: 'demo',
      order: 0,
      visible: true,
    },
    {
      id: 'nav-activity',
      label: 'Activiteit',
      icon: 'map-pin',
      pageId: 'activity',
      order: 1,
      visible: true,
    },
    {
      id: 'nav-forme',
      label: 'Voor mij',
      icon: 'clipboard',
      badgeSource: 'api://badges/nav-forme',
      pageId: 'forme',
      order: 2,
      visible: true,
    },
    {
      id: 'nav-discover',
      label: 'Ontdekken',
      icon: 'search',
      badgeSource: 'api://badges/nav-discover',
      pageId: 'discover',
      order: 3,
      visible: true,
    },
    {
      id: 'nav-chats',
      label: 'Chats',
      icon: 'message-square',
      badgeSource: 'api://badges/nav-chats',
      pageId: 'chats',
      order: 4,
      visible: true,
    },
    {
      id: 'nav-profile',
      label: 'Profiel',
      icon: 'user',
      pageId: 'profile',
      order: 5,
      visible: true,
    },
  ],
};

// Mock data responses
const MOCK_DATA: Record<string, any> = {
  // ===== Hero & Activity Data =====
  get_demo_hero: {
    title: '🎉 SDUI Werkt!',
    subtitle: 'Backend-driven UI in React Native',
    ctaText: 'Ontdek Meer',
  },
  get_activity_1: {
    title: 'Voetbal in het Park',
    description: 'Gezellig potje voetbal met vrienden in het Vondelpark',
    imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80',
    location: 'Vondelpark, Amsterdam',
    distance: 2.3,
    participants: 8,
    date: '2025-11-15T14:00:00Z',
  },
  get_activity_2: {
    title: 'Hardlopen Langs het IJ',
    description: 'Groepsrun van 10km langs het prachtige IJ',
    imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80',
    location: 'IJ-promenade',
    distance: 4.7,
    participants: 12,
    date: '2025-11-16T08:00:00Z',
  },
  get_activity_3: {
    title: 'Yoga in het Park',
    description: 'Ontspannende yoga sessie bij zonsopgang',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
    location: 'Westerpark',
    distance: 1.8,
    participants: 15,
    date: '2025-11-17T07:00:00Z',
  },

  // ===== Badge Counts (Bottom Navigation) =====
  'badges/nav-forme': { count: 25 },
  'badges/nav-discover': { count: 51 },
  'badges/nav-chats': { count: 31 },
  'badges/nav-demo': { count: 0 },
  'badges/nav-activity': { count: 0 },
  'badges/nav-profile': { count: 0 },

  // ===== Badge Counts (Top Bar) =====
  'notifications/unread-count': { count: 3 },
  'messages/unread-count': { count: 8 },

  // ===== Generic Badge Endpoints =====
  'badge-count': { count: 5 }, // Fallback for testing
};

/**
 * Mock delay to simulate network latency
 */
function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock API Service
 */
export const mockApi = {
  /**
   * GET /api/structure
   */
  async getStructure(): Promise<AppStructure> {
    await delay(500); // Simulate network delay
    if (__DEV__) {
      console.log('[MockAPI] GET /api/structure');
    }
    return MOCK_STRUCTURE;
  },

  /**
   * GET /api/read?query_name={name}
   */
  async query(params: { query_name: string; [key: string]: any }): Promise<any> {
    await delay(200); // Simulate network delay

    const { query_name } = params;

    if (__DEV__) {
      console.log(`[MockAPI] GET /api/read?query_name=${query_name}`, params);
    }

    const data = MOCK_DATA[query_name];

    if (!data) {
      throw new Error(`Mock data not found for query: ${query_name}`);
    }

    return data;
  },
};

export default mockApi;
