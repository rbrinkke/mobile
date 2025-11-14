/**
 * MSW Server - React Native Testing Setup
 *
 * Best practices:
 * - Use setupServer from msw/native (not msw/node!)
 * - Import handlers from centralized location
 * - Lifecycle managed in jest.setup.js
 */

import { setupServer } from 'msw/native';
import { handlers } from './handlers';

/**
 * MSW Server instance
 *
 * Lifecycle:
 * - beforeAll: server.listen()
 * - afterEach: server.resetHandlers()
 * - afterAll: server.close()
 */
export const server = setupServer(...handlers);
