import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { API_CONFIG } from '@/config/api.config';
import { apiClient } from '@/api/client';
import { devTools } from '@utils/devTools';
import { useAuthStore } from '@stores/authStore';

/**
 * DebugPanel - Development-only debugging interface
 *
 * Shows:
 * - API configuration (URL, timeout)
 * - Network status (online/offline)
 * - API connectivity test
 * - Storage management (clear MMKV)
 * - Auth state
 * - Environment info
 *
 * Only renders in __DEV__ mode
 */
export function DebugPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [apiStatus, setApiStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const authState = useAuthStore();

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const handleClearStorage = () => {
    Alert.alert(
      '🧹 Clear Storage',
      'This will:\n• Clear all MMKV storage\n• Clear query cache\n• Reset auth state\n\nYou\'ll need to restart the app.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear & Restart',
          style: 'destructive',
          onPress: () => {
            devTools.clearAll();
            Alert.alert(
              '✅ Storage Cleared',
              'Press "r" in the terminal to restart the app',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  const testApiConnection = async () => {
    setApiStatus('testing');
    try {
      const response = await apiClient.get('/health');
      setApiStatus('success');
      console.log('✅ API connection successful:', response.data);
    } catch (error) {
      setApiStatus('error');
      console.error('❌ API connection failed:', error);
    }
  };

  if (!isExpanded) {
    return (
      <Pressable
        style={styles.collapsedContainer}
        onPress={() => setIsExpanded(true)}
      >
        <Text style={styles.collapsedText}>🛠️ DEV</Text>
        <View style={[styles.statusDot, isOnline ? styles.statusOnline : styles.statusOffline]} />
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.header} onPress={() => setIsExpanded(false)}>
        <Text style={styles.headerText}>🛠️ DEBUG PANEL (tap to minimize)</Text>
        <View style={[styles.statusDot, isOnline ? styles.statusOnline : styles.statusOffline]} />
      </Pressable>

      <ScrollView style={styles.content}>
        {/* Auth State */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 Auth State</Text>
          <Text style={styles.infoText}>
            Initialized: {authState.isInitialized ? '✅' : '❌'}
          </Text>
          <Text style={styles.infoText}>
            Authenticated: {authState.isAuthenticated ? '✅' : '❌'}
          </Text>
          <Text style={styles.infoText}>
            User: {authState.user?.email || 'None'}
          </Text>
        </View>

        {/* Storage Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💾 Storage</Text>
          <Pressable
            style={styles.testButton}
            onPress={handleClearStorage}
          >
            <Text style={styles.testButtonText}>🧹 CLEAR ALL STORAGE</Text>
          </Pressable>
          <Text style={[styles.infoText, { marginTop: 8, fontSize: 10, color: '#999' }]}>
            ⚠️ This will log you out and reset the app
          </Text>
        </View>

        {/* Network Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌐 Network</Text>
          <Text style={[styles.infoText, isOnline ? styles.textSuccess : styles.textError]}>
            Status: {isOnline === null ? 'Checking...' : isOnline ? 'Online ✅' : 'Offline ❌'}
          </Text>
        </View>

        {/* API Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ API Configuration</Text>
          <Text style={styles.infoText}>URL: {API_CONFIG.BASE_URL}</Text>
          <Text style={styles.infoText}>Timeout: {API_CONFIG.TIMEOUT}ms</Text>

          <Pressable
            style={[styles.testButton, apiStatus === 'testing' && styles.testButtonDisabled]}
            onPress={testApiConnection}
            disabled={apiStatus === 'testing'}
          >
            <Text style={styles.testButtonText}>
              {apiStatus === 'testing' ? '⏳ Testing...' : '🔍 Test Connection'}
            </Text>
          </Pressable>

          {apiStatus === 'success' && (
            <Text style={[styles.testResult, styles.textSuccess]}>✅ API is reachable</Text>
          )}
          {apiStatus === 'error' && (
            <Text style={[styles.testResult, styles.textError]}>❌ API connection failed</Text>
          )}
        </View>

        {/* Console Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Console Commands</Text>
          <Text style={[styles.infoText, { fontSize: 10 }]}>
            devTools.clearStorage(){'\n'}
            devTools.clearQueryCache(){'\n'}
            devTools.inspectStorage()
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  collapsedContainer: {
    position: 'absolute',
    bottom: 80, // Above bottom tab navigation
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FF6B35',
    zIndex: 9999,
  },
  collapsedText: {
    color: '#FF6B35',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  container: {
    position: 'absolute',
    bottom: 64, // Account for bottom tab navigation height
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 2,
    borderTopColor: '#FF6B35',
    zIndex: 9999,
    maxHeight: 400,
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
