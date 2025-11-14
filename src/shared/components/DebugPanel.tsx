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
  const [isExpanded, setIsExpanded] = useState(true);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'unknown'>('unknown');
  const [apiTestStatus, setApiTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [apiTestMessage, setApiTestMessage] = useState('');

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkStatus(state.isConnected ? 'online' : 'offline');
    });

    return () => unsubscribe();
  }, []);

  // Test API connectivity
  const testApiConnection = async () => {
    setApiTestStatus('testing');
    setApiTestMessage('Testing...');

    try {
      const startTime = Date.now();

      // Try to hit the health endpoint
      const response = await fetch(`${API_CONFIG.apiUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const duration = Date.now() - startTime;

      if (response.ok) {
        setApiTestStatus('success');
        setApiTestMessage(`✅ Connected! (${duration}ms)`);
      } else {
        setApiTestStatus('error');
        setApiTestMessage(`❌ HTTP ${response.status}`);
      }
    } catch (error: any) {
      setApiTestStatus('error');
      setApiTestMessage(`❌ ${error.message || 'Connection failed'}`);
    }
  };

  // Don't render in production
  if (!__DEV__) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Pressable
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.headerText}>
          🔧 DEBUG PANEL {isExpanded ? '▼' : '▶'}
        </Text>
        <View style={[
          styles.statusDot,
          networkStatus === 'online' && styles.statusOnline,
          networkStatus === 'offline' && styles.statusOffline,
        ]} />
      </Pressable>

      {/* Expanded Content */}
      {isExpanded && (
        <ScrollView style={styles.content}>
          {/* API Configuration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌐 API Configuration</Text>
            <Text style={styles.infoText}>URL: {API_CONFIG.apiUrl}</Text>
            <Text style={styles.infoText}>Timeout: {API_CONFIG.requestTimeout}ms</Text>
            <Text style={styles.infoText}>Max Retries: {API_CONFIG.maxRetries}</Text>
          </View>

          {/* Network Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📡 Network Status</Text>
            <Text style={[
              styles.infoText,
              networkStatus === 'online' && styles.textSuccess,
              networkStatus === 'offline' && styles.textError,
            ]}>
              Status: {networkStatus.toUpperCase()}
            </Text>
          </View>

          {/* API Connectivity Test */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🧪 API Connectivity</Text>
            <Pressable
              style={[
                styles.testButton,
                apiTestStatus === 'testing' && styles.testButtonDisabled,
              ]}
              onPress={testApiConnection}
              disabled={apiTestStatus === 'testing'}
            >
              <Text style={styles.testButtonText}>
                {apiTestStatus === 'testing' ? 'Testing...' : 'Test Connection'}
              </Text>
            </Pressable>
            {apiTestMessage && (
              <Text style={[
                styles.testResult,
                apiTestStatus === 'success' && styles.textSuccess,
                apiTestStatus === 'error' && styles.textError,
              ]}>
                {apiTestMessage}
              </Text>
            )}
          </View>

          {/* Environment Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ℹ️  Environment</Text>
            <Text style={styles.infoText}>Mode: {__DEV__ ? 'DEVELOPMENT' : 'PRODUCTION'}</Text>
            <Text style={styles.infoText}>Platform: {require('react-native').Platform.OS}</Text>
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <Text style={styles.infoText} style={[styles.infoText, { fontSize: 11, color: '#666', fontStyle: 'italic' }]}>
              💡 All API requests are logged to console with full details
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
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
