import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  ZoomIn,
  FadeIn,
  Layout,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Polygon, Rect } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import speechManager from '@/utils/speechManager';

const COMPASS_SIZE = 220;

const DIR_TO_DEG = { North: 0, East: 90, South: 180, West: 270 };
const TURN_DELTA = {
  quarter: { clockwise: 90, counterclockwise: -90 },
  half:    { clockwise: 180, counterclockwise: 180 },
};

// ─── Static compass face (circle + cardinal ticks) ───
const CompassFace = () => (
  <Svg
    width={COMPASS_SIZE}
    height={COMPASS_SIZE}
    viewBox={`0 0 ${COMPASS_SIZE} ${COMPASS_SIZE}`}
  >
    {/* Outer ring */}
    <Circle
      cx={110} cy={110} r={100}
      fill={Colors.surfaceContainerLowest}
      stroke={Colors.outlineVariant}
      strokeWidth={2}
    />
    {/* Center pin */}
    <Circle cx={110} cy={110} r={7} fill={Colors.onSurfaceVariant} />

    {/* Cardinal ticks */}
    <Line x1={110} y1={10}  x2={110} y2={28}  stroke={Colors.onSurfaceVariant} strokeWidth={3} strokeLinecap="round" />
    <Line x1={210} y1={110} x2={192} y2={110} stroke={Colors.onSurfaceVariant} strokeWidth={3} strokeLinecap="round" />
    <Line x1={110} y1={210} x2={110} y2={192} stroke={Colors.onSurfaceVariant} strokeWidth={3} strokeLinecap="round" />
    <Line x1={10}  y1={110} x2={28}  y2={110} stroke={Colors.onSurfaceVariant} strokeWidth={3} strokeLinecap="round" />

    {/* 45° diagonal ticks */}
    <Line x1={181} y1={39}  x2={172} y2={48}  stroke={Colors.outlineVariant} strokeWidth={1.5} />
    <Line x1={39}  y1={39}  x2={48}  y2={48}  stroke={Colors.outlineVariant} strokeWidth={1.5} />
    <Line x1={181} y1={181} x2={172} y2={172} stroke={Colors.outlineVariant} strokeWidth={1.5} />
    <Line x1={39}  y1={181} x2={48}  y2={172} stroke={Colors.outlineVariant} strokeWidth={1.5} />
  </Svg>
);

// ─── Arrow SVG — points North (up) from pivot at (110, 110) ───
const ArrowSvg = () => (
  <Svg
    width={COMPASS_SIZE}
    height={COMPASS_SIZE}
    viewBox={`0 0 ${COMPASS_SIZE} ${COMPASS_SIZE}`}
  >
    {/* Blue half: shaft + arrowhead pointing up */}
    <Rect x={104} y={50} width={12} height={60} rx={4} fill={Colors.secondary} />
    <Polygon points="110,22 94,58 126,58" fill={Colors.secondary} />

    {/* Orange counter-tail pointing down */}
    <Rect x={105} y={110} width={10} height={24} rx={3} fill={Colors.primary} />
    <Polygon points="110,140 101,124 119,124" fill={Colors.primary} />
  </Svg>
);

// ─── DirectionButton ───
const DirectionButton = ({ label, index, isSelected, evaluation, disabled, onPress }) => {
  const translateY = useSharedValue(0);
  const bottomWidth = useSharedValue(6);
  const shakeX = useSharedValue(0);

  const state = evaluation || (isSelected ? 'selected' : 'idle');
  const isWrong = isSelected && evaluation === 'wrong';

  const colors = {
    idle:     { border: Colors.outlineVariant,     bg: Colors.surfaceContainerLowest, text: Colors.onSurface },
    selected: { border: Colors.secondary,           bg: Colors.secondaryContainer,     text: Colors.onSecondaryContainer },
    correct:  { border: Colors.success,             bg: '#e8f5e9',                     text: Colors.success },
    wrong:    { border: Colors.error,               bg: '#ffebee',                     text: Colors.error },
  }[state];

  useEffect(() => {
    if (isWrong) {
      shakeX.value = withSequence(
        withTiming(-8, { duration: 60 }),
        withTiming(8,  { duration: 60 }),
        withTiming(-6, { duration: 50 }),
        withTiming(6,  { duration: 50 }),
        withTiming(0,  { duration: 40 }),
      );
    }
  }, [isWrong]);

  const sinkStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    borderBottomWidth: bottomWidth.value,
  }));

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  return (
    <Animated.View
      entering={ZoomIn.springify().delay(index * 80)}
      layout={Layout.springify()}
      style={styles.dirBtnWrapper}
    >
      <Animated.View style={shakeStyle}>
        <Pressable
          onPress={() => !disabled && onPress(label)}
          onPressIn={() => {
            if (disabled) return;
            translateY.value = withSpring(4, { damping: 15, stiffness: 300 });
            bottomWidth.value = withSpring(2, { damping: 15, stiffness: 300 });
          }}
          onPressOut={() => {
            if (disabled) return;
            translateY.value = withSpring(0, { damping: 15, stiffness: 300 });
            bottomWidth.value = withSpring(6, { damping: 15, stiffness: 300 });
          }}
          disabled={disabled}
        >
          <Animated.View
            style={[
              styles.dirBtn,
              sinkStyle,
              { backgroundColor: colors.bg, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.dirBtnText, { color: colors.text }]}>{label}</Text>
            {state === 'correct' && (
              <Animated.View entering={ZoomIn.springify()} style={styles.dirBadge}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
              </Animated.View>
            )}
            {state === 'wrong' && (
              <Animated.View entering={ZoomIn.springify()} style={styles.dirBadge}>
                <Ionicons name="close-circle" size={18} color={Colors.error} />
              </Animated.View>
            )}
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};

// ─── CheckButton ───
const CheckButton = ({ onPress, disabled, label = 'CHECK' }) => {
  const translateY = useSharedValue(0);
  const bottomWidth = useSharedValue(6);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    borderBottomWidth: bottomWidth.value,
  }));

  return (
    <View style={styles.checkButtonContainer}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          if (disabled) return;
          translateY.value = withSpring(4);
          bottomWidth.value = withSpring(2);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
        onPressOut={() => {
          translateY.value = withSpring(0);
          bottomWidth.value = withSpring(6);
        }}
        disabled={disabled}
        style={{ width: '100%' }}
      >
        <Animated.View
          style={[styles.checkButton, animatedStyle, disabled && styles.checkButtonDisabled]}
        >
          <Text style={[styles.checkButtonText, disabled && styles.checkButtonTextDisabled]}>
            {label}
          </Text>
        </Animated.View>
      </Pressable>
    </View>
  );
};

// ─── TurnCompassEngine ───
const TurnCompassEngine = ({ data, onResult }) => {
  const { question: questionText, answer, metadata = {} } = data;
  const {
    initialDirection = 'North',
    turnType         = 'quarter',
    turnDirection    = 'clockwise',
    options          = ['North', 'East', 'South', 'West'],
  } = metadata;

  const [selectedDirection, setSelectedDirection] = useState(null);
  const [evaluation, setEvaluation]               = useState(null);
  const [resolved, setResolved]                   = useState(false);

  const initialDeg = DIR_TO_DEG[initialDirection] ?? 0;
  const delta      = TURN_DELTA[turnType]?.[turnDirection] ?? 90;
  const finalDeg   = initialDeg + delta;

  const arrowRotation = useSharedValue(initialDeg);

  useEffect(() => {
    setSelectedDirection(null);
    setEvaluation(null);
    setResolved(false);
    arrowRotation.value = initialDeg;
    const timer = setTimeout(() => {
      arrowRotation.value = withTiming(finalDeg, {
        duration: 900,
        easing: Easing.out(Easing.cubic),
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [data]);

  useEffect(() => {
    if (!questionText) return;
    const timer = setTimeout(() => speechManager.speakInstruction(questionText), 400);
    return () => { clearTimeout(timer); speechManager.stop(); };
  }, [questionText]);

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${arrowRotation.value}deg` }],
  }));

  const turnLabel =
    `${turnType === 'quarter' ? 'Quarter' : 'Half'}-turn ${turnDirection}`;

  const handleCheck = () => {
    if (!selectedDirection || resolved) return;

    const isCorrect =
      String(selectedDirection).toLowerCase().trim() === String(answer).toLowerCase().trim();

    if (isCorrect) {
      setEvaluation('correct');
      setResolved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      speechManager.speakFeedback('Correct!', true);
      arrowRotation.value = withSequence(
        withTiming(finalDeg + 15, { duration: 120 }),
        withSpring(finalDeg, { damping: 10, stiffness: 280 }),
      );
      setTimeout(() => onResult(true, [String(selectedDirection)]), 900);
    } else {
      setEvaluation('wrong');
      setResolved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      speechManager.speakFeedback('Try again!', false);
      setTimeout(() => onResult(false, [String(selectedDirection)]), 1100);
    }
  };

  return (
    <View style={styles.container}>
      {/* Turn descriptor pill */}
      <Animated.View entering={FadeIn.delay(200)} style={styles.turnPill}>
        <Text style={styles.turnPillText}>{turnLabel}</Text>
      </Animated.View>

      {/* Compass */}
      <Animated.View entering={ZoomIn.springify().delay(80)} style={styles.compassContainer}>
        {/* Static face */}
        <CompassFace />

        {/* Rotating arrow overlay — rotates around compass center */}
        <Animated.View style={[styles.arrowOverlay, arrowStyle]}>
          <ArrowSvg />
        </Animated.View>

        {/* Cardinal labels */}
        <Text style={[styles.cardinalLabel, styles.cardinalN]}>N</Text>
        <Text style={[styles.cardinalLabel, styles.cardinalE]}>E</Text>
        <Text style={[styles.cardinalLabel, styles.cardinalS]}>S</Text>
        <Text style={[styles.cardinalLabel, styles.cardinalW]}>W</Text>
      </Animated.View>

      {/* Direction option buttons */}
      <View style={styles.dirGrid}>
        {options.map((dir, idx) => (
          <DirectionButton
            key={dir}
            label={dir}
            index={idx}
            isSelected={selectedDirection === dir}
            evaluation={selectedDirection === dir ? evaluation : null}
            disabled={resolved}
            onPress={(dir) => {
              if (resolved) return;
              setSelectedDirection(dir);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          />
        ))}
      </View>

      <CheckButton
        onPress={handleCheck}
        disabled={!selectedDirection || resolved || !!evaluation}
        label={resolved && evaluation === 'correct' ? 'AWESOME!' : 'CHECK'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  turnPill: {
    backgroundColor: Colors.secondaryContainer,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  turnPillText: {
    fontFamily: 'Lexend-SemiBold',
    fontSize: 14,
    color: Colors.onSecondaryContainer,
  },
  compassContainer: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    position: 'relative',
  },
  arrowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
  },
  cardinalLabel: {
    position: 'absolute',
    fontFamily: 'Lexend-Bold',
    fontSize: 15,
    color: Colors.onSurface,
  },
  cardinalN: { top: 2,  left: 0, right: 0, textAlign: 'center' },
  cardinalE: { right: 2, top: COMPASS_SIZE / 2 - 11 },
  cardinalS: { bottom: 2, left: 0, right: 0, textAlign: 'center' },
  cardinalW: { left: 2,  top: COMPASS_SIZE / 2 - 11 },
  dirGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    width: '100%',
    marginTop: 8,
  },
  dirBtnWrapper: {
    width: '46%',
  },
  dirBtn: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    position: 'relative',
  },
  dirBtnText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 18,
    textAlign: 'center',
  },
  dirBadge: {
    position: 'absolute',
    right: 8,
  },
  checkButtonContainer: {
    width: '100%',
    marginTop: 12,
  },
  checkButton: {
    width: '100%',
    backgroundColor: Colors.tertiary,
    borderColor: '#004d1e',
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonDisabled: {
    backgroundColor: Colors.surfaceContainerHighest,
    borderColor: Colors.outlineVariant,
  },
  checkButtonText: {
    fontFamily: 'Lexend-Black',
    fontSize: 18,
    color: '#fff',
    letterSpacing: 1.2,
  },
  checkButtonTextDisabled: {
    color: Colors.onSurfaceVariant,
    opacity: 0.5,
  },
});

export default TurnCompassEngine;
