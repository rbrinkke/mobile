/**
 * Activities Feature - Public API
 *
 * Central export point for the activities feature module.
 * Clean barrel exports for external consumers.
 */

// Types
export type {
  Activity,
  ActivityLocation,
  ActivitiesListResponse,
  CreateActivityRequest,
  UpdateActivityRequest,
  ActivityFilters,
  ActivityCardProps,
  ActivityListProps,
  ActivityDetailProps,
  ActivitySortBy,
  ActivityStats,
} from './types';

export { ActivityCategory } from './types';

// Hooks
export {
  useActivities,
  useActivity,
  useSearchActivities,
  useNearbyActivities,
  useLikeActivity,
  useUnlikeActivity,
  useJoinActivity,
  useLeaveActivity,
  useCreateActivity,
  useUpdateActivity,
  useDeleteActivity,
} from './hooks/useActivities';

// API Service (for advanced use cases)
export { activitiesApi } from './services/activitiesApi';
