/**
 * MSW v2 API Handlers - Mock API Responses
 *
 * Best practices:
 * - Test behavior, not implementation
 * - Realistic API responses
 * - Reusable across tests
 */

import { http, HttpResponse } from 'msw';
import type { Activity, ActivitiesListResponse } from '@features/activities/types';

// Mock data
export const mockActivities: Activity[] = [
  {
    id: '1',
    title: 'Morning Yoga Session',
    description: 'Join us for a relaxing yoga session',
    location: 'Central Park',
    category: 'sports',
    date: '2024-12-01T10:00:00Z',
    participants: 5,
    maxParticipants: 10,
    imageUrl: 'https://example.com/yoga.jpg',
    creatorId: 'user-1',
    creatorName: 'Jane Doe',
    liked: false,
    likeCount: 12,
    distance: 2.5,
  },
  {
    id: '2',
    title: 'Coffee Meetup',
    description: 'Casual coffee and conversation',
    location: 'Downtown Cafe',
    category: 'social',
    date: '2024-12-02T14:00:00Z',
    participants: 3,
    maxParticipants: 6,
    imageUrl: 'https://example.com/coffee.jpg',
    creatorId: 'user-2',
    creatorName: 'John Smith',
    liked: true,
    likeCount: 8,
    distance: 1.2,
  },
];

// API Base URL
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * MSW Handlers - Match your actual API endpoints
 */
export const handlers = [
  // ============================================================================
  // Activities Endpoints
  // ============================================================================

  /**
   * GET /api/activities - Infinite query endpoint
   */
  http.get(`${API_BASE}/api/activities`, ({ request }) => {
    const url = new URL(request.url);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);

    // Simulate pagination
    const start = offset;
    const end = offset + limit;
    const items = mockActivities.slice(start, end);
    const hasMore = end < mockActivities.length;

    const response: ActivitiesListResponse = {
      items,
      hasMore,
      nextOffset: hasMore ? end : undefined,
      total: mockActivities.length,
    };

    return HttpResponse.json(response, { status: 200 });
  }),

  /**
   * GET /api/activities/:id - Single activity
   */
  http.get(`${API_BASE}/api/activities/:id`, ({ params }) => {
    const { id } = params;
    const activity = mockActivities.find((a) => a.id === id);

    if (!activity) {
      return HttpResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(activity, { status: 200 });
  }),

  /**
   * POST /api/activities/:id/like - Like activity
   */
  http.post(`${API_BASE}/api/activities/:id/like`, ({ params }) => {
    const { id } = params;
    const activity = mockActivities.find((a) => a.id === id);

    if (!activity) {
      return HttpResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Simulate successful like
    return HttpResponse.json(
      {
        success: true,
        activity: {
          ...activity,
          liked: true,
          likeCount: activity.likeCount + 1,
        },
      },
      { status: 200 }
    );
  }),

  /**
   * DELETE /api/activities/:id/like - Unlike activity
   */
  http.delete(`${API_BASE}/api/activities/:id/like`, ({ params }) => {
    const { id } = params;
    const activity = mockActivities.find((a) => a.id === id);

    if (!activity) {
      return HttpResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(
      {
        success: true,
        activity: {
          ...activity,
          liked: false,
          likeCount: Math.max(0, activity.likeCount - 1),
        },
      },
      { status: 200 }
    );
  }),

  /**
   * POST /api/activities/:id/join - Join activity
   */
  http.post(`${API_BASE}/api/activities/:id/join`, ({ params }) => {
    const { id } = params;
    const activity = mockActivities.find((a) => a.id === id);

    if (!activity) {
      return HttpResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    if (activity.participants >= activity.maxParticipants) {
      return HttpResponse.json(
        { error: 'Activity is full' },
        { status: 400 }
      );
    }

    return HttpResponse.json(
      {
        success: true,
        activity: {
          ...activity,
          participants: activity.participants + 1,
        },
      },
      { status: 200 }
    );
  }),

  /**
   * POST /api/activities/:id/leave - Leave activity
   */
  http.post(`${API_BASE}/api/activities/:id/leave`, ({ params }) => {
    const { id } = params;
    const activity = mockActivities.find((a) => a.id === id);

    if (!activity) {
      return HttpResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(
      {
        success: true,
        activity: {
          ...activity,
          participants: Math.max(0, activity.participants - 1),
        },
      },
      { status: 200 }
    );
  }),

  /**
   * POST /api/activities - Create activity
   */
  http.post(`${API_BASE}/api/activities`, async ({ request }) => {
    const body = (await request.json()) as Partial<Activity>;

    const newActivity: Activity = {
      id: `activity-${Date.now()}`,
      title: body.title || 'New Activity',
      description: body.description || '',
      location: body.location || 'Location TBD',
      category: body.category || 'other',
      date: body.date || new Date().toISOString(),
      participants: 1,
      maxParticipants: body.maxParticipants || 10,
      imageUrl: body.imageUrl || '',
      creatorId: 'current-user',
      creatorName: 'Current User',
      liked: false,
      likeCount: 0,
      distance: 0,
    };

    return HttpResponse.json(newActivity, { status: 201 });
  }),

  /**
   * PATCH /api/activities/:id - Update activity
   */
  http.patch(`${API_BASE}/api/activities/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as Partial<Activity>;
    const activity = mockActivities.find((a) => a.id === id);

    if (!activity) {
      return HttpResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    const updatedActivity = {
      ...activity,
      ...body,
    };

    return HttpResponse.json(updatedActivity, { status: 200 });
  }),

  /**
   * DELETE /api/activities/:id - Delete activity
   */
  http.delete(`${API_BASE}/api/activities/:id`, ({ params }) => {
    const { id } = params;
    const activityIndex = mockActivities.findIndex((a) => a.id === id);

    if (activityIndex === -1) {
      return HttpResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(
      { success: true, message: 'Activity deleted' },
      { status: 200 }
    );
  }),

  // ============================================================================
  // Search & Filters
  // ============================================================================

  /**
   * GET /api/activities/search - Search activities
   */
  http.get(`${API_BASE}/api/activities/search`, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q')?.toLowerCase() || '';

    const filtered = mockActivities.filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query)
    );

    return HttpResponse.json(filtered, { status: 200 });
  }),

  /**
   * GET /api/activities/nearby - Nearby activities
   */
  http.get(`${API_BASE}/api/activities/nearby`, ({ request }) => {
    const url = new URL(request.url);
    const radius = parseFloat(url.searchParams.get('radius') || '10');

    // Filter by distance (mock implementation)
    const nearby = mockActivities.filter((a) => a.distance <= radius);

    return HttpResponse.json(nearby, { status: 200 });
  }),
];
