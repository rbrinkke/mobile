# Debugging Infrastructure

**Production-ready debugging tools for rapid development and troubleshooting.**

## 🔧 Features

### 1. Comprehensive API Logging

Every API request/response is automatically logged to the console with full details:

**Request Logging:**
```
🌐 API Request [POST-1731596745123-abc123]
📍 URL: http://localhost:8000/api/auth/register
🔧 Method: POST
🔑 Has Token: false
📦 Body: {email: "test@example.com", password: "***"}
⏱️ Timeout: 10000ms
🕐 Started: 2025-11-14T14:25:45.123Z
```

**Success Response:**
```
✅ API Response [POST-1731596745123-abc123]
📍 URL: http://localhost:8000/api/auth/register
📊 Status: 201 Created
⏱️ Duration: 234ms
📦 Data: {message: "Verification email sent"}
🕐 Completed: 2025-11-14T14:25:45.357Z
```

**Error Response:**
```
💥 API Error [POST-1731596745123-abc123]
📍 URL: http://localhost:8000/api/auth/register
🔧 Method: POST
⏱️ Duration: 156ms
❌ Error Type: ValidationError
💬 Error Message: Email already registered
📊 Status Code: 400
📦 Full Error: {...}
🕐 Failed at: 2025-11-14T14:25:45.279Z
```

### 2. Debug Panel (DEV Mode Only)

**Location:** Bottom of screen in development mode
**Visibility:** Collapsible panel with orange header

**Features:**
- 🌐 **API Configuration:** Shows base URL, timeout, retry settings
- 📡 **Network Status:** Real-time online/offline indicator
- 🧪 **API Connectivity Test:** One-tap test to verify backend connection
- ℹ️ **Environment Info:** Platform, mode, configuration

**Usage:**
```typescript
import { DebugPanel } from '@shared/components/DebugPanel';

// Add to your root component (already added to App.tsx)
<DebugPanel />
```

The panel automatically:
- Shows network status with colored indicator (green = online, red = offline)
- Monitors NetInfo for connection changes
- Provides instant feedback on API connectivity

### 3. Request ID Tracking

Every API request gets a unique ID for easy tracing:
```
Format: {METHOD}-{TIMESTAMP}-{RANDOM}
Example: POST-1731596745123-abc123def
```

Use this ID to:
- Correlate requests with responses
- Track requests across logs
- Debug async issues

## 🚀 How to Use

### During Development

1. **Open Browser Console** (for web)
   - All API calls are logged with grouped, collapsible output
   - Expand groups to see full request/response details

2. **Check Debug Panel**
   - Panel appears at bottom of screen
   - Click header to expand/collapse
   - Use "Test Connection" to verify API is reachable

3. **Monitor Network Status**
   - Green dot = Online and connected
   - Red dot = Offline or disconnected
   - Yellow dot = Unknown status

### Common Debugging Scenarios

**Scenario 1: Registration Not Working**
1. Open browser console
2. Fill in registration form and submit
3. Look for `🌐 API Request` log
4. Check URL is correct (should be `http://localhost:8000/api/auth/register`)
5. Check request body contains email and password
6. Look for response (`✅` or `❌`)
7. If error, check `💥 API Error` for details

**Scenario 2: No Response from Backend**
1. Open Debug Panel
2. Click "Test Connection"
3. If it fails, check:
   - Is auth-api container running? (`docker ps | grep auth-api`)
   - Is it on port 8000? (`curl http://localhost:8000/health`)
   - Is API_CONFIG.apiUrl correct?

**Scenario 3: Token Issues**
1. Check console for `🔑 Auth token set` message after login
2. Subsequent requests should show `🔑 Has Token: true`
3. If token missing, check authentication flow

## 📋 Configuration

### API Client Settings

Located in `/src/config/api.config.ts`:

```typescript
export const API_CONFIG = {
  apiUrl: __DEV__
    ? 'http://localhost:8000'  // ✅ Auth API (port 8000)
    : 'https://api.activity-app.com',

  requestTimeout: 10000,  // 10 seconds
  maxRetries: 3,
  retryDelay: 1000,
};
```

### Enable/Disable Logging

Logging is automatically enabled in `__DEV__` mode.
To disable for specific debugging:

```typescript
// Temporarily disable in src/api/client.ts
if (__DEV__ && false) {  // Add && false
  console.group(`🌐 API Request [${requestId}]`);
  // ...
}
```

### Debug Panel Customization

```typescript
// src/shared/components/DebugPanel.tsx

// Start collapsed
const [isExpanded, setIsExpanded] = useState(false);  // was: true

// Change max height
maxHeight: 400,  // was: 300

// Hide in specific environments
if (!__DEV__ || process.env.EXPO_PUBLIC_HIDE_DEBUG === 'true') {
  return null;
}
```

## 🎯 Best Practices

### 1. Always Check Console First
Before asking "why isn't this working?", check the console logs.
90% of issues are visible in the request/response logs.

### 2. Use Request IDs for Support
When reporting bugs, include the request ID:
```
Error in registration: POST-1731596745123-abc123def
```

### 3. Test API Connectivity First
Before debugging complex auth flows, use "Test Connection" button to verify basic connectivity.

### 4. Monitor Network Status
If requests are failing, check if device is online (network status indicator).

### 5. Document Findings
When you find a bug via debugging:
1. Note the request ID
2. Screenshot the console logs
3. Copy the full error details
4. Document reproduction steps

## 🔍 Troubleshooting

### Problem: Console Logs Not Appearing
**Solution:**
- Ensure you're in development mode (`__DEV__` = true)
- Check browser console is open
- Reload app to ensure latest code

### Problem: Debug Panel Not Visible
**Solution:**
- Only shows in `__DEV__` mode
- Check `App.tsx` includes `<DebugPanel />`
- Reload app to ensure latest code

### Problem: "Test Connection" Always Fails
**Solution:**
1. Verify auth-api is running: `docker ps | grep auth-api`
2. Test manually: `curl http://localhost:8000/health`
3. Check API_CONFIG.apiUrl matches your backend
4. For physical devices, use machine IP instead of localhost

### Problem: Too Many Logs
**Solution:**
- Use browser console filtering (filter by "API Request" or emoji)
- Collapse console groups you don't need
- Use request ID to find specific request

## 📚 Related Files

- `/src/api/client.ts` - API client with logging
- `/src/shared/components/DebugPanel.tsx` - Debug panel component
- `/src/config/api.config.ts` - API configuration
- `/App.tsx` - Root component with DebugPanel

## 🎓 Learning Resources

**Understanding the Logs:**
- `🌐` = Request sent
- `✅` = Success response (2xx)
- `❌` = HTTP error (4xx/5xx)
- `💥` = Network/fetch error

**Request Lifecycle:**
1. Request initiated → `🌐 API Request` logged
2. Network call made → (waiting)
3. Response received → `✅` or `❌` logged
4. On error → `💥 API Error` logged

---

**This debugging infrastructure will save you HOURS of frustration! 🚀**

Every minute spent building this pays dividends for years to come.
