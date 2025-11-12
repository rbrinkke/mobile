import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ChatsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chats</Text>
      <Text style={styles.subtitle}>Jouw berichten</Text>
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
