# Stores - Client State Management

## Usage Examples

### Theme Toggle
```typescript
import { useAppStore } from '@stores/appStore';

function SettingsScreen() {
  const { theme, setTheme } = useAppStore();

  return (
    <Switch
      value={theme === 'dark'}
      onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
    />
  );
}
```

### Authentication
```typescript
import { useAppStore } from '@stores/appStore';

function LoginScreen() {
  const { setUser } = useAppStore();

  const handleLogin = async () => {
    const response = await loginApi();
    setUser(response.userId);
    // Navigate to home
  };
}

function ProfileScreen() {
  const { userId, logout } = useAppStore();

  return (
    <Button onPress={logout}>Log out</Button>
  );
}
```

### Filter Preferences
```typescript
import { useAppStore } from '@stores/appStore';

function DiscoverScreen() {
  const {
    selectedCategories,
    setSelectedCategories,
    radiusFilter,
    setRadiusFilter
  } = useAppStore();

  return (
    <>
      <CategoryFilter
        selected={selectedCategories}
        onChange={setSelectedCategories}
      />
      <RadiusSlider
        value={radiusFilter}
        onChange={setRadiusFilter}
      />
    </>
  );
}
```

## State Organization

**✅ Use Zustand for:**
- Theme preferences
- Authentication status
- UI state (modals, bottom sheets)
- User preferences (filters, settings)
- Onboarding status

**✅ Use TanStack Query for:**
- Activities data
- User profiles
- Messages
- Comments
- Any server data!

## Performance

All state is **persisted to MMKV** (30x faster than AsyncStorage):
- Instant app startup with preserved state
- Synchronous read/write operations
- Automatic persistence on state changes
