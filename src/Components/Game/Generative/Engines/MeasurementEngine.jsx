import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, LinearTransition, FadeIn, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

import MeasurementVisual from '@/Components/Game/Global/Visualizers/MeasurementVisual';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function AnimatedChoiceTile({ value, isSelected, disabled, onSelect, theme, tileWidth }) {
  const translateY = useSharedValue(0);
  const borderBottom = useSharedValue(5);

  const tap = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      translateY.value = withSpring(4, { damping: 15, stiffness: 300 });
      borderBottom.value = withSpring(2, { damping: 15, stiffness: 300 });
    })
    .onEnd(() => {
      if (onSelect && !disabled) runOnJS(onSelect)(value);
    })
    .onFinalize(() => {
      translateY.value = withSpring(0, { damping: 15, stiffness: 200 });
      borderBottom.value = withSpring(5, { damping: 15, stiffness: 200 });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    borderBottomWidth: borderBottom.value,
  }));

  const isLongText = String(value).length > 8;

  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        layout={LinearTransition.springify()}
        entering={FadeIn.duration(300)}
        style={[
          styles.choiceTile,
          { width: tileWidth || '45%' },
          animatedStyle,
          {
            backgroundColor: isSelected ? theme.primaryColor : Colors.surface,
            borderColor: isSelected ? theme.primaryColor : Colors.outlineVariant,
          },
        ]}
      >
        <Text
          adjustsFontSizeToFit
          numberOfLines={2}
          minimumFontScale={0.6}
          style={[
            styles.choiceText,
            isLongText && { fontSize: 16 },
            { fontFamily: theme.fontFamily.accent, color: isSelected ? Colors.surface : Colors.onSurface },
          ]}
        >
          {value}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}

export default function MeasurementEngine({ problem, onAnswer, theme }) {
  const [selectedChoice, setSelectedChoice] = useState(null);
  const hasAnswered = useRef(false);
  const answerTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    setSelectedChoice(null);
    hasAnswered.current = false;
    if (answerTimeoutRef.current) {
      clearTimeout(answerTimeoutRef.current);
      answerTimeoutRef.current = null;
    }
  }, [problem?.answer]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (answerTimeoutRef.current) clearTimeout(answerTimeoutRef.current);
    };
  }, []);

  if (!problem || !problem.metadata) return null;

  const { metadata, choices, answer } = problem;
  const { displayQuestion, category, categoryIcon, conversion, comparison, type, isWordProblem } = metadata;
  const safeChoices = choices ?? [];

  const handleChoiceSelect = (value) => {
    if (selectedChoice !== null || hasAnswered.current) return;
    hasAnswered.current = true;

    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}

    setSelectedChoice(value);
    const isCorrect = String(value) === String(answer);

    answerTimeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      try {
        onAnswer(isCorrect, String(value));
      } catch (e) {
        console.error('[MeasurementEngine] onAnswer crash:', e);
      }
    }, 400);
  };

  const isTablet = SCREEN_WIDTH > 768;

  const getChoiceTileWidth = () => {
    const isLongText = safeChoices.some(c => String(c).length > 10);
    if (isLongText || isWordProblem) return isTablet ? '45%' : '100%';
    return '45%';
  };

  // ── Comparison layout: two-zone design ──────────────────────────────────────
  const renderComparisonLayout = () => (
    <View style={styles.comparisonWrapper}>
      {/* Zone A: VS comparison cards */}
      <View style={styles.vsRow}>
        <View style={styles.vsCard}>
          <Text style={[styles.vsLabel, { fontFamily: theme.fontFamily.body }]}>Option A</Text>
          <Text
            adjustsFontSizeToFit
            numberOfLines={1}
            minimumFontScale={0.6}
            style={[styles.vsValue, { fontFamily: theme.fontFamily.title, color: theme.primaryColor }]}
          >
            {comparison.val1}
          </Text>
          <Text style={[styles.vsUnit, { fontFamily: theme.fontFamily.body, color: Colors.onSurfaceVariant }]}>
            {comparison.unit1}
          </Text>
        </View>

        <View style={styles.vsBadge}>
          <Text style={[styles.vsBadgeText, { fontFamily: theme.fontFamily.accent, color: Colors.onSurfaceVariant }]}>
            VS
          </Text>
        </View>

        <View style={styles.vsCard}>
          <Text style={[styles.vsLabel, { fontFamily: theme.fontFamily.body }]}>Option B</Text>
          <Text
            adjustsFontSizeToFit
            numberOfLines={1}
            minimumFontScale={0.6}
            style={[styles.vsValue, { fontFamily: theme.fontFamily.title, color: theme.primaryColor }]}
          >
            {comparison.val2}
          </Text>
          <Text style={[styles.vsUnit, { fontFamily: theme.fontFamily.body, color: Colors.onSurfaceVariant }]}>
            {comparison.unit2}
          </Text>
        </View>
      </View>

      {/* Zone B: Conversion reference — capped so it never overflows */}
      <View style={styles.hintCard}>
        <Text style={[styles.hintLabel, { fontFamily: theme.fontFamily.body }]}>
          Conversion Reference
        </Text>
        <View style={styles.hintVisual}>
          <MeasurementVisual
            fromUnit={comparison.unit1}
            toUnit={comparison.unit2}
            category={category}
            categoryIcon={categoryIcon}
            theme={theme}
          />
        </View>
      </View>
    </View>
  );

  // ── Other problem area layouts ───────────────────────────────────────────────
  const renderProblemArea = () => {
    if (comparison) return renderComparisonLayout();

    if (conversion && !isWordProblem) {
      return (
        <View style={styles.focalContainer}>
          <MeasurementVisual
            fromUnit={conversion.from}
            toUnit={conversion.to}
            category={category}
            categoryIcon={categoryIcon}
            theme={theme}
          />
        </View>
      );
    }

    if (isWordProblem) {
      return (
        <View style={styles.focalContainer}>
          <Text style={styles.wordProblemIcon}>{categoryIcon}</Text>
          {conversion && (
            <View style={{ marginTop: 16 }}>
              <MeasurementVisual
                fromUnit={conversion.from}
                toUnit={conversion.to}
                category={category}
                categoryIcon={categoryIcon}
                theme={theme}
              />
            </View>
          )}
        </View>
      );
    }

    return null;
  };

  const instructionLabel = selectedChoice !== null ? 'Answer locked in!' : 'Select your answer';

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text
          adjustsFontSizeToFit
          numberOfLines={2}
          minimumFontScale={0.65}
          style={[styles.questionText, { fontFamily: theme.fontFamily.title, color: theme.primaryColor }]}
        >
          {displayQuestion}
        </Text>
      </View>

      <View style={styles.focusArea}>
        {renderProblemArea()}
      </View>

      <View style={styles.choicesArea}>
        <Text style={[styles.instructionText, { fontFamily: theme.fontFamily.body, color: Colors.onSurfaceVariant }]}>
          {instructionLabel}
        </Text>
        <View style={styles.choicesGrid}>
          {safeChoices.map((choice, index) => (
            <AnimatedChoiceTile
              key={`choice-${choice}-${index}`}
              value={choice}
              isSelected={selectedChoice === choice}
              onSelect={handleChoiceSelect}
              theme={theme}
              tileWidth={getChoiceTileWidth()}
              disabled={selectedChoice !== null}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  questionText: {
    fontSize: 24,
    textAlign: 'center',
    lineHeight: 32,
  },
  focusArea: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginBottom: 16,
  },
  // ── Standard focal container (conversion / word problem) ────────────────────
  focalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 500,
    backgroundColor: Colors.surface,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: Colors.outlineVariant,
  },
  wordProblemIcon: {
    fontSize: 64,
  },
  // ── Comparison two-zone layout ───────────────────────────────────────────────
  comparisonWrapper: {
    width: '100%',
    maxWidth: 500,
    gap: 12,
  },
  vsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
  },
  vsCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: Colors.outlineVariant,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
  },
  vsLabel: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  vsValue: {
    fontSize: 28,
    textAlign: 'center',
  },
  vsUnit: {
    fontSize: 13,
  },
  vsBadge: {
    width: 36,
    alignSelf: 'center',
    alignItems: 'center',
  },
  vsBadgeText: {
    fontSize: 14,
  },
  hintCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    paddingVertical: 12,
    paddingHorizontal: 8,
    maxHeight: 150,
    overflow: 'hidden',
    alignItems: 'center',
    gap: 8,
  },
  hintLabel: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  hintVisual: {
    width: '100%',
    alignItems: 'center',
  },
  // ── Choice area ──────────────────────────────────────────────────────────────
  choicesArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  instructionText: {
    fontSize: 16,
    marginBottom: 12,
  },
  choicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  choiceTile: {
    minHeight: 70,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceText: {
    fontSize: 24,
    textAlign: 'center',
  },
});
