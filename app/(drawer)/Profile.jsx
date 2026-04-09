import React from 'react';
import { StyleSheet, View, SafeAreaView, ScrollView } from 'react-native';
import Colors from '@/constants/colors';

import AchievementSection from '@/Components/Profile/AchievementSection';
import ProfileBarGraph from '@/Components/Profile/ProfileBarGraph';
import ActivityFeed from '@/Components/Profile/ActivityFeed';

export default function Profile() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
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
});
