# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React Native mobile app for the Activity App ecosystem, built with **Expo**, **TypeScript**, and a **Server-Driven UI (SDUI)** architecture. The app renders its entire UI dynamically from backend-provided JSON structure, allowing instant UI updates without app deployments.

## Common Commands

### Development

```bash
# Start Expo development server
npm start

# Platform-specific launches
npm run android          # Launch on Android emulator/device
npm run ios             # Launch on iOS simulator (Mac only)
npm run web             # Launch in web browser

# Type checking
npx tsc --noEmit        # Verify TypeScript compilation
```

### Testing with Expo

```bash
# In Expo development server (after npm start):
# Press 'w' → Open in web browser
# Press 'a' → Open in Android emulator
# Press 'i' → Open in iOS simulator
# Scan QR code → Open in Expo Go app on physical device

# For WSL environments
npx expo start --tunnel  # Enables access from physical devices
```

### Connecting to Backend

The app expects two backend services:

1. **Auth API** (port 8000) - Authentication service at `/mnt/d/activity/auth-api`
2. **Content API** (port 8002) - SDUI structure and data endpoints

Update `src/config/api.config.ts` with your backend URL (use local IP for physical devices, not localhost).

## Architecture Overview

### SDUI System (Server-Driven UI)

The core concept: **Backend controls UI structure, frontend renders dynamically.**

```
Backend (structure.json)
    ↓
useStructure() → Load app definition
    ↓
UniversalPageRenderer → Compose pages with Flexbox
    ↓
Building Blocks (native components) → Render Views
    ↓
Dynamic, Backend-Driven UI ✨
```

### Key Architectural Decisions

**Why SDUI?**
- Instant UI updates without app store deployments
- A/B testing and personalization without code changes
- Consistent cross-platform experience
- Backend team controls UX iteration speed

**Layout System: React Native Flexbox**
- Native layout engine (not CSS Grid emulation)
- SectionLayout uses Flexbox properties directly
- Responsive by default, performance-optimized

**Component System: Building Blocks**
- Reusable React Native components registered at startup
- Backend references blocks by ID in structure.json
- Each block receives data as props from backend queries

**Data Flow: TanStack Query**
- All data queries managed by TanStack Query
- Cache policies defined per-section in structure.json
- Three strategies: `static` (immutable), `onLoad` (stale-while-revalidate), `poll` (periodic refresh)

### Directory Structure

```
src/
├── sdui/                           # Complete SDUI system
│   ├── schema/
│   │   ├── structure.schema.ts     # App structure types (pages, blocks, layout)
│   │   └── policy.schema.ts        # Cache policy definitions
│   ├── types/
│   │   └── runtime-context.types.ts # Runtime context ($$USER, $$GEOLOCATION, $$FILTER)
│   ├── hooks/
│   │   ├── useStructure.ts         # Load structure.json from backend
│   │   └── useRuntimeContext.ts    # Aggregate runtime context variables
│   ├── components/
│   │   ├── UniversalPageRenderer.tsx # Core rendering engine
│   │   └── blocks/                 # Building block components
│   │       ├── HeroSection.tsx     # Hero banner with gradient
│   │       ├── ActivityCard.tsx    # Activity card with image
│   │       └── index.ts            # Building block exports
│   ├── engine/                     # SDUI rendering engine utilities
│   ├── utils/                      # SDUI helper functions
│   ├── setup.ts                    # Building block registration
│   └── index.ts                    # Clean exports
│
├── screens/                        # Screen components (minimal code)
│   ├── ActivityScreen.tsx          # Uses UniversalPageRenderer
│   ├── DemoScreen.tsx              # SDUI demo with mock data
│   └── [Other screens]             # Placeholder screens
│
├── navigation/
│   └── BottomTabNavigator.tsx      # Bottom tab navigation (5 tabs)
│
├── services/
│   ├── apiClient.ts                # Real API client (JWT auth)
│   └── mockApi.ts                  # Mock backend for development
│
├── config/
│   └── api.config.ts               # API endpoint configuration
│
└── [components, hooks, utils]      # Shared utilities
```

### Backend Contract

The backend MUST implement these endpoints:

#### GET /api/sdui/structure
Returns complete app structure as JSON.

```typescript
{
  version: string;
  meta: {
    appName: string;
    defaultPage: string;
    theme: { primaryColor, secondaryColor, ... };
  };
  buildingBlocks: Array<{
    id: string;                    // e.g., "hero", "activity-card"
    componentName: string;         // React component name
    defaultProps?: Record<string, any>;
  }>;
  pages: Array<{
    id: string;
    title: string;
    screenName: string;
    sections: Array<{
      id: string;
      buildingBlockId: string;     // References buildingBlock.id
      layout: SectionLayout;       // Flexbox layout properties
      dataSource: {
        queryName: string;         // Data query identifier
        params?: Record<string, any>;
        cachePolicy: { strategy, staleTimeMs, persist? };
      };
    }>;
  }>;
  navigation: Array<{
    id, label, icon, pageId, order, visible, badge?
  }>;
}
```

#### GET /api/sdui/read?query_name={name}&{params}
Returns data for specific sections.

Example queries:
- `get_activity_hero` → Hero section content
- `get_nearby_activities` → List of activities
- `get_user_profile` → User profile data

Runtime context variables like `$$USER.ID` or `$$GEOLOCATION.LAT` are resolved client-side before API calls.

### Authentication

JWT token management via `src/services/apiClient.ts`:

```typescript
import { setAuthToken } from './services/apiClient';

// After successful login
setAuthToken(jwtAccessToken);

// All API requests automatically include: Authorization: Bearer {token}
```

Dev mode sets test token in `App.tsx` for development without auth backend.

## Creating New Building Blocks

Building blocks are reusable React Native components that the backend can compose into pages.

### Step 1: Create Component

```tsx
// src/sdui/components/blocks/MyNewBlock.tsx
import { View, Text, StyleSheet } from 'react-native';

interface MyNewBlockProps {
  title: string;
  content: string;
  color?: string;
}

export default function MyNewBlock({ title, content, color = '#333' }: MyNewBlockProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color }]}>{title}</Text>
      <Text style={styles.content}>{content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
  },
});
```

### Step 2: Register Block

```typescript
// src/sdui/setup.ts
import MyNewBlock from './components/blocks/MyNewBlock';
import { registerBuildingBlock } from './components/UniversalPageRenderer';

export function setupSduiSystem() {
  registerBuildingBlock('my-new-block', MyNewBlock);
  // ... other blocks

  if (__DEV__) {
    console.log('✅ SDUI System initialized');
  }
}
```

### Step 3: Export Block

```typescript
// src/sdui/components/blocks/index.ts
export { default as MyNewBlock } from './MyNewBlock';
```

### Step 4: Backend Uses It

Backend can now reference this block in structure.json:

```json
{
  "id": "custom-section",
  "buildingBlockId": "my-new-block",
  "layout": { "padding": 16 },
  "dataSource": {
    "queryName": "get_my_data",
    "cachePolicy": { "strategy": "onLoad", "staleTimeMs": 300000 }
  }
}
```

## Adding New Screens

Screens are minimal wrappers around UniversalPageRenderer:

```tsx
// src/screens/NewScreen.tsx
import { UniversalPageRenderer } from '../sdui';

export default function NewScreen() {
  return <UniversalPageRenderer pageId="new-page-id" />;
}
```

The `pageId` must match a page definition in the backend's structure.json.

## Cache Policy Guidelines

Three cache strategies available:

1. **static**: Immutable data, cached forever
   - Use for: App structure, static content, theme configuration
   - `{ strategy: 'static', staleTimeMs: Infinity, persist: true }`

2. **onLoad**: Stale-while-revalidate pattern
   - Use for: User-specific data, activity lists, profiles
   - `{ strategy: 'onLoad', staleTimeMs: 300000 }` (5 minutes)

3. **poll**: Periodic background refresh
   - Use for: Real-time data, notifications, live feeds
   - `{ strategy: 'poll', intervalMs: 30000 }` (30 seconds)

## Runtime Context System

Inject client-side data into backend queries using context variables:

### Available Contexts

- `$$USER.ID` - Current user ID
- `$$USER.EMAIL` - User email
- `$$GEOLOCATION.LAT` - GPS latitude
- `$$GEOLOCATION.LON` - GPS longitude
- `$$FILTER.RADIUS_KM` - Search radius filter

### Usage in Structure

```json
{
  "dataSource": {
    "queryName": "get_nearby_activities",
    "params": {
      "user_id": "$$USER.ID",
      "lat": "$$GEOLOCATION.LAT",
      "lon": "$$GEOLOCATION.LON",
      "radius_km": "$$FILTER.RADIUS_KM"
    }
  }
}
```

Client resolves these before calling backend API.

## Development Workflow

### Initial Setup
1. Clone repo
2. `npm install`
3. Update `src/config/api.config.ts` with backend URL
4. `npm start`

### Working with Mock Data
Mock API in `src/services/mockApi.ts` provides sample structure.json and data for development without backend.

To switch between mock and real API:
- Mock: Use `mockApi` in `useStructure.ts`
- Real: Use `apiClient` from `src/services/apiClient.ts`

### Hot Reload
Expo supports fast refresh. Changes to:
- Building blocks → Instant refresh
- Screens → Instant refresh
- Structure (mock) → Restart required

### Debugging SDUI
Development mode shows debug banner at top of pages:
```
🔧 SDUI Debug: Page "demo" | 4 sections
```

Console logs show:
- Building block registration
- Structure loading
- API queries
- Cache hits/misses

## Performance Considerations

- **Structure Loading**: Cached statically, loaded once per app session
- **Image Loading**: Uses React Native Image with built-in caching
- **List Rendering**: Use FlatList for long lists (add building block if needed)
- **Bundle Size**: Expo manages JS bundle optimization automatically

## TypeScript Usage

Strict mode enabled. Key types:

- `AppStructure` - Complete app definition
- `PageDefinition` - Page structure
- `PageSection` - Section with block + data + layout
- `BuildingBlock` - Component registration
- `SectionLayout` - Flexbox layout properties
- `CachePolicy` - Data caching strategy

All SDUI types exported from `src/sdui/index.ts`.

## Common Issues

**Images not loading**: Check internet connection (Unsplash URLs require network access)

**Building block not found**: Verify block ID in structure.json matches registered ID in setup.ts

**JWT token missing**: Call `setAuthToken()` after login, before using SDUI endpoints

**TypeScript errors**: Run `npx tsc --noEmit` to check compilation

**Expo cache issues**: `npx expo start --clear` clears Metro bundler cache
