# 🔴 Real-Time Infrastructure - Production-Ready

Complete WebSocket + Offline-First architecture for instant, reliable user experiences.

## 🎯 Features

### ✅ **WebSocket Service**
- **Automatic reconnection** with exponential backoff
- **Network awareness** - reconnects when internet restores
- **Type-safe events** with TypeScript
- **Memory leak prevention** - automatic cleanup
- **Connection pooling** - efficient resource usage
- **Room support** for group features

### ✅ **Offline-First Queue**
- **Persistent queue** with MMKV (survives app restart)
- **Automatic sync** when back online
- **Duplicate prevention** - avoids redundant requests
- **Retry logic** with exponential backoff (max 3 retries)
- **Optimistic updates** work offline
- **Progress tracking** - queue status monitoring

### ✅ **Real-Time Sync**
- **Automatic cache updates** via WebSocket events
- **Instant UI updates** across all screens
- **Zero configuration** - works out of the box
- **Type-safe** event handlers
- **Smart invalidation** - only affected queries refetch

## 📁 Architecture

```
src/
├── services/
│   ├── socket/
│   │   └── socketClient.ts       # WebSocket service
│   └── offline/
│       └── offlineQueue.ts       # Offline mutation queue
│
├── shared/hooks/
│   ├── useSocketEvent.ts         # React hook for socket events
│   └── useOfflineMutation.ts     # Offline-first mutations
│
└── features/activities/hooks/
    └── useActivityRealtimeSync.ts # Real-time activity sync
```

## 🚀 Quick Start

### 1. Setup in App.tsx

```typescript
import { useEffect } from 'react';
import { socketService } from '@services/socket/socketClient';
import { offlineQueue } from '@services/offline/offlineQueue';
import { useActivityRealtimeSync } from '@features/activities/hooks/useActivityRealtimeSync';

export default function App() {
  // Enable real-time sync
  useActivityRealtimeSync();

  useEffect(() => {
    // Connect WebSocket
    socketService.connect();

    // Enable auto queue processing
    offlineQueue.startAutoProcessing();

    return () => {
      socketService.disconnect();
      offlineQueue.stopAutoProcessing();
    };
  }, []);

  return <RootNavigator />;
}
```

### 2. Use in Components

#### Subscribe to Socket Events

```typescript
import { useSocketEvent } from '@shared/hooks/useSocketEvent';

function ActivityDetailScreen({ activityId }: Props) {
  const queryClient = useQueryClient();

  // Listen for activity updates
  useSocketEvent({
    event: 'activity:updated',
    onEvent: (activity) => {
      if (activity.id === activityId) {
        console.log('Activity updated in real-time!');
      }
    },
    invalidateQueries: [queryKeys.activities.detail(activityId)],
  });

  // ... rest of component
}
```

#### Offline-First Mutations

```typescript
import { useOfflineMutation } from '@shared/hooks/useOfflineMutation';

function LikeButton({ activity }: Props) {
  const likeMutation = useOfflineMutation({
    mutationFn: (activityId: string) =>
      activitiesApi.likeActivity(activityId),
    endpoint: (activityId) => `/api/activities/${activityId}/like`,
    method: 'POST',
    onMutate: async (activityId) => {
      // Optimistic update (works offline!)
      const previous = queryClient.getQueryData(['activities']);
      queryClient.setQueryData(['activities'], (old) =>
        updateActivityLike(old, activityId)
      );
      return { previous };
    },
    onError: (err, vars, context) => {
      // Rollback on error
      queryClient.setQueryData(['activities'], context?.previous);
    },
  });

  return (
    <TouchableOpacity
      onPress={() => likeMutation.mutate(activity.id)}
      disabled={likeMutation.isPending}
    >
      <Text>❤️ {activity.likeCount}</Text>
    </TouchableOpacity>
  );
}
```

## 🔧 WebSocket API

### Connection Management

```typescript
import { socketService } from '@services/socket/socketClient';

// Connect
await socketService.connect();

// Check connection status
const isConnected = socketService.isConnected();

// Get reconnection attempts
const attempts = socketService.getReconnectAttempts();

// Disconnect
socketService.disconnect();
```

### Event Subscription

```typescript
// Subscribe to event
socketService.on('activity:updated', (activity) => {
  console.log('Activity updated:', activity);
});

// Unsubscribe
socketService.off('activity:updated', handler);

// Emit event
socketService.emit('typing:start', { chatId: '123' });

// Emit with acknowledgment
const response = await socketService.emitWithAck('message:send', {
  text: 'Hello',
});
```

### Room Management

```typescript
// Join room (e.g., activity chat)
socketService.joinRoom(`activity_${activityId}`);

// Leave room
socketService.leaveRoom(`activity_${activityId}`);
```

## 📡 Socket Events

### Activity Events

| Event | Payload | Description |
|-------|---------|-------------|
| `activity:created` | `Activity` | New activity created |
| `activity:updated` | `Activity` | Activity details updated |
| `activity:deleted` | `{ activityId }` | Activity removed |
| `activity:user_joined` | `{ activityId, userId, participantCount }` | User joined activity |
| `activity:user_left` | `{ activityId, userId, participantCount }` | User left activity |
| `activity:like_added` | `{ activityId, userId, likeCount }` | Activity liked |
| `activity:like_removed` | `{ activityId, userId, likeCount }` | Activity unliked |

### Message Events

| Event | Payload | Description |
|-------|---------|-------------|
| `message:new` | `Message` | New chat message |
| `message:read` | `{ messageId, userId }` | Message marked as read |

### User Events

| Event | Payload | Description |
|-------|---------|-------------|
| `user:online` | `{ userId }` | User came online |
| `user:offline` | `{ userId }` | User went offline |

## 🔄 Offline Queue API

### Add to Queue

```typescript
import { offlineQueue } from '@services/offline/offlineQueue';

// Add mutation to queue
const queueId = offlineQueue.addToQueue(
  {
    endpoint: '/api/activities/123/like',
    method: 'POST',
    data: { userId: 'user-123' },
  },
  { maxRetries: 3 }
);
```

### Process Queue

```typescript
// Manual processing
const result = await offlineQueue.processQueue();
console.log(`Processed: ${result.processed}, Failed: ${result.failed}`);

// Auto processing (recommended)
offlineQueue.startAutoProcessing(); // In App.tsx
```

### Queue Status

```typescript
// Get queue status
const status = offlineQueue.getQueueStatus();
console.log(`Queue has ${status.count} items`);

// Using React hook
function OfflineStatus() {
  const { count, processing } = useOfflineQueueStatus();

  if (count === 0) return null;

  return (
    <View>
      <Text>{count} actions pending sync</Text>
      {processing && <ActivityIndicator />}
    </View>
  );
}
```

## 🎨 Best Practices

### 1. Always Use Real-Time Sync Hook

```typescript
// ✅ Good - In App.tsx
useActivityRealtimeSync();

// ❌ Bad - Manual event listeners in every component
```

### 2. Combine with Optimistic Updates

```typescript
// ✅ Best UX - Instant feedback + offline support
const likeMutation = useOfflineMutation({
  mutationFn: activitiesApi.likeActivity,
  endpoint: (id) => `/api/activities/${id}/like`,
  method: 'POST',
  onMutate: optimisticUpdate, // Works offline!
  onError: rollback,
});
```

### 3. Use Connection Status for UI

```typescript
import { useSocketConnection } from '@shared/hooks/useSocketEvent';

function ConnectionIndicator() {
  const { isConnected, reconnectAttempts } = useSocketConnection();

  if (isConnected) return null;

  return (
    <Banner>
      {reconnectAttempts > 0
        ? `Reconnecting... (${reconnectAttempts})`
        : 'Connecting...'}
    </Banner>
  );
}
```

### 4. Clean Up Event Listeners

```typescript
// ✅ Automatic cleanup with hook
useSocketEvent({
  event: 'activity:updated',
  onEvent: handleUpdate,
});

// ❌ Manual cleanup required
useEffect(() => {
  socketService.on('activity:updated', handleUpdate);
  return () => socketService.off('activity:updated', handleUpdate);
}, []);
```

## 🔐 Security

### Authentication

WebSocket connection automatically includes JWT token:

```typescript
// Token from storage is automatically sent
await socketService.connect();

// Server receives: socket.handshake.auth.token
```

### Room Authorization

Server should verify user has permission to join rooms:

```typescript
// Server-side (example)
socket.on('room:join', async ({ roomId }, callback) => {
  const hasPermission = await checkRoomPermission(socket.userId, roomId);

  if (!hasPermission) {
    callback({ error: 'Unauthorized' });
    return;
  }

  socket.join(roomId);
  callback({ success: true });
});
```

## 📊 Performance

### Network Efficiency

- **WebSocket**: ~2KB overhead per message (vs ~800 bytes HTTP)
- **Binary protocol**: Smaller payloads than JSON over HTTP
- **Multiplexing**: Single connection for all events
- **Compression**: Socket.IO has built-in compression

### Memory Management

- **Automatic cleanup**: Listeners removed on unmount
- **Connection pooling**: Single socket for entire app
- **Queue limits**: Max 100 mutations in queue
- **TTL**: Queued mutations expire after 24 hours

### Battery Impact

- **Heartbeat interval**: 25 seconds (adjustable)
- **Exponential backoff**: Reduces reconnection attempts
- **Network awareness**: No reconnection attempts when offline

## 🧪 Testing

### Mock WebSocket in Tests

```typescript
import { socketService } from '@services/socket/socketClient';

jest.mock('@services/socket/socketClient', () => ({
  socketService: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    isConnected: jest.fn(() => true),
  },
}));

describe('Activity Component', () => {
  it('updates on socket event', () => {
    const { rerender } = render(<ActivityList />);

    // Simulate socket event
    const handler = (socketService.on as jest.Mock).mock.calls[0][1];
    handler({ id: '123', title: 'Updated' });

    rerender(<ActivityList />);

    expect(screen.getByText('Updated')).toBeTruthy();
  });
});
```

### Mock Offline Queue

```typescript
import { offlineQueue } from '@services/offline/offlineQueue';

jest.mock('@services/offline/offlineQueue', () => ({
  offlineQueue: {
    addToQueue: jest.fn(),
    processQueue: jest.fn(),
    getQueueStatus: jest.fn(() => ({ count: 0, processing: false })),
  },
}));
```

## 🐛 Debugging

### Enable Socket.IO Debugging

```typescript
// In development
if (__DEV__) {
  localStorage.debug = 'socket.io-client:*';
}
```

### Monitor WebSocket Traffic

Chrome DevTools → Network → WS → Select connection → Messages

### Queue Debugging

```typescript
// Log queue status
console.log(offlineQueue.getQueueStatus());

// Manually process queue
const result = await offlineQueue.processQueue();
console.log(result);

// Clear queue (debugging only!)
offlineQueue.clearQueue();
```

## 🚨 Error Handling

### Connection Errors

```typescript
try {
  await socketService.connect();
} catch (error) {
  if (error.message === 'No auth token available') {
    // Redirect to login
  } else if (error.message === 'No internet connection') {
    // Show offline banner
  } else {
    // Show generic error
  }
}
```

### Queue Processing Errors

Errors are automatically logged. Failed mutations stay in queue for retry:

```typescript
// Monitor queue processing
const result = await offlineQueue.processQueue();

if (result.failed > 0) {
  console.warn(`${result.failed} mutations failed`);
}

if (result.skipped > 0) {
  console.warn(`${result.skipped} mutations exceeded max retries`);
}
```

## 🔄 Migration Guide

### From Polling to WebSocket

**Before (Polling):**
```typescript
const { data } = useQuery({
  queryKey: ['activities'],
  queryFn: fetchActivities,
  refetchInterval: 5000, // Poll every 5 seconds
});
```

**After (Real-Time):**
```typescript
// In App.tsx - Once
useActivityRealtimeSync();

// In component - No changes needed!
const { data } = useQuery({
  queryKey: ['activities'],
  queryFn: fetchActivities,
  // No refetchInterval needed - updates via WebSocket
});
```

## 📚 Additional Resources

- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [TanStack Query Best Practices](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [NetInfo Documentation](https://github.com/react-native-netinfo/react-native-netinfo)

---

**Your app now has production-grade real-time infrastructure! 🎉**

Real-time updates, offline support, and automatic sync - all working seamlessly together.
