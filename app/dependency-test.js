import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Constants from 'expo-constants';

// We try to import these to see if they crash or load
const depsToTest = [
  { name: 'Expo Constants', module: () => require('expo-constants') },
  { name: 'Expo AV', module: () => require('expo-av') },
  { name: 'Expo Blur', module: () => require('expo-blur') },
  { name: 'Expo Font', module: () => require('expo-font') },
  { name: 'Expo Haptics', module: () => require('expo-haptics') },
  { name: 'Expo Image', module: () => require('expo-image') },
  { name: 'Expo Linear Gradient', module: () => require('expo-linear-gradient') },
  { name: 'Expo Secure Store', module: () => require('expo-secure-store') },
  { name: 'Expo SQLite', module: () => require('expo-sqlite') },
  { name: 'Lottie', module: () => require('lottie-react-native') },
  { name: 'Reanimated', module: () => require('react-native-reanimated') },
  { name: 'SVG', module: () => require('react-native-svg') },
  { name: 'WebView', module: () => require('react-native-webview') },
  { name: 'AsyncStorage', module: () => require('@react-native-async-storage/async-storage') },
  { name: 'Zustand', module: () => require('zustand') },
  { name: 'React Query', module: () => require('@tanstack/react-query') },
  { name: 'Axios', module: () => require('axios') },
  { name: 'Path Alias (@assets)', module: () => require('@assets/adaptive-icon.png') },
];

export default function DependencyTestScreen() {
  const [results, setResults] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const runTests = () => {
      const testResults = depsToTest.map(dep => {
        try {
          const mod = dep.module();
          return { name: dep.name, status: 'pass', version: mod.version || 'Loaded' };
        } catch (error) {
          console.error(`Failed to load ${dep.name}:`, error);
          return { name: dep.name, status: 'fail', error: error.message };
        }
      });
      setResults(testResults);
    };

    runTests();
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Dependency Check',
          headerStyle: { backgroundColor: '#121212' },
          headerTintColor: '#fff',
          headerShadowVisible: false,
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>MathSync Diagnostic</Text>
          <Text style={styles.subtitle}>Verifying core modules & SDK bindings</Text>
        </View>

        {results.map((item, index) => (
          <View key={index} style={styles.resultItem}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemStatus}>
                {item.status === 'pass' ? '✅ Operational' : '❌ Failed'}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: item.status === 'pass' ? '#1a4d1a' : '#4d1a1a' }]}>
              <Text style={styles.badgeText}>{item.status === 'pass' ? 'PASS' : 'FAIL'}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Return to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 4,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  itemStatus: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
