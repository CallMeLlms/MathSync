import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Colors from '@/constants/colors';
import BadgeItem from '@/Components/Profile/BadgeItem';

const BADGES = [
  { id: 'first_lesson', title: 'First Lesson', subtitle: 'Completed', assetId: 'icon_runner_1st', earned: true },
  { id: 'streak_three', title: 'Streak Spark', subtitle: 'Completed', assetId: 'icon_star', earned: true },
  { id: 'shape_scout', title: 'Shape Scout', subtitle: 'Completed', assetId: 'icon_diamond', earned: true },
  { id: 'time_keeper', title: 'Time Keeper', subtitle: 'Locked', assetId: 'icon_clock_3', earned: false },
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
            <BadgeItem
              title={badge.title}
              subtitle={badge.subtitle}
              assetId={badge.assetId}
              earned={badge.earned}
            />
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
    gap: 12,
  },
  badgeCard: {
    width: 150,
  },
});
