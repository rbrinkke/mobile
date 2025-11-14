# UI Components Foundation

Production-ready, reusable UI primitives and patterns for best-in-class mobile apps.

## 🎯 Philosophy

- **Accessibility First** - VoiceOver/TalkBack ready out of the box
- **Performance Optimized** - Minimal re-renders, optimized images, smooth animations
- **Composable** - Build complex UIs from simple primitives
- **Type-Safe** - Full TypeScript support with autocomplete

## 📦 Components

### Images

#### `<OptimizedImage />`
Production-ready image component with error handling, caching, and accessibility.

```tsx
import { OptimizedImage } from '@components/ui';

<OptimizedImage
  source={{ uri: activity.imageUrl }}
  style={{ width: '100%', height: 200 }}
  contentFit="cover"
  blurhash="LGF5]+Yk^6#M@-5c,1J5@[or[Q6."
  recyclingKey={activity.id} // CRITICAL for FlashList!
  accessibilityLabel="Activity cover image"
  priority="high"
/>
```

**Features:**
- Automatic error fallback with icon
- Blurhash placeholders for smooth loading
- Memory-disk caching (30x faster)
- Accessibility labels
- Error logging (analytics ready)

---

### Loading States

#### `<Skeleton />` - Base skeleton
```tsx
import { Skeleton } from '@components/ui';

<Skeleton width="80%" height={20} borderRadius={4} />
```

#### `<SkeletonCircle />` - For avatars
```tsx
<SkeletonCircle size={48} />
```

#### `<SkeletonText />` - For text lines
```tsx
<SkeletonText width="70%" />
```

#### `<SkeletonCard />` - Complete card pattern
```tsx
<SkeletonCard />
```

#### `<SkeletonListItem />` - List item pattern
```tsx
<SkeletonListItem />
```

#### `<SkeletonGrid />` - Grid pattern
```tsx
<SkeletonGrid columns={2} rows={3} />
```

**Features:**
- Animated shimmer effect (respects reduce motion)
- Composable primitives
- Pre-built patterns for common layouts
- Zero configuration

---

### Layout & Structure

#### `<EmptyState />`
Beautiful placeholders for empty data states.

```tsx
import { EmptyState } from '@components/ui';

<EmptyState
  icon="compass"
  title="No activities yet"
  message="Be the first! Create an activity and invite others to join."
  actionLabel="Create Activity"
  onAction={() => navigation.navigate('CreateActivity')}
/>
```

**Features:**
- Context-aware messaging
- Actionable CTAs
- Beautiful icons (Feather)
- Reusable across all screens

---

#### `<ErrorBoundary />`
Catches React errors and prevents app crashes.

```tsx
import { ErrorBoundary } from '@components/ui';

<ErrorBoundary>
  <YourApp />
</ErrorBoundary>
```

**Features:**
- Beautiful fallback UI with retry
- Error logging (Sentry ready)
- Preserves navigation state
- Dev mode: shows error details

---

#### `<OfflineBanner />`
Displays when user is offline, auto-dismisses when back online.

```tsx
import { OfflineBanner } from '@components/ui';

<NavigationContainer>
  <App />
  <OfflineBanner />
</NavigationContainer>
```

**Features:**
- Non-intrusive top banner
- Shows connection type when restored
- Smooth animations
- Auto-dismisses after 3 seconds

---

### Compound Components

#### `<Tabs />`
Flexible tabs system with compound component API.

```tsx
import { Tabs } from '@components/ui';

<Tabs defaultTab="upcoming">
  <Tabs.List>
    <Tabs.Tab value="upcoming">Upcoming</Tabs.Tab>
    <Tabs.Tab value="past">Past</Tabs.Tab>
  </Tabs.List>

  <Tabs.Panel value="upcoming">
    <UpcomingActivities />
  </Tabs.Panel>

  <Tabs.Panel value="past">
    <PastActivities />
  </Tabs.Panel>
</Tabs>
```

**Features:**
- Context-based state management
- Composable API
- Fully customizable styling
- Accessible keyboard navigation

---

## 🛠 Utilities

### Accessibility Helpers

```tsx
import {
  getAccessibleButtonProps,
  getAccessibleImageProps,
  generateA11yLabel,
  generateA11yHint,
  announceForAccessibility,
  isScreenReaderEnabled,
} from '@utils/accessibility';

// Button with full accessibility
<TouchableOpacity
  {...getAccessibleButtonProps('Like', 'Double tap to like this post')}
>
  <Text>Like</Text>
</TouchableOpacity>

// Dynamic labels
const label = generateA11yLabel('Like', { count: 42, state: 'liked' });
// => "Like, 42 items, liked"

// Screen reader announcements
announceForAccessibility('Activity liked successfully');
```

### Image Utilities

```tsx
import {
  preloadActivityImages,
  clearImageCaches,
  getImagePlaceholder,
  handleImageError,
} from '@utils/imageUtils';

// Preload images for better UX
await preloadActivityImages(activities);

// Clear caches (memory warnings)
await clearImageCaches();

// Get blurhash placeholder
const placeholder = getImagePlaceholder();
```

---

## 🎨 Design Tokens

All components use consistent design tokens:

### Colors
- Primary: `#3B82F6` (blue)
- Error: `#EF4444` (red)
- Success: `#10B981` (green)
- Gray Scale: `#111827` → `#F9FAFB`

### Spacing
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- 2xl: 32px

### Shadows
```typescript
{
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3, // Android
}
```

---

## ✅ Best Practices

### 1. Always Use OptimizedImage
```tsx
// ❌ Don't use React Native Image directly
import { Image } from 'react-native';
<Image source={{ uri: url }} />

// ✅ Use OptimizedImage instead
import { OptimizedImage } from '@components/ui';
<OptimizedImage source={{ uri: url }} recyclingKey={id} />
```

### 2. Add recyclingKey for FlashList
```tsx
// CRITICAL: Always add recyclingKey when using images in FlashList
<OptimizedImage
  source={{ uri: item.imageUrl }}
  recyclingKey={item.id} // Prevents image flickering!
/>
```

### 3. Use Skeletons Instead of Spinners
```tsx
// ❌ Don't use spinners for loading states
{isLoading && <ActivityIndicator />}

// ✅ Use skeleton screens for better perceived performance
{isLoading ? <SkeletonCard /> : <ActivityCard />}
```

### 4. Always Add Accessibility Labels
```tsx
// ❌ Don't skip accessibility
<TouchableOpacity onPress={handleLike}>
  <Feather name="heart" />
</TouchableOpacity>

// ✅ Add labels and hints
<TouchableOpacity
  {...getAccessibleButtonProps('Like', 'Double tap to like this activity')}
  onPress={handleLike}
>
  <Feather name="heart" />
</TouchableOpacity>
```

### 5. Handle Empty States
```tsx
// ❌ Don't show blank screens
<FlashList data={activities} renderItem={...} />

// ✅ Add empty state
<FlashList
  data={activities}
  renderItem={...}
  ListEmptyComponent={
    <EmptyState
      title="No activities"
      message="Create your first activity!"
    />
  }
/>
```

---

## 📖 Examples

### Complete Activity Card Pattern

```tsx
import { OptimizedImage, Skeleton } from '@components/ui';
import { getAccessibleButtonProps } from '@utils/accessibility';

function ActivityCard({ activity, isLoading }) {
  if (isLoading) {
    return <SkeletonCard />;
  }

  return (
    <View>
      <OptimizedImage
        source={{ uri: activity.imageUrl }}
        style={{ width: '100%', height: 200 }}
        recyclingKey={activity.id}
        accessibilityLabel={`${activity.title} cover image`}
      />

      <View style={{ padding: 16 }}>
        <Text>{activity.title}</Text>

        <TouchableOpacity
          {...getAccessibleButtonProps(
            'Like',
            'Double tap to like this activity',
            { selected: activity.liked }
          )}
          onPress={handleLike}
        >
          <Feather name="heart" />
          <Text>{activity.likeCount}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

---

## 🚀 Performance

All components are optimized for production:

- **React.memo** - Prevents unnecessary re-renders
- **useCallback** - Stable function references
- **Expo Image** - 25-35% smaller images (WebP)
- **MMKV Storage** - 30x faster than AsyncStorage
- **FlashList** - 10x better than FlatList
- **Animations** - 60 FPS on UI thread (Reanimated ready)

---

## 🧪 Testing

All components are designed to be testable:

```tsx
import { render, fireEvent } from '@testing-library/react-native';
import { EmptyState } from '@components/ui';

test('calls action when button pressed', () => {
  const onAction = jest.fn();
  const { getByText } = render(
    <EmptyState
      title="Empty"
      message="No data"
      actionLabel="Retry"
      onAction={onAction}
    />
  );

  fireEvent.press(getByText('Retry'));
  expect(onAction).toHaveBeenCalled();
});
```

---

## 📱 Platform Support

- ✅ iOS (VoiceOver ready)
- ✅ Android (TalkBack ready)
- ✅ Web (ARIA attributes)

---

## 🎯 What's Next?

When building new screens, start with these foundations:

1. Use `<SkeletonCard />` for loading states
2. Use `<EmptyState />` for empty data
3. Use `<OptimizedImage />` for all images
4. Add accessibility props to all interactive elements
5. Wrap in `<ErrorBoundary />` at screen level

**You now have a production-ready foundation to build ANY screen! 🚀**
