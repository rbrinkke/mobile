# Quick Reference: Production Monitoring

Quick copy-paste snippets for daily development.

---

## 📊 Analytics (Segment)

### User Identification
```typescript
import { analyticsService } from '@services/analytics/analyticsService';

// After login
analyticsService.identify('user_123', {
  email: 'user@example.com',
  name: 'John Doe',
  plan: 'free',
  createdAt: new Date().toISOString(),
});

// After logout
analyticsService.reset();
```

### Track Custom Event
```typescript
// Simple event
analyticsService.track('Button Clicked', {
  button_name: 'create_activity',
  screen: 'home',
});

// Or use pre-built methods
analyticsService.trackActivityCreated('activity_123', 'sports', 'Amsterdam');
analyticsService.trackActivityJoined('activity_123', 'sports');
analyticsService.trackMessageSent('chat_456', 42);
analyticsService.trackSearch('football', 15);
```

### Screen Tracking
```typescript
// Manual tracking
analyticsService.screen('Activity Detail', {
  activity_id: '123',
  category: 'sports',
});

// Automatic tracking (in navigation hooks)
import { useScreenTracking } from '@shared/hooks/useAnalytics';

function App() {
  useScreenTracking(); // Tracks all screen changes automatically
  // ...
}
```

---

## 🚨 Error Tracking (Sentry)

### Automatic Error Capture
```typescript
// Errors caught by ErrorBoundary are automatically sent to Sentry
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Manual Error Capture
```typescript
import { captureException, captureMessage } from './sentry.config';

try {
  await riskyOperation();
} catch (error) {
  // Capture exception with context
  captureException(error, {
    operation: 'riskyOperation',
    userId: user.id,
    activityId: activity.id,
  });
}

// Log a warning (not an error)
captureMessage('Something unusual happened', 'warning');
```

### Add Breadcrumbs
```typescript
import { addBreadcrumb } from './sentry.config';

// Add context before error occurs
addBreadcrumb('User clicked button', 'user_action', {
  buttonId: 'create_activity',
  screenName: 'home',
});

// Later, if error occurs, breadcrumbs show what led to it
```

### User Context
```typescript
import { setSentryUser, clearSentryUser } from './sentry.config';

// After login
setSentryUser('user_123', 'user@example.com', 'johndoe');

// After logout
clearSentryUser();
```

### Performance Monitoring
```typescript
import { startTransaction } from './sentry.config';

// Track slow operations
const transaction = startTransaction('screen_load', 'ActivityDetail');

// ... do expensive work (API call, image loading, etc.)

transaction.finish(); // Sends duration to Sentry
```

---

## 🔧 Common Patterns

### Track Activity Lifecycle
```typescript
// Activity created
analyticsService.trackActivityCreated(activity.id, activity.category, activity.location);

// User joins
analyticsService.trackActivityJoined(activity.id, activity.category);

// User likes
analyticsService.trackActivityLiked(activity.id);

// User shares
analyticsService.trackActivityShared(activity.id, 'whatsapp');

// User leaves
analyticsService.trackActivityLeft(activity.id);
```

### Track User Actions
```typescript
// Profile view
analyticsService.trackProfileViewed(user.id);

// Follow/Unfollow
analyticsService.trackUserFollowed(user.id);
analyticsService.trackUserUnfollowed(user.id);

// Search
analyticsService.trackSearch(query, resultCount, {
  filter_category: 'sports',
  filter_radius: 10,
});

// Message sent
analyticsService.trackMessageSent(chat.id, message.length);

// Comment added
analyticsService.trackCommentAdded(activity.id, comment.length);
```

### Track Authentication
```typescript
// Signup
analyticsService.trackSignUp('email'); // or 'google', 'apple'
analyticsService.identify(newUser.id, {
  email: newUser.email,
  name: newUser.name,
  createdAt: new Date().toISOString(),
});

// Signin
analyticsService.trackSignIn('email');
analyticsService.identify(user.id, {
  email: user.email,
  name: user.name,
});

// Signout
analyticsService.trackSignOut();
analyticsService.reset();
```

### Track Onboarding
```typescript
// Start onboarding
analyticsService.trackOnboardingStarted();

// Complete step
analyticsService.track('Onboarding Step Completed', {
  step_number: 2,
  step_name: 'profile_setup',
});

// Complete onboarding
analyticsService.trackOnboardingCompleted(5); // 5 steps total

// Skip onboarding
analyticsService.trackOnboardingSkipped(3); // skipped at step 3
```

---

## 🧪 Testing

### Test Sentry in Development
```typescript
// Add this temporarily to trigger test error
import { captureException } from './sentry.config';

useEffect(() => {
  if (__DEV__) {
    captureException(new Error('Test Sentry integration'));
  }
}, []);

// Check Sentry dashboard for the error
```

### Test Segment in Development
```typescript
// Add this temporarily to trigger test event
import { analyticsService } from '@services/analytics/analyticsService';

useEffect(() => {
  if (__DEV__) {
    analyticsService.track('Test Event', {
      source: 'development',
      timestamp: new Date().toISOString(),
    });
  }
}, []);

// Check Segment dashboard > Debugger for the event
```

---

## 📱 React Component Examples

### Screen with Auto-Tracking
```typescript
import { useEffect } from 'react';
import { analyticsService } from '@services/analytics/analyticsService';

export function ActivityDetailScreen({ route }) {
  const { activityId } = route.params;

  useEffect(() => {
    // Track screen view with params
    analyticsService.screen('Activity Detail', {
      activity_id: activityId,
    });
  }, [activityId]);

  // ... component code
}
```

### Button with Analytics
```typescript
import { TouchableOpacity } from 'react-native';
import { analyticsService } from '@services/analytics/analyticsService';

function JoinButton({ activity }) {
  const handleJoin = async () => {
    try {
      await joinActivity(activity.id);

      // Track successful join
      analyticsService.trackActivityJoined(activity.id, activity.category);
    } catch (error) {
      // Track error
      captureException(error, {
        operation: 'join_activity',
        activity_id: activity.id,
      });
    }
  };

  return (
    <TouchableOpacity onPress={handleJoin}>
      <Text>Join Activity</Text>
    </TouchableOpacity>
  );
}
```

### Form with Error Tracking
```typescript
import { useState } from 'react';
import { analyticsService } from '@services/analytics/analyticsService';
import { captureException } from './sentry.config';

function CreateActivityForm() {
  const [title, setTitle] = useState('');

  const handleSubmit = async () => {
    try {
      const activity = await createActivity({ title });

      // Track creation
      analyticsService.trackActivityCreated(
        activity.id,
        activity.category,
        activity.location
      );

      navigation.navigate('ActivityDetail', { activityId: activity.id });
    } catch (error) {
      // Sentry gets full error + context
      captureException(error, {
        operation: 'create_activity',
        form_data: { title },
      });

      // Analytics gets sanitized error
      analyticsService.trackError(error, {
        screen: 'create_activity',
      });
    }
  };

  return (
    // ... form UI
  );
}
```

---

## 🎯 Pro Tips

### 1. Consistent Event Names
```typescript
// ✅ GOOD: Past tense, space-separated
'Activity Created'
'Activity Joined'
'Message Sent'

// ❌ BAD: Inconsistent tense/format
'CreateActivity'
'activity_join'
'sent_message'
```

### 2. Meaningful Properties
```typescript
// ✅ GOOD: Snake case, descriptive
{
  activity_id: '123',
  category: 'sports',
  participant_count: 5,
  is_premium: false,
}

// ❌ BAD: Unclear, inconsistent
{
  id: '123',
  cat: 'sports',
  count: 5,
  premium: false,
}
```

### 3. Track User Intent, Not Just Actions
```typescript
// ✅ GOOD: Understand why
analyticsService.track('Activity Shared', {
  activity_id: '123',
  share_method: 'whatsapp',
  user_intent: 'invite_friends', // Why sharing?
});

// ❌ LESS USEFUL: Just what happened
analyticsService.track('Share Button Clicked');
```

### 4. Balance Detail vs. Noise
```typescript
// ✅ GOOD: Important business events
trackActivityCreated()
trackActivityJoined()
trackMessageSent()

// ❌ TOO MUCH: Every interaction
trackButtonHovered()
trackTextInputFocused()
trackScrollPositionChanged()
```

---

## 🔗 Resources

- **Sentry Dashboard**: https://sentry.io/
- **Segment Dashboard**: https://segment.com/
- **Sentry Docs**: https://docs.sentry.io/platforms/react-native/
- **Segment Docs**: https://segment.com/docs/connections/sources/catalog/libraries/mobile/react-native/

---

**Keep this file handy for quick copy-paste during development!** 📋
