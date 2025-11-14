#!/bin/bash
# Expo Reset Script - Nuclear option for clean restart
# Usage: ./scripts/reset-expo.sh [--full-clean]

set -e  # Exit on error

FULL_CLEAN=false
if [[ "$1" == "--full-clean" ]]; then
    FULL_CLEAN=true
fi

echo "🧹 Expo Reset Script - Starting cleanup..."

# Get this script's PID to avoid killing ourselves
SCRIPT_PID=$$
PARENT_PID=$(ps -o ppid= -p $SCRIPT_PID | tr -d ' ')

# 1. Kill ALL Expo/Metro/Node processes (except this script)
echo "📛 Step 1/6: Killing all Expo/Metro/Node processes..."
pkill -f "expo start" || true
pkill -f "metro" || true
pkill -f "webpack-dev-server" || true
sleep 2

# 2. Kill processes on ports 8081, 19000, 19001, 19002
echo "📛 Step 2/6: Killing processes on Expo ports..."
for port in 8081 19000 19001 19002 19006; do
    PID=$(lsof -ti:$port 2>/dev/null || true)
    if [ -n "$PID" ]; then
        # Don't kill this script or its parent
        if [[ "$PID" != "$SCRIPT_PID" ]] && [[ "$PID" != "$PARENT_PID" ]]; then
            echo "  Killing process $PID on port $port"
            kill -9 $PID 2>/dev/null || true
        fi
    fi
done
sleep 1

# 3. Clear Metro bundler cache
echo "🗑️  Step 3/6: Clearing Metro bundler cache..."
rm -rf .expo 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf $HOME/.expo/web-cache 2>/dev/null || true
rm -rf /tmp/metro-* 2>/dev/null || true
rm -rf /tmp/haste-map-* 2>/dev/null || true
rm -rf /tmp/react-* 2>/dev/null || true

# 4. Clear watchman (if installed)
echo "🗑️  Step 4/6: Clearing watchman..."
if command -v watchman &> /dev/null; then
    watchman watch-del-all 2>/dev/null || true
fi

# 5. Optional: Full clean (node_modules)
if [ "$FULL_CLEAN" = true ]; then
    echo "🗑️  Step 5/6: FULL CLEAN - Removing node_modules..."
    rm -rf node_modules
    echo "📦 Installing dependencies..."
    npm install
else
    echo "⏭️  Step 5/6: Skipping node_modules (use --full-clean to remove)"
fi

# 6. Verify cleanup
echo "✅ Step 6/6: Verifying cleanup..."
for port in 8081 19000 19001 19002; do
    if lsof -ti:$port >/dev/null 2>&1; then
        echo "⚠️  WARNING: Port $port still in use!"
        lsof -ti:$port | xargs ps -p 2>/dev/null || true
    fi
done

echo ""
echo "✨ Cleanup complete!"
echo ""
echo "🚀 Ready to start Expo!"
echo ""
echo "Run one of these commands:"
echo "  npm start          # Metro bundler only"
echo "  npm run web        # Start with web"
echo "  npm run android    # Start with Android"
echo "  npm run ios        # Start with iOS"
echo ""
