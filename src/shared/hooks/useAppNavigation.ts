import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/types';

/**
 * Typed navigation hook with full autocomplete
 *
 * Usage:
 * const navigation = useAppNavigation();
 * navigation.navigate('ActivityDetail', { activityId: '123' }); // ✅ Fully typed!
 */
export function useAppNavigation() {
  return useNavigation<NativeStackNavigationProp<RootStackParamList>>();
}
