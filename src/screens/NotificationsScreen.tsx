/**
 * NotificationsScreen - Notifications placeholder
 *
 * Professional placeholder screen for notifications with mock data.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function NotificationsScreen() {
  // Mock notifications data
  const notifications = [
    {
      id: '1',
      icon: 'users',
      title: 'Nieuwe deelnemer',
      message: 'Jan heeft zich aangemeld voor "Voetbal in het Park"',
      time: '5 min geleden',
      unread: true,
    },
    {
      id: '2',
      icon: 'message-circle',
      title: 'Nieuw bericht',
      message: 'Lisa: "Kunnen we een half uur eerder beginnen?"',
      time: '1 uur geleden',
      unread: true,
    },
    {
      id: '3',
      icon: 'calendar',
      title: 'Activiteit update',
      message: 'De locatie van "Hardlopen Langs het IJ" is gewijzigd',
      time: '2 uur geleden',
      unread: false,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notificaties</Text>
        <TouchableOpacity>
          <Text style={styles.markAllRead}>Alles markeren als gelezen</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <ScrollView style={styles.scrollView}>
        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationItem,
              notification.unread && styles.notificationUnread,
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                notification.unread && styles.iconContainerUnread,
              ]}
            >
              <Feather
                name={notification.icon as any}
                size={20}
                color={notification.unread ? '#FF6B6B' : '#666'}
              />
            </View>

            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationMessage}>{notification.message}</Text>
              <Text style={styles.notificationTime}>{notification.time}</Text>
            </View>

            {notification.unread && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        ))}

        {/* Placeholder state info */}
        <View style={styles.placeholderInfo}>
          <Feather name="info" size={20} color="#999" />
          <Text style={styles.placeholderText}>
            Dit is een placeholder scherm met mock data.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  markAllRead: {
    fontSize: 14,
    color: '#FF6B6B',
  },
  scrollView: {
    flex: 1,
  },
  notificationItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationUnread: {
    backgroundColor: '#FFF9F9',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerUnread: {
    backgroundColor: '#FFEBEE',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
    marginLeft: 8,
    marginTop: 6,
  },
  placeholderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF3E0',
    margin: 16,
    borderRadius: 8,
    gap: 12,
  },
  placeholderText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
});
