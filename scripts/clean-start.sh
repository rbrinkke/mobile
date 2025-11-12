#!/bin/bash

# Clean Start Script - Mobile App
# Fully resets cache and starts fresh Expo server

echo "🧹 Cleaning all caches..."

# Kill all running processes
pkill -9 -f expo 2>/dev/null
pkill -9 -f metro 2>/dev/null
pkill -9 -f node 2>/dev/null
sleep 2

# Clean all cache directories
rm -rf .expo 2>/dev/null
rm -rf node_modules/.cache 2>/dev/null
rm -rf .metro-cache 2>/dev/null
rm -rf /tmp/metro-* 2>/dev/null
rm -rf /tmp/react-* 2>/dev/null

echo "✅ Cache cleaned!"
echo ""
echo "🚀 Starting Expo with clean cache..."
echo ""

# Start Expo with clear flag
npm start -- --clear
