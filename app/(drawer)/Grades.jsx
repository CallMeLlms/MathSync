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
    icon: 'seedling',
    progressLabel: 'Start here',
    colors: ['#7ee081', '#58cc02'],
    borderColor: '#3c9f18',
    badgeColor: '#dff7cf',
    iconTint: '#1f6d12',
  },
  {
    id: 'G2',
    title: 'Grade 2',
    label: 'Skill Climb',
    desc: 'Train your speed with patterns, place value, and sharper number sense.',
    icon: 'rocket-launch',
    progressLabel: 'Ready',
    colors: ['#7dd8ff', '#1cb0f6'],
    borderColor: '#1185be',
    badgeColor: '#d8f4ff',
    iconTint: '#0d5f89',
  },
  {
    id: 'G3',
    title: 'Grade 3',
    label: 'Strategy Zone',
    desc: 'Mix logic and rhythm as multiplication and problem solving level up.',
    icon: 'sword-cross',
    progressLabel: 'Challenge',
    colors: ['#ffc76b', '#ff9600'],
    borderColor: '#cc6f00',
    badgeColor: '#ffedd1',
    iconTint: '#8a4f00',
  },
  {
    id: 'G4',
    title: 'Grade 4',
    label: 'Master Track',
    desc: 'Tackle bigger numbers, deeper thinking, and more confident decision making.',
    icon: 'castle',
    progressLabel: 'Advance',
    colors: ['#ff9aa2', '#ff4b4b'],
    borderColor: '#c93333',
    badgeColor: '#ffe1e3',
    iconTint: '#8c2222',
  },
  {
    id: 'G5',
    title: 'Grade 5',
    label: 'Elite Arena',
    desc: 'Push into precision, planning, and stronger multi-step reasoning.',
    icon: 'lightning-bolt',
    progressLabel: 'Elite',
    colors: ['#c5a7ff', '#9069ff'],
    borderColor: '#6d4cd1',
    badgeColor: '#ece2ff',
    iconTint: '#4f35a4',
  },
  {
    id: 'G6',
    title: 'Grade 6',
    label: 'Champion Path',
    desc: 'Finish strong with advanced missions built for confident math explorers.',
    icon: 'crown',
    progressLabel: 'Boss level',
    colors: ['#9ee4b6', '#2bb673'],
    borderColor: '#198656',
    badgeColor: '#def7e8',
    iconTint: '#115f3e',
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
    if (isLocked) {
      return;
    }

    pressOffset.value = withTiming(4, { duration: 100 });
    hapticLight();
  };

  const handlePressOut = () => {
    if (isLocked) {
      return;
    }

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
      {({ pressed }) => (
        <Animated.View
          style={[
            styles.cardShell,
            animatedCardStyle,
            { borderColor: grade.borderColor, backgroundColor: grade.borderColor },
            isLocked && styles.lockedCardShell,
          ]}
        >
          <LinearGradient
            colors={isLocked ? [Colors.surfaceContainerHigh, Colors.surfaceContainer] : grade.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.cardSurface,
              isActive && styles.activeCardSurface,
              pressed && !isLocked && styles.cardSurfacePressed,
            ]}
          >
            <View style={styles.cardTopRow}>
              <View style={[styles.stageBadge, { backgroundColor: grade.badgeColor }]}>
                <Text style={[styles.stageBadgeText, { color: grade.iconTint }]}>{grade.progressLabel}</Text>
              </View>

              {isLocked ? (
                <View style={styles.lockBadge}>
                  <MaterialIcons name="lock" size={18} color={Colors.onSurfaceVariant} />
                </View>
              ) : isActive ? (
                <View style={styles.currentBadge}>
                  <MaterialIcons name="star" size={16} color="#ffffff" />
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

              <View style={[styles.iconBubble, { backgroundColor: grade.badgeColor }]}>
                <MaterialCommunityIcons
                  name={grade.icon}
                  size={38}
                  color={isLocked ? Colors.onSurfaceVariant : grade.iconTint}
                />
              </View>
            </View>

            <View style={styles.cardFooter}>
              {/* <View style={styles.lessonTrack}>
                <View style={[styles.lessonNode, styles.lessonNodeDone]} />
                <View style={[styles.lessonNode, isActive && styles.lessonNodeCurrent]} />
                <View style={[styles.lessonNode, !isLocked && !isActive && styles.lessonNodeOpen]} />
              </View> */}

              <View
                style={[
                  styles.actionPill,
                  isLocked ? styles.actionPillLocked : isActive ? styles.actionPillCurrent : styles.actionPillOpen,
                ]}
              >
                <Text
                  style={[
                    styles.actionPillText,
                    isLocked
                      ? styles.actionPillTextLocked
                      : isActive
                        ? styles.actionPillTextCurrent
                        : styles.actionPillTextOpen,
                  ]}
                >
                  {isLocked ? 'LOCKED' : isActive ? 'CONTINUE' : 'START'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      )}
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
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    borderWidth: 2,
    borderBottomWidth: 8,
    borderColor: '#cbeab8',
    padding: 22,
    marginBottom: 24,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#58cc02',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroBadgeText: {
    color: '#ffffff',
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 11,
    letterSpacing: 1,
  },
  heroGradeChip: {
    backgroundColor: '#fff4d9',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroGradeChipText: {
    color: '#9f4200',
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
  },
  heroTitle: {
    fontFamily: 'Lexend-Black',
    fontSize: 32,
    lineHeight: 38,
    color: '#20311c',
    maxWidth: '88%',
  },
  heroSubtitle: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 15,
    lineHeight: 23,
    color: Colors.onSurfaceVariant,
    marginTop: 12,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    marginTop: 22,
  },
  heroStatCard: {
    flex: 1,
    backgroundColor: '#f6fbef',
    borderRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: '#d7eebe',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  heroStatValue: {
    fontFamily: 'Lexend-Black',
    fontSize: 28,
    color: '#20311c',
  },
  heroStatLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 4,
  },
  heroMascot: {
    width: 84,
    alignItems: 'center',
  },
  heroMascotFace: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: '#dff7cf',
    borderWidth: 2,
    borderBottomWidth: 8,
    borderColor: '#a9db86',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 24,
    color: '#20311c',
  },
  sectionCaption: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    lineHeight: 21,
    color: Colors.onSurfaceVariant,
    marginTop: 6,
  },
  cardStack: {
    gap: 18,
  },
  cardPressable: {
    width: '100%',
  },
  cardShell: {
    borderRadius: 30,
    borderWidth: 2,
    overflow: 'hidden',
  },
  lockedCardShell: {
    borderColor: '#d3c7b8',
    backgroundColor: '#d3c7b8',
  },
  cardSurface: {
    borderRadius: 28,
    padding: 18,
    minHeight: 188,
  },
  activeCardSurface: {
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  cardSurfacePressed: {
    opacity: 0.96,
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
    paddingVertical: 7,
  },
  stageBadgeText: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 11,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  lockBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#20311c',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  currentBadgeText: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 11,
    letterSpacing: 0.9,
    color: '#ffffff',
  },
  availableBadge: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  availableBadgeText: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 11,
    letterSpacing: 0.9,
    color: '#20311c',
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
    color: 'rgba(35,26,13,0.72)',
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: 'Lexend-Black',
    fontSize: 30,
    lineHeight: 34,
    color: '#ffffff',
  },
  cardDesc: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 10,
  },
  iconBubble: {
    width: 82,
    height: 82,
    borderRadius: 24,
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'end',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  lessonTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lessonNode: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  lessonNodeDone: {
    backgroundColor: '#ffffff',
  },
  lessonNodeCurrent: {
    width: 32,
    backgroundColor: '#20311c',
  },
  lessonNodeOpen: {
    width: 20,
    backgroundColor: '#fff6b5',
  },
  actionPill: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderWidth: 2,
  },
  actionPillCurrent: {
    backgroundColor: '#ffffff',
    borderColor: '#dff7cf',
  },
  actionPillOpen: {
    backgroundColor: '#20311c',
    borderColor: '#20311c',
  },
  actionPillLocked: {
    backgroundColor: '#f7f0e7',
    borderColor: '#e4d8c8',
  },
  actionPillText: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 12,
    letterSpacing: 1,
  },
  actionPillTextCurrent: {
    color: '#20311c',
  },
  actionPillTextOpen: {
    color: '#ffffff',
  },
  actionPillTextLocked: {
    color: Colors.onSurfaceVariant,
  },
});
