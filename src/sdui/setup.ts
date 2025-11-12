/**
 * SDUI Setup - Register Building Blocks
 *
 * This file registers all building block components with the SDUI system.
 * Must be imported BEFORE rendering any SDUI pages.
 *
 * Usage in App.tsx:
 * ```tsx
 * import './src/sdui/setup'; // Register building blocks
 * import { UniversalPageRenderer } from './src/sdui';
 * ```
 */

import { registerBuildingBlock } from './components/UniversalPageRenderer';
import { HeroSection, ActivityCard } from './components/blocks';

/**
 * Register all building blocks
 *
 * The building block ID MUST match the id in structure.json
 */
export function setupSduiSystem() {
  // Hero Section
  registerBuildingBlock('hero', HeroSection);

  // Activity Card
  registerBuildingBlock('activity-card', ActivityCard);

  // TODO: Register more building blocks as you create them
  // registerBuildingBlock('user-avatar-list', UserAvatarList);
  // registerBuildingBlock('section-header', SectionHeader);
  // registerBuildingBlock('empty-state', EmptyState);

  if (__DEV__) {
    console.log('✅ SDUI System initialized - 2 building blocks registered');
  }
}

// Auto-initialize in development
if (__DEV__) {
  setupSduiSystem();
}

export default setupSduiSystem;
