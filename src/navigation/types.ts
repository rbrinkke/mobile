import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * Root navigation parameter list
 * Define all screens and their required/optional parameters
 */
export type RootStackParamList = {
  // Bottom tabs
  Activity: undefined;
  ForMe: undefined;
  Discover: undefined;
  Chats: undefined;
  Profile: undefined;

  // Modal screens (future)
  ActivityDetail: { activityId: string };
  UserProfile: { userId: string };
  ChatDetail: { chatId: string };
  Notifications: undefined;
  MapView: undefined;
  EditActivity: { activityId?: string }; // Optional for create/edit
  Settings: undefined;
};

/**
 * Global type augmentation for React Navigation
 * This enables type checking for navigation.navigate() throughout the app
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

/**
 * Helper type for screen props
 * Usage: type Props = RootStackScreenProps<'ActivityDetail'>
 */
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
