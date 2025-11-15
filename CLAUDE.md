# Activity Platform - Mobile App

AI guidance for React Native/Expo development with **feature-based architecture** for maximum scalability.

## 🎯 Tech Stack

- **React Native 0.76+** (New Architecture enabled)
- **Expo SDK 53+**
- **TypeScript 5.3+** (strict mode, no `any` types)
- **TanStack Query 5.90.8** (server state + MMKV persistence)
- **Zustand 4.x** (client state + MMKV persistence)
- **React Navigation 7.x** (type-safe)
- **FlashList 2.x** (10x better than FlatList - use for ALL lists)
- **Expo Image 1.10+** (optimized caching)
- **Reanimated 3.x** (60 FPS animations)

## 🚨 CRITICAL: Smart Debugging & Monitoring

**See [DEBUGGING-GUIDE.md](./DEBUGGING-GUIDE.md) for complete strategies.**

### Never Settle For Less - Best Practices 🏆

**DON'T do this (inefficient):**
```bash
# ❌ Blind waiting without feedback
npm run web
sleep 120  # Hope it works...
```

**DO this instead (intelligent monitoring):**
```bash
# ✅ Smart monitoring with real-time feedback
npx expo start --web --clear

# In parallel: Monitor bundling status
BashOutput with filter="Bundled|ERROR"

# Check server readiness
curl -s http://localhost:8081 | head -1

# Count running processes
ps aux | grep -E "expo|metro" | grep -v grep
```

### Key Principles
1. **Verify First** - Always confirm file changes before testing
2. **Smart Monitoring** - Use filtered output, don't scan thousands of lines
3. **Parallel Checks** - Run multiple verifications simultaneously
4. **Intelligent Polling** - Test endpoints, don't blindly wait
5. **Cache Clearing** - Clear Metro/Expo cache when bundler fails: `rm -rf /tmp/metro-* /tmp/haste-map-* .expo`

## 📁 Architecture: Feature-Based Organization

**See [ARCHITECTURE.md](./ARCHITECTURE.md) for complete details.**

```
src/
├── features/          # Feature modules (self-contained)
│   ├── auth/         # Authentication
│   ├── activities/   # Activity management
│   ├── profile/      # User profiles
│   ├── messaging/    # Chat
│   └── discovery/    # Explore/search
│
├── shared/           # Reusable across features
│   ├── components/   # UI primitives
│   ├── hooks/        # Generic hooks
│   ├── utils/        # Utility functions
│   └── types/        # Shared types
│
├── api/              # API layer
│   ├── client.ts     # Axios + interceptors
│   ├── queryClient.ts # TanStack Query config
│   ├── queryKeys.ts  # Query key factory
│   └── storage.ts    # MMKV wrapper
│
├── navigation/       # Navigation
├── store/            # Zustand stores
└── config/           # App config
```

### Import Aliases

```typescript
import { Button } from '@shared/components/ui';
import { useActivities } from '@features/activities/hooks/useActivities';
import { apiClient } from '@api/client';
import { useAppNavigation } from '@shared/hooks/useAppNavigation';
```

## 🚀 Quick Commands

```bash
# Development
npm start                     # Start dev server
npm run android/ios/web       # Launch platform
./scripts/clean-start.sh      # Nuclear cache clean

# Testing
npx playwright test           # E2E tests (web)
npm run test                  # Unit tests
npm run type-check            # TypeScript check

# Code Quality
npm run lint                  # ESLint
npm run lint:fix              # Auto-fix
npm run format                # Prettier
```

## 📐 Coding Conventions

### 1. TypeScript Strict Mode
```typescript
// ✅ Explicit types
interface Props {
  title: string;
  count?: number;
}

function MyComponent({ title, count = 0 }: Props) { }

// ❌ No 'any' types
function BadComponent(props: any) { }
```

### 2. State Management

**Server State (TanStack Query):**
```typescript
// ✅ Use for backend data
const { data } = useActivities();
const likeMutation = useLikeActivity();
```

**Client State (Zustand):**
```typescript
// ✅ Use for UI state
const { theme, setTheme } = useAppStore();
const { isAuthenticated } = useAppStore();
```

### 3. Navigation (Type-Safe)

```typescript
const navigation = useAppNavigation();
navigation.navigate('ActivityDetail', { activityId: '123' });
// Full TypeScript autocomplete and type-checking!
```

### 4. Lists (Always FlashList)

```typescript
import { FlashList } from '@shopify/flash-list';

// ✅ 10x better performance
<FlashList
  data={activities}
  renderItem={({ item }) => <ActivityCard activity={item} />}
  estimatedItemSize={200}
/>

// ❌ Don't use FlatList
<FlatList data={...} />
```

### 5. Images (Always OptimizedImage)

```typescript
import { OptimizedImage } from '@shared/components/ui';

// ✅ With error handling, caching, accessibility
<OptimizedImage
  source={{ uri: activity.imageUrl }}
  style={{ width: '100%', height: 200 }}
  recyclingKey={activity.id}  // CRITICAL for FlashList!
  accessibilityLabel="Activity cover"
/>
```

### 6. Loading States (Skeletons, not Spinners)

```typescript
// ✅ Better perceived performance
{isLoading ? <SkeletonCard /> : <ActivityCard />}

// ❌ Generic spinner
{isLoading && <ActivityIndicator />}
```

## 🎨 Component Patterns

### Feature Component Structure

```
features/activities/
├── components/
│   ├── ActivityCard.tsx      # Feature-specific
│   ├── ActivityForm.tsx
│   └── ActivityList.tsx
├── hooks/
│   ├── useActivities.ts      # TanStack Query
│   ├── useLikeActivity.ts    # Mutations
│   └── index.ts
├── screens/
│   ├── ActivityListScreen.tsx
│   ├── ActivityDetailScreen.tsx
│   └── index.ts
├── services/
│   └── activitiesApi.ts      # API calls
└── types.ts                   # Feature types
```

### Example: Activity Feature

```typescript
// features/activities/types.ts
export interface Activity {
  id: string;
  title: string;
  location: string;
  liked: boolean;
  likeCount: number;
}

// features/activities/services/activitiesApi.ts
import { apiClient } from '@api/client';

export const activitiesApi = {
  getActivities: (offset: number, limit: number) =>
    apiClient.get('/api/activities', { params: { offset, limit } }),

  likeActivity: (id: string) =>
    apiClient.post(`/api/activities/${id}/like`),
};

// features/activities/hooks/useActivities.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '@api/queryKeys';
import { activitiesApi } from '../services/activitiesApi';

export function useActivities() {
  return useInfiniteQuery({
    queryKey: queryKeys.activities.infiniteList(),
    queryFn: ({ pageParam = 0 }) =>
      activitiesApi.getActivities(pageParam, 20),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextOffset : undefined,
    initialPageParam: 0,
    staleTime: 1 * 60 * 1000,
  });
}

// features/activities/screens/ActivityListScreen.tsx
import { FlashList } from '@shopify/flash-list';
import { useActivities } from '../hooks/useActivities';
import { ActivityCard } from '../components/ActivityCard';
import { EmptyState, SkeletonCard } from '@shared/components/ui';

export function ActivityListScreen() {
  const { data, isLoading, fetchNextPage } = useActivities();

  if (isLoading) {
    return <SkeletonCard />;
  }

  const activities = data?.pages.flatMap(p => p.items) ?? [];

  return (
    <FlashList
      data={activities}
      renderItem={({ item }) => <ActivityCard activity={item} />}
      estimatedItemSize={200}
      onEndReached={fetchNextPage}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={
        <EmptyState
          icon="compass"
          title="No activities yet"
          message="Create your first activity!"
        />
      }
    />
  );
}
```

## 🛠 Shared Components

Located in `src/shared/components/ui/` - production-ready foundations:

### UI Primitives
- `<OptimizedImage />` - Error handling, caching, a11y
- `<Skeleton />`, `<SkeletonCard />`, `<SkeletonListItem />` - Loading states
- `<EmptyState />` - Empty data placeholders
- `<Tabs />` - Compound component for tabs

### Layout & Error Handling
- `<ErrorBoundary />` - Catches React errors
- `<OfflineBanner />` - Shows when offline

## 📦 API Layer

### API Client (`@api/client.ts`)

```typescript
import { apiClient } from '@api/client';

// JWT token automatically injected via interceptor
const response = await apiClient.get('/api/activities');
```

### Query Keys (`@api/queryKeys.ts`)

```typescript
import { queryKeys } from '@api/queryKeys';

// ✅ Type-safe, consistent query keys
queryKey: queryKeys.activities.infiniteList()
queryKey: queryKeys.activities.detail(activityId)

// ❌ Don't use raw strings
queryKey: ['activities']
```

### TanStack Query Config (`@api/queryClient.ts`)

```typescript
import { queryClient, persister } from '@api/queryClient';

// Already configured with MMKV persistence
// Instant app startup with cached data!
```

## 🎯 Performance Foundations

All implemented and ready:
- ✅ **MMKV Storage** (30x faster than AsyncStorage)
- ✅ **FlashList** (10x better than FlatList)
- ✅ **Expo Image** (optimized caching + WebP)
- ✅ **Query Persistence** (instant startup)
- ✅ **Offline Detection** (NetInfo + auto-refetch)
- ✅ **Haptic Feedback** (native feel)
- ✅ **Error Boundaries** (crash prevention)
- ✅ **Pull-to-Refresh** (standard mobile UX)

## ♿ Accessibility Helpers

```typescript
import {
  getAccessibleButtonProps,
  getAccessibleImageProps,
  announceForAccessibility,
} from '@shared/utils/accessibility';

// Button with full accessibility
<TouchableOpacity
  {...getAccessibleButtonProps('Like', 'Double tap to like this activity')}
>
  <Text>Like</Text>
</TouchableOpacity>

// Screen reader announcements
announceForAccessibility('Activity liked successfully');
```

## 🧪 Testing

```bash
# E2E Tests (Playwright - web only)
npx playwright test
npx playwright test --ui

# Unit Tests (React Native Testing Library)
npm run test
npm run test:watch
npm run test:coverage

# Type Checking
npm run type-check
```

### Test Structure
```
features/activities/
└── __tests__/
    ├── hooks/
    │   └── useActivities.test.ts
    ├── components/
    │   └── ActivityCard.test.tsx
    └── screens/
        └── ActivityListScreen.test.tsx
```

## 📝 Best Practices

### 1. Feature Isolation
```typescript
// ❌ Don't import across features
import { ProfileCard } from '@features/profile/components/ProfileCard';
// in activities feature

// ✅ Create shared component if needed by 3+ features
import { UserCard } from '@shared/components/UserCard';
```

### 2. Always Use Service Layer
```typescript
// ✅ API calls through service layer
const data = await activitiesApi.getActivities(0, 20);

// ❌ Don't call apiClient directly in components
const data = await apiClient.get('/api/activities');
```

### 3. Optimistic Updates for Social Features
```typescript
const likeMutation = useMutation({
  mutationFn: (activityId) => activitiesApi.likeActivity(activityId),
  onMutate: async (activityId) => {
    // Optimistically update cache
    await queryClient.cancelQueries({ queryKey: queryKeys.activities.all });
    const previousData = queryClient.getQueryData(queryKeys.activities.infiniteList());

    queryClient.setQueryData(queryKeys.activities.infiniteList(), (old) => {
      // Update liked state immediately
    });

    return { previousData };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(queryKeys.activities.infiniteList(), context.previousData);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
  },
});
```

### 4. Always Add Accessibility
```typescript
// ❌ Missing accessibility
<TouchableOpacity onPress={handleLike}>
  <Feather name="heart" />
</TouchableOpacity>

// ✅ Full accessibility
<TouchableOpacity
  {...getAccessibleButtonProps('Like', 'Double tap to like this activity')}
  onPress={handleLike}
>
  <Feather name="heart" />
</TouchableOpacity>
```

### 5. Handle Empty States
```typescript
// ✅ Always provide empty state
<FlashList
  data={activities}
  renderItem={...}
  ListEmptyComponent={
    <EmptyState
      title="No activities"
      message="Create your first activity!"
      actionLabel="Create Activity"
      onAction={() => navigation.navigate('CreateActivity')}
    />
  }
/>
```

## 🚨 Common Pitfalls

### 1. Don't Use FlatList
```typescript
// ❌ Slow performance
import { FlatList } from 'react-native';

// ✅ 10x faster
import { FlashList } from '@shopify/flash-list';
```

### 2. Don't Forget recyclingKey
```typescript
// ❌ Images flicker in FlashList
<OptimizedImage source={{ uri: item.imageUrl }} />

// ✅ Stable images
<OptimizedImage
  source={{ uri: item.imageUrl }}
  recyclingKey={item.id}  // CRITICAL!
/>
```

### 3. Don't Skip Error Boundaries
```typescript
// ✅ Wrap screens in ErrorBoundary
<ErrorBoundary>
  <ActivityListScreen />
</ErrorBoundary>
```

## 📖 Additional Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete architecture guide
- **[src/shared/components/ui/README.md](./src/shared/components/ui/README.md)** - UI component library docs
- **[src/stores/README.md](./src/stores/README.md)** - Zustand usage examples

## 🎯 Development Workflow

### Adding a New Feature

1. **Create feature folder**
```bash
mkdir -p src/features/my-feature/{components,hooks,screens,services}
```

2. **Define types** (`types.ts`)
```typescript
export interface MyEntity {
  id: string;
  name: string;
}
```

3. **Create API service** (`services/myFeatureApi.ts`)
```typescript
export const myFeatureApi = {
  getData: () => apiClient.get('/api/my-feature'),
};
```

4. **Build custom hooks** (`hooks/useMyFeature.ts`)
```typescript
export function useMyFeature() {
  return useQuery({
    queryKey: queryKeys.myFeature.list(),
    queryFn: () => myFeatureApi.getData(),
  });
}
```

5. **Create components** (`components/MyFeatureCard.tsx`)
6. **Build screens** (`screens/MyFeatureScreen.tsx`)
7. **Add navigation routes**
8. **Write tests**

---

**This codebase is production-ready from day 1!** 🚀

Feature-based architecture + performance foundations + accessibility = **best-in-class mobile app**.
