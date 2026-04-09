import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Colors from '@/constants/colors';
import { Feather } from '@expo/vector-icons';

// Placeholder mock data
const BADGES = [
  { id: '1', name: 'First Win', icon: 'award', color: Colors.primary },
  { id: '2', name: '10 Streak', icon: 'zap', color: Colors.tertiary },
  { id: '3', name: 'Master Add', icon: 'plus-circle', color: Colors.secondary },
  { id: '4', name: 'Fast Solver', icon: 'clock', color: Colors.primary },
];

export default function BadgeSection() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recent Badges</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {BADGES.map((badge) => (
          <View key={badge.id} style={styles.badgeCard}>
            <View style={[styles.iconWrapper, { backgroundColor: badge.color + '15' }]}>
              <Feather name={badge.icon} size={32} color={badge.color} />
            </View>
            <Text style={styles.badgeName}>{badge.name}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 0, // ScrollView will handle horizontal padding
  },
  sectionTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 20,
    color: Colors.onSurface,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 24, // Padding at edges
    gap: 16,
  },
  badgeCard: {
    alignItems: 'center',
    width: 80,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerHigh,
    marginBottom: 8,
  },
  badgeName: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
