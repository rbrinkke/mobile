/**
 * MapViewScreen - Map view placeholder
 *
 * Professional placeholder screen for map view of activities.
 * In production, this would use react-native-maps or similar.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function MapViewScreen() {
  return (
    <View style={styles.container}>
      {/* Mock Map Background */}
      <View style={styles.mapPlaceholder}>
        <Feather name="map" size={64} color="#CCC" />
        <Text style={styles.mapText}>Kaart Weergave</Text>
        <Text style={styles.mapSubtext}>
          In productie: react-native-maps met activity markers
        </Text>
      </View>

      {/* Floating Controls */}
      <View style={styles.controls}>
        {/* Map Type Toggle */}
        <TouchableOpacity style={styles.controlButton}>
          <Feather name="layers" size={20} color="#333" />
        </TouchableOpacity>

        {/* Center on Location */}
        <TouchableOpacity style={styles.controlButton}>
          <Feather name="navigation" size={20} color="#333" />
        </TouchableOpacity>

        {/* Zoom In */}
        <TouchableOpacity style={styles.controlButton}>
          <Feather name="plus" size={20} color="#333" />
        </TouchableOpacity>

        {/* Zoom Out */}
        <TouchableOpacity style={styles.controlButton}>
          <Feather name="minus" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Activity Cards (Bottom Sheet Preview) */}
      <View style={styles.activityPreview}>
        <View style={styles.activityCard}>
          <View style={styles.activityIcon}>
            <Feather name="activity" size={24} color="#FF6B6B" />
          </View>
          <View style={styles.activityInfo}>
            <Text style={styles.activityTitle}>Voetbal in het Park</Text>
            <Text style={styles.activityDistance}>2.3 km - 8 deelnemers</Text>
          </View>
          <TouchableOpacity>
            <Feather name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.viewListButton}>
          <Feather name="list" size={18} color="#FFFFFF" />
          <Text style={styles.viewListText}>Toon als lijst</Text>
        </TouchableOpacity>
      </View>

      {/* Placeholder Info Banner */}
      <View style={styles.placeholderBanner}>
        <Feather name="info" size={16} color="#666" />
        <Text style={styles.placeholderText}>
          Placeholder scherm - Kaartweergave komt in productie
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E5E5',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  mapText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
  },
  mapSubtext: {
    fontSize: 14,
    color: '#BBB',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  controls: {
    position: 'absolute',
    right: 16,
    top: 80,
    gap: 12,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityPreview: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    marginBottom: 12,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  activityDistance: {
    fontSize: 14,
    color: '#666',
  },
  viewListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  viewListText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderBanner: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeholderText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
  },
});
