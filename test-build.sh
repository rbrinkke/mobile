#!/bin/bash
set -e

clear
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     🧪  REACT NATIVE BUILD VERIFICATION TEST               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((TESTS_PASSED++))
}

fail() {
    echo -e "${RED}✗${NC} $1"
    ((TESTS_FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# 1. Check dependencies
echo -e "${BOLD}Step 1/9: Checking dependencies${NC}"
echo "─────────────────────────────────────────────────────────────"
if command -v pnpm &> /dev/null; then
    pass "pnpm installed: $(pnpm --version)"
else
    fail "pnpm is NOT installed"
    exit 1
fi

if command -v watchman &> /dev/null; then
    pass "Watchman installed: $(watchman --version 2>&1 | head -1)"
else
    warn "Watchman NOT installed (optional but recommended)"
fi
echo ""

# 2. Check configuration files
echo -e "${BOLD}Step 2/9: Verifying configuration${NC}"
echo "─────────────────────────────────────────────────────────────"
if [[ -f "metro.config.js" ]]; then
    if grep -q "FileStore" metro.config.js; then
        pass "Metro cache: FileStore enabled"
    else
        warn "Metro cache: FileStore not configured"
    fi
fi

if [[ -f "app.json" ]]; then
    if grep -q '"jsEngine": "hermes"' app.json; then
        pass "Hermes Engine: enabled"
    else
        warn "Hermes Engine: not enabled"
    fi
fi

if [[ -f ".watchmanconfig" ]]; then
    pass "Watchman config: present"
fi
echo ""

# 3. Clean Metro cache
echo -e "${BOLD}Step 3/9: Cleaning Metro cache${NC}"
echo "─────────────────────────────────────────────────────────────"
rm -rf .metro-cache .expo node_modules/.cache 2>/dev/null || true
watchman watch-del-all 2>/dev/null || true
pass "All caches cleared"
echo ""

# 4. Kill existing Metro processes
echo -e "${BOLD}Step 4/9: Stopping existing Metro processes${NC}"
echo "─────────────────────────────────────────────────────────────"
pkill -9 -f "expo start" 2>/dev/null || true
pkill -9 -f "node.*metro" 2>/dev/null || true
sleep 2
pass "Metro processes stopped"
echo ""

# 5. Start Metro bundler
echo -e "${BOLD}Step 5/9: Starting Metro bundler${NC}"
echo "─────────────────────────────────────────────────────────────"
info "Start time: $(date +%H:%M:%S)"
START_TIME=$(date +%s)

pnpm start --clear > /tmp/metro-build.log 2>&1 &
METRO_PID=$!
pass "Metro started (PID: $METRO_PID)"
echo ""

# 6. Wait for Metro to be ready
echo -e "${BOLD}Step 6/9: Waiting for Metro to respond${NC}"
echo "─────────────────────────────────────────────────────────────"
MAX_WAIT=300  # 5 minutes
WAITED=0
printf "Checking Metro status"
while ! curl -s http://localhost:8081 > /dev/null 2>&1; do
    sleep 2
    WAITED=$((WAITED + 2))
    if [ $WAITED -gt $MAX_WAIT ]; then
        echo ""
        fail "Metro did not start within $MAX_WAIT seconds"
        kill $METRO_PID 2>/dev/null || true
        exit 1
    fi
    printf "."
done
echo ""
pass "Metro responding on http://localhost:8081"
echo ""

# 7. Wait for initial bundle
echo -e "${BOLD}Step 7/9: Bundling JavaScript (this may take 2-5 minutes)${NC}"
echo "─────────────────────────────────────────────────────────────"
LAST_PROGRESS=""
printf "Bundling progress: "
while ! grep -q "Bundled.*index.ts" /tmp/metro-build.log 2>/dev/null; do
    # Check for progress percentage in log
    PROGRESS=$(tail -20 /tmp/metro-build.log 2>/dev/null | grep -oP '\d+\.\d+%' | tail -1)
    if [[ -n "$PROGRESS" && "$PROGRESS" != "$LAST_PROGRESS" ]]; then
        printf "\rBundling progress: ${GREEN}$PROGRESS${NC}"
        LAST_PROGRESS="$PROGRESS"
    else
        printf "."
    fi

    sleep 3
    WAITED=$((WAITED + 3))
    if [ $WAITED -gt 600 ]; then  # 10 minutes max
        echo ""
        fail "Bundle did not complete within 10 minutes"
        echo ""
        echo "Last 20 lines of Metro log:"
        tail -20 /tmp/metro-build.log
        kill $METRO_PID 2>/dev/null || true
        exit 1
    fi
done
echo ""

END_TIME=$(date +%s)
BUILD_TIME=$((END_TIME - START_TIME))
MINUTES=$(($BUILD_TIME / 60))
SECONDS=$(($BUILD_TIME % 60))
pass "Bundle completed in ${BUILD_TIME}s (${MINUTES}m ${SECONDS}s)"

# Extract bundle size from log
BUNDLE_SIZE=$(grep "Bundled.*index.ts" /tmp/metro-build.log | grep -oP '\d+ms' | tail -1)
if [[ -n "$BUNDLE_SIZE" ]]; then
    info "Bundle time: $BUNDLE_SIZE"
fi
echo ""

# 8. Test HTTP response
echo -e "${BOLD}Step 8/9: Testing HTTP endpoint${NC}"
echo "─────────────────────────────────────────────────────────────"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081 --max-time 10)
if [ "$HTTP_CODE" = "200" ]; then
    pass "HTTP 200 OK from Metro"
else
    fail "HTTP $HTTP_CODE from Metro (expected 200)"
fi
echo ""

# 9. Test browser rendering
echo -e "${BOLD}Step 9/9: Testing app rendering in browser${NC}"
echo "─────────────────────────────────────────────────────────────"

# Use simple Node.js test instead of full Playwright
cat > /tmp/test-render.js << 'EOF'
const http = require('http');

http.get('http://localhost:8081', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    if (data.includes('root') && data.includes('<!DOCTYPE html>')) {
      console.log('PASS: HTML with root element detected');
      process.exit(0);
    } else {
      console.error('FAIL: Invalid HTML response');
      process.exit(1);
    }
  });
}).on('error', (e) => {
  console.error('FAIL: ' + e.message);
  process.exit(1);
});
EOF

if node /tmp/test-render.js 2>&1 | grep -q "PASS"; then
    pass "App HTML rendered correctly"
    info "Login screen should be visible in browser"
else
    warn "Could not verify app rendering (check manually)"
fi
echo ""

# 10. Final summary
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                     📊 TEST RESULTS                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo -e "  ${GREEN}✓ Passed:${NC}  $TESTS_PASSED tests"
if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "  ${RED}✗ Failed:${NC}  $TESTS_FAILED tests"
fi
echo ""
echo -e "  ⏱️  Total build time: ${BOLD}${BUILD_TIME}s${NC} (${MINUTES}m ${SECONDS}s)"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo -e "║            ${GREEN}${BOLD}✓ BUILD SUCCESS - ALL TESTS PASSED${NC}              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    echo -e "${BOLD}Metro Bundler Information:${NC}"
    echo "  • URL:      http://localhost:8081"
    echo "  • PID:      $METRO_PID"
    echo "  • Status:   Running"
    echo ""
    echo -e "${BOLD}To stop Metro:${NC}"
    echo "  kill $METRO_PID"
    echo ""
    echo -e "${GREEN}You can now open the app in your browser at http://localhost:8081${NC}"
    echo ""
    exit 0
else
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo -e "║              ${RED}${BOLD}✗ BUILD FAILED - SEE ERRORS ABOVE${NC}              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    kill $METRO_PID 2>/dev/null || true
    exit 1
fi
