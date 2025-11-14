/**
 * Jest Setup File - Test Environment Configuration
 *
 * Runs before each test suite to configure the testing environment
 */

// Polyfills for MSW v2 (React Native compatibility)
import 'react-native-url-polyfill/auto';
import 'fast-text-encoding';

// Import MSW server
import { server } from './src/__tests__/mocks/server';

// Mock MMKV storage for testing
jest.mock('react-native-mmkv', () => {
  const storage = new Map();

  return {
    MMKV: jest.fn().mockImplementation(() => ({
      set: jest.fn((key, value) => storage.set(key, value)),
      getString: jest.fn((key) => storage.get(key)),
      getNumber: jest.fn((key) => storage.get(key)),
      getBoolean: jest.fn((key) => storage.get(key)),
      delete: jest.fn((key) => storage.delete(key)),
      clearAll: jest.fn(() => storage.clear()),
      getAllKeys: jest.fn(() => Array.from(storage.keys())),
    })),
  };
});

// Mock expo-image
jest.mock('expo-image', () => {
  const React = require('react');
  return {
    Image: (props) => React.createElement('Image', props),
  };
});

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() =>
    Promise.resolve({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    })
  ),
  addEventListener: jest.fn(() => jest.fn()),
}));

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    connected: true,
  })),
}));

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock gesture handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: jest.fn(),
    Directions: {},
  };
});

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// MSW Server Lifecycle
beforeAll(() => {
  // Enable API mocking
  server.listen({
    onUnhandledRequest: 'warn',
  });
});

afterEach(() => {
  // Reset handlers after each test
  server.resetHandlers();
});

afterAll(() => {
  // Clean up after all tests
  server.close();
});
