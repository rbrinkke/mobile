/**
 * Query Key Factory - TanStack Query Best Practice
 *
 * Benefits:
 * - Consistent query key structure across the app
 * - Type-safe query keys with autocomplete
 * - Efficient cache invalidation
 * - Easy to find all cache keys in one place
 *
 * Pattern from TanStack Query docs:
 * https://tanstack.com/query/latest/docs/react/guides/query-keys
 */

export const queryKeys = {
  // Activities
  activities: {
    all: ['activities'] as const,
    lists: () => [...queryKeys.activities.all, 'list'] as const,
    list: (filters?: ActivityFilters) =>
      [...queryKeys.activities.lists(), filters].filter(Boolean) as const,
    infiniteList: (filters?: ActivityFilters) =>
      [...queryKeys.activities.lists(), 'infinite', filters].filter(Boolean) as const,
    details: () => [...queryKeys.activities.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.activities.details(), id] as const,
  },

  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters?: UserFilters) =>
      [...queryKeys.users.lists(), filters].filter(Boolean) as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    profile: (id: string) => [...queryKeys.users.all, 'profile', id] as const,
  },

  // Chats
  chats: {
    all: ['chats'] as const,
    lists: () => [...queryKeys.chats.all, 'list'] as const,
    list: () => [...queryKeys.chats.lists()] as const,
    details: () => [...queryKeys.chats.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.chats.details(), id] as const,
    messages: (chatId: string) => [...queryKeys.chats.detail(chatId), 'messages'] as const,
  },

  // Comments
  comments: {
    all: ['comments'] as const,
    lists: () => [...queryKeys.comments.all, 'list'] as const,
    list: (activityId: string) => [...queryKeys.comments.lists(), activityId] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    lists: () => [...queryKeys.notifications.all, 'list'] as const,
    list: (filters?: NotificationFilters) =>
      [...queryKeys.notifications.lists(), filters].filter(Boolean) as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unread-count'] as const,
  },

  // Auth
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    tokens: () => [...queryKeys.auth.all, 'tokens'] as const,
  },
};

// Type definitions for filters
export interface ActivityFilters {
  category?: string;
  radius?: number;
  location?: { lat: number; lng: number };
  dateFrom?: string;
  dateTo?: string;
}

export interface UserFilters {
  search?: string;
  role?: string;
}

export interface NotificationFilters {
  unreadOnly?: boolean;
  type?: string;
}

/**
 * Helper to invalidate all queries for a specific domain
 *
 * Usage:
 * invalidateActivities(queryClient) - Invalidates ALL activity queries
 * invalidateActivities(queryClient, 'lists') - Invalidates only lists
 */
export function invalidateActivities(
  queryClient: any,
  scope?: 'all' | 'lists' | 'details'
) {
  if (!scope || scope === 'all') {
    return queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
  }
  if (scope === 'lists') {
    return queryClient.invalidateQueries({ queryKey: queryKeys.activities.lists() });
  }
  if (scope === 'details') {
    return queryClient.invalidateQueries({ queryKey: queryKeys.activities.details() });
  }
}

export function invalidateUsers(queryClient: any, scope?: 'all' | 'lists' | 'details') {
  if (!scope || scope === 'all') {
    return queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
  }
  if (scope === 'lists') {
    return queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
  }
  if (scope === 'details') {
    return queryClient.invalidateQueries({ queryKey: queryKeys.users.details() });
  }
}

export function invalidateChats(queryClient: any, scope?: 'all' | 'lists' | 'details') {
  if (!scope || scope === 'all') {
    return queryClient.invalidateQueries({ queryKey: queryKeys.chats.all });
  }
  if (scope === 'lists') {
    return queryClient.invalidateQueries({ queryKey: queryKeys.chats.lists() });
  }
  if (scope === 'details') {
    return queryClient.invalidateQueries({ queryKey: queryKeys.chats.details() });
  }
}
