# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **React Native mobile app** built with **Expo** using a **Server-Driven UI (SDUI)** architecture. The app renders its interface dynamically based on JSON structure definitions from the backend, allowing UI changes without app updates.

**Tech Stack:**
- React Native 0.81.5 / React 19.1.0
- Expo ~54.0
- TypeScript (strict mode)
- React Navigation (bottom tabs + dynamic screens)
- TanStack Query (data fetching & caching)
- Zod (runtime schema validation)
- Playwright (E2E testing for web)

**Architecture Philosophy:**
- **Backend-Driven UI**: All page structures, navigation, and building blocks defined in JSON
- **Zero Hardcoded Screens**: Screens are 3-line wrappers around `UniversalPageRenderer`
- **Component Registry Pattern**: Building blocks map to React Native components via registration system
- **Type-Safe Runtime**: Zod schemas validate JSON structure at runtime
- **Cache-First Data**: TanStack Query with configurable cache policies per section

## Development Commands

### Start Development Server

```bash
# Standard start (uses cache)
npm start

# Clean start (clears all caches - use when things act weird)
./scripts/clean-start.sh

# Platform-specific shortcuts
npm run android    # Launch on Android
npm run ios        # Launch on iOS (Mac only)
npm run web        # Launch in browser
```

**Access URLs:**
- Web: http://localhost:19006 or http://localhost:8081
- Mobile: Scan QR code in terminal with Expo Go app

### Testing

```bash
# Run Playwright E2E tests (web only)
npx playwright test

# Run specific test
npx playwright test tests/overflow-menu.spec.ts

# Run with UI
npx playwright test --ui

# Debug mode
npx playwright test --debug
```

**Note:** Playwright tests run against the web build (`http://localhost:8081`), not native builds.

### Clean & Reset

```bash
# Full cache clean (when Metro/Expo acts weird)
./scripts/clean-start.sh

# Manual cache clean
rm -rf .expo node_modules/.cache .metro-cache
pkill -f expo && pkill -f metro

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Architecture Deep Dive

### SDUI System Flow

```
Backend JSON (mockApi.ts)
    ↓
Structure Definition (AppStructure)
    ↓
UniversalPageRenderer
    ↓
Building Block Registry (COMPONENT_REGISTRY)
    ↓
React Native Components (HeroSection, ActivityCard, etc.)
```

**Key Files:**
- `src/sdui/schema/structure.schema.ts` - TypeScript types for SDUI structure
- `src/sdui/setup.ts` - Building block registration (runs on startup)
- `src/sdui/components/UniversalPageRenderer.tsx` - Core rendering engine
- `src/services/mockApi.ts` - Mock backend (replace with real API)

### Adding a New Building Block

**Pattern to follow:**

1. **Create Component** in `src/sdui/components/blocks/`:
```tsx
// MyNewBlock.tsx
export interface MyNewBlockProps {
  title: string;
  description?: string;
}

export default function MyNewBlock({ title, description }: MyNewBlockProps) {
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
      {description && <Text>{description}</Text>}
    </View>
  );
}
```

2. **Export from Index** in `src/sdui/components/blocks/index.ts`:
```tsx
export { default as MyNewBlock } from './MyNewBlock';
```

3. **Register in Setup** in `src/sdui/setup.ts`:
```tsx
import { MyNewBlock } from './components/blocks';

export function setupSduiSystem() {
  registerBuildingBlock('my-new-block', MyNewBlock);
  // ... other blocks
}
```

4. **Add to Structure** in `src/services/mockApi.ts`:
```typescript
buildingBlocks: [
  {
    id: 'my-new-block',
    componentName: 'MyNewBlock',
    defaultProps: { /* optional defaults */ },
    description: 'My new building block',
  },
]
```

5. **Use in Page Sections**:
```typescript
sections: [
  {
    id: 'my-section',
    buildingBlockId: 'my-new-block',
    layout: { marginBottom: 16 },
    dataSource: {
      queryName: 'get_my_data',
      cachePolicy: { strategy: 'static', staleTimeMs: 3600000, persist: true },
    },
  },
]
```

### Data Flow & Caching

**TanStack Query Integration:**
- Each `PageSection` defines a `dataSource.queryName`
- `UniversalPageRenderer` creates React Query hooks per section
- Cache policies (`strategy`, `staleTimeMs`, `persist`) map to React Query options

**Cache Strategies:**
- `static`: Never refetch (infinite stale time)
- `onLoad`: Refetch on page load (short stale time)
- `poll`: Background polling (custom implementation needed)

**Example Data Fetch:**
```typescript
// In mockApi.ts
const MOCK_DATA: Record<string, any> = {
  get_hero_data: {
    title: 'Welcome!',
    subtitle: 'Server-Driven UI',
    ctaText: 'Get Started',
  },
};
```

### Navigation System

**Dynamic Navigation:**
- Bottom tabs generated from `structure.navigation[]`
- Tab icons use Feather icons via `@expo/vector-icons`
- Badge counts support static numbers or live `badgeSource` API endpoints

**Adding a New Screen:**

1. Create screen file in `src/screens/`:
```tsx
// NewScreen.tsx
import { UniversalPageRenderer } from '../sdui';

export default function NewScreen() {
  return <UniversalPageRenderer pageId="new-page" />;
}
```

2. Add navigation item in `mockApi.ts`:
```typescript
navigation: [
  {
    id: 'nav-new',
    label: 'New',
    icon: 'star',  // Feather icon name
    pageId: 'new-page',
    order: 6,
    visible: true,
    badgeSource: 'api://badges/nav-new',  // Optional live badge
  },
]
```

3. Add page definition:
```typescript
pages: [
  {
    id: 'new-page',
    title: 'New Page',
    screenName: 'NewScreen',
    sections: [ /* ... */ ],
  },
]
```

**Note:** `DynamicNavigator` automatically creates tabs from the navigation structure.

### Menu System & Top Bar

**Dynamic Top Bar:**
- Configured via `appStructure.meta.topBarConfig`
- Supports static elements (logo, search, profile)
- Context-aware actions per screen (overflow menus, filters)

**Action Protocol:**
- `navigate://screen-id` - Navigate to screen
- `modal://modal-id` - Open modal
- `bottomsheet://sheet-id` - Open bottom sheet
- `share://content-id` - Share content
- `api://endpoint` - API call (e.g., badge counts)
- `confirm://action-id` - Confirmation dialog
- `none` - No action

**Overflow Menu Pattern:**
```typescript
contextualActions: {
  'demo': {
    overflow: {
      type: 'menu',
      id: 'demo-overflow',
      icon: 'more-vertical',
      action: 'none',
      items: [
        {
          type: 'icon',
          id: 'share',
          label: 'Share',
          icon: 'share-2',
          action: 'share://app',
        },
        {
          type: 'icon',
          id: 'reset',
          label: 'Reset',
          icon: 'refresh-ccw',
          action: 'api://reset-data',
          destructive: true,
        },
      ],
    },
  },
}
```

**Implementation:** See `src/components/OverflowMenu.tsx` and `src/services/MenuActionHandler.ts`

## Common Development Patterns

### Layout System (Flexbox)

React Native uses **Flexbox for all layouts**. Section layouts map directly to `StyleSheet`:

```typescript
// JSON layout definition
layout: {
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 16,
  marginBottom: 8,
  backgroundColor: '#FFFFFF',
  borderRadius: 8,
}

// Converted to React Native style automatically
```

**Common patterns:**
- `flex: 1` - Fill available space
- `flexDirection: 'column'` - Vertical stacking (default)
- `flexDirection: 'row'` - Horizontal layout
- `paddingHorizontal` - Left + right padding
- `marginVertical` - Top + bottom margin

### TypeScript Strict Mode

This project uses **strict TypeScript**. All types must be explicit:

```tsx
// ✅ Good
interface Props {
  title: string;
  count?: number;
}

function MyComponent({ title, count = 0 }: Props) { }

// ❌ Bad
function MyComponent(props: any) { }  // no 'any' types
```

**Type Sources:**
- `src/sdui/schema/structure.schema.ts` - SDUI structure types
- `src/sdui/types/runtime-context.types.ts` - Runtime context types

### Debugging SDUI

**Console logs to watch:**
```
✅ SDUI System initialized - 2 building blocks registered
[useStructure] Loading from mock API...
[useStructure] Loaded app structure: { version: "1.0.0", ... }
[UniversalPageRenderer] pageId: demo
[UniversalPageRenderer] pageDefinition: FOUND
[MockAPI] GET /api/read?query_name=get_demo_hero
```

**Common issues:**
- **Blank screen**: Check console for "SDUI System initialized" - if missing, `setupSduiSystem()` didn't run
- **Component not rendering**: Verify building block ID matches registered ID exactly
- **Data not loading**: Check `MOCK_DATA` has entry for `queryName`
- **Layout broken**: Inspect `layout` object in page section definition

### Authentication Flow

**JWT Token Management:**
- Token stored via `setAuthToken()` in `src/services/apiClient.ts`
- Dev token set in `App.tsx` for development
- Production: Implement proper auth flow (login screen → token storage → API headers)

**Current setup:**
```tsx
// App.tsx - Development only
if (__DEV__) {
  setAuthToken('eyJhbGc...');  // Test JWT
}
```

**API Client:**
- `src/services/apiClient.ts` - HTTP client with JWT header injection
- Replace `mockApi` calls with real API client when backend ready

## File Structure Overview

```
/mobile
├── App.tsx                          # Entry point, QueryClient setup
├── index.ts                         # Expo entry
│
├── src/
│   ├── sdui/                        # SDUI Core System
│   │   ├── components/
│   │   │   ├── blocks/              # Building block components
│   │   │   │   ├── HeroSection.tsx
│   │   │   │   ├── ActivityCard.tsx
│   │   │   │   └── index.ts
│   │   │   ├── UniversalPageRenderer.tsx  # Main renderer
│   │   │   └── DynamicTopBar.tsx    # Top navigation
│   │   │
│   │   ├── hooks/
│   │   │   ├── useStructure.ts      # Structure fetching
│   │   │   └── useRuntimeContext.ts # Runtime params
│   │   │
│   │   ├── schema/
│   │   │   ├── structure.schema.ts  # TypeScript types
│   │   │   └── policy.schema.ts     # Cache policies
│   │   │
│   │   ├── setup.ts                 # Building block registration
│   │   └── index.ts                 # Public exports
│   │
│   ├── navigation/
│   │   ├── DynamicNavigator.tsx     # Bottom tab navigator
│   │   ├── BottomTabNavigator.tsx   # Tab bar component
│   │   └── useScreens.tsx           # Screen registration
│   │
│   ├── screens/                     # Screen wrappers (3 lines each)
│   │   ├── DemoScreen.tsx
│   │   ├── ActivityScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── ...
│   │
│   ├── components/
│   │   └── OverflowMenu.tsx         # Overflow menu component
│   │
│   ├── services/
│   │   ├── mockApi.ts               # Mock backend (REPLACE THIS)
│   │   ├── apiClient.ts             # HTTP client with JWT
│   │   └── MenuActionHandler.ts     # Action protocol router
│   │
│   └── config/
│       └── api.config.ts            # API endpoints
│
├── tests/                           # Playwright E2E tests
│   ├── overflow-menu.spec.ts
│   ├── expanded-menu-showcase.spec.ts
│   └── check-console.spec.ts
│
└── scripts/
    └── clean-start.sh               # Cache cleaning script
```

## Connecting to Real Backend

**Current State:** App uses `mockApi.ts` for all data.

**Migration Steps:**

1. **Replace Structure Endpoint:**
```tsx
// src/sdui/hooks/useStructure.ts
// Change from:
const data = await mockApi.getStructure();

// To:
const data = await apiClient.get('/api/structure');
```

2. **Replace Data Queries:**
```tsx
// src/sdui/components/UniversalPageRenderer.tsx
// Change from:
const data = await mockApi.query({ query_name });

// To:
const data = await apiClient.get('/api/read', { params: { query_name } });
```

3. **Handle Badge Counts:**
```tsx
// Implement badge fetching in DynamicTopBar.tsx & BottomTabNavigator.tsx
// Parse badgeSource protocol: 'api://notifications/unread-count'
// Make API call: apiClient.get('/api/notifications/unread-count')
```

4. **Environment Variables:**
```bash
# Create .env
API_BASE_URL=https://api.yourapp.com
JWT_SECRET_KEY=your-production-secret
```

## Performance Considerations

**Bundle Size:**
- Current: ~5MB (within target)
- Monitor with: `npx expo export --platform web` → check `dist/` size

**Cache Strategy:**
- Structure JSON: Static cache (never refetch)
- Page data: 5-minute stale time
- Badge counts: Short stale time or polling

**Optimization Tips:**
- Use `React.memo()` for building blocks that receive same props
- Implement `FlatList` for long lists (not `ScrollView`)
- Lazy load images with `expo-image` (not implemented yet)

## Testing Strategy

**Current Coverage:**
- Playwright E2E: Overflow menu interactions, console validation
- Unit tests: Not implemented yet

**Adding Tests:**

```typescript
// tests/new-feature.spec.ts
import { test, expect } from '@playwright/test';

test('feature works', async ({ page }) => {
  await page.goto('http://localhost:8081');
  await page.waitForSelector('text=SDUI Werkt!');
  // ... test logic
});
```

**Run before commits:**
```bash
npx playwright test --reporter=list
```

## Troubleshooting

### Metro Bundler Issues

**Symptom:** Changes not reflected, stale cache
```bash
./scripts/clean-start.sh
```

### Port Already in Use

**Symptom:** `EADDRINUSE: address already in use :::8081`
```bash
pkill -f expo
pkill -f metro
npm start
```

### Building Block Not Rendering

**Checklist:**
1. ✅ Component exported from `src/sdui/components/blocks/index.ts`
2. ✅ Registered in `src/sdui/setup.ts`
3. ✅ ID in `mockApi.ts` matches registration ID exactly
4. ✅ `setupSduiSystem()` called in `App.tsx` before render
5. ✅ Check console for "Registered building block: {id}"

### TypeScript Errors

**Symptom:** `Type 'X' is not assignable to type 'Y'`

All SDUI structures must match schema types. Import from:
```tsx
import type { PageSection, BuildingBlock } from './sdui/schema/structure.schema';
```

### Images Not Loading

**Symptom:** Gray boxes instead of images

Mock API uses Unsplash URLs - requires internet connection. For offline:
```tsx
// Use local assets or placeholder images
imageUrl: require('./assets/placeholder.png')
```

## Production Deployment Checklist

- [ ] Replace `mockApi.ts` with real API client
- [ ] Implement proper authentication flow
- [ ] Set production `API_BASE_URL` in environment
- [ ] Remove dev JWT token from `App.tsx`
- [ ] Configure Sentry or error tracking
- [ ] Enable production builds: `eas build --platform all`
- [ ] Test on physical devices (Android + iOS)
- [ ] Validate cache policies for production traffic
- [ ] Setup CI/CD pipeline for automated builds
- [ ] Review and update app permissions in `app.json`

## Additional Resources

- **Expo Docs:** https://docs.expo.dev/
- **React Navigation:** https://reactnavigation.org/
- **TanStack Query:** https://tanstack.com/query/latest
- **Feather Icons:** https://feathericons.com/ (for icon names)
