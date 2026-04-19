import React from 'react';
import { StyleSheet, View, SafeAreaView, ScrollView, Pressable, Text } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import useUserStore from '@/stores/user-stores/useUserStore';

import ProfileBarGraph from '@/Components/Profile/ProfileBarGraph';
import ActivityFeed from '@/Components/Profile/ActivityFeed';

export default function Profile() {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const stats = useUserStore((state) => state.stats);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>

          <Pressable
            style={({ pressed }) => [styles.badgesCta, pressed && styles.badgesCtaPressed]}
            onPress={() => router.push('/(drawer)/Badges')}
          >
            <View style={styles.badgesIconWrap}>
              <MaterialIcons name="military-tech" size={24} color={Colors.onPrimaryContainer} />
            </View>

            <View style={styles.badgesCtaCopy}>
              <Text style={styles.badgesEyebrow}>Achievement shelf</Text>
              <Text style={styles.badgesTitle}>View all badges</Text>
              <Text style={styles.badgesSubtitle}>See unlocked rewards and what to earn next.</Text>
            </View>
            <View style={styles.badgesArrowWrap}>
              <Feather name="arrow-right" size={20} color={Colors.onSurface} />
            </View>
          </Pressable>

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  badgesCta: {
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: Colors.outlineVariant,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgesCtaPressed: {
    transform: [{ translateY: 2 }],
    borderBottomWidth: 4,
  },
  badgesIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgesCtaCopy: {
    flex: 1,
    paddingHorizontal: 12,
  },
  badgesEyebrow: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: Colors.onSurfaceVariant,
  },
  badgesTitle: {
    marginTop: 2,
    fontFamily: 'Lexend-Bold',
    fontSize: 20,
    color: Colors.onSurface,
  },
  badgesSubtitle: {
    marginTop: 3,
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  badgesArrowWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
  },
});
