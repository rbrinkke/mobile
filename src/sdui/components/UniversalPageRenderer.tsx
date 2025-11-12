import React, { useMemo } from 'react';
import { View, ScrollView, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { usePage, useBuildingBlocks } from '../hooks/useStructure';
import { useRuntimeContext } from '../hooks/useRuntimeContext';
import type { PageSection, SectionLayout } from '../schema/structure.schema';
import apiClient from '../../services/apiClient';

/**
 * UniversalPageRenderer - React Native Edition
 *
 * The "LEGO Builder" - Assembles pages from building blocks and data.
 *
 * This component:
 * 1. Gets the page definition from structure.json
 * 2. Fetches data for each section (with cache policies)
 * 3. Renders building blocks as React Native components
 *
 * MVP VERSION: Direct component mapping (no template engine yet)
 * Full SDUI features (templates, policies, runtime params) coming next!
 */

interface UniversalPageRendererProps {
  pageId: string;
}

/**
 * Component Registry - Maps building block IDs to React Native components
 *
 * This is the bridge between backend structure.json and native components.
 */
const COMPONENT_REGISTRY: Record<string, React.ComponentType<any>> = {
  // TODO: Register building blocks here
  // 'hero': HeroSection,
  // 'activity-card': ActivityCard,
  // 'user-avatar-list': UserAvatarList,
};

/**
 * Register a building block component
 */
export function registerBuildingBlock(id: string, component: React.ComponentType<any>) {
  COMPONENT_REGISTRY[id] = component;
  if (__DEV__) {
    console.log(`[SDUI] Registered building block: ${id}`);
  }
}

/**
 * Main Page Renderer Component
 */
export default function UniversalPageRenderer({ pageId }: UniversalPageRendererProps) {
  const pageDefinition = usePage(pageId);
  const buildingBlocks = useBuildingBlocks();
  const runtimeContext = useRuntimeContext();

  // DEBUG: Log page lookup
  if (__DEV__) {
    console.log('[UniversalPageRenderer] pageId:', pageId);
    console.log('[UniversalPageRenderer] pageDefinition:', pageDefinition ? 'FOUND' : 'NOT FOUND');
    console.log('[UniversalPageRenderer] buildingBlocks:', buildingBlocks ? `${buildingBlocks.size} blocks` : 'NOT LOADED');
  }

  // Sort sections by order (ALWAYS call useMemo, even if empty!)
  const sortedSections = useMemo(() => {
    if (!pageDefinition) return [];
    return [...pageDefinition.sections].sort((a, b) => {
      const orderA = a.layout.order ?? 0;
      const orderB = b.layout.order ?? 0;
      return orderA - orderB;
    });
  }, [pageDefinition]);

  // Container layout from page definition (ALWAYS compute style)
  const containerStyle = useMemo(() => {
    if (!pageDefinition?.containerLayout) return styles.defaultContainer;
    return convertLayoutToStyle(pageDefinition.containerLayout);
  }, [pageDefinition]);

  // Loading state (AFTER all hooks!)
  if (!pageDefinition || !buildingBlocks) {
    return <LoadingState />;
  }

  return (
    <ScrollView
      style={[styles.scrollView, containerStyle]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Debug banner in development */}
      {__DEV__ && (
        <View style={styles.debugBanner}>
          <Text style={styles.debugText}>
            🔧 SDUI Debug: Page "{pageId}" | {sortedSections.length} sections
          </Text>
        </View>
      )}

      {/* Render all sections */}
      {sortedSections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          buildingBlocks={buildingBlocks}
          runtimeContext={runtimeContext}
        />
      ))}

      {/* Empty state if no sections */}
      {sortedSections.length === 0 && <EmptyState pageId={pageId} />}
    </ScrollView>
  );
}

/**
 * Section Renderer - Renders a single section with its building block
 *
 * IMPORTANT: This MUST be a separate component (not inline in map)
 * to ensure stable React Hooks behavior!
 */
interface SectionRendererProps {
  section: PageSection;
  buildingBlocks: Map<string, any>;
  runtimeContext: any;
}

const SectionRenderer = React.memo(function SectionRenderer({
  section,
  buildingBlocks,
  runtimeContext
}: SectionRendererProps) {
  const buildingBlock = buildingBlocks.get(section.buildingBlockId);

  // Fetch data for this section using TanStack Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['section-data', section.id, section.dataSource.queryName],
    queryFn: async () => {
      // Use real API client
      if (__DEV__) {
        console.log(`[Section] Fetching data for: ${section.dataSource.queryName}`);
      }

      return apiClient.query({
        query_name: section.dataSource.queryName,
        ...section.dataSource.params,
        ...runtimeContext, // Include runtime context (user_id, etc.)
      });
    },
    // Apply cache policy from section
    staleTime: section.dataSource.cachePolicy.staleTimeMs || 5 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });

  if (!buildingBlock) {
    if (__DEV__) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            ⚠️ Building block not found: {section.buildingBlockId}
          </Text>
        </View>
      );
    }
    return null;
  }

  // Get component from registry
  const Component = COMPONENT_REGISTRY[buildingBlock.id];

  if (!Component) {
    if (__DEV__) {
      return (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            📦 Component not registered: {buildingBlock.id}
          </Text>
          <Text style={styles.warningSubtext}>
            Use registerBuildingBlock('{buildingBlock.id}', YourComponent)
          </Text>
        </View>
      );
    }
    return null;
  }

  // Convert layout to React Native styles
  const sectionStyle = convertLayoutToStyle(section.layout);

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <View style={[styles.sectionWrapper, sectionStyle, styles.loadingSection]}>
        <ActivityIndicator size="small" color="#FF6B6B" />
      </View>
    );
  }

  // Show error state if data fetch failed
  if (error) {
    if (__DEV__) {
      return (
        <View style={[styles.sectionWrapper, sectionStyle, styles.errorContainer]}>
          <Text style={styles.errorText}>
            ⚠️ Error loading data: {error.message}
          </Text>
        </View>
      );
    }
    return null;
  }

  // Merge default props from building block + fetched data
  const componentProps = {
    ...buildingBlock.defaultProps,
    ...data,
  };

  return (
    <View style={[styles.sectionWrapper, sectionStyle]} key={section.id}>
      <Component {...componentProps} />
    </View>
  );
});

/**
 * Convert SectionLayout to React Native StyleSheet
 */
function convertLayoutToStyle(layout: SectionLayout): any {
  const style: any = {};

  // Flex properties
  if (layout.flex !== undefined) style.flex = layout.flex;
  if (layout.flexDirection) style.flexDirection = layout.flexDirection;
  if (layout.justifyContent) style.justifyContent = layout.justifyContent;
  if (layout.alignItems) style.alignItems = layout.alignItems;

  // Padding
  if (layout.padding !== undefined) style.padding = layout.padding;
  if (layout.paddingTop !== undefined) style.paddingTop = layout.paddingTop;
  if (layout.paddingBottom !== undefined) style.paddingBottom = layout.paddingBottom;
  if (layout.paddingLeft !== undefined) style.paddingLeft = layout.paddingLeft;
  if (layout.paddingRight !== undefined) style.paddingRight = layout.paddingRight;
  if (layout.paddingHorizontal !== undefined) style.paddingHorizontal = layout.paddingHorizontal;
  if (layout.paddingVertical !== undefined) style.paddingVertical = layout.paddingVertical;

  // Margin
  if (layout.margin !== undefined) style.margin = layout.margin;
  if (layout.marginTop !== undefined) style.marginTop = layout.marginTop;
  if (layout.marginBottom !== undefined) style.marginBottom = layout.marginBottom;
  if (layout.marginLeft !== undefined) style.marginLeft = layout.marginLeft;
  if (layout.marginRight !== undefined) style.marginRight = layout.marginRight;
  if (layout.marginHorizontal !== undefined) style.marginHorizontal = layout.marginHorizontal;
  if (layout.marginVertical !== undefined) style.marginVertical = layout.marginVertical;

  // Dimensions
  if (layout.width !== undefined) style.width = layout.width;
  if (layout.height !== undefined) style.height = layout.height;
  if (layout.minWidth !== undefined) style.minWidth = layout.minWidth;
  if (layout.maxWidth !== undefined) style.maxWidth = layout.maxWidth;
  if (layout.minHeight !== undefined) style.minHeight = layout.minHeight;
  if (layout.maxHeight !== undefined) style.maxHeight = layout.maxHeight;

  // Background
  if (layout.backgroundColor) style.backgroundColor = layout.backgroundColor;

  // Border radius
  if (layout.borderRadius !== undefined) style.borderRadius = layout.borderRadius;

  // Shadow (iOS)
  if (layout.shadowColor) style.shadowColor = layout.shadowColor;
  if (layout.shadowOffset) style.shadowOffset = layout.shadowOffset;
  if (layout.shadowOpacity !== undefined) style.shadowOpacity = layout.shadowOpacity;
  if (layout.shadowRadius !== undefined) style.shadowRadius = layout.shadowRadius;

  // Elevation (Android)
  if (layout.elevation !== undefined) style.elevation = layout.elevation;

  return style;
}

/**
 * Loading State
 */
function LoadingState() {
  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#FF6B6B" />
      <Text style={styles.loadingText}>Loading page...</Text>
    </View>
  );
}

/**
 * Empty State
 */
function EmptyState({ pageId }: { pageId: string }) {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.emptyTitle}>📄 Empty Page</Text>
      <Text style={styles.emptyText}>No content defined for "{pageId}"</Text>
    </View>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flexGrow: 1,
  },
  defaultContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  sectionWrapper: {
    // Default section wrapper styles
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  debugBanner: {
    backgroundColor: '#E3F2FD',
    borderBottomWidth: 1,
    borderBottomColor: '#90CAF9',
    padding: 12,
  },
  debugText: {
    fontSize: 12,
    color: '#1976D2',
    fontFamily: 'monospace',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#EF5350',
    padding: 16,
    margin: 8,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#C62828',
    fontWeight: '600',
  },
  warningContainer: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FFB74D',
    padding: 16,
    margin: 8,
    borderRadius: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#E65100',
    fontWeight: '600',
    marginBottom: 4,
  },
  warningSubtext: {
    fontSize: 12,
    color: '#EF6C00',
    fontFamily: 'monospace',
  },
  loadingSection: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
});
