import { View, Text, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useMemo, useCallback, useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  ZoomIn,
  FadeIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── MatchItem: A tappable item in either column ───
const MatchItem = ({
  label,
  isSelected,
  isLinked,
  isCorrect,
  isWrong,
  onPress,
  disabled,
}) => {
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (isSelected) {
      pulseScale.value = withSequence(
        withSpring(1.06, { damping: 8, stiffness: 200 }),
        withSpring(1.0, { damping: 12, stiffness: 200 })
      );
    }
  }, [isSelected]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Visual states: Correct > Wrong > Linked (locked grey) > Selected > Idle
  const bgColor = isCorrect
    ? 'rgba(76,175,80,0.12)'
    : isWrong
      ? 'rgba(211,47,47,0.08)'
      : isLinked
        ? Colors.surfaceContainerLow
        : isSelected
          ? Colors.primaryContainer
          : Colors.surface;

  const borderColor = isCorrect
    ? Colors.success
    : isWrong
      ? Colors.error
      : isLinked
        ? Colors.outlineVariant
        : isSelected
          ? Colors.primary
          : Colors.outlineVariant;

  const textColor = isCorrect
    ? Colors.success
    : isWrong
      ? Colors.error
      : isLinked
        ? Colors.onSurfaceVariant
        : isSelected
          ? Colors.primary
          : Colors.onSurface;

  return (
    <Animated.View style={pulseStyle}>
      <TouchableOpacity
        style={[
          styles.matchItem,
          {
            backgroundColor: bgColor,
            borderColor: borderColor,
            borderWidth: isSelected || isWrong ? 3 : 2,
          },
        ]}
        onPress={onPress}
        disabled={disabled || isCorrect}
        activeOpacity={0.7}
      >
        {isCorrect && (
          <View style={styles.matchedCheck}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
          </View>
        )}
        {isWrong && (
          <View style={styles.matchedCheck}>
            <Ionicons name="close-circle" size={18} color={Colors.error} />
          </View>
        )}
        <Text
          style={[styles.matchItemText, { color: textColor }]}
          numberOfLines={2}
          adjustsFontSizeToFit
        >
          {String(label)}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};


// ─── MatcherEngine ───
const MatcherEngine = ({ question, onAnswer }) => {
  const { pairs = [] } = question;

  // Shuffle left and right independently on question mount
  const leftItems = useMemo(
    () => pairs.map((p, i) => ({ ...p, pairIndex: i })).sort(() => Math.random() - 0.5),
    [pairs]
  );
  const rightItems = useMemo(
    () => pairs.map((p, i) => ({ ...p, pairIndex: i })).sort(() => Math.random() - 0.5),
    [pairs]
  );

  const [selectedLeft, setSelectedLeft] = useState(null);
  const [userMatches, setUserMatches] = useState({});  // { leftPairIndex: rightPairIndex }
  const [showErrors, setShowErrors] = useState(false);
  const [answered, setAnswered] = useState(false);

  const handleLeftTap = useCallback((pairIndex) => {
    if (answered || showErrors) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLeft(prev => prev === pairIndex ? null : pairIndex);
  }, [answered, showErrors]);

  const handleRightTap = useCallback((rightPairIndex) => {
    if (answered || selectedLeft === null || showErrors) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setUserMatches(prev => {
      const next = { ...prev };
      // Maintain 1:1 mapping — clear any existing link to this right item
      Object.keys(next).forEach(key => {
        if (next[key] === rightPairIndex) delete next[key];
      });
      next[selectedLeft] = rightPairIndex;
      return next;
    });

    setSelectedLeft(null);
  }, [answered, selectedLeft, showErrors]);

  const handleReset = useCallback(() => {
    if (answered || showErrors) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setUserMatches({});
    setSelectedLeft(null);
  }, [answered, showErrors]);

  const handleCheckAnswer = () => {
    if (answered) return;
    if (Object.keys(userMatches).length !== pairs.length) return;

    const allCorrect = Object.entries(userMatches).every(
      ([leftId, rightId]) => parseInt(leftId) === rightId
    );

    if (allCorrect) {
      setAnswered(true);
      setShowErrors(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => onAnswer(true), 800);
    } else {
      setShowErrors(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      onAnswer(false);
      // Auto-reset wrong matches after showing error state
      setTimeout(() => {
        setUserMatches({});
        setSelectedLeft(null);
        setShowErrors(false);
      }, 1200);
    }
  };

  const matchedCount = Object.keys(userMatches).length;
  const isReadyToCheck = matchedCount === pairs.length;

  // Dynamic instruction text — mirrors OrderingEngine's contextual hint
  const instructionHint = answered
    ? '✅ All matched!'
    : showErrors
      ? '❌ Some matches are wrong. Try again!'
      : selectedLeft !== null
        ? 'Now tap its match on the right →'
        : matchedCount > 0 && !isReadyToCheck
          ? `${matchedCount} of ${pairs.length} matched — keep going!`
          : isReadyToCheck
            ? "All paired! Tap 'Check Match' when ready."
            : 'Tap a tile on the left to begin';

  return (
    <View style={styles.container}>

      {/* ── Dynamic Instruction Hint ── */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.hintContainer}>
        <Text style={styles.instructionHint}>{instructionHint}</Text>
      </Animated.View>

      {/* ── Column Headers ── */}
      <View style={styles.columnHeaders}>
        <Text style={styles.columnLabel}>Match</Text>
        <Text style={styles.columnLabel}>With</Text>
      </View>

      {/* ── Match Columns ── */}
      <View style={styles.columnsContainer}>
        {/* Left Column */}
        <View style={styles.column}>
          {leftItems.map((item) => {
            const rightId = userMatches[item.pairIndex];
            const isLinked = rightId !== undefined;
            const isCorrect = answered && isLinked && item.pairIndex === rightId;
            const isWrong = showErrors && isLinked && item.pairIndex !== rightId;
            const isSelected = selectedLeft === item.pairIndex;

            return (
              <MatchItem
                key={`left-${item.pairIndex}`}
                label={item.left}
                isSelected={isSelected}
                isLinked={isLinked && !isCorrect && !isWrong}
                isCorrect={isCorrect}
                isWrong={isWrong}
                onPress={() => handleLeftTap(item.pairIndex)}
                disabled={answered}
              />
            );
          })}
        </View>

        {/* Right Column */}
        <View style={styles.column}>
          {rightItems.map((item) => {
            const leftId = Object.keys(userMatches).find(key => userMatches[key] === item.pairIndex);
            const isLinked = leftId !== undefined;
            const isCorrect = answered && isLinked && parseInt(leftId) === item.pairIndex;
            const isWrong = showErrors && isLinked && parseInt(leftId) !== item.pairIndex;

            return (
              <MatchItem
                key={`right-${item.pairIndex}`}
                label={item.right}
                isSelected={false}
                isLinked={isLinked && !isCorrect && !isWrong}
                isCorrect={isCorrect}
                isWrong={isWrong}
                onPress={() => handleRightTap(item.pairIndex)}
                disabled={answered}
              />
            );
          })}
        </View>
      </View>

      {/* ── Footer Controls ── */}
      {!answered && (
        <Animated.View entering={FadeIn.duration(400)} style={styles.controlsContainer}>
          <TouchableOpacity
            style={[
              styles.controlBtn,
              styles.resetBtn,
              { opacity: matchedCount > 0 && !showErrors ? 1 : 0.35 }
            ]}
            onPress={handleReset}
            disabled={matchedCount === 0 || showErrors}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={18} color={Colors.onSurface} />
            <Text style={styles.resetBtnText}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlBtn,
              styles.checkBtn,
              { backgroundColor: isReadyToCheck ? Colors.primary : Colors.surfaceVariant }
            ]}
            onPress={handleCheckAnswer}
            disabled={!isReadyToCheck || showErrors}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.checkBtnText,
              { color: isReadyToCheck ? '#FFF' : Colors.onSurfaceVariant }
            ]}>
              Check Match
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },

  // ─── Dynamic Hint ───
  hintContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  instructionHint: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },

  // ─── Column Headers ───
  columnHeaders: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  columnLabel: {
    flex: 1,
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },

  // ─── Match Grid ───
  columnsContainer: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    gap: 14,
  },
  column: {
    flex: 1,
    gap: 10,
  },
  matchItem: {
    minHeight: SCREEN_HEIGHT * 0.075,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  matchItemText: {
    fontFamily: 'Lexend-Bold',
    fontSize: SCREEN_HEIGHT * 0.021,
    textAlign: 'center',
  },
  matchedCheck: {
    position: 'absolute',
    top: -7,
    right: -7,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    zIndex: 1,
  },

  // ─── Footer Controls ───
  controlsContainer: {
    flexDirection: 'row',
    gap: 14,
    paddingBottom: 32,
    paddingTop: 16,
  },
  controlBtn: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  resetBtn: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
  },
  resetBtnText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    color: Colors.onSurface,
  },
  checkBtn: {},
  checkBtnText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 16,
  },
});

export default MatcherEngine;
