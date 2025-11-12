/**
 * useRuntimeContext Hook - React Native Edition
 *
 * Aggregates live client-side data into a unified RuntimeContext object.
 *
 * This hook is the "source of truth" for all $$CONTEXT variable resolution.
 * It collects data from:
 * - Auth Context (USER context)
 * - Expo Location (GEOLOCATION context)
 * - Global filter store (FILTER context)
 *
 * The returned context is then used by resolveRuntimeParams() to inject
 * live values into PageSection dataSource.params.
 */

import { useMemo } from 'react';
import type { RuntimeContext, UserContext } from '../types/runtime-context.types';

/**
 * Aggregate live client state into RuntimeContext
 *
 * @returns RuntimeContext object with all available context namespaces
 */
export function useRuntimeContext(): RuntimeContext {
  // TODO: Get authenticated user from Auth Context
  // For now, returns null until auth system is implemented
  const userContext: UserContext | null = useMemo(() => {
    // Future implementation:
    // const { user, isAuthenticated } = useAuth();
    // if (!isAuthenticated || !user) return null;
    // return {
    //   ID: user.id,
    //   EMAIL: user.email,
    //   IS_VERIFIED: user.is_verified,
    //   IS_2FA_ENABLED: user.is_2fa_enabled,
    // };
    return null;
  }, []);

  // TODO: GEOLOCATION context (requires Expo Location API)
  // For now, returns null until location is implemented
  const geolocationContext = useMemo(() => {
    // Future implementation:
    // import * as Location from 'expo-location';
    // const [location, setLocation] = useState<Location.LocationObject | null>(null);
    // useEffect(() => {
    //   (async () => {
    //     let { status } = await Location.requestForegroundPermissionsAsync();
    //     if (status !== 'granted') return;
    //     let location = await Location.getCurrentPositionAsync({});
    //     setLocation(location);
    //   })();
    // }, []);
    // return location ? {
    //   LAT: location.coords.latitude,
    //   LON: location.coords.longitude,
    //   ACCURACY: location.coords.accuracy
    // } : null;
    return null;
  }, []);

  // TODO: FILTER context (requires global filter store)
  // For now, returns empty object
  const filterContext = useMemo(() => {
    // Future implementation:
    // const { globalSearch, category } = useFilterStore();
    // return { GLOBAL_SEARCH: globalSearch, CATEGORY: category };
    return {};
  }, []);

  // Combine all contexts
  return useMemo(
    () => ({
      USER: userContext,
      GEOLOCATION: geolocationContext,
      FILTER: filterContext,
    }),
    [userContext, geolocationContext, filterContext]
  );
}

/**
 * Debug helper: Log current runtime context
 *
 * Usage in component:
 * ```tsx
 * const context = useRuntimeContext();
 * useDebugRuntimeContext(context);
 * ```
 */
export function useDebugRuntimeContext(context: RuntimeContext) {
  if (__DEV__) {
    console.log('[RuntimeContext] Current state:', {
      USER: context.USER
        ? {
            ID: context.USER.ID,
            EMAIL: context.USER.EMAIL,
            IS_VERIFIED: context.USER.IS_VERIFIED,
          }
        : null,
      GEOLOCATION: context.GEOLOCATION,
      FILTER: context.FILTER,
    });
  }
}
