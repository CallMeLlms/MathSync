import React from 'react';
import { StyleSheet, View, SafeAreaView, ScrollView, Pressable, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';

import AchievementSection from '@/Components/Profile/AchievementSection';
import ProfileBarGraph from '@/Components/Profile/ProfileBarGraph';
import ActivityFeed from '@/Components/Profile/ActivityFeed';

export default function Profile() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Pressable style={styles.badgesCta} onPress={() => router.push('/(drawer)/Badges')}>
            <View style={styles.badgesCtaCopy}>
              <Text style={styles.badgesTitle}>View All Badges</Text>
              <Text style={styles.badgesSubtitle}>See unlocked and upcoming achievements</Text>
            </View>
            <Feather name="arrow-right-circle" size={22} color={Colors.primary} />
          </Pressable>
          <AchievementSection />
          <ProfileBarGraph />
          <ActivityFeed />
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
  content: {
    paddingBottom: 20,
  },
  badgesCta: {
    marginTop: 12,
    marginHorizontal: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgesCtaCopy: {
    flex: 1,
    paddingRight: 12,
  },
  badgesTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 18,
    color: Colors.onSurface,
  },
  badgesSubtitle: {
    marginTop: 2,
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
});
