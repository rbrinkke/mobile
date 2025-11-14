/**
 * Activities Feature - Type Definitions
 *
 * Centralized types for the activities feature module.
 * All activity-related interfaces, types, and enums in one place.
 */

// ============================================================================
// Domain Models
// ============================================================================

export interface Activity {
  id: string;
  title: string;
  description: string;
  location: ActivityLocation;
  imageUrl?: string;
  participants: number;
  maxParticipants: number;
  liked: boolean;
  likeCount: number;
  category: ActivityCategory;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export interface ActivityLocation {
  address: string;
  city: string;
  postalCode?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export enum ActivityCategory {
  SPORTS = 'sports',
  FOOD = 'food',
  CULTURE = 'culture',
  NATURE = 'nature',
  SOCIAL = 'social',
  LEARNING = 'learning',
  VOLUNTEERING = 'volunteering',
  OTHER = 'other',
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface ActivitiesListResponse {
  items: Activity[];
  hasMore: boolean;
  nextOffset: number;
  total: number;
}

export interface CreateActivityRequest {
  title: string;
  description: string;
  location: Omit<ActivityLocation, 'coordinates'>;
  category: ActivityCategory;
  maxParticipants: number;
  startDate: string;
  endDate?: string;
  imageUrl?: string;
}

export interface UpdateActivityRequest extends Partial<CreateActivityRequest> {
  id: string;
}

export interface ActivityFilters {
  category?: ActivityCategory;
  radius?: number; // in km
  location?: { lat: number; lng: number };
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
}

// ============================================================================
// Component Props
// ============================================================================

export interface ActivityCardProps {
  activity: Activity;
  onPress?: (activity: Activity) => void;
  onLike?: (activityId: string) => void;
  onJoin?: (activityId: string) => void;
}

export interface ActivityListProps {
  filters?: ActivityFilters;
  onActivityPress?: (activity: Activity) => void;
}

export interface ActivityDetailProps {
  activityId: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type ActivitySortBy = 'date' | 'distance' | 'popularity' | 'newest';

export interface ActivityStats {
  totalActivities: number;
  activeParticipants: number;
  categoriesCount: Record<ActivityCategory, number>;
}
