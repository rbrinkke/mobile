/**
 * Structure Schema - React Native Edition
 *
 * Defines the ENTIRE app structure in JSON for React Native.
 *
 * This is the "Blueprint" that describes:
 * - Available pages
 * - Navigation structure
 * - Which building blocks each page uses
 * - Where to get the data for each page
 *
 * NO BRANDS. NO HARDCODED COMPONENTS. Just pure structure.
 *
 * KEY DIFFERENCES FROM WEB:
 * - Layout uses Flexbox (not CSS Grid)
 * - Building blocks reference React Native components
 * - Styles use StyleSheet or inline objects
 */

import { CachePolicy } from './policy.schema';

// ============================================================================
// Building Block Definition - React Native Components
// ============================================================================

/**
 * Building Block - Native Component Definition
 *
 * A BuildingBlock references a React Native component by name.
 * The component receives data as props and renders native Views.
 *
 * Example:
 * ```json
 * {
 *   "id": "hero",
 *   "componentName": "HeroSection",
 *   "defaultProps": {
 *     "backgroundColor": "#FF6B6B"
 *   }
 * }
 * ```
 *
 * The actual component implementation:
 * ```tsx
 * function HeroSection({ title, subtitle, backgroundColor }) {
 *   return (
 *     <View style={{ backgroundColor }}>
 *       <Text>{title}</Text>
 *       <Text>{subtitle}</Text>
 *     </View>
 *   );
 * }
 * ```
 */
export interface BuildingBlock {
  /** Unique ID for this block (e.g., 'hero', 'card', 'footer') */
  id: string;

  /** Name of the React Native component to render */
  componentName: string;

  /** Default props to pass to the component */
  defaultProps?: Record<string, any>;

  /** Optional description for documentation */
  description?: string;
}

// ============================================================================
// Layout System - Flexbox-Based
// ============================================================================

/**
 * Flex Direction
 */
export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';

/**
 * Flex Alignment
 */
export type FlexAlign = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';

/**
 * Flex Justify
 */
export type FlexJustify =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

/**
 * Section Layout - Flexbox-based positioning
 *
 * Uses React Native's Flexbox layout system.
 *
 * Example:
 * ```json
 * {
 *   "flex": 1,
 *   "flexDirection": "row",
 *   "justifyContent": "space-between",
 *   "alignItems": "center",
 *   "padding": 16,
 *   "margin": 8
 * }
 * ```
 */
export interface SectionLayout {
  /** Flex grow factor (0 = fixed size, 1 = flexible) */
  flex?: number;

  /** Flex direction */
  flexDirection?: FlexDirection;

  /** Main axis alignment */
  justifyContent?: FlexJustify;

  /** Cross axis alignment */
  alignItems?: FlexAlign;

  /** Padding (all sides) */
  padding?: number;

  /** Padding (individual sides) */
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;

  /** Margin (all sides) */
  margin?: number;

  /** Margin (individual sides) */
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  marginHorizontal?: number;
  marginVertical?: number;

  /** Width */
  width?: number | string;

  /** Height */
  height?: number | string;

  /** Min/Max dimensions */
  minWidth?: number | string;
  maxWidth?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;

  /** Display order (for responsive reordering) */
  order?: number;

  /** Background color */
  backgroundColor?: string;

  /** Border radius */
  borderRadius?: number;

  /** Shadow (iOS) */
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;

  /** Elevation (Android) */
  elevation?: number;
}

// ============================================================================
// Page Definition
// ============================================================================

/**
 * Page Section - Composition unit
 *
 * Combines THREE elements:
 * 1. BuildingBlock (the React Native component)
 * 2. DataSource (where to get the data)
 * 3. Layout (Flexbox positioning)
 *
 * This is the fundamental composition primitive.
 */
export interface PageSection {
  /** Unique section ID */
  id: string;

  /** Which building block to use (references BuildingBlock.id) */
  buildingBlockId: string;

  /** Layout specification - Flexbox-based */
  layout: SectionLayout;

  /** Where to get the data for this section */
  dataSource: {
    /** The query name (e.g., 'get_home_hero_data') */
    queryName: string;

    /** Optional params to pass to the query */
    params?: Record<string, any>;

    /** Cache policy for the data */
    cachePolicy: CachePolicy;
  };

  /** Optional: Transform data before passing to component */
  dataTransform?: string; // JavaScript function as string

  /** Optional: Conditional rendering */
  condition?: string; // JavaScript expression as string
}

/**
 * Page Definition - Complete page structure
 */
export interface PageDefinition {
  /** Unique page ID */
  id: string;

  /** Page title */
  title: string;

  /** Screen name for navigation */
  screenName: string;

  /** Sections that make up this page */
  sections: PageSection[];

  /** Optional layout for the page container */
  containerLayout?: SectionLayout;

  /** Optional metadata */
  meta?: {
    description?: string;
    requiresAuth?: boolean;
    headerShown?: boolean;
    tabBarVisible?: boolean;
  };
}

// ============================================================================
// Dynamic Menu System - SDUI Navigation
// ============================================================================

/**
 * Action Protocol - Type-safe action routing system
 *
 * Defines all possible actions that can be triggered from menu items.
 *
 * Examples:
 * - `navigate://profile` - Navigate to profile screen
 * - `modal://create-activity` - Open create activity modal
 * - `bottomsheet://filters` - Open filters bottom sheet
 * - `api://badge-count` - API call for data
 * - `share://activity-123` - Share content
 * - `confirm://delete` - Show confirmation dialog
 * - `none` - No action (e.g., for display-only elements)
 */
export type ActionProtocol =
  | `navigate://${string}`
  | `modal://${string}`
  | `bottomsheet://${string}`
  | `share://${string}`
  | `api://${string}`
  | `confirm://${string}`
  | 'none';

/**
 * Menu Action Type - Visual component type
 */
export type MenuActionType = 'icon' | 'avatar' | 'logo' | 'search' | 'menu';

/**
 * Menu Action Style - Visual style variant
 */
export type MenuActionStyle = 'default' | 'fab' | 'destructive';

/**
 * Menu Action - Universal building block for navigation elements
 *
 * This is the fundamental unit for all menu items: buttons, tabs, overflow menus.
 * Backend uses this to define every clickable element in the app.
 *
 * Example (Icon button with badge):
 * ```json
 * {
 *   "type": "icon",
 *   "id": "notifications",
 *   "icon": "bell",
 *   "action": "navigate://notifications",
 *   "badge": true,
 *   "badgeSource": "api://notifications/unread-count"
 * }
 * ```
 */
export interface MenuAction {
  /** Visual component type */
  type: MenuActionType;

  /** Unique identifier */
  id: string;

  /** Feather icon name (e.g., 'bell', 'search', 'user') */
  icon?: string;

  /** Text label (for tabs, menu items) */
  label?: string;

  /** Action to execute when tapped */
  action: ActionProtocol;

  /** Visual style variant */
  style?: MenuActionStyle;

  // ===== Badge Support =====
  /** Show badge indicator? */
  badge?: boolean;

  /** API endpoint for live badge count (e.g., 'api://messages/unread-count') */
  badgeSource?: ActionProtocol;

  // ===== Search-specific =====
  /** Placeholder text for search bars */
  placeholder?: string;

  /** Is this a contextual element? (internal use) */
  contextual?: boolean;

  // ===== Menu-specific (overflow menus) =====
  /** Child menu items (for type='menu') */
  items?: MenuAction[];

  /** Destructive action? (renders in red) */
  destructive?: boolean;
}

/**
 * Top Bar Configuration - Header navigation structure
 *
 * Defines the complete top bar of the app, including:
 * - Static elements (logo, search, profile)
 * - Context-aware actions (filter buttons, overflow menus per screen)
 *
 * Example:
 * ```json
 * {
 *   "left": { "type": "logo", "icon": "activity", "action": "navigate://home" },
 *   "center": { "type": "search", "placeholder": "Search..." },
 *   "right": [
 *     { "type": "icon", "icon": "bell", "badge": true, "badgeSource": "api://notifications" }
 *   ],
 *   "contextualActions": {
 *     "discover": {
 *       "filter": { "type": "icon", "icon": "filter", "action": "bottomsheet://filters" }
 *     }
 *   }
 * }
 * ```
 */
export interface TopBarConfig {
  /** Left element (typically logo or back button) */
  left?: MenuAction;

  /** Center element (typically search bar or title) */
  center?: MenuAction;

  /** Right elements (typically notifications, profile, etc.) */
  right?: MenuAction[];

  /**
   * Context-aware actions per page/screen
   *
   * Map of pageId -> actions that appear ONLY on that page.
   * This allows different screens to have different toolbars.
   *
   * Example:
   * - "discover" page shows filter button
   * - "activity-detail" page shows share button
   */
  contextualActions: Record<string, {
    /** Filter button (common pattern) */
    filter?: MenuAction;

    /** Overflow menu (three dots with dropdown) */
    overflow?: MenuAction;
  }>;
}

// ============================================================================
// Navigation Structure
// ============================================================================

/**
 * Navigation Item - Bottom Tab Navigation
 *
 * UPDATED: Now supports live badge counts via badgeSource.
 */
export interface NavigationItem {
  /** Item ID */
  id: string;

  /** Label to display */
  label: string;

  /** Feather icon name (e.g., 'home', 'search', 'user') */
  icon?: string;

  /** Static badge count (deprecated, use badgeSource instead) */
  badge?: number;

  /** API endpoint for live badge count (e.g., 'api://messages/unread-count') */
  badgeSource?: ActionProtocol;

  /** Target page ID */
  pageId: string;

  /** Order in navigation */
  order: number;

  /** Visible? */
  visible: boolean;
}

// ============================================================================
// Theme Configuration
// ============================================================================

/**
 * App Theme - Colors and styling
 */
export interface AppTheme {
  /** Primary brand color */
  primaryColor: string;

  /** Secondary accent color */
  secondaryColor: string;

  /** Background colors */
  backgroundColor: string;
  surfaceColor: string;

  /** Text colors */
  textColor: string;
  textSecondary: string;

  /** Border and divider colors */
  borderColor: string;

  /** Status bar style */
  statusBarStyle: 'light-content' | 'dark-content';

  /** Font family (optional) */
  fontFamily?: string;
}

// ============================================================================
// Complete Structure
// ============================================================================

/**
 * App Structure - The complete app definition for React Native
 *
 * This is THE ONLY configuration the frontend needs.
 *
 * UPDATED: Now includes topBarConfig for dynamic top navigation.
 */
export interface AppStructure {
  /** Structure version */
  version: string;

  /** App metadata */
  meta: {
    appName: string;
    defaultPage: string;
    theme: AppTheme;
    /** Top bar configuration (optional, for dynamic top navigation) */
    topBarConfig?: TopBarConfig;
  };

  /** All available building blocks */
  buildingBlocks: BuildingBlock[];

  /** All page definitions */
  pages: PageDefinition[];

  /** Navigation structure */
  navigation: NavigationItem[];

  /** Global cache policy overrides (optional) */
  cacheDefaults?: {
    buildingBlocks?: { strategy: 'static'; staleTimeMs: number };
    data?: { strategy: 'onLoad' | 'poll'; staleTimeMs?: number };
  };
}

// ============================================================================
// Example Structure - React Native SDUI
// ============================================================================

/**
 * Example of a complete AppStructure for React Native
 *
 * This demonstrates:
 * 1. BuildingBlocks as component references
 * 2. Flexbox-based layout system
 * 3. Separation of content (component), data (query), and layout (flexbox)
 */
export const EXAMPLE_STRUCTURE: AppStructure = {
  version: '1.0.0',
  meta: {
    appName: 'Activity App',
    defaultPage: 'activity',
    theme: {
      primaryColor: '#FF6B6B',
      secondaryColor: '#4ECDC4',
      backgroundColor: '#FFFFFF',
      surfaceColor: '#F7F7F7',
      textColor: '#333333',
      textSecondary: '#666666',
      borderColor: '#E0E0E0',
      statusBarStyle: 'dark-content',
    },
  },

  // ========================================================================
  // Building Blocks - React Native Components
  // ========================================================================
  buildingBlocks: [
    {
      id: 'hero',
      componentName: 'HeroSection',
      defaultProps: {
        variant: 'gradient',
      },
      description: 'Hero banner with title and CTA',
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
    {
      id: 'user-avatar-list',
      componentName: 'UserAvatarList',
      defaultProps: {
        maxVisible: 5,
      },
      description: 'Horizontal list of user avatars',
    },
  ],

  // ========================================================================
  // Pages - Composed with FLEXBOX LAYOUT
  // ========================================================================
  pages: [
    {
      id: 'activity',
      title: 'Activiteit',
      screenName: 'ActivityScreen',
      containerLayout: {
        flex: 1,
        backgroundColor: '#FFFFFF',
      },
      sections: [
        // Hero Section at top
        {
          id: 'hero-section',
          buildingBlockId: 'hero',
          layout: {
            height: 200,
            marginBottom: 16,
          },
          dataSource: {
            queryName: 'get_activity_hero',
            cachePolicy: { strategy: 'static', staleTimeMs: 3600000, persist: true },
          },
        },

        // Activity Cards - Vertical list
        {
          id: 'activity-list',
          buildingBlockId: 'activity-card',
          layout: {
            flex: 1,
            paddingHorizontal: 16,
          },
          dataSource: {
            queryName: 'get_nearby_activities',
            params: { radius_km: 10 },
            cachePolicy: { strategy: 'onLoad', staleTimeMs: 300000, persist: true },
          },
        },
      ],
      meta: {
        requiresAuth: true,
        headerShown: false,
        tabBarVisible: true,
      },
    },
  ],

  // Navigation
  navigation: [
    {
      id: 'nav-activity',
      label: 'Activiteit',
      icon: '📍',
      pageId: 'activity',
      order: 1,
      visible: true,
    },
    {
      id: 'nav-forme',
      label: 'Voor mij',
      icon: '📋',
      badge: 25,
      pageId: 'forme',
      order: 2,
      visible: true,
    },
    {
      id: 'nav-discover',
      label: 'Ontdekken',
      icon: '🔍',
      badge: 51,
      pageId: 'discover',
      order: 3,
      visible: true,
    },
    {
      id: 'nav-chats',
      label: 'Chats',
      icon: '💬',
      badge: 31,
      pageId: 'chats',
      order: 4,
      visible: true,
    },
    {
      id: 'nav-profile',
      label: 'Profiel',
      icon: '👤',
      pageId: 'profile',
      order: 5,
      visible: true,
    },
  ],
};
