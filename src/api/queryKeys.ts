/**
 * React Query keys - Centralized query key management
 * Best practice: Organize by feature for automatic invalidation
 */

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    tokens: () => [...queryKeys.auth.all, 'tokens'] as const,
  },
  // Add more features as needed
  // profile: {
  //   all: ['profile'] as const,
  //   detail: (id: string) => [...queryKeys.profile.all, id] as const,
  // },
} as const;
