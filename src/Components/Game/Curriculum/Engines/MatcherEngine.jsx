import { View, Text, Dimensions, StyleSheet, Pressable } from 'react-native';
import { useState, useMemo, useCallback, useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  ZoomIn,
  FadeIn,
  Layout,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── MatchItem: A tactile "Bulky" tappable item ───
const MatchItem = ({
  label,
  isSelected,
  isLinked,
  isCorrect,
  isWrong,
  onPress,
  disabled,
  index,
  side, // 'left' | 'right'
}) => {
  const translateY = useSharedValue(0);
  const bottomWidth = useSharedValue(6);

  // Interaction State: correct > wrong > selected > linked > idle
  const state = isCorrect 
    ? 'correct' 
    : isWrong 
      ? 'wrong' 
      : isSelected 
        ? 'selected' 
        : isLinked 
          ? 'linked' 
          : 'idle';

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    borderBottomWidth: bottomWidth.value,
  }));

  const handlePressIn = () => {
    if (disabled || isCorrect) return;
    translateY.value = withSpring(4, { damping: 15, stiffness: 300 });
    bottomWidth.value = withSpring(2, { damping: 15, stiffness: 300 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    if (disabled || isCorrect) return;
    translateY.value = withSpring(0, { damping: 15, stiffness: 300 });
    bottomWidth.value = withSpring(6, { damping: 15, stiffness: 300 });
  };

  const colors = {
    idle: {
      border: Colors.outlineVariant,
      bg: Colors.surfaceContainerLowest,
      text: Colors.onSurface,
    },
    linked: {
      border: Colors.outlineVariant,
      bg: Colors.surfaceContainerLow,
      text: Colors.onSurfaceVariant,
    },
    selected: {
      border: Colors.secondary,
      bg: Colors.secondaryContainer,
      text: Colors.onSecondaryContainer,
    },
    correct: {
      border: Colors.success,
      bg: '#e8f5e9', // Light success tint
      text: Colors.success,
    },
    wrong: {
      border: Colors.error,
      bg: '#ffebee', // Light error tint
      text: Colors.error,
    },
  }[state];

  return (
    <Animated.View 
      entering={ZoomIn.springify().delay(index * 50)}
      layout={Layout.springify()}
      style={styles.matchItemWrapper}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || isCorrect}
      >
        <Animated.View
          style={[
            styles.matchItem,
            animatedStyle,
            {
              backgroundColor: colors.bg,
              borderColor: colors.border,
            },
          ]}
        >
          {isCorrect && (
            <View style={styles.badge}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            </View>
          )}
          {isWrong && (
            <View style={styles.badge}>
              <Ionicons name="close-circle" size={20} color={Colors.error} />
            </View>
          )}
          <Text
            style={[styles.matchItemText, { color: colors.text }]}
            numberOfLines={2}
            adjustsFontSizeToFit
          >
            {String(label)}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

// ─── BulkyButton: Custom internal button component ───
const BulkyButton = ({ label, icon, onPress, disabled, type = 'secondary', style }) => {
  const translateY = useSharedValue(0);
  const bottomWidth = useSharedValue(4);

  const colors = {
    primary: {
      bg: Colors.tertiary,
      border: '#004d1e',
      text: '#fff',
    },
    secondary: {
      bg: Colors.surface,
      border: Colors.outlineVariant,
      text: Colors.onSurface,
    },
  }[type];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    borderBottomWidth: bottomWidth.value,
  }));

  const handlePressIn = () => {
    if (disabled) return;
    translateY.value = withSpring(2);
    bottomWidth.value = withSpring(2);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePressOut = () => {
    translateY.value = withSpring(0);
    bottomWidth.value = withSpring(4);
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[{ flex: 1 }, style]}
    >
      <Animated.View
        style={[
          styles.bulkyBtn,
          animatedStyle,
          { backgroundColor: colors.bg, borderColor: colors.border },
          disabled && styles.disabledBtn
        ]}
      >
        {icon && <Ionicons name={icon} size={20} color={disabled ? Colors.onSurfaceVariant : colors.text} />}
        <Text style={[
          styles.bulkyBtnText, 
          { color: colors.text },
          disabled && { color: Colors.onSurfaceVariant, opacity: 0.5 }
        ]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
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
    setSelectedLeft(prev => prev === pairIndex ? null : pairIndex);
  }, [answered, showErrors]);

  const handleRightTap = useCallback((rightPairIndex) => {
    if (answered || selectedLeft === null || showErrors) return;

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

  // Dynamic instruction text
  const instructionHint = answered
    ? '✅ All matched!'
    : showErrors
      ? '❌ Try again!'
      : selectedLeft !== null
        ? 'Now tap its match →'
        : 'Tap a tile on the left to begin';

  return (
    <View style={styles.container}>

      {/* ── Dynamic Instruction Hint ── */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.hintContainer}>
        <Text style={styles.instructionHint}>{instructionHint}</Text>
      </Animated.View>

      {/* ── Match Columns ── */}
      <View style={styles.columnsContainer}>
        {/* Left Column */}
        <View style={styles.column}>
          {leftItems.map((item, idx) => {
            const rightId = userMatches[item.pairIndex];
            const isLinked = rightId !== undefined;
            const isCorrect = answered && isLinked && item.pairIndex === rightId;
            const isWrong = showErrors && isLinked && item.pairIndex !== rightId;
            const isSelected = selectedLeft === item.pairIndex;

            return (
              <MatchItem
                key={`left-${item.pairIndex}`}
                label={item.left}
                index={idx}
                side="left"
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
          {rightItems.map((item, idx) => {
            const leftId = Object.keys(userMatches).find(key => userMatches[key] === item.pairIndex);
            const isLinked = leftId !== undefined;
            const isCorrect = answered && isLinked && parseInt(leftId) === item.pairIndex;
            const isWrong = showErrors && isLinked && parseInt(leftId) !== item.pairIndex;

            return (
              <MatchItem
                key={`right-${item.pairIndex}`}
                label={item.right}
                index={idx}
                side="right"
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
        <Animated.View entering={FadeIn.delay(300)} style={styles.controlsContainer}>
          <BulkyButton
            label="Reset"
            icon="refresh"
            type="secondary"
            onPress={handleReset}
            disabled={matchedCount === 0 || showErrors}
          />

          <BulkyButton
            label="Check Match"
            type="primary"
            onPress={handleCheckAnswer}
            disabled={!isReadyToCheck || showErrors}
            style={{ flex: 1.5 }}
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  // ─── Dynamic Hint ───
  hintContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  instructionHint: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 15,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },

  // ─── Match Grid ───
  columnsContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 12,
  },
  matchItemWrapper: {
    width: '100%',
  },
  matchItem: {
    minHeight: SCREEN_HEIGHT * 0.08,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  matchItemText: {
    fontFamily: 'Lexend-Bold',
    fontSize: SCREEN_HEIGHT * 0.02,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    zIndex: 2,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },

  // ─── Footer Controls ───
  controlsContainer: {
    flexDirection: 'column',
    gap: 12,
    paddingTop: 24,
    paddingBottom: 16,
  },

  bulkyBtn: {
    height: 60,
    borderRadius: 16,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bulkyBtnText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  disabledBtn: {
    backgroundColor: Colors.surfaceContainerHighest,
    borderColor: Colors.outlineVariant,
  },
});

export default MatcherEngine;

