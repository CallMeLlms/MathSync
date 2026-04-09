import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';

export default function KeepGrowingCard() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.tertiary, Colors.tertiaryContainer]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.title}>Keep Growing!</Text>
        <Text style={styles.subtitle}>
          Complete 3 more lessons this week to earn the "Weekend Warrior" surprise!
        </Text>
        
        <TouchableOpacity style={styles.button} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Start Next Lesson</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 40, // Padding for bottom nav space
  },
  gradient: {
    borderRadius: 32,
    padding: 28,
  },
  title: {
    fontFamily: 'Lexend-Bold',
    fontSize: 22,
    color: Colors.onTertiary,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: Colors.onTertiary,
    lineHeight: 20,
    opacity: 0.9,
    marginBottom: 24,
  },
  button: {
    backgroundColor: Colors.surfaceContainerLowest,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    color: Colors.tertiary,
  },
});
