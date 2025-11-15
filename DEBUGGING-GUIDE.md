# Debugging Guide - Never Settle For Less 🏆

**Philosophy**: Smart monitoring beats blind waiting. Always use intelligent verification strategies.

## 🎯 Core Principles

1. **Verify First, Test Second** - Confirm changes exist before running tests
2. **Smart Monitoring** - Filter output, don't scan everything
3. **Parallel Execution** - Run multiple checks simultaneously
4. **Intelligent Polling** - Test endpoints, don't sleep blindly
5. **Cache Awareness** - Know when to clear Metro/Expo caches

---

## 📋 Standard Debugging Workflow

### Step 1: Verify File Changes

**Always confirm your edits were successful:**

```bash
# Read the file to verify changes
Read tool: /path/to/file.tsx (lines X-Y)

# Or use grep to find specific code
grep -n "your_change" src/path/to/file.tsx
```

**Why?** Edit operations can fail silently. If the file doesn't contain your fix, no amount of restarting will help.

---

### Step 2: Smart Cache Clearing

**When Metro bundler shows old errors despite file fixes:**

```bash
# Kill all Metro/Expo processes
pkill -9 -f "expo|metro"

# Clear Metro bundler cache
rm -rf /tmp/metro-* /tmp/haste-map-* /tmp/react-*

# Clear Expo cache
rm -rf .expo node_modules/.cache

# Start with cache clear flag
npx expo start --web --clear
```

**Lesson Learned**: `expo start --clear` doesn't clear ALL caches. Metro's temp directory caches persist and cause stale code issues.

---

### Step 3: Intelligent Monitoring (NOT blind waiting!)

#### ❌ **BAD - Blind Waiting**
```bash
npm run web
sleep 120  # Just hope it works...
# No idea what's happening!
```

#### ✅ **GOOD - Smart Monitoring**

**A. Use BashOutput with Filters**
```typescript
// Filter for specific log patterns
BashOutput({
  bash_id: "process_id",
  filter: "Bundled|ERROR|SyntaxError"
})
```

**B. Parallel Health Checks**
```bash
# Check 1: Server responds
curl -s http://localhost:8081 | head -1

# Check 2: Process count
ps aux | grep -E "expo|metro" | grep -v grep | wc -l

# Check 3: Port status
lsof -ti:8081
```

**C. Intelligent Polling Loop**
```bash
# Poll until server is ready (max 2 min)
timeout 120 bash -c 'until curl -s http://localhost:8081 | grep -q "mobile"; do
  echo "Waiting for server...";
  sleep 3;
done' && echo "✅ SERVER READY!"
```

---

## 🔍 Common Issues & Solutions

### Issue 1: Metro Shows Old Syntax Errors

**Symptoms:**
- Changed file but Metro still shows old errors
- SyntaxError pointing to code you already fixed

**Root Cause:** Metro's temp cache not cleared

**Solution:**
```bash
# Nuclear cache clear
pkill -9 -f "expo|metro"
rm -rf /tmp/metro-* /tmp/haste-map-* .expo
npx expo start --web --clear
```

**Verification:**
```typescript
// Use filter to check for success
BashOutput with filter="Bundled"
// Should show: "Web Bundled XXXms"
```

---

### Issue 2: Server Hangs on "Waiting on http://localhost:8081"

**Symptoms:**
- Expo says "Waiting on http://localhost:8081"
- Never progresses to bundling

**Root Cause:** Port conflict or stale process

**Solution:**
```bash
# Find what's using port 8081
lsof -ti:8081

# Kill the process
kill -9 $(lsof -ti:8081)

# Restart Expo
npx expo start --web
```

---

### Issue 3: Changes Not Reflecting in Browser

**Symptoms:**
- Made code changes but browser shows old version
- Hard refresh doesn't help

**Root Cause:** Browser cache + Metro cache combination

**Solution:**
```bash
# 1. Clear Metro cache
rm -rf /tmp/metro-* .expo

# 2. Restart Expo
npx expo start --web --clear

# 3. Hard refresh browser
# Chrome/Firefox: Ctrl+Shift+R
# Or clear browser cache completely
```

---

## 🧪 Testing Strategies

### Strategy 1: Multi-Point Verification

**Run these checks in parallel:**

```typescript
// Check 1: File verification
Read("src/component/File.tsx", lines: 18-25)

// Check 2: Bundling status
BashOutput with filter="Bundled|ERROR"

// Check 3: Server health
curl -s http://localhost:8081

// Check 4: Process count
ps aux | grep expo
```

### Strategy 2: Progressive Monitoring

**Track bundling progress in real-time:**

```bash
# Watch Metro logs with grep
tail -f /tmp/metro-bundler-*.log | grep "Bundled\|ERROR"

# Or use BashOutput polling
while true; do
  BashOutput with filter="Bundled"
  sleep 5
done
```

### Strategy 3: Playwright for Visual Verification

**Don't trust logs alone - see it visually:**

```typescript
// Navigate to app
browser_navigate("http://localhost:8081")

// Take screenshot
browser_take_screenshot("verification.png")

// Check snapshot for expected elements
browser_snapshot()  // Better than screenshot for accessibility
```

---

## 📊 Debugging Decision Tree

```
Problem: Metro bundler error
├─ Step 1: Verify file changes exist
│  ├─ Changes present? → Continue
│  └─ Changes missing? → Re-apply edits
│
├─ Step 2: Check if error is from cache
│  ├─ Code is correct? → Clear cache
│  └─ Code is wrong? → Fix code
│
├─ Step 3: Clear Metro cache
│  ├─ rm -rf /tmp/metro-* /tmp/haste-map-*
│  └─ npx expo start --web --clear
│
├─ Step 4: Monitor bundling with filter
│  ├─ BashOutput filter="Bundled|ERROR"
│  └─ Check for success or new errors
│
└─ Step 5: Verify in browser
   ├─ Playwright screenshot
   └─ Visual confirmation
```

---

## 🎓 Lessons Learned

### Lesson 1: Don't Trust Implicit Success
**Problem:** Assumed file edits worked without verification
**Solution:** Always read file after editing to confirm changes

### Lesson 2: Metro Cache is Persistent
**Problem:** `expo start --clear` doesn't clear temp directory caches
**Solution:** Manually clear `/tmp/metro-*` and `/tmp/haste-map-*`

### Lesson 3: Blind Waiting is Inefficient
**Problem:** Using `sleep 120` without monitoring
**Solution:** Use filtered BashOutput and intelligent polling

### Lesson 4: Filter > Full Logs
**Problem:** Scanning thousands of log lines manually
**Solution:** Use BashOutput filter parameter to find specific messages

### Lesson 5: Parallel Checks Win
**Problem:** Sequential verification takes too long
**Solution:** Run multiple health checks simultaneously

---

## 🛠 Quick Reference Commands

### Metro Bundler Management
```bash
# Check Metro process
ps aux | grep metro

# Kill Metro
pkill -9 -f metro

# Clear Metro cache
rm -rf /tmp/metro-* /tmp/haste-map-*
```

### Expo Management
```bash
# Start with cache clear
npx expo start --web --clear

# Check Expo process
ps aux | grep expo

# Clear Expo cache
rm -rf .expo node_modules/.cache
```

### Health Checks
```bash
# Test server responds
curl -s http://localhost:8081

# Check port usage
lsof -ti:8081

# Count running processes
ps aux | grep -E "expo|metro" | wc -l
```

### Smart Monitoring
```bash
# Poll until ready
until curl -s http://localhost:8081 | grep -q "mobile"; do
  sleep 3
done

# Filter logs for specific patterns
grep -E "Bundled|ERROR" expo.log

# Watch logs in real-time
tail -f expo.log | grep "Bundled"
```

---

## 💡 Pro Tips

1. **Always start with file verification** - Don't assume edits worked
2. **Use filter parameter** - BashOutput filter="pattern" saves time
3. **Kill processes before cache clear** - Otherwise cache may regenerate
4. **Test endpoint, don't just check logs** - curl verification is definitive
5. **Screenshot for visual proof** - Playwright confirmation beats log analysis
6. **Run checks in parallel** - Multiple verification points simultaneously
7. **Set timeouts** - Don't wait forever, fail fast with timeout commands

---

## 🎯 Success Indicators

### Bundling Succeeded
```
✅ "Web Bundled XXXms index.ts (2694 modules)"
✅ curl returns "<!DOCTYPE html>"
✅ No ERROR or SyntaxError in logs
✅ Screenshot shows expected UI
```

### Bundling Failed
```
❌ "Bundling failed" in logs
❌ "SyntaxError" or "Unexpected token"
❌ curl returns empty or error
❌ Server not responding on port 8081
```

---

## 🚀 Best-in-Class Workflow Example

```bash
# 1. Verify file changes
Read src/component/File.tsx (lines 18-25)
✅ Changes confirmed

# 2. Clear all caches
pkill -9 -f "expo|metro"
rm -rf /tmp/metro-* /tmp/haste-map-* .expo
✅ Cache cleared

# 3. Start with monitoring
npx expo start --web --clear &
EXPO_PID=$!

# 4. Parallel health checks
BashOutput filter="Bundled|ERROR" &
curl -s http://localhost:8081 &
ps aux | grep expo &
wait

# 5. Visual verification
Playwright: navigate + screenshot
✅ All systems go!
```

**This is the best-in-class approach. Never settle for less!** 🏆

---

*Last updated: 2025-11-15*
*Principle: Smart monitoring beats blind waiting, always.* 🧠
