import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

/**
 * FactorsMultiplesEngine — "Number Sieve"
 *
 * A multi-select grid engine for Factors, Multiples, and Prime/Composite problems.
 * Students tap number tiles to select all correct answers, then submit with CHECK.
 *
 * Unique UX: Only multi-select engine in MathSync — teaches systematic filtering.
 *
 * Props (Orchestrator contract — DO NOT CHANGE):
 * @param {Object}   problem  — { answer, choices, metadata } from factorsMultiplesGenerator
 * @param {Object}   theme    — Game theme from gameThemes.js
 * @param {Function} onAnswer — (isCorrect: boolean, userAnswer: string) => void
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const SPRING_CONFIG = { damping: 15, stiffness: 300 };

const TILE_COLORS = {
  idle: Colors.surfaceContainerLowest,
  idleBorder: Colors.outlineVariant,
  selected: '#BA68C8',
  selectedBorder: '#6A1B9A',
  correct: '#4CAF50',
  correctBorder: '#2E7D32',
  wrong: '#F44336',
  wrongBorder: '#C62828',
  missed: '#FF9800',
  missedBorder: '#E65100',
};

// ============================================================================
// MAIN ENGINE
// ============================================================================

export default function FactorsMultiplesEngine({ problem, theme, onAnswer }) {
  if (!problem || !problem.metadata) return null;

  const { choices, metadata } = problem;
  const { displayQuestion, correctIndices, hint, type } = metadata;

  // State
  const [selectedIndices, setSelectedIndices] = useState(new Set());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedbackMap, setFeedbackMap] = useState(null); // Map<index, 'correct'|'wrong'|'missed'>

  // Check button animation
  const checkBtnDepth = useSharedValue(5);
  const checkBtnTranslateY = useSharedValue(0);

  const checkBtnAnimatedStyle = useAnimatedStyle(() => ({
    borderBottomWidth: checkBtnDepth.value,
    transform: [{ translateY: checkBtnTranslateY.value }],
  }));

  // Toggle tile selection
  const handleTilePress = useCallback((index) => {
    if (isSubmitted) return;
    Haptics.selectionAsync();

    setSelectedIndices(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, [isSubmitted]);

  // Submit all selections
  const handleCheck = useCallback(() => {
    if (isSubmitted || selectedIndices.size === 0) return;
    setIsSubmitted(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Build feedback map
    const correctSet = new Set(correctIndices);
    const feedback = {};
    let allCorrectSelected = true;
    let noWrongSelected = true;

    // Check each tile
    choices.forEach((_, index) => {
      const isSelected = selectedIndices.has(index);
      const isCorrect = correctSet.has(index);

      if (isSelected && isCorrect) {
        feedback[index] = 'correct';
      } else if (isSelected && !isCorrect) {
        feedback[index] = 'wrong';
        noWrongSelected = false;
      } else if (!isSelected && isCorrect) {
        feedback[index] = 'missed';
        allCorrectSelected = false;
      }
      // unselected + incorrect = no feedback (stays idle)
    });

    const isFullyCorrect = allCorrectSelected && noWrongSelected;

    setFeedbackMap(feedback);

    if (isFullyCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    // Delay to show feedback, then call Orchestrator
    const selectedValues = Array.from(selectedIndices)
      .map(i => choices[i])
      .sort((a, b) => a - b)
      .join(', ');

    setTimeout(() => {
      onAnswer(isFullyCorrect, selectedValues);
    }, 800);
  }, [isSubmitted, selectedIndices, correctIndices, choices, onAnswer]);

  // Derive selected count
  const selectedCount = selectedIndices.size;

  // Get type-specific accent label
  const typeLabel = type === 'factors'
    ? 'Factors'
    : type === 'multiples'
      ? 'Multiples'
      : 'Numbers';

  return (
    <View style={styles.container}>

      {/* ═══════ ZONE A: Question Header ═══════ */}
      <View style={styles.zoneA}>
        <Text style={[styles.promptText, {
          fontFamily: theme.fontFamily?.body || 'PlusJakartaSans-SemiBold',
          color: Colors.onSurfaceVariant,
        }]}>
          {displayQuestion}
        </Text>
        <Text style={[styles.hintText, {
          fontFamily: theme.fontFamily?.body || 'PlusJakartaSans-Medium',
          color: Colors.onSurfaceVariant,
        }]}>
          {hint}
        </Text>
      </View>

      {/* ═══════ ZONE B: Number Grid ═══════ */}
      <View style={styles.zoneB}>
        <View style={styles.grid}>
          {choices.map((number, index) => (
            <SieveTile
              key={`tile-${index}-${number}`}
              number={number}
              index={index}
              isSelected={selectedIndices.has(index)}
              feedbackState={feedbackMap ? feedbackMap[index] || null : null}
              isSubmitted={isSubmitted}
              onPress={handleTilePress}
              theme={theme}
            />
          ))}
        </View>
      </View>

      {/* ═══════ ZONE C: Counter + Check Button ═══════ */}
      <View style={styles.zoneC}>
        {/* Selection Counter */}
        <View style={styles.counterRow}>
          <View style={[styles.counterBadge, {
            backgroundColor: selectedCount > 0 ? 'rgba(186, 104, 200, 0.12)' : 'transparent',
            borderColor: selectedCount > 0 ? TILE_COLORS.selected : Colors.outlineVariant,
          }]}>
            <Text style={[styles.counterText, {
              fontFamily: theme.fontFamily?.accent || 'Lexend-Bold',
              color: selectedCount > 0 ? TILE_COLORS.selectedBorder : Colors.onSurfaceVariant,
            }]}>
              {selectedCount > 0 ? `${selectedCount} selected` : 'Tap to select'}
            </Text>
          </View>
        </View>

        {/* Check Button */}
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={() => {
            if (isSubmitted || selectedCount === 0) return;
            checkBtnDepth.value = withSpring(1, SPRING_CONFIG);
            checkBtnTranslateY.value = withSpring(4, SPRING_CONFIG);
          }}
          onPressOut={() => {
            checkBtnDepth.value = withSpring(5, SPRING_CONFIG);
            checkBtnTranslateY.value = withSpring(0, SPRING_CONFIG);
          }}
          onPress={handleCheck}
          disabled={isSubmitted || selectedCount === 0}
          style={styles.checkBtnWrapper}
        >
          <Animated.View style={[
            styles.checkBtn,
            checkBtnAnimatedStyle,
            {
              backgroundColor: isSubmitted
                ? Colors.surfaceContainerHigh
                : selectedCount > 0
                  ? TILE_COLORS.selected
                  : Colors.surfaceContainerHigh,
              borderColor: isSubmitted
                ? Colors.outlineVariant
                : selectedCount > 0
                  ? TILE_COLORS.selectedBorder
                  : Colors.outlineVariant,
            }
          ]}>
            <Text style={[styles.checkBtnText, {
              fontFamily: theme.fontFamily?.accent || 'Lexend-Bold',
              color: isSubmitted || selectedCount === 0
                ? Colors.onSurfaceVariant
                : '#FFFFFF',
            }]}>
              {isSubmitted ? 'SUBMITTED' : 'CHECK'}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================================================
// SIEVE TILE (Internal Component)
// ============================================================================

function SieveTile({ number, index, isSelected, feedbackState, isSubmitted, onPress, theme }) {
  const depth = useSharedValue(5);
  const translateY = useSharedValue(0);
  const tileScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    borderBottomWidth: depth.value,
    transform: [
      { translateY: translateY.value },
      { scale: tileScale.value },
    ],
  }));

  // Determine tile colors based on state
  let bgColor = TILE_COLORS.idle;
  let borderColor = TILE_COLORS.idleBorder;
  let textColor = Colors.onSurface;
  let showCheck = false;

  if (feedbackState === 'correct') {
    bgColor = 'rgba(76, 175, 80, 0.15)';
    borderColor = TILE_COLORS.correctBorder;
    textColor = TILE_COLORS.correct;
    showCheck = true;
  } else if (feedbackState === 'wrong') {
    bgColor = 'rgba(244, 67, 54, 0.12)';
    borderColor = TILE_COLORS.wrongBorder;
    textColor = TILE_COLORS.wrong;
  } else if (feedbackState === 'missed') {
    bgColor = 'rgba(255, 152, 0, 0.12)';
    borderColor = TILE_COLORS.missedBorder;
    textColor = TILE_COLORS.missed;
  } else if (isSelected) {
    bgColor = 'rgba(186, 104, 200, 0.12)';
    borderColor = TILE_COLORS.selectedBorder;
    textColor = TILE_COLORS.selectedBorder;
    showCheck = true;
  }

  const handlePressIn = () => {
    if (isSubmitted) return;
    depth.value = withSpring(2, SPRING_CONFIG);
    translateY.value = withSpring(3, SPRING_CONFIG);
    tileScale.value = withSpring(0.95, SPRING_CONFIG);
  };

  const handlePressOut = () => {
    if (isSubmitted) return;
    depth.value = withSpring(5, SPRING_CONFIG);
    translateY.value = withSpring(0, SPRING_CONFIG);
    tileScale.value = withSpring(1, SPRING_CONFIG);
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => onPress(index)}
      disabled={isSubmitted}
      style={styles.tileWrapper}
    >
      <Animated.View style={[
        styles.tile,
        animatedStyle,
        { backgroundColor: bgColor, borderColor },
      ]}>
        {/* Checkmark indicator */}
        {showCheck && (
          <View style={styles.checkIndicator}>
            <Text style={[styles.checkMark, { color: feedbackState === 'correct' ? TILE_COLORS.correct : TILE_COLORS.selectedBorder }]}>
              ✓
            </Text>
          </View>
        )}

        {/* Feedback icons for wrong/missed */}
        {feedbackState === 'wrong' && (
          <View style={styles.checkIndicator}>
            <Text style={[styles.checkMark, { color: TILE_COLORS.wrong }]}>✗</Text>
          </View>
        )}
        {feedbackState === 'missed' && (
          <View style={styles.checkIndicator}>
            <Text style={[styles.checkMark, { color: TILE_COLORS.missed }]}>!</Text>
          </View>
        )}

        <Text style={[styles.tileNumber, {
          fontFamily: theme.fontFamily?.title || 'Lexend-Black',
          color: textColor,
        }]}>
          {number}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },

  // ── Zone A: Question Header ──
  zoneA: {
    alignItems: 'center',
    marginBottom: 16,
  },
  promptText: {
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 6,
  },
  hintText: {
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 18,
  },

  // ── Zone B: Grid ──
  zoneB: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    maxWidth: 360,
  },
  tileWrapper: {
    width: '22%',
    aspectRatio: 1,
  },
  tile: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileNumber: {
    fontSize: 24,
  },
  checkIndicator: {
    position: 'absolute',
    top: 4,
    right: 6,
  },
  checkMark: {
    fontSize: 12,
    fontFamily: 'Lexend-Bold',
  },

  // ── Zone C: Counter + Check ──
  zoneC: {
    paddingTop: 12,
  },
  counterRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  counterBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  counterText: {
    fontSize: 14,
  },
  checkBtnWrapper: {
    width: '100%',
  },
  checkBtn: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBtnText: {
    fontSize: 18,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
