import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ActivityScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activiteit</Text>
      <Text style={styles.subtitle}>Activiteiten in jouw regio</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
