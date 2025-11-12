/**
 * SDUI System - React Native Edition
 *
 * Central export file for the complete SDUI (Server-Driven UI) system.
 *
 * This system enables:
 * - Backend-defined UI structure
 * - Dynamic page composition
 * - Policy-driven caching
 * - Runtime context injection
 */

// ============================================================================
// Schemas
// ============================================================================

export type {
  // Structure types
  AppStructure,
  BuildingBlock,
  PageDefinition,
  PageSection,
  NavigationItem,
  AppTheme,
  SectionLayout,
  FlexDirection,
  FlexAlign,
  FlexJustify,
} from './schema/structure.schema';

export { EXAMPLE_STRUCTURE } from './schema/structure.schema';

export type {
  // Cache Policy types
  CachePolicy,
  CachePolicyStrategy,
  AdaptivePolling,
  DataQueryConfig,
  ComponentData,
} from './schema/policy.schema';

export {
  // Cache Policy validators and helpers
  CachePolicyStrategySchema,
  validateCachePolicy,
  safeCachePolicy,
  validateDataQueryConfig,
  getDefaultCachePolicy,
  isPollStrategy,
  isStaticStrategy,
  isOnLoadStrategy,
  describeCachePolicy,
} from './schema/policy.schema';

// ============================================================================
// Hooks
// ============================================================================

export {
  useStructure,
  useBuildingBlocks,
  useBuildingBlock,
  usePages,
  usePage,
  useNavigation,
  useAppMeta,
  useReloadStructure,
} from './hooks/useStructure';

export {
  useRuntimeContext,
  useDebugRuntimeContext,
} from './hooks/useRuntimeContext';

// ============================================================================
// Types
// ============================================================================

export type {
  RuntimeContext,
  UserContext,
  GeolocationContext,
  FilterContext,
  ContextVariablePath,
  ParameterValue,
  ParametersWithContext,
  ResolvedParameters,
} from './types/runtime-context.types';

export {
  isContextVariable,
  parseContextPath,
} from './types/runtime-context.types';

// ============================================================================
// Components
// ============================================================================

export { default as UniversalPageRenderer } from './components/UniversalPageRenderer';
export { registerBuildingBlock } from './components/UniversalPageRenderer';

// Building Blocks
export * from './components/blocks';

// Setup
export { default as setupSduiSystem } from './setup';

// ============================================================================
// Note: Main types already exported above - no need for re-exports
// ============================================================================
