import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

// ─── Screen-specific palette ──────────────────────────────────────────────────
// Complementary tints derived from the app's core color tokens.

const SCREEN_COLORS = {
  easy: {
    accent: Colors.tertiary,
    onAccent: Colors.onTertiary,
    surface: '#edfff3',
    border: Colors.onTertiaryContainer,
  },
  medium: {
    accent: Colors.secondary,
    onAccent: Colors.onSecondary,
    surface: Colors.secondaryContainer,
    border: Colors.onSecondaryContainer,
  },
  hard: {
    accent: Colors.error,
    onAccent: '#ffffff',
    surface: '#fff0f0',
    border: '#93000a',
  },
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const DIFFICULTIES = [
  {
    id: 'easy',
    label: 'Easy',
    description: 'Addition & subtraction · Numbers up to 20',
  },
  {
    id: 'medium',
    label: 'Medium',
    description: 'All 4 operations · Numbers up to 50',
  },
  {
    id: 'hard',
    label: 'Hard',
    description: 'All 4 operations · Numbers up to 100',
  },
];

const OPERATIONS = [
  { id: 'addition',       symbol: '+', label: 'Add' },
  { id: 'subtraction',    symbol: '−', label: 'Sub' },
  { id: 'multiplication', symbol: '×', label: 'Mul' },
  { id: 'division',       symbol: '÷', label: 'Div' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function DifficultyCard({ item, isSelected, onPress }) {
  const palette = SCREEN_COLORS[item.id];

  return (
    <TouchableOpacity
      style={[
        styles.difficultyCard,
        {
          backgroundColor: isSelected ? palette.accent : palette.surface,
          borderColor: palette.accent,
          borderBottomWidth: isSelected ? 2 : 6,
        },
      ]}
      onPress={() => onPress(item.id)}
      activeOpacity={0.85}
    >
      <Text style={[styles.difficultyLabel, { color: isSelected ? palette.onAccent : palette.accent }]}>
        {item.label}
      </Text>
      <Text style={[
        styles.difficultyDescription,
        { color: isSelected ? 'rgba(255,255,255,0.85)' : Colors.onSurfaceVariant },
      ]}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );
}

function OperationChip({ item, isSelected, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.operationChip,
        isSelected
          ? { backgroundColor: Colors.primary, borderColor: Colors.onPrimaryContainer, borderBottomWidth: 2 }
          : { backgroundColor: Colors.surfaceContainerLow, borderColor: Colors.outlineVariant, borderBottomWidth: 5 },
      ]}
      onPress={() => onPress(item.id)}
      activeOpacity={0.8}
    >
      <Text style={[styles.operationSymbol, { color: isSelected ? Colors.onPrimary : Colors.primary }]}>
        {item.symbol}
      </Text>
      <Text style={[styles.operationLabel, { color: isSelected ? 'rgba(255,255,255,0.8)' : Colors.onSurfaceVariant }]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MentalMath() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width > 768;

  const [difficulty, setDifficulty]   = useState('medium');
  const [selectedOps, setSelectedOps] = useState(['addition', 'subtraction', 'multiplication', 'division']);

  const handleDifficultyPress = (id) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
    setDifficulty(id);
  };

  const handleOperationToggle = (id) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
    setSelectedOps((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter((op) => op !== id);
      }
      return [...prev, id];
    });
  };

  const handleStart = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (_) {}
    const rules = JSON.stringify({ difficulty, operations: selectedOps });
    router.push({
      pathname: '/game/mental-math',
      params: { topicId: 'mental-math', grade: 'MENTAL_MATH', rules },
    });
  };

  return (
    <LinearGradient
      colors={[Colors.surfaceContainerLow, Colors.surface]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: isTablet ? 48 : 24 }]}
          showsVerticalScrollIndicator={false}
        >

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Mental Math</Text>
            <Text style={styles.headerSubtitle}>Quick-fire arithmetic practice</Text>
          </View>

          {/* Difficulty */}
          <Text style={styles.sectionLabel}>Select Difficulty</Text>
          <View style={[styles.difficultyRow, isTablet && styles.difficultyRowTablet]}>
            {DIFFICULTIES.map((item) => (
              <DifficultyCard
                key={item.id}
                item={item}
                isSelected={difficulty === item.id}
                onPress={handleDifficultyPress}
              />
            ))}
          </View>

          {/* Operations */}
          <Text style={styles.sectionLabel}>Operations</Text>
          <Text style={styles.sectionHint}>Tap to toggle — at least one must stay active</Text>
          <View style={styles.operationsRow}>
            {OPERATIONS.map((item) => (
              <OperationChip
                key={item.id}
                item={item}
                isSelected={selectedOps.includes(item.id)}
                onPress={handleOperationToggle}
              />
            ))}
          </View>

          {/* Session Preview */}
          <View style={styles.previewCard}>
            <View style={styles.previewRow}>
              <Text style={styles.previewKey}>Difficulty</Text>
              <Text style={[styles.previewValue, { color: SCREEN_COLORS[difficulty].accent }]}>
                {DIFFICULTIES.find((d) => d.id === difficulty)?.label}
              </Text>
            </View>
            <View style={[styles.previewRow, styles.previewRowDivider]}>
              <Text style={styles.previewKey}>Operations</Text>
              <Text style={styles.previewValue}>
                {selectedOps.map((op) => OPERATIONS.find((o) => o.id === op)?.symbol).join('   ')}
              </Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewKey}>Scoring</Text>
              <Text style={styles.previewValue}>+10 correct · −2 wrong</Text>
            </View>
          </View>

        </ScrollView>

        {/* Start Button */}
        <View style={[styles.startContainer, { paddingHorizontal: isTablet ? 48 : 24 }]}>
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: Colors.primary, borderColor: Colors.onPrimaryContainer }]}
            onPress={handleStart}
            activeOpacity={0.85}
          >
            <Text style={styles.startButtonText}>Start Practice</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    paddingTop: 28,
    paddingBottom: 16,
  },
  header: {
    marginBottom: 36,
  },
  headerTitle: {
    fontFamily: 'Lexend-Black',
    fontSize: 40,
    color: Colors.onSurface,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 17,
    color: Colors.onSurfaceVariant,
    marginTop: 6,
  },
  sectionLabel: {
    fontFamily: 'Lexend-Bold',
    fontSize: 19,
    color: Colors.onSurface,
    marginBottom: 6,
  },
  sectionHint: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginBottom: 14,
  },
  difficultyRow: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 36,
  },
  difficultyRowTablet: {
    flexDirection: 'row',
  },
  difficultyCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 2,
    paddingVertical: 20,
    paddingHorizontal: 22,
  },
  difficultyLabel: {
    fontFamily: 'Lexend-Bold',
    fontSize: 22,
    marginBottom: 5,
  },
  difficultyDescription: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 15,
    lineHeight: 21,
  },
  operationsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 36,
  },
  operationChip: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  operationSymbol: {
    fontFamily: 'Lexend-Black',
    fontSize: 26,
  },
  operationLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    marginTop: 3,
  },
  previewCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    paddingHorizontal: 22,
    marginBottom: 8,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  previewRowDivider: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  previewKey: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    color: Colors.onSurfaceVariant,
  },
  previewValue: {
    fontFamily: 'Lexend-Bold',
    fontSize: 17,
    color: Colors.onSurface,
  },
  startContainer: {
    paddingTop: 14,
    paddingBottom: 18,
  },
  startButton: {
    height: 64,
    borderRadius: 18,
    borderWidth: 2,
    borderBottomWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 20,
    color: Colors.onPrimary,
    letterSpacing: 1.2,
  },
});
