import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * ActivityCard Building Block
 *
 * A card displaying activity information with image, title, description, and metadata.
 *
 * Expected props from backend:
 * - title: string
 * - description: string
 * - imageUrl: string
 * - location?: string
 * - distance?: number (in km)
 * - participants?: number
 * - date?: string (ISO 8601)
 * - onPress?: () => void
 */

export interface ActivityCardProps {
  title: string;
  description: string;
  imageUrl: string;
  location?: string;
  distance?: number;
  participants?: number;
  date?: string;
  onPress?: () => void;
}

export default function ActivityCard({
  title,
  description,
  imageUrl,
  location,
  distance,
  participants,
  date,
  onPress,
}: ActivityCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {/* Image */}
      <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>

        {/* Metadata Row */}
        <View style={styles.metadata}>
          {location && (
            <View style={styles.metadataItem}>
              <Text style={styles.metadataIcon}>📍</Text>
              <Text style={styles.metadataText}>{location}</Text>
            </View>
          )}

          {distance !== undefined && (
            <View style={styles.metadataItem}>
              <Text style={styles.metadataIcon}>🚶</Text>
              <Text style={styles.metadataText}>{distance.toFixed(1)} km</Text>
            </View>
          )}

          {participants !== undefined && (
            <View style={styles.metadataItem}>
              <Text style={styles.metadataIcon}>👥</Text>
              <Text style={styles.metadataText}>{participants}</Text>
            </View>
          )}
        </View>

        {/* Date (if provided) */}
        {date && (
          <Text style={styles.date}>{new Date(date).toLocaleDateString('nl-NL')}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android shadow
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#E0E0E0',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
    lineHeight: 20,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  metadataText: {
    fontSize: 13,
    color: '#999999',
  },
  date: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '500',
  },
});
