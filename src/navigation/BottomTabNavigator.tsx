import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';

// Screens
import DemoScreen from '../screens/DemoScreen';
import ActivityScreen from '../screens/ActivityScreen';
import ForMeScreen from '../screens/ForMeScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import ChatsScreen from '../screens/ChatsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// Custom Tab Bar Icon with Badge
interface TabIconProps {
  emoji: string;
  focused: boolean;
  badge?: number;
}

function TabIcon({ emoji, focused, badge }: TabIconProps) {
  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>
        {emoji}
      </Text>
      {badge && badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      )}
    </View>
  );
}

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF6B6B', // Coral color like Meet5
        tabBarInactiveTintColor: '#999',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Demo"
        component={DemoScreen}
        options={{
          tabBarLabel: 'SDUI Demo',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🎨" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Activity"
        component={ActivityScreen}
        options={{
          tabBarLabel: 'Activiteit',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📍" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ForMe"
        component={ForMeScreen}
        options={{
          tabBarLabel: 'Voor mij',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📋" focused={focused} badge={25} />
          ),
        }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          tabBarLabel: 'Ontdekken',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🔍" focused={focused} badge={51} />
          ),
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatsScreen}
        options={{
          tabBarLabel: 'Chats',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="💬" focused={focused} badge={31} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profiel',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  iconContainer: {
    position: 'relative',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    opacity: 0.6,
  },
  iconFocused: {
    opacity: 1,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
