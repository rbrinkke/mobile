/**
 * Activities API Service
 *
 * Clean service layer abstraction for all activity-related API calls.
 * Separates API logic from React hooks for better testability and reusability.
 */

import apiClient from '@api/client';
import type {
  Activity,
  ActivitiesListResponse,
  CreateActivityRequest,
  UpdateActivityRequest,
  ActivityFilters,
} from '../types';

// ============================================================================
// API Service
// ============================================================================

/**
 * Activities API - All activity-related backend communication
 */
export const activitiesApi = {
  /**
   * Fetch paginated activities list
   */
  async getActivities(
    offset: number = 0,
    limit: number = 20,
    filters?: ActivityFilters
  ): Promise<ActivitiesListResponse> {
    const params: Record<string, any> = { offset, limit };

    // Add filters to query params
    if (filters?.category) params.category = filters.category;
    if (filters?.radius) params.radius = filters.radius;
    if (filters?.location) {
      params.lat = filters.location.lat;
      params.lng = filters.location.lng;
    }
    if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters?.dateTo) params.dateTo = filters.dateTo;
    if (filters?.searchQuery) params.q = filters.searchQuery;

    return apiClient.get<ActivitiesListResponse>('/api/activities', params);
  },

  /**
   * Fetch single activity by ID
   */
  async getActivity(id: string): Promise<Activity> {
    return apiClient.get<Activity>(`/api/activities/${id}`);
  },

  /**
   * Create new activity
   */
  async createActivity(data: CreateActivityRequest): Promise<Activity> {
    return apiClient.post<Activity>('/api/activities', data);
  },

  /**
   * Update existing activity
   */
  async updateActivity(data: UpdateActivityRequest): Promise<Activity> {
    const { id, ...updateData } = data;
    return apiClient.patch<Activity>(`/api/activities/${id}`, updateData);
  },

  /**
   * Delete activity
   */
  async deleteActivity(id: string): Promise<void> {
    return apiClient.delete(`/api/activities/${id}`);
  },

  /**
   * Like activity (toggle)
   */
  async likeActivity(id: string): Promise<{ liked: boolean; likeCount: number }> {
    return apiClient.post(`/api/activities/${id}/like`);
  },

  /**
   * Unlike activity
   */
  async unlikeActivity(id: string): Promise<{ liked: boolean; likeCount: number }> {
    return apiClient.delete(`/api/activities/${id}/like`);
  },

  /**
   * Join activity
   */
  async joinActivity(id: string): Promise<{ participants: number }> {
    return apiClient.post(`/api/activities/${id}/join`);
  },

  /**
   * Leave activity
   */
  async leaveActivity(id: string): Promise<{ participants: number }> {
    return apiClient.delete(`/api/activities/${id}/join`);
  },

  /**
   * Get nearby activities (location-based)
   */
  async getNearbyActivities(
    lat: number,
    lng: number,
    radius: number = 10 // km
  ): Promise<Activity[]> {
    return apiClient.get<Activity[]>('/api/activities/nearby', {
      lat,
      lng,
      radius,
    });
  },

  /**
   * Search activities
   */
  async searchActivities(query: string, limit: number = 20): Promise<Activity[]> {
    return apiClient.get<Activity[]>('/api/activities/search', {
      q: query,
      limit,
    });
  },
};
