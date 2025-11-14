import React, { createContext, useContext, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

interface TabsProps {
  children: React.ReactNode;
  defaultTab: string;
  style?: ViewStyle;
}

function Tabs({ children, defaultTab, style }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <View style={style}>{children}</View>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

function TabsList({ children, style }: TabsListProps) {
  return (
    <View style={[styles.tabsList, style]}>
      {children}
    </View>
  );
}

interface TabProps {
  value: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

function Tab({ value, children, style }: TabProps) {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error('Tab must be used within a Tabs component');
  }

  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === value;

  return (
    <TouchableOpacity
      onPress={() => setActiveTab(value)}
      style={[styles.tab, isActive && styles.tabActive, style]}
      activeOpacity={0.7}
    >
      <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

interface TabPanelProps {
  value: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

function TabPanel({ value, children, style }: TabPanelProps) {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error('TabPanel must be used within a Tabs component');
  }

  const { activeTab } = context;

  if (activeTab !== value) {
    return null;
  }

  return <View style={[styles.tabPanel, style]}>{children}</View>;
}

// Export as compound component
Tabs.List = TabsList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;

export default Tabs;

const styles = StyleSheet.create({
  tabsList: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  tabPanel: {
    padding: 16,
  },
});
