import { useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { AppStructure, BuildingBlock, PageDefinition } from '../schema/structure.schema';
import apiClient from '../../services/apiClient';
import mockApi from '../../services/mockApi';

/**
 * useStructure Hook - React Native Edition
 *
 * Loads the complete AppStructure JSON from the backend.
 *
 * This is loaded ONCE and cached with 'static' policy (never refetches).
 * The structure defines:
 * - All building blocks
 * - All pages
 * - Navigation structure
 *
 * This is the "blueprint" of the entire app.
 */

const STRUCTURE_QUERY_KEY = ['app', 'structure'];

/**
 * Load the app structure from backend
 */
export function useStructure(): UseQueryResult<AppStructure> {
  return useQuery({
    queryKey: STRUCTURE_QUERY_KEY,
    queryFn: async () => {
      if (__DEV__) {
        console.log('[useStructure] Loading from mock API (development mode)...');
      }

      // Use mock API for development (no backend required)
      const structure = await mockApi.getStructure();

      // Validate structure
      if (!structure.version || !structure.buildingBlocks || !structure.pages) {
        throw new Error('Invalid AppStructure: missing required fields');
      }

      if (__DEV__) {
        console.log('[useStructure] Loaded app structure:', {
          version: structure.version,
          buildingBlocks: structure.buildingBlocks.length,
          pages: structure.pages.length,
          navigation: structure.navigation?.length || 0,
        });
      }

      return structure;
    },
    // STATIC POLICY: Never refetch (structure rarely changes)
    // DEV MODE: Short cache for development flexibility
    staleTime: __DEV__ ? 10000 : Infinity, // 10 seconds in dev, infinite in production
    gcTime: Infinity,
    refetchOnMount: __DEV__ ? true : false, // Reload in dev mode
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 3, // Retry if loading fails (critical data)
  });
}

/**
 * Get all building blocks as a Map (for fast lookup)
 */
export function useBuildingBlocks(): Map<string, BuildingBlock> | undefined {
  const { data: structure, isLoading } = useStructure();

  // DEBUG: Log structure loading state
  if (__DEV__ && isLoading) {
    console.log('[useBuildingBlocks] Structure is loading...');
  }

  return useMemo(() => {
    if (!structure) return undefined;

    const map = new Map<string, BuildingBlock>();
    structure.buildingBlocks.forEach((block) => {
      map.set(block.id, block);
    });

    if (__DEV__) {
      console.log(`[useBuildingBlocks] Returning ${map.size} building blocks`);
    }

    return map;
  }, [structure]);
}

/**
 * Get a specific building block by ID
 */
export function useBuildingBlock(blockId: string): BuildingBlock | undefined {
  const blocks = useBuildingBlocks();
  return blocks?.get(blockId);
}

/**
 * Get all pages as a Map (for fast lookup)
 */
export function usePages(): Map<string, PageDefinition> | undefined {
  const { data: structure, isLoading } = useStructure();

  // DEBUG: Log structure loading state
  if (__DEV__ && isLoading) {
    console.log('[usePages] Structure is loading...');
  }

  return useMemo(() => {
    if (!structure) return undefined;

    const map = new Map<string, PageDefinition>();
    structure.pages.forEach((page) => {
      map.set(page.id, page);
    });

    if (__DEV__) {
      console.log(`[usePages] Returning ${map.size} pages`);
    }

    return map;
  }, [structure]);
}

/**
 * Get a specific page definition by ID
 */
export function usePage(pageId: string): PageDefinition | undefined {
  const pages = usePages();
  return pages?.get(pageId);
}

/**
 * Get navigation items (sorted by order)
 */
export function useNavigation() {
  const { data: structure } = useStructure();

  return useMemo(() => {
    if (!structure) return [];

    return [...structure.navigation]
      .filter((item) => item.visible)
      .sort((a, b) => a.order - b.order);
  }, [structure]);
}

/**
 * Get app metadata (name, theme, etc.)
 */
export function useAppMeta() {
  const { data: structure } = useStructure();
  return structure?.meta;
}

/**
 * Force reload the structure (useful for development)
 */
export function useReloadStructure() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: STRUCTURE_QUERY_KEY });
    if (__DEV__) {
      console.log('[useStructure] Structure reloaded');
    }
  };
}

// ============================================================================
// Development Utilities
// ============================================================================

if (__DEV__) {
  // Expose reload function globally for debugging
  (global as any).__reloadStructure = () => {
    console.log('[Dev] Reloading structure...');
    // This will be available after first render
  };
}
