import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

/**
 * PercentagesEngine — "Percentage Grid"
 *
 * A multi-mode visual engine for percentage problems (Identify, Calculate, Convert).
 * Each problem type renders a unique visualization:
 *   - identify:  10×10 shaded grid
 *   - calculate: progress bar + structured equation
 *   - convert:   fraction visual with arrow to ?%
 *
 * All modes share a 4-choice tactile MCQ at the bottom.
 *
 * Props (Orchestrator contract — DO NOT CHANGE):
 * @param {Object}   problem  — { answer, choices, metadata } from percentagesGenerator
 * @param {Object}   theme    — Game theme from gameThemes.js
 * @param {Function} onAnswer — (isCorrect: boolean, userAnswer: string) => void
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const SPRING_CONFIG = { damping: 15, stiffness: 300 };
const GRID_SIZE = 10; // 10×10 = 100 cells

const ACCENT = {
  primary: '#E65100',
  primaryLight: '#FF8A65',
  primaryBg: 'rgba(230, 81, 0, 0.12)',
  correct: '#4CAF50',
  correctBg: 'rgba(76, 175, 80, 0.15)',
  wrong: '#F44336',
  wrongBg: 'rgba(244, 67, 54, 0.12)',
  fraction: '#7C3AED',
  fractionDark: '#5B21B6',
};

// ============================================================================
// MAIN ENGINE
// ============================================================================

export default function PercentagesEngine({ problem, theme, onAnswer }) {
  if (!problem || !problem.metadata) return null;

  const { answer, choices, metadata } = problem;
  const { displayQuestion, type, percentage, baseNumber, fraction, hint } = metadata;

  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [feedbackState, setFeedbackState] = useState(null); // 'correct' | 'wrong'

  // Handle choice selection
  const handleChoicePress = useCallback((choice) => {
    if (isLocked) return;
    setIsLocked(true);
    setSelectedChoice(choice);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const isCorrect = choice === answer;

    if (isCorrect) {
      setFeedbackState('correct');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setFeedbackState('wrong');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setTimeout(() => {
      onAnswer(isCorrect, String(choice));
    }, 600);
  }, [isLocked, answer, onAnswer]);

  return (
    <View style={styles.container}>

      {/* ═══════ ZONE A: Question + Visualization ═══════ */}
      <View style={styles.zoneA}>
        {/* Type badge */}
        <View style={[styles.typeBadge, {
          backgroundColor: ACCENT.primaryBg,
          borderColor: ACCENT.primary,
        }]}>
          <Text style={[styles.typeBadgeText, {
            fontFamily: theme.fontFamily?.accent || 'Lexend-Bold',
            color: ACCENT.primary,
          }]}>
            {type === 'identify' ? 'IDENTIFY' : type === 'calculate' ? 'CALCULATE' : 'CONVERT'}
          </Text>
        </View>

        <Text style={[styles.promptText, {
          fontFamily: theme.fontFamily?.body || 'PlusJakartaSans-SemiBold',
          color: Colors.onSurfaceVariant,
        }]}>
          {displayQuestion}
        </Text>

        {/* Visualization area — switches by type */}
        <View style={styles.vizArea}>
          {type === 'identify' && (
            <PercentageGrid percentage={percentage} theme={theme} />
          )}
          {type === 'calculate' && (
            <CalculateVisual
              percentage={percentage}
              baseNumber={baseNumber}
              theme={theme}
            />
          )}
          {type === 'convert' && (
            <ConvertVisual fraction={fraction} theme={theme} />
          )}
        </View>
      </View>

      {/* ═══════ ZONE B: 4 Choice Buttons ═══════ */}
      <View style={styles.zoneB}>
        <View style={styles.choicesGrid}>
          {choices.map((choice, index) => (
            <TactileChoiceButton
              key={`choice-${index}-${choice}`}
              value={choice}
              isSelected={selectedChoice === choice}
              isCorrectAnswer={choice === answer}
              feedbackState={isLocked ? (choice === answer ? 'correct' : selectedChoice === choice ? 'wrong' : null) : null}
              isLocked={isLocked}
              onPress={handleChoicePress}
              theme={theme}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// PERCENTAGE GRID (10×10) — for "identify" problems
// ============================================================================

function PercentageGrid({ percentage, theme }) {
  const shadedCount = percentage; // e.g. 50 means 50 out of 100

  const cells = [];
  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    cells.push(i < shadedCount);
  }

  return (
    <View style={styles.gridBoard}>
      <View style={styles.gridInner}>
        {Array.from({ length: GRID_SIZE }).map((_, row) => (
          <View key={`row-${row}`} style={styles.gridRow}>
            {Array.from({ length: GRID_SIZE }).map((_, col) => {
              const index = row * GRID_SIZE + col;
              const isShaded = cells[index];
              return (
                <View
                  key={`cell-${index}`}
                  style={[
                    styles.gridCell,
                    {
                      backgroundColor: isShaded
                        ? ACCENT.primary
                        : Colors.surfaceContainerLowest,
                      borderColor: isShaded
                        ? ACCENT.primary
                        : Colors.outlineVariant,
                    }
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>
      <Text style={[styles.gridLabel, {
        fontFamily: theme.fontFamily?.body || 'PlusJakartaSans-Medium',
        color: Colors.onSurfaceVariant,
      }]}>
        {shadedCount} out of 100 shaded
      </Text>
    </View>
  );
}

// ============================================================================
// CALCULATE VISUAL — progress bar for "calculate" problems
// ============================================================================

function CalculateVisual({ percentage, baseNumber, theme }) {
  const fillPercent = Math.min(percentage, 100);

  return (
    <View style={styles.calcBoard}>
      {/* Structured equation */}
      <View style={styles.calcEquation}>
        <Text style={[styles.calcPercentage, {
          fontFamily: theme.fontFamily?.title || 'Lexend-Black',
          color: ACCENT.primary,
        }]}>
          {percentage}%
        </Text>
        <Text style={[styles.calcOf, {
          fontFamily: theme.fontFamily?.body || 'PlusJakartaSans-SemiBold',
          color: Colors.onSurfaceVariant,
        }]}>
          of
        </Text>
        <Text style={[styles.calcBase, {
          fontFamily: theme.fontFamily?.title || 'Lexend-Black',
          color: Colors.onSurface,
        }]}>
          {baseNumber}
        </Text>
        <Text style={[styles.calcEquals, {
          fontFamily: theme.fontFamily?.title || 'Lexend-Black',
          color: Colors.onSurfaceVariant,
        }]}>
          =
        </Text>
        <View style={[styles.calcSlot, { borderColor: ACCENT.primary }]}>
          <Text style={[styles.calcSlotText, {
            fontFamily: theme.fontFamily?.title || 'Lexend-Black',
            color: ACCENT.primary,
          }]}>
            ?
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${fillPercent}%` }]} />
        <Text style={[styles.progressBarLabel, {
          fontFamily: theme.fontFamily?.accent || 'Lexend-Bold',
          color: Colors.onSurfaceVariant,
        }]}>
          {percentage}%
        </Text>
      </View>
    </View>
  );
}

// ============================================================================
// CONVERT VISUAL — fraction → percentage for "convert" problems
// ============================================================================

function ConvertVisual({ fraction, theme }) {
  if (!fraction) return null;

  return (
    <View style={styles.convertBoard}>
      {/* Fraction display */}
      <View style={[styles.fractionBox, { borderColor: ACCENT.fraction }]}>
        <Text style={[styles.fractionNumerator, {
          fontFamily: theme.fontFamily?.title || 'Lexend-Black',
          color: ACCENT.fraction,
        }]}>
          {fraction.numerator}
        </Text>
        <View style={[styles.fractionLine, { backgroundColor: ACCENT.fraction }]} />
        <Text style={[styles.fractionDenominator, {
          fontFamily: theme.fontFamily?.title || 'Lexend-Black',
          color: ACCENT.fraction,
        }]}>
          {fraction.denominator}
        </Text>
      </View>

      {/* Arrow */}
      <Text style={[styles.convertArrow, {
        fontFamily: theme.fontFamily?.title || 'Lexend-Black',
        color: Colors.onSurfaceVariant,
      }]}>
        →
      </Text>

      {/* Percentage slot */}
      <View style={[styles.percentSlot, { borderColor: ACCENT.primary }]}>
        <Text style={[styles.percentSlotText, {
          fontFamily: theme.fontFamily?.title || 'Lexend-Black',
          color: ACCENT.primary,
        }]}>
          ?%
        </Text>
      </View>
    </View>
  );
}

// ============================================================================
// TACTILE CHOICE BUTTON (Internal Component)
// ============================================================================

function TactileChoiceButton({ value, isSelected, isCorrectAnswer, feedbackState, isLocked, onPress, theme }) {
  const depth = useSharedValue(5);
  const translateY = useSharedValue(0);
  const btnScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    borderBottomWidth: depth.value,
    transform: [
      { translateY: translateY.value },
      { scale: btnScale.value },
    ],
  }));

  // Determine colors
  let bgColor = Colors.surfaceContainerLowest;
  let borderColor = Colors.outlineVariant;
  let textColor = Colors.onSurface;

  if (feedbackState === 'correct') {
    bgColor = ACCENT.correctBg;
    borderColor = ACCENT.correct;
    textColor = ACCENT.correct;
  } else if (feedbackState === 'wrong') {
    bgColor = ACCENT.wrongBg;
    borderColor = ACCENT.wrong;
    textColor = ACCENT.wrong;
  } else if (isLocked && isCorrectAnswer) {
    // Reveal correct answer when wrong choice was made
    bgColor = ACCENT.correctBg;
    borderColor = ACCENT.correct;
    textColor = ACCENT.correct;
  }

  const handlePressIn = () => {
    if (isLocked) return;
    depth.value = withSpring(2, SPRING_CONFIG);
    translateY.value = withSpring(3, SPRING_CONFIG);
    btnScale.value = withSpring(0.96, SPRING_CONFIG);
  };

  const handlePressOut = () => {
    if (isLocked) return;
    depth.value = withSpring(5, SPRING_CONFIG);
    translateY.value = withSpring(0, SPRING_CONFIG);
    btnScale.value = withSpring(1, SPRING_CONFIG);
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => onPress(value)}
      disabled={isLocked}
      style={styles.choiceBtnWrapper}
    >
      <Animated.View style={[
        styles.choiceBtn,
        animatedStyle,
        { backgroundColor: bgColor, borderColor },
      ]}>
        <Text style={[styles.choiceBtnText, {
          fontFamily: theme.fontFamily?.accent || 'Lexend-Bold',
          color: textColor,
        }]}>
          {value}
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
    paddingTop: 20,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },

  // ── Zone A: Question + Visualization ──
  zoneA: {
    flex: 1,
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  typeBadgeText: {
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  promptText: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  vizArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },

  // ── 10×10 Grid (identify) ──
  gridBoard: {
    alignItems: 'center',
  },
  gridInner: {
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: Colors.outlineVariant,
    borderRadius: 12,
    overflow: 'hidden',
    padding: 3,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridCell: {
    width: 24,
    height: 24,
    borderWidth: 0.5,
    borderRadius: 3,
    margin: 1,
  },
  gridLabel: {
    fontSize: 12,
    marginTop: 10,
    letterSpacing: 0.3,
  },

  // ── Calculate visual ──
  calcBoard: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 8,
  },
  calcEquation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  calcPercentage: {
    fontSize: 36,
  },
  calcOf: {
    fontSize: 20,
  },
  calcBase: {
    fontSize: 36,
  },
  calcEquals: {
    fontSize: 30,
  },
  calcSlot: {
    minWidth: 56,
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 2.5,
    borderBottomWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: 'rgba(230, 81, 0, 0.06)',
  },
  calcSlotText: {
    fontSize: 32,
  },

  // Progress bar
  progressBarTrack: {
    width: '90%',
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLow,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  progressBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: ACCENT.primaryLight,
    borderRadius: 12,
  },
  progressBarLabel: {
    fontSize: 12,
    textAlign: 'center',
    zIndex: 1,
  },

  // ── Convert visual ──
  convertBoard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  fractionBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 2.5,
    borderBottomWidth: 6,
    borderRadius: 18,
    backgroundColor: 'rgba(124, 58, 237, 0.06)',
  },
  fractionNumerator: {
    fontSize: 40,
  },
  fractionLine: {
    width: '100%',
    height: 3,
    borderRadius: 2,
    marginVertical: 4,
  },
  fractionDenominator: {
    fontSize: 40,
  },
  convertArrow: {
    fontSize: 36,
  },
  percentSlot: {
    minWidth: 80,
    minHeight: 72,
    borderRadius: 18,
    borderWidth: 2.5,
    borderBottomWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(230, 81, 0, 0.06)',
  },
  percentSlotText: {
    fontSize: 32,
  },

  // ── Zone B: Choices ──
  zoneB: {
    paddingTop: 12,
  },
  choicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  choiceBtnWrapper: {
    width: '46%',
    aspectRatio: 2.2,
  },
  choiceBtn: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceBtnText: {
    fontSize: 22,
  },
});
