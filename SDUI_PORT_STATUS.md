# SDUI System Porting Status

## Overview

Porting Pure SDUI (Server-Driven UI) architecture from PWA to React Native. This enables backend-controlled UI structure, eliminating hardcoded screens.

## Key Differences: Web vs React Native

| Aspect | PWA (Web) | React Native |
|--------|-----------|--------------|
| **Layout** | CSS Grid (12-column) | Flexbox |
| **Templates** | HTML strings + Handlebars | React Native components |
| **Styling** | Tailwind classes | StyleSheet objects |
| **Env Vars** | `import.meta.env` | `__DEV__` constant |
| **Global** | `window` | `global` |
| **Storage** | localStorage | AsyncStorage |

## Architecture Components

### ✅ Completed

#### 1. **Schemas** (`src/sdui/schema/`)

- **policy.schema.ts** - Cache policy definitions (Zod validation)
  - Identical to PWA version
  - Supports `onLoad`, `static`, `poll` strategies
  - Adaptive polling, persistence, retry logic

- **structure.schema.ts** - App structure definitions
  - **Adapted for React Native**:
    - `SectionLayout` uses Flexbox instead of CSS Grid
    - `BuildingBlock` references component names (not HTML templates)
    - Added React Native-specific layout props (elevation, shadowOffset, etc.)
    - Theme includes `statusBarStyle`

#### 2. **Types** (`src/sdui/types/`)

- **runtime-context.types.ts** - Runtime context injection
  - Identical to PWA version
  - Defines `$$USER`, `$$GEOLOCATION`, `$$FILTER` contexts
  - Type-safe context variable paths

#### 3. **Hooks** (`src/sdui/hooks/`)

- **useStructure.ts** - App structure loading
  - **Changes from PWA**:
    - Uses `buildApiUrl()` from config (not `import.meta.env`)
    - Uses `__DEV__` instead of `import.meta.env.PROD`
    - Uses `global` instead of `window` for dev utilities

- **useRuntimeContext.ts** - Runtime context aggregation
  - **Simplified for now**:
    - Returns `null` for USER until auth system built
    - Returns `null` for GEOLOCATION until Expo Location integrated
    - Empty FILTER context
  - **Future**: Will integrate Expo Location API

#### 4. **Configuration** (`src/config/`)

- **api.config.ts** - API endpoint configuration (NEW)
  - Replaces `import.meta.env` pattern
  - Supports development/production URLs
  - Helper functions: `getApiUrl()`, `buildApiUrl()`

#### 5. **Exports** (`src/sdui/index.ts`)

- Central export file for clean imports
- Re-exports all types, hooks, schemas

### 🚧 In Progress

#### 6. **Universal Page Renderer** (`src/sdui/components/`)

- **Status**: Not started
- **Complexity**: High - Core rendering logic
- **PWA equivalent**: `UniversalPageRenderer.tsx`
- **React Native changes needed**:
  - Replace HTML rendering with React Native View hierarchy
  - Use ScrollView for page scrolling
  - Apply Flexbox layout from `SectionLayout`
  - Map building block IDs to React Native component registry

#### 7. **Building Blocks** (`src/sdui/components/blocks/`)

- **Status**: Not started
- **Complexity**: Medium - Create native components
- **Examples needed**:
  - `HeroSection` - Hero banner with gradient
  - `ActivityCard` - Activity card with image
  - `UserAvatarList` - Horizontal scrollable avatars
  - `SectionHeader` - Section title and description
  - `EmptyState` - Empty state placeholder

### ❌ Not Started

#### 8. **Policy Engine** (`src/sdui/engine/`)

- **PolicyEngine.ts** - Cache policy execution
- **Status**: Will port after Page Renderer works
- **Complexity**: Low - TanStack Query options mapping

#### 9. **Utilities** (`src/sdui/utils/`)

- **resolveRuntimeParams.ts** - Context variable injection
- **queryKeys.ts** - Query key factory
- **Status**: Port when needed by Page Renderer

#### 10. **Services** (`src/services/`)

- **readApi.ts** - Backend data fetching
- **Status**: Port when Page Renderer is ready

## File Structure

```
mobile/src/sdui/
├── schema/
│   ├── structure.schema.ts  ✅ (adapted for RN)
│   └── policy.schema.ts     ✅ (identical)
├── types/
│   └── runtime-context.types.ts  ✅ (identical)
├── hooks/
│   ├── useStructure.ts      ✅ (adapted for RN)
│   └── useRuntimeContext.ts ✅ (simplified)
├── components/
│   ├── UniversalPageRenderer.tsx  ❌ (NOT STARTED)
│   └── blocks/              ❌ (NOT STARTED)
├── engine/
│   └── PolicyEngine.ts      ❌ (NOT STARTED)
├── utils/
│   ├── resolveRuntimeParams.ts  ❌ (NOT STARTED)
│   └── queryKeys.ts         ❌ (NOT STARTED)
└── index.ts                 ✅ (complete)
```

## Next Steps

1. **Create Universal Page Renderer**
   - Read PWA version: `/mnt/d/activity/frontend/src/sdui/components/UniversalPageRenderer.tsx`
   - Adapt for React Native View hierarchy
   - Implement Flexbox layout rendering
   - Create component registry for building blocks

2. **Build Core Building Blocks**
   - HeroSection (gradient banner)
   - ActivityCard (image + details)
   - UserAvatarList (horizontal scroll)
   - Start with these 3, expand later

3. **Test with Mock Structure**
   - Create example structure.json
   - Test Page Renderer with mock data
   - Verify layout, scrolling, data flow

4. **Port Remaining Utilities**
   - PolicyEngine (cache policy execution)
   - resolveRuntimeParams (context injection)
   - readApi (backend fetching)

## Estimated Completion

- **Core SDUI (Renderer + 3 blocks)**: 60% complete (schemas + hooks done)
- **Full SDUI (10+ blocks)**: 40% complete
- **Time to working prototype**: ~2-3 hours (depends on PWA code complexity)

## Integration Points

### Backend API Contract

The backend MUST provide:

1. **GET /api/structure** - Complete AppStructure JSON
2. **GET /api/read?query_name={name}** - Data for sections

Example structure response:
```json
{
  "version": "1.0.0",
  "meta": {
    "appName": "Activity App",
    "defaultPage": "activity",
    "theme": { "primaryColor": "#FF6B6B" }
  },
  "buildingBlocks": [
    {
      "id": "hero",
      "componentName": "HeroSection",
      "defaultProps": {}
    }
  ],
  "pages": [
    {
      "id": "activity",
      "title": "Activiteit",
      "screenName": "ActivityScreen",
      "sections": [
        {
          "id": "hero",
          "buildingBlockId": "hero",
          "layout": { "height": 200 },
          "dataSource": {
            "queryName": "get_activity_hero",
            "cachePolicy": { "strategy": "static" }
          }
        }
      ]
    }
  ],
  "navigation": [...]
}
```

### TanStack Query Setup

Need to configure QueryClient in App.tsx with:
- Persister (AsyncStorage)
- Default cache times
- Retry policies

### Navigation Integration

Current hardcoded navigation → Will be replaced by `structure.navigation[]`

## Testing Strategy

1. **Unit Tests**: Schema validation, utility functions
2. **Integration Tests**: Page Renderer with mock structure
3. **E2E Tests**: Full flow from structure load → page render
4. **Visual Tests**: Compare rendered pages to design

## Known Limitations

1. **No Auth Yet**: `useRuntimeContext` returns null USER
2. **No Location**: GEOLOCATION context not implemented
3. **Static Structure**: No hot reload for structure.json (yet)
4. **Limited Blocks**: Only 3 building blocks initially

## Future Enhancements

1. **Expo Location** - GPS for `$$GEOLOCATION` context
2. **AsyncStorage Persister** - Offline support
3. **Hot Reload** - Dev mode structure updates
4. **Component Registry** - Dynamic component loading
5. **Animation Support** - Reanimated integration
6. **Image Caching** - Fast Imageoptimization
