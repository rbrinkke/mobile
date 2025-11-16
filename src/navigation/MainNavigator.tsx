import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  Search,
  Filter,
  CircleUserRound,
  MoreVertical,
  Activity,
  MessageSquare,
  Calendar,
  Bell,
  Users,
} from 'lucide-react-native';

// === BRAND COLORS ===
const PRIMARY_COLOR = '#E6001A';
const LIGHT_ACCENT = '#FFF3F4';
const GRAY_TEXT = '#6b7280';
const INACTIVE_GRAY = '#9CA3AF';

// === CUSTOM HEADER COMPONENT ===
const CustomHeader = () => {
  return (
    <View style={styles.headerContainer}>
      {/* App Title */}
      <Pressable accessible accessibilityRole="button" accessibilityLabel="Home">
        <Text style={styles.headerTitle}>Activity</Text>
      </Pressable>

      {/* Header Icons */}
      <View style={styles.headerIconsContainer}>
        <Pressable
          style={styles.headerIcon}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Zoeken"
        >
          <Search color={GRAY_TEXT} size={24} />
        </Pressable>

        <Pressable
          style={styles.headerIcon}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Filter"
        >
          <Filter color={GRAY_TEXT} size={24} />
        </Pressable>

        {/* Profile Icon */}
        <Pressable
          style={styles.profileIconContainer}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Profiel"
        >
          <View style={styles.profileIconCircle}>
            <CircleUserRound color={PRIMARY_COLOR} size={20} />
          </View>
        </Pressable>

        <Pressable
          style={styles.headerIcon}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Meer opties"
        >
          <MoreVertical color={GRAY_TEXT} size={24} />
        </Pressable>
      </View>
    </View>
  );
};

// === PLACEHOLDER SCREENS ===
interface PlaceholderScreenProps {
  route: { name: string };
}

const PlaceholderScreen = ({ route }: PlaceholderScreenProps) => (
  <View style={styles.mainContent}>
    <Text style={styles.mainContentTitle}>{route.name}</Text>
    <Text style={styles.mainContentSubtitle}>
      Dit scherm wordt later uitgewerkt met de echte functionaliteit.
    </Text>
  </View>
);

// === TAB NAVIGATOR ===
const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Custom header for all screens
        header: () => <CustomHeader />,

        // Tab bar styling
        tabBarActiveTintColor: PRIMARY_COLOR,
        tabBarInactiveTintColor: INACTIVE_GRAY,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,

        // Tab bar icons
        tabBarIcon: ({ color }) => {
          const iconSize = 24;

          switch (route.name) {
            case 'Activiteiten':
              return <Activity color={color} size={iconSize} />;
            case 'Chats':
              return <MessageSquare color={color} size={iconSize} />;
            case 'Agenda':
              return <Calendar color={color} size={iconSize} />;
            case 'Meldingen':
              return <Bell color={color} size={iconSize} />;
            case 'Moatjes':
              return <Users color={color} size={iconSize} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen name="Activiteiten" component={PlaceholderScreen} />
      <Tab.Screen name="Chats" component={PlaceholderScreen} />
      <Tab.Screen name="Agenda" component={PlaceholderScreen} />
      <Tab.Screen name="Meldingen" component={PlaceholderScreen} />
      <Tab.Screen name="Moatjes" component={PlaceholderScreen} />
    </Tab.Navigator>
  );
}

// === STYLES ===
const styles = StyleSheet.create({
  // Header Styles
  headerContainer: {
    height: 64,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
  },
  headerIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    padding: 8,
  },
  profileIconContainer: {
    width: 36,
    height: 36,
    marginHorizontal: 4,
  },
  profileIconCircle: {
    width: '100%',
    height: '100%',
    backgroundColor: LIGHT_ACCENT,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
  },

  // Tab Bar Styles
  tabBar: {
    height: 64,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 4,
    paddingBottom: 4,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },

  // Main Content Styles
  mainContent: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContentTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 8,
  },
  mainContentSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
