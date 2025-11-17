# React Native Build Testing

## Test Script

Het project heeft één geautomatiseerd test script:

```bash
./test-build.sh
```

## Wat het script doet

Het script voert een complete build verificatie uit in 9 stappen:

1. **Dependencies Check** - Controleert of pnpm en watchman geïnstalleerd zijn
2. **Configuration Verification** - Verifieert Hermes Engine en Metro cache setup
3. **Cache Cleanup** - Maakt alle caches schoon voor een frisse build
4. **Process Management** - Stopt bestaande Metro processes
5. **Metro Start** - Start Metro bundler met --clear flag
6. **Metro Response** - Wacht tot Metro op port 8081 reageert
7. **Bundle Completion** - Wacht tot JavaScript bundle klaar is (2-5 minuten)
   - Toont realtime progress percentage
   - Meet build tijd
8. **HTTP Test** - Test of Metro correct HTTP 200 responses geeft
9. **Rendering Test** - Verifieert dat HTML correct wordt gegenereerd

## Output

Het script geeft zeer duidelijke visuele feedback:

- ✅ Groene vinkjes voor geslaagde tests
- ❌ Rode kruisjes voor gefaalde tests  
- ⚠️  Gele waarschuwingen voor optionele checks
- ℹ️  Blauwe info berichten

### Success Output

Bij succesvolle build:

```
╔══════════════════════════════════════════════════════════════╗
║            ✓ BUILD SUCCESS - ALL TESTS PASSED              ║
╚══════════════════════════════════════════════════════════════╝

Metro Bundler Information:
  • URL:      http://localhost:8081
  • PID:      12345
  • Status:   Running

To stop Metro:
  kill 12345

You can now open the app in your browser at http://localhost:8081
```

### Failure Output

Bij gefaalde build:

```
╔══════════════════════════════════════════════════════════════╗
║              ✗ BUILD FAILED - SEE ERRORS ABOVE              ║
╚══════════════════════════════════════════════════════════════╝
```

## Build Time Verwachting

Eerste run (na cache clear): **2-5 minuten**
Tweede run (met cache): **~30 seconden**

## Optimalisaties Geactiveerd

1. **pnpm** - 2-3x snellere package install
2. **Hermes Engine** - ~50% snellere JavaScript startup
3. **Watchman** - Native file watching (geen polling)
4. **Metro FileStore Cache** - Persistente cache tussen builds

## Manual Testing

Als je handmatig wilt testen:

```bash
# 1. Clear cache en start
pnpm start --clear

# 2. Open browser
# http://localhost:8081

# 3. Verifieer login screen
# - Email input zichtbaar
# - Password input zichtbaar
# - Login button zichtbaar
```

## Troubleshooting

### Blank screen?

```bash
# Kill Metro en clear alle caches
pkill -f "expo start"
rm -rf .metro-cache .expo node_modules/.cache
watchman watch-del-all
pnpm start --clear
```

### Port 8081 in use?

```bash
# Vind process
lsof -i :8081

# Kill process
kill -9 <PID>
```

### Metro bundling duurt te lang?

Check:
- Hermes enabled in `app.json`
- FileStore in `metro.config.js`
- Watchman installed (`watchman --version`)
