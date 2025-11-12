/**
 * Building Blocks - Native Component Library
 *
 * These are the "LEGO pieces" that the backend can assemble into pages.
 * Each building block is a self-contained React Native component.
 */

export { default as HeroSection } from './HeroSection';
export type { HeroSectionProps } from './HeroSection';

export { default as ActivityCard } from './ActivityCard';
export type { ActivityCardProps } from './ActivityCard';

// TODO: Add more building blocks:
// - UserAvatarList (horizontal scrollable list)
// - SectionHeader (title + subtitle)
// - EmptyState (placeholder when no data)
// - LoadingCard (skeleton loader)
// - FilterBar (search + filters)
// - CategoryGrid (grid of categories)
// - StatCard (metric display)
// - NotificationBanner (alerts)
