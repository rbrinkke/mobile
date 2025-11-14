# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **React Native mobile app** built with **Expo** for a social activity platform. The app provides a native mobile experience with bottom tab navigation, screens for activities, chat, discovery, and user profiles.

**Tech Stack:**
- React Native 0.81.5 / React 19.1.0
- Expo ~54.0
- TypeScript (strict mode)
- React Navigation (bottom tabs)
- TanStack Query (data fetching & caching)
- Zod (runtime schema validation)
- Playwright (E2E testing for web)

**Architecture:**
- Native React Native components
- Bottom tab navigation with dynamic routing
- TanStack Query for data management
- Type-safe with strict TypeScript
- Component-based architecture

## Development Commands

### Start Development Server

```bash
# Standard start
npm start

# Clean start (clears all caches)
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

## Project Structure

```
/mobile
├── App.tsx                          # Entry point, QueryClient & Navigation setup
├── index.ts                         # Expo entry
│
├── src/
│   ├── components/                  # Reusable components
│   │   ├── ui/                      # UI primitives
│   │   └── OverflowMenu.tsx         # Overflow menu component
│   │
│   ├── navigation/
│   │   └── BottomTabNavigator.tsx   # Bottom tab navigation
│   │
│   ├── screens/                     # Screen components
│   │   ├── ActivityScreen.tsx       # Activity feed
│   │   ├── ForMeScreen.tsx          # Personalized content
│   │   ├── DiscoverScreen.tsx       # Discovery/search
│   │   ├── ChatsScreen.tsx          # Chat/messaging
│   │   ├── ProfileScreen.tsx        # User profile
│   │   ├── NotificationsScreen.tsx  # Notifications
│   │   └── MapViewScreen.tsx        # Map-based activity view
│   │
│   ├── services/
│   │   └── apiClient.ts             # HTTP client with JWT
│   │
│   ├── config/
│   │   └── api.config.ts            # API endpoints
│   │
│   ├── hooks/                       # Custom React hooks
│   └── utils/                       # Utility functions
│
├── tests/                           # Playwright E2E tests
│   ├── overflow-menu.spec.ts
│   ├── expanded-menu-showcase.spec.ts
│   └── check-console.spec.ts
│
└── scripts/
    └── clean-start.sh               # Cache cleaning script
```

## Common Development Patterns

### Adding a New Screen

1. **Create screen component** in `src/screens/`:
```tsx
// NewScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function NewScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
```

2. **Add to navigation** in `src/navigation/BottomTabNavigator.tsx`:
```tsx
<Tab.Screen
  name="NewScreen"
  component={NewScreen}
  options={{
    tabBarLabel: 'New',
    tabBarIcon: ({ color, size }) => (
      <Feather name="star" size={size} color={color} />
    ),
  }}
/>
```

### Layout System (Flexbox)

React Native uses **Flexbox for all layouts**:

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,                        // Fill available space
    flexDirection: 'column',        // Vertical (default) or 'row'
    justifyContent: 'center',       // Main axis alignment
    alignItems: 'center',           // Cross axis alignment
    paddingHorizontal: 16,          // Left + right padding
    marginVertical: 8,              // Top + bottom margin
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
});
```

**Common patterns:**
- `flex: 1` - Fill available space
- `flexDirection: 'row'` - Horizontal layout
- `paddingHorizontal` / `paddingVertical` - Shorthand padding
- `marginHorizontal` / `marginVertical` - Shorthand margin

### TypeScript Strict Mode

This project uses **strict TypeScript**. All types must be explicit:

```tsx
// ✅ Good
interface Props {
  title: string;
  count?: number;
}

function MyComponent({ title, count = 0 }: Props) {
  return <Text>{title}: {count}</Text>;
}

// ❌ Bad
function MyComponent(props: any) { }  // no 'any' types
```

### Data Fetching with TanStack Query

```tsx
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

function MyScreen() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['activities'],
    queryFn: () => apiClient.get('/api/activities'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <ActivityList data={data} />;
}
```

**Cache configuration** (in `App.tsx`):
- `staleTime: 5 * 60 * 1000` - Data fresh for 5 minutes
- `gcTime: 24 * 60 * 60 * 1000` - Cache persists 24 hours
- `retry: 2` - Retry failed requests twice

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
```tsx
// src/services/apiClient.ts - Auto-injects JWT header
const response = await apiClient.get('/api/protected-endpoint');
```

## Navigation

**Bottom Tab Navigation:**
- Managed by `BottomTabNavigator.tsx`
- Uses `@react-navigation/bottom-tabs`
- Icons from Feather Icons (`@expo/vector-icons`)

**Current tabs:**
1. Activity (map-pin icon)
2. For Me (clipboard icon)
3. Discover (search icon)
4. Chats (message-square icon)
5. Profile (user icon)

**Adding badges:**
```tsx
options={{
  tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
}}
```

## Component Development

### UI Components

Place reusable components in `src/components/ui/`:
- Buttons
- Input fields
- Cards
- List items
- Loading states
- Error boundaries

### Example Component

```tsx
// src/components/ui/Card.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function Card({ children, style }: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android shadow
  },
});
```

## API Integration

### API Client Setup

```tsx
// src/services/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.API_BASE_URL || 'http://localhost:8000',
  timeout: 10000,
});

// JWT token injection
let authToken: string | null = null;

export function setAuthToken(token: string) {
  authToken = token;
}

apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export default apiClient;
```

### Making API Calls

```tsx
// Simple GET
const activities = await apiClient.get('/api/activities');

// GET with params
const filtered = await apiClient.get('/api/activities', {
  params: { category: 'sports', radius: 10 }
});

// POST
const newActivity = await apiClient.post('/api/activities', {
  title: 'Soccer Game',
  location: 'Central Park',
});

// PUT/PATCH
await apiClient.patch(`/api/activities/${id}`, { title: 'Updated' });

// DELETE
await apiClient.delete(`/api/activities/${id}`);
```

## Performance Considerations

**Bundle Size:**
- Monitor with: `npx expo export --platform web`
- Target: < 5MB initial bundle

**Optimization Tips:**
- Use `React.memo()` for expensive components
- Implement `FlatList` for long lists (not `ScrollView`)
- Lazy load images
- Optimize TanStack Query cache policies
- Use `useMemo()` / `useCallback()` for expensive computations

**Image Optimization:**
```tsx
import { Image } from 'react-native';

// Use optimized images
<Image
  source={{ uri: imageUrl }}
  style={styles.image}
  resizeMode="cover"
  defaultSource={require('./placeholder.png')}
/>
```

## Testing Strategy

**Current Coverage:**
- Playwright E2E: Navigation, menu interactions, console validation
- Unit tests: Not implemented yet

**Adding E2E Tests:**

```typescript
// tests/new-feature.spec.ts
import { test, expect } from '@playwright/test';

test('feature works', async ({ page }) => {
  await page.goto('http://localhost:8081');

  // Navigate to screen
  await page.click('text=Activity');

  // Verify content
  await expect(page.locator('text=Activiteit')).toBeVisible();
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

### TypeScript Errors

**Common issues:**
- Missing type imports
- Incorrect prop types
- `any` type usage (not allowed in strict mode)

**Fix:**
```tsx
// Import types explicitly
import type { ViewStyle, TextStyle } from 'react-native';

// Define interfaces
interface MyProps {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
}
```

### Images Not Loading

**For local images:**
```tsx
// Use require()
<Image source={require('../assets/logo.png')} />
```

**For remote images:**
```tsx
// Requires internet connection
<Image source={{ uri: 'https://...' }} />
```

### Navigation Issues

**Screen not appearing:**
1. ✅ Component exported as default
2. ✅ Added to `BottomTabNavigator.tsx`
3. ✅ Icon name is valid (check Feather Icons)
4. ✅ No console errors

## Production Deployment Checklist

- [ ] Remove dev JWT token from `App.tsx`
- [ ] Set production `API_BASE_URL` in environment
- [ ] Configure error tracking (Sentry)
- [ ] Enable production builds: `eas build --platform all`
- [ ] Test on physical devices (Android + iOS)
- [ ] Review app permissions in `app.json`
- [ ] Optimize images and assets
- [ ] Configure app icons and splash screen
- [ ] Setup CI/CD pipeline
- [ ] App Store / Play Store metadata

## Environment Variables

Create `.env` for local development:

```bash
API_BASE_URL=http://localhost:8000
JWT_SECRET_KEY=your-dev-secret
```

Production environment (managed by deployment platform):

```bash
API_BASE_URL=https://api.yourapp.com
JWT_SECRET_KEY=your-production-secret
SENTRY_DSN=your-sentry-dsn
```

## Best Practices

### Code Style

- Use functional components (not class components)
- Prefer hooks over HOCs
- Keep components small and focused
- Extract business logic to custom hooks
- Use TypeScript strictly (no `any`)

### File Naming

- Components: PascalCase (`ActivityCard.tsx`)
- Hooks: camelCase with `use` prefix (`useActivities.ts`)
- Utils: camelCase (`formatDate.ts`)
- Constants: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)

### Component Structure

```tsx
// 1. Imports
import React from 'react';
import { View } from 'react-native';

// 2. Types/Interfaces
interface Props {
  title: string;
}

// 3. Component
export default function MyComponent({ title }: Props) {
  // 4. Hooks
  const [state, setState] = useState();

  // 5. Event handlers
  const handlePress = () => { };

  // 6. Render
  return <View />;
}

// 7. Styles
const styles = StyleSheet.create({ });
```

## MCP Server Tools

Available MCP servers for autonomous development assistance:

### react-analyzer
**Capability**: AST-based component analysis, performance detection, accessibility validation
**Trigger**: Component optimization, performance auditing, React best practices verification
**Operations**: `analyze_component`, `detect_antipatterns`, `suggest_optimizations`, `check_accessibility`
**Use when**: Reviewing component quality, detecting performance issues, validating React patterns

### react-mcp
**Capability**: React development utilities, hook generation, component scaffolding
**Trigger**: Component creation, custom hook implementation, React pattern implementation
**Operations**: `create_component`, `generate_hook`, `scaffold_context`, `implement_pattern`
**Use when**: Generating React code, implementing React patterns, creating reusable hooks

### shadcn-ui
**Capability**: shadcn/ui component library integration, component composition
**Trigger**: UI component implementation requiring shadcn/ui components
**Operations**: `add_component`, `list_components`, `get_component_code`, `compose_components`
**Use when**: Building UI with shadcn/ui design system, need pre-built accessible components

### v0-mcp
**Capability**: Vercel v0 AI-powered design-to-code conversion
**Trigger**: Complex UI implementation from design requirements, rapid prototyping
**Operations**: `generate_ui`, `convert_design`, `create_component_from_prompt`
**Use when**: Converting design specifications to code, rapid UI prototyping, complex layouts
**Note**: Requires V0_API_KEY environment variable

### mock-data
**Capability**: Realistic test data generation using Faker.js
**Trigger**: Test data requirements, mock API responses, fixture generation
**Operations**: `generate_user`, `generate_address`, `generate_profile`, `generate_dataset`
**Use when**: Creating test fixtures, populating development database, mocking API responses
**Data types**: Names, addresses, emails, phone numbers, dates, images, lorem ipsum

### rest-api-tester
**Capability**: HTTP endpoint testing, API validation, response inspection
**Trigger**: API endpoint verification, integration testing, backend connectivity validation
**Operations**: `test_endpoint`, `validate_response`, `check_status`, `measure_performance`
**Use when**: Testing backend APIs, validating integrations, debugging network requests
**Config**: REST_BASE_URL environment variable (default: http://localhost:8000)

### expo-mcp
**Capability**: Expo SDK automation, iOS/Android simulator control, React Native DevTools integration
**Trigger**: Expo development server interaction, simulator automation, screenshot capture, UI testing
**Operations**: `start_server`, `open_simulator`, `take_screenshot`, `tap_element`, `find_by_testid`, `reload_app`
**Use when**: Automating Expo workflows, testing on simulators, capturing UI states, debugging native modules
**Native features**: Requires local Expo dev server running, provides device control and DevTools access
**Platform support**: iOS simulator, Android emulator, physical devices via Expo Go

### react-native-mcp
**Capability**: React Native project lifecycle management, version upgrades, dependency resolution
**Trigger**: Project initialization, RN version migration, package management, build configuration
**Operations**: `init_project`, `upgrade_version`, `install_dependencies`, `configure_metro`, `setup_typescript`
**Use when**: Creating new RN projects, upgrading React Native versions, resolving dependency conflicts
**Workflow automation**: Handles complex upgrade paths, applies codemods, updates native configurations
**Package**: react-native-upgrader-mcp (NOT react-native-mcp which is empty)

### expo-docs
**Capability**: Offline Expo documentation search, API reference lookup, versioned documentation access
**Trigger**: Expo SDK API queries, module usage examples, configuration reference, troubleshooting
**Operations**: `search_docs`, `get_api_reference`, `find_examples`, `get_config_schema`
**Use when**: Need Expo-specific documentation, offline development, version-specific API reference
**Index**: 496+ documentation files cached locally, smart semantic search, context-aware suggestions

### android-ui-mcp
**Capability**: AI-powered UI analysis for React Native Android, layout inspection, accessibility audit
**Trigger**: Android-specific UI validation, layout debugging, performance profiling, accessibility compliance
**Operations**: `analyze_layout`, `check_accessibility`, `detect_performance_issues`, `validate_android_patterns`
**Use when**: Android UI optimization, accessibility validation, platform-specific bug detection
**Platform**: Android-focused, complements expo-mcp for cross-platform testing

## MCP Server Usage Patterns

**Component Quality Assurance**:
```
Trigger: react-analyzer
Operation: analyze_component(src/screens/ActivityScreen.tsx)
Expected output: Performance metrics, antipatterns, accessibility violations
Follow-up: Apply suggested optimizations, fix detected issues
```

**UI Component Generation**:
```
Trigger: shadcn-ui OR v0-mcp
Decision: shadcn-ui for design system components, v0-mcp for custom layouts
Operation: add_component(name) OR generate_ui(prompt)
Expected output: Component code, dependencies, usage examples
```

**Test Data Creation**:
```
Trigger: mock-data
Operation: generate_dataset(type, count, locale)
Expected output: JSON array of realistic data matching schema
Use case: Populate screens during development, create test fixtures
```

**API Integration Validation**:
```
Trigger: rest-api-tester
Operation: test_endpoint(method, path, headers, body)
Expected output: Status code, response body, performance metrics
Use case: Verify backend connectivity, validate response structure
```

**Expo Development Automation**:
```
Trigger: expo-mcp
Operation: start_server(), open_simulator(platform), take_screenshot(filename)
Expected output: Dev server status, simulator launch confirmation, screenshot file path
Use case: Automated testing workflows, UI state capture, simulator control
Prerequisite: Expo dev server must be running locally
```

**React Native Project Management**:
```
Trigger: react-native-mcp
Operation: upgrade_version(target_version), install_dependencies(packages)
Expected output: Migration report, dependency tree, configuration changes
Use case: Version upgrades, dependency resolution, project scaffolding
```

**Expo Documentation Lookup**:
```
Trigger: expo-docs
Operation: search_docs(query), get_api_reference(module_name)
Expected output: Relevant documentation sections, API signatures, usage examples
Use case: Offline development, version-specific API lookup, troubleshooting
Cache: 496+ files indexed locally
```

**Android UI Validation**:
```
Trigger: android-ui-mcp
Operation: analyze_layout(screen_path), check_accessibility(component)
Expected output: Layout issues, accessibility violations, performance bottlenecks
Use case: Android-specific optimization, accessibility compliance
```

## MCP Server Decision Matrix

| Task | Primary MCP | Alternative | Rationale |
|------|-------------|-------------|-----------|
| Component analysis | react-analyzer | - | AST-based, React-specific rules |
| Component generation | react-mcp | v0-mcp | react-mcp for patterns, v0 for complex UI |
| UI from design | v0-mcp | shadcn-ui | v0 for custom, shadcn for design system |
| Test data | mock-data | - | Faker.js integration, locale support |
| API testing | rest-api-tester | - | Direct HTTP testing, timing metrics |
| Design system | shadcn-ui | - | Pre-built accessible components |
| Expo workflows | expo-mcp | - | Official Expo integration, simulator control |
| RN project management | react-native-mcp | - | Automated upgrades, dependency resolution |
| Expo documentation | expo-docs | - | Offline access, 496+ files indexed |
| Android UI analysis | android-ui-mcp | - | Platform-specific validation |
| Simulator automation | expo-mcp | - | Device control, screenshot capture |
| Version upgrades | react-native-mcp | - | Complex migration paths, codemods |

## AIRIS MCP Gateway (Unified Access)

**Purpose**: Single entrypoint to 25+ MCP servers with 75-90% token reduction via OpenMCP schema partitioning

**Configuration**: `/home/rob/.claude/mcp.json` points to `http://localhost:9400/api/v1/mcp/sse`

**Core Performance MCPs** (via gateway):
- **Serena**: Semantic code understanding, 2-3x faster analysis, project memory, LSP integration
- **Sequential**: Multi-step reasoning, 30-50% token reduction, hypothesis testing, architectural analysis
- **Context7**: Official library documentation, version-specific patterns, curated API references
- **Tavily**: Real-time web search, deep research capability, current information retrieval
- **Morphllm**: Bulk code transformations, pattern-based editing, style enforcement across files
- **Mindbase**: Semantic conversation search, cross-session learning, memory persistence
- **+19 more specialized MCPs**: See http://localhost:9400/api/mcp/servers for full list

**Activation**: Requires Claude Code restart to load gateway connection

**Usage pattern**:
```
Complex analysis → Sequential MCP (via gateway)
Symbol operations → Serena MCP (via gateway)
Official docs → Context7 MCP (via gateway)
Current info → Tavily MCP (via gateway)
Bulk refactoring → Morphllm MCP (via gateway)
```

**Performance benefits**:
- Single gateway reduces connection overhead
- Schema partitioning: 75-90% token reduction
- Parallel MCP execution capability
- Unified error handling and retry logic
- Automatic MCP discovery and routing

**Services status**: Check with `docker ps | grep airis-mcp-gateway`

## Additional Resources

- **Expo Docs:** https://docs.expo.dev/
- **React Navigation:** https://reactnavigation.org/
- **TanStack Query:** https://tanstack.com/query/latest
- **Feather Icons:** https://feathericons.com/
- **React Native:** https://reactnative.dev/
