import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Colors from '@/constants/colors';
import BadgeItem from '@/Components/Profile/BadgeItem';
import { useUserStore } from '@/stores/user-stores/useUserStore';
import badgeBank from '@content/badges/badgeBank.json';

export default function BadgeSection() {
  const earnedBadges = useUserStore((s) => s.earnedBadges);

  // Show earned badges first, then locked — cap at 4 for the carousel
  const badges = badgeBank
    .map((b) => ({ ...b, earned: earnedBadges.includes(b.id) }))
    .sort((a, b) => (b.earned ? 1 : 0) - (a.earned ? 1 : 0))
    .slice(0, 4);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recent Badges</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {badges.map((badge) => (
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
    paddingHorizontal: 0,
  },
  sectionTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 20,
    color: Colors.onSurface,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  badgeCard: {
    width: 150,
  },
});
