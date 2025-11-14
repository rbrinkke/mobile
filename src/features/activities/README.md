# Activities Feature Module

Complete, production-ready feature module for activity management in the social activity platform.

## 📁 Structure

```
src/features/activities/
├── components/          # Feature-specific UI components
├── hooks/              # React hooks for data fetching & mutations
│   └── useActivities.ts  # Complete hook suite
├── screens/            # Screen components
├── services/           # API service layer
│   └── activitiesApi.ts  # Backend communication
├── types.ts            # Type definitions
├── index.ts            # Public API exports
└── README.md           # This file
```

## 🎯 Features

### Data Management
- ✅ Infinite scroll pagination with FlashList
- ✅ Optimistic updates for instant UI feedback
- ✅ Automatic image preloading
- ✅ Smart cache invalidation
- ✅ Type-safe API calls
- ✅ Production-ready error handling

### Hooks Available

#### Query Hooks
```typescript
// Fetch paginated activities
const { data, fetchNextPage, hasNextPage } = useActivities(filters);

// Fetch single activity
const { data: activity } = useActivity(activityId);

// Search activities
const { data: results } = useSearchActivities(query, enabled);

// Get nearby activities
const { data: nearby } = useNearbyActivities(lat, lng, radius, enabled);
```

#### Mutation Hooks
```typescript
// Like/unlike
const likeMutation = useLikeActivity();
const unlikeMutation = useUnlikeActivity();

// Join/leave
const joinMutation = useJoinActivity();
const leaveMutation = useLeaveActivity();

// CRUD operations
const createMutation = useCreateActivity();
const updateMutation = useUpdateActivity();
const deleteMutation = useDeleteActivity();
```

## 💻 Usage Examples

### Activity List Screen

```typescript
import { FlashList } from '@shopify/flash-list';
import { useActivities, ActivityCategory } from '@features/activities';

export function ActivityListScreen() {
  const filters = {
    category: ActivityCategory.SPORTS,
    radius: 10,
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
  } = useActivities(filters);

  const activities = data?.pages.flatMap((page) => page.items) ?? [];

  if (isLoading) return <SkeletonCard />;

  return (
    <View style={{ flex: 1 }}>
      <FlashList
        data={activities}
        renderItem={({ item }) => <ActivityCard activity={item} />}
        estimatedItemSize={200}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator /> : null
        }
      />
    </View>
  );
}
```

### Like Button with Optimistic Updates

```typescript
import { useLikeActivity, useUnlikeActivity } from '@features/activities';

export function LikeButton({ activity }: { activity: Activity }) {
  const likeMutation = useLikeActivity();
  const unlikeMutation = useUnlikeActivity();

  const handlePress = () => {
    if (activity.liked) {
      unlikeMutation.mutate(activity.id);
    } else {
      likeMutation.mutate(activity.id);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={likeMutation.isPending || unlikeMutation.isPending}
    >
      <Feather
        name="heart"
        size={24}
        color={activity.liked ? '#FF6B6B' : '#999'}
        fill={activity.liked ? '#FF6B6B' : 'none'}
      />
      <Text>{activity.likeCount}</Text>
    </TouchableOpacity>
  );
}
```

### Create Activity Form

```typescript
import { useCreateActivity, ActivityCategory } from '@features/activities';

export function CreateActivityForm() {
  const createMutation = useCreateActivity();
  const navigation = useAppNavigation();

  const handleSubmit = async (formData: CreateActivityRequest) => {
    try {
      const newActivity = await createMutation.mutateAsync(formData);
      navigation.navigate('ActivityDetail', { activityId: newActivity.id });
    } catch (error) {
      // Error is already logged and typed
      Alert.alert('Error', error.getUserMessage());
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {/* Form fields */}
    </Form>
  );
}
```

## 🏗️ Architecture Patterns

### Service Layer
All API calls go through the service layer for:
- Centralized API logic
- Easy mocking in tests
- Reusability outside React components

```typescript
// Direct API access (for non-React contexts)
import { activitiesApi } from '@features/activities';

const activities = await activitiesApi.getActivities(0, 20);
```

### Type Safety
Full type safety from API to UI:
```typescript
Activity → ActivitiesListResponse → useActivities() → ActivityCard
```

### Error Handling
Elegant error handling with typed error classes:
```typescript
try {
  await activitiesApi.createActivity(data);
} catch (error) {
  if (error instanceof ValidationError) {
    // Show validation errors
  } else if (error instanceof AuthenticationError) {
    // Redirect to login
  }

  // User-friendly message
  Alert.alert('Error', error.getUserMessage());
}
```

## 🎨 Best Practices

### 1. Always Use Filters Type
```typescript
// ✅ Type-safe
const filters: ActivityFilters = {
  category: ActivityCategory.SPORTS,
  radius: 10,
};

// ❌ Avoid raw objects
const filters = { category: 'sports', radius: 10 };
```

### 2. Optimistic Updates for Social Actions
```typescript
// ✅ Instant UI feedback
likeMutation.mutate(activityId);

// ❌ Don't wait for server
await likeMutation.mutateAsync(activityId);
```

### 3. Use Barrel Exports
```typescript
// ✅ Clean imports
import { useActivities, Activity } from '@features/activities';

// ❌ Deep imports
import { useActivities } from '@features/activities/hooks/useActivities';
```

## 🧪 Testing

```typescript
import { renderHook, waitFor } from '@testing-library/react-native';
import { useActivities } from '@features/activities';
import { createWrapper } from '@/test-utils';

describe('useActivities', () => {
  it('fetches activities successfully', async () => {
    const { result } = renderHook(() => useActivities(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.pages[0].items).toBeDefined();
  });
});
```

## 📊 Performance

- **Query caching**: 1-minute staleTime for feeds, 5 minutes for details
- **Image preloading**: Automatic for visible items + next page
- **Optimistic updates**: Zero perceived latency for likes/joins
- **FlashList**: 10x performance vs FlatList
- **Smart invalidation**: Only refetch affected queries

## 🔄 Future Enhancements

- [ ] WebSocket integration for real-time updates
- [ ] Offline mutation queue
- [ ] Advanced filtering (multi-category, date ranges)
- [ ] Activity recommendations based on user preferences
- [ ] Share activity functionality
- [ ] Activity templates for quick creation

## 📚 Related Documentation

- [ARCHITECTURE.md](../../ARCHITECTURE.md) - Overall app architecture
- [CLAUDE.md](../../CLAUDE.md) - AI development guidelines
- [API Documentation](../../api/README.md) - API layer patterns
