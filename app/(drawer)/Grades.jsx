import React from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient'; // Only for cards, not for background
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

import Colors from '@/constants/colors';
import useUserStore from '@/stores/user-stores/useUserStore';
import { isGradeAuthorized } from '@/utils/gradeMapping';

const gradeData = [
  {
    id: 'G1',
    title: 'Grade 1',
    label: 'Warm-up World',
    desc: 'Count, match, and build confidence with playful first missions.',
    icon: 'sprout',
    progressLabel: 'Start here',
  },
  {
    id: 'G2',
    title: 'Grade 2',
    label: 'Skill Climb',
    desc: 'Train your speed with patterns, place value, and sharper number sense.',
    icon: 'rocket-launch',
    progressLabel: 'Ready',
  },
  {
    id: 'G3',
    title: 'Grade 3',
    label: 'Strategy Zone',
    desc: 'Mix logic and rhythm as multiplication and problem solving level up.',
    icon: 'sword-cross',
    progressLabel: 'Challenge',
  },
  {
    id: 'G4',
    title: 'Grade 4',
    label: 'Master Track',
    desc: 'Tackle bigger numbers, deeper thinking, and more confident decision making.',
    icon: 'castle',
    progressLabel: 'Advance',
  },
  {
    id: 'G5',
    title: 'Grade 5',
    label: 'Elite Arena',
    desc: 'Push into precision, planning, and stronger multi-step reasoning.',
    icon: 'lightning-bolt',
    progressLabel: 'Elite',
  },
  {
    id: 'G6',
    title: 'Grade 6',
    label: 'Champion Path',
    desc: 'Finish strong with advanced missions built for confident math explorers.',
    icon: 'crown',
    progressLabel: 'Boss level',
  },
];

function hapticLight() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

function GradeCard({ grade, isActive, isLocked, onPress }) {
  const pressOffset = useSharedValue(0);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pressOffset.value }],
    borderBottomWidth: isLocked ? 4 : 8 - pressOffset.value,
  }));

  const handlePressIn = () => {
    if (isLocked) return;
    pressOffset.value = withTiming(4, { duration: 100 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    if (isLocked) return;
    pressOffset.value = withTiming(0, { duration: 140 });
  };

  return (
    <Pressable
      disabled={isLocked}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.cardPressable}
    >
      <Animated.View
        style={[
          styles.cardShell,
          animatedCardStyle,
          isLocked ? styles.lockedCardShell : styles.cardShellActive,
        ]}
      >
        <View style={[
          styles.cardSurface,
          isActive && styles.activeCardSurface,
          isLocked && styles.lockedCardSurface
        ]}>
          <View style={styles.cardTopRow}>
            <View style={styles.stageBadge}>
              <Text style={styles.stageBadgeText}>{grade.progressLabel}</Text>
            </View>

            {isLocked ? (
              <View style={styles.lockBadge}>
                <MaterialIcons name="lock" size={18} color={Colors.onSurfaceVariant} />
              </View>
            ) : isActive ? (
              <View style={styles.currentBadge}>
                <MaterialIcons name="star" size={16} color={Colors.primary} />
                <Text style={styles.currentBadgeText}>CURRENT</Text>
              </View>
            ) : (
              <View style={styles.availableBadge}>
                <Text style={styles.availableBadgeText}>OPEN</Text>
              </View>
            )}
          </View>

          <View style={styles.cardBody}>
            <View style={styles.cardTextBlock}>
              <Text style={styles.cardEyebrow}>{grade.label}</Text>
              <Text style={styles.cardTitle}>{grade.title}</Text>
              <Text style={styles.cardDesc}>{grade.desc}</Text>
            </View>

            <View style={[styles.iconBubble, isLocked && styles.iconBubbleLocked]}>
              <MaterialCommunityIcons
                name={grade.icon}
                size={38}
                color={isLocked ? Colors.onSurfaceVariant : Colors.primary}
              />
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View
              style={[
                styles.actionPill,
                isLocked ? styles.actionPillLocked : isActive ? styles.actionPillCurrent : styles.actionPillOpen,
              ]}
            >
              <Text
                style={[
                  styles.actionPillText,
                  isLocked ? styles.actionPillTextLocked : isActive ? styles.actionPillTextCurrent : styles.actionPillTextOpen,
                ]}
              >
                {isLocked ? 'LOCKED' : isActive ? 'CONTINUE' : 'START'}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default function Grades() {
  const router = useRouter();
  const setCurrentGrade = useUserStore((state) => state.setCurrentGrade);
  const currentGrade = useUserStore((state) => state.currentGrade);
  const profile = useUserStore((state) => state.profile);
  const registeredGrade = profile?.registeredGrade || 'G1';
  const activeGrade = currentGrade || registeredGrade;

  const handleGradeSelect = (gradeId) => {
    if (isGradeAuthorized(gradeId, profile)) {
      setCurrentGrade(gradeId);
      router.push(`/journey/${gradeId}`);
      return;
    }

    Alert.alert(
      'Restricted Access',
      `You are currently registered for Grade ${registeredGrade.replace('G', '')}. Please contact your teacher to change levels.`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.background, { backgroundColor: Colors.surfaceContainerHigh }]}> 
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardStack}>
            {gradeData.map((grade) => {
              const isAuthorized = isGradeAuthorized(grade.id, profile);
              return (
                <GradeCard
                  key={grade.id}
                  grade={grade}
                  isActive={grade.id === activeGrade}
                  isLocked={!isAuthorized}
                  onPress={() => handleGradeSelect(grade.id)}
                />
              );
            })}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  background: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 56,
  },
  cardStack: {
    gap: 20,
  },
  cardPressable: {
    width: '100%',
  },
  cardShell: {
    borderRadius: 24,
    borderWidth: 2,
    backgroundColor: Colors.outlineVariant,
    borderColor: Colors.outlineVariant,
  },
  cardShellActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  lockedCardShell: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderColor: Colors.surfaceContainerHigh,
    opacity: 0.8,
  },
  cardSurface: {
    borderRadius: 22,
    padding: 20,
    minHeight: 180,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  lockedCardSurface: {
    backgroundColor: Colors.surfaceContainerLow,
  },
  activeCardSurface: {
    // Optional: add a subtle indicator if needed
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  stageBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.surfaceContainerHigh,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
  },
  stageBadgeText: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.onSurfaceVariant,
  },
  lockBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainerLowest,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primaryContainer,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  currentBadgeText: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 10,
    letterSpacing: 0.8,
    color: Colors.primary,
  },
  availableBadge: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
  },
  availableBadgeText: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 10,
    letterSpacing: 0.8,
    color: Colors.onSurface,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 18,
  },
  cardTextBlock: {
    flex: 1,
  },
  cardEyebrow: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.onSurfaceVariant,
    marginBottom: 4,
  },
  cardTitle: {
    fontFamily: 'Lexend-Black',
    fontSize: 28,
    lineHeight: 32,
    color: Colors.onSurface,
  },
  cardDesc: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 13,
    lineHeight: 18,
    color: Colors.onSurfaceVariant,
    marginTop: 8,
  },
  iconBubble: {
    width: 76,
    height: 76,
    borderRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBubbleLocked: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderColor: Colors.outlineVariant,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  actionPill: {
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 2,
    borderBottomWidth: 4,
  },
  actionPillCurrent: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary, // The shell handle the bottom color if we wanted, but here we do it localized
  },
  actionPillOpen: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderColor: Colors.outlineVariant,
  },
  actionPillLocked: {
    backgroundColor: Colors.surfaceContainerLow,
    borderColor: Colors.outlineVariant,
  },
  actionPillText: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 12,
    letterSpacing: 1,
  },
  actionPillTextCurrent: {
    color: '#ffffff',
  },
  actionPillTextOpen: {
    color: Colors.onSurface,
  },
  actionPillTextLocked: {
    color: Colors.onSurfaceVariant,
  },
});
