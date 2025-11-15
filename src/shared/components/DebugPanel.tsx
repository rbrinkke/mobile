import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { API_CONFIG } from '@/config/api.config';
import { apiClient } from '@/api/client';

/**
 * DebugPanel - Development-only debugging interface
 *
 * Shows:
 * - API configuration (URL, timeout)
 * - Network status (online/offline)
 * - API connectivity test
 * - Environment info
 *
 * Only renders in __DEV__ mode
 */
export function DebugPanel() {
  // TEMPORARY: Disabled to debug tab bar visibility
  // TODO: Re-enable after fixing tab bar overlap issue
  return null;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 64, // Account for bottom tab navigation height
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 2,
    borderTopColor: '#FF6B35',
    zIndex: 9999,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#2a2a2a',
  },
  headerText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#666',
  },
  statusOnline: {
    backgroundColor: '#00E676',
  },
  statusOffline: {
    backgroundColor: '#FF1744',
  },
  content: {
    maxHeight: 300,
    padding: 12,
  },
  section: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  infoText: {
    color: '#CCC',
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  textSuccess: {
    color: '#00E676',
  },
  textError: {
    color: '#FF1744',
  },
  testButton: {
    backgroundColor: '#FF6B35',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  testButtonDisabled: {
    backgroundColor: '#666',
  },
  testButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  testResult: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
