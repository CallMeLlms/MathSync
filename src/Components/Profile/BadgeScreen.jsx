import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';
import BadgeItem from '@/Components/Profile/BadgeItem';
import { useUserStore } from '@/stores/user-stores/useUserStore';
import badgeBank from '@content/badges/badgeBank.json';

export default function BadgeScreen() {
  const earnedBadges = useUserStore((s) => s.earnedBadges);

  const badges = badgeBank.map((b) => ({ ...b, earned: earnedBadges.includes(b.id) }));
  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Badges</Text>
          <Text style={styles.subtitle}>
            {earnedCount} of {badges.length} earned — keep learning to unlock more!
          </Text>
        </View>

        <View style={styles.grid}>
          {badges.map((badge) => (
            <View key={badge.id} style={styles.gridItem}>
              <BadgeItem
                title={badge.title}
                subtitle={badge.subtitle}
                assetId={badge.assetId}
                earned={badge.earned}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  header: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: Colors.outlineVariant,
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Lexend-Bold',
    fontSize: 28,
    color: Colors.onSurface,
  },
  subtitle: {
    marginTop: 4,
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: 12,
  },
});
