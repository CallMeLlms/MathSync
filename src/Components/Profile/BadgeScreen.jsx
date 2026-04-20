import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';
import BadgeItem from '@/Components/Profile/BadgeItem';

const BADGES = [
  {
    id: 'first_lesson',
    title: 'First Lesson',
    subtitle: 'Complete your first game',
    assetId: 'icon_runner_1st',
    earned: true,
  },
  {
    id: 'streak_three',
    title: 'Streak Spark',
    subtitle: '3 lessons in a row',
    assetId: 'icon_star',
    earned: true,
  },
  {
    id: 'shape_scout',
    title: 'Shape Scout',
    subtitle: 'Master shape hunt',
    assetId: 'icon_diamond',
    earned: true,
  },
  {
    id: 'time_keeper',
    title: 'Time Keeper',
    subtitle: 'Finish under 2 minutes',
    assetId: 'icon_clock_3',
    earned: false,
  },
  {
    id: 'calendar_champ',
    title: 'Calendar Champ',
    subtitle: 'Perfect weekly attendance',
    assetId: 'icon_calendar',
    earned: false,
  },
  {
    id: 'number_navigator',
    title: 'Number Navigator',
    subtitle: 'Reach 100 solved problems',
    assetId: 'icon_number_line',
    earned: false,
  },
];

export default function BadgeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Badges</Text>
          <Text style={styles.subtitle}>Track your progress and unlock learning milestones.</Text>
        </View>

        <View style={styles.grid}>
          {BADGES.map((badge) => (
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
    borderRadius: 24,
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
