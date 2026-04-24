import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  ZoomIn,
  FadeIn,
} from 'react-native-reanimated';
import Svg, { Circle, Path, Rect, Line, ClipPath, Defs, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import speechManager from '@/utils/speechManager';

const SHAPE_SIZE = 180;
const SHADE_COLOR = '#F48FB1';
const STROKE_COLOR = '#AD1457';
const STROKE_WIDTH = 3;

// ─── SVG Fraction Diagrams ───────────────────────────────────────────────────

const CircleHalf = () => {
  const r = SHAPE_SIZE / 2;
  const cx = r;
  const cy = r;
  return (
    <Svg width={SHAPE_SIZE} height={SHAPE_SIZE}>
      <Defs>
        <ClipPath id="circle-clip-half">
          <Circle cx={cx} cy={cy} r={r - STROKE_WIDTH / 2} />
        </ClipPath>
      </Defs>
      <Circle cx={cx} cy={cy} r={r - STROKE_WIDTH / 2} fill="transparent" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
      {/* Top half shaded */}
      <Rect
        x={0} y={0} width={SHAPE_SIZE} height={r}
        fill={SHADE_COLOR}
        clipPath="url(#circle-clip-half)"
      />
      {/* Diameter line */}
      <Line x1={0} y1={cy} x2={SHAPE_SIZE} y2={cy} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
    </Svg>
  );
};

const CircleQuarter = () => {
  const r = SHAPE_SIZE / 2;
  const cx = r;
  const cy = r;
  return (
    <Svg width={SHAPE_SIZE} height={SHAPE_SIZE}>
      <Defs>
        <ClipPath id="circle-clip-quarter">
          <Circle cx={cx} cy={cy} r={r - STROKE_WIDTH / 2} />
        </ClipPath>
      </Defs>
      <Circle cx={cx} cy={cy} r={r - STROKE_WIDTH / 2} fill="transparent" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
      {/* Top-right quarter shaded */}
      <Rect
        x={cx} y={0} width={r} height={r}
        fill={SHADE_COLOR}
        clipPath="url(#circle-clip-quarter)"
      />
      {/* Cross lines */}
      <Line x1={cx} y1={0} x2={cx} y2={SHAPE_SIZE} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
      <Line x1={0} y1={cy} x2={SHAPE_SIZE} y2={cy} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
    </Svg>
  );
};

const SquareHalf = () => (
  <Svg width={SHAPE_SIZE} height={SHAPE_SIZE}>
    <Rect x={STROKE_WIDTH / 2} y={STROKE_WIDTH / 2} width={SHAPE_SIZE - STROKE_WIDTH} height={SHAPE_SIZE - STROKE_WIDTH} fill="transparent" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
    {/* Left half shaded */}
    <Rect x={STROKE_WIDTH / 2} y={STROKE_WIDTH / 2} width={(SHAPE_SIZE - STROKE_WIDTH) / 2} height={SHAPE_SIZE - STROKE_WIDTH} fill={SHADE_COLOR} />
    {/* Midline */}
    <Line x1={SHAPE_SIZE / 2} y1={0} x2={SHAPE_SIZE / 2} y2={SHAPE_SIZE} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
  </Svg>
);

const SquareQuarter = () => (
  <Svg width={SHAPE_SIZE} height={SHAPE_SIZE}>
    <Rect x={STROKE_WIDTH / 2} y={STROKE_WIDTH / 2} width={SHAPE_SIZE - STROKE_WIDTH} height={SHAPE_SIZE - STROKE_WIDTH} fill="transparent" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
    {/* Top-left quarter shaded */}
    <Rect x={STROKE_WIDTH / 2} y={STROKE_WIDTH / 2} width={(SHAPE_SIZE - STROKE_WIDTH) / 2} height={(SHAPE_SIZE - STROKE_WIDTH) / 2} fill={SHADE_COLOR} />
    {/* Cross lines */}
    <Line x1={SHAPE_SIZE / 2} y1={0} x2={SHAPE_SIZE / 2} y2={SHAPE_SIZE} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
    <Line x1={0} y1={SHAPE_SIZE / 2} x2={SHAPE_SIZE} y2={SHAPE_SIZE / 2} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
  </Svg>
);

const RectHalf = () => {
  const W = SHAPE_SIZE;
  const H = SHAPE_SIZE * 0.55;
  return (
    <Svg width={W} height={H}>
      <Rect x={STROKE_WIDTH / 2} y={STROKE_WIDTH / 2} width={W - STROKE_WIDTH} height={H - STROKE_WIDTH} fill="transparent" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
      {/* Left half shaded */}
      <Rect x={STROKE_WIDTH / 2} y={STROKE_WIDTH / 2} width={(W - STROKE_WIDTH) / 2} height={H - STROKE_WIDTH} fill={SHADE_COLOR} />
      {/* Midline */}
      <Line x1={W / 2} y1={0} x2={W / 2} y2={H} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
    </Svg>
  );
};

const RectQuarter = () => {
  const W = SHAPE_SIZE;
  const H = SHAPE_SIZE * 0.55;
  const segW = (W - STROKE_WIDTH) / 4;
  return (
    <Svg width={W} height={H}>
      <Rect x={STROKE_WIDTH / 2} y={STROKE_WIDTH / 2} width={W - STROKE_WIDTH} height={H - STROKE_WIDTH} fill="transparent" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
      {/* First quarter shaded */}
      <Rect x={STROKE_WIDTH / 2} y={STROKE_WIDTH / 2} width={segW} height={H - STROKE_WIDTH} fill={SHADE_COLOR} />
      {/* Division lines */}
      <Line x1={STROKE_WIDTH / 2 + segW} y1={0} x2={STROKE_WIDTH / 2 + segW} y2={H} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
      <Line x1={STROKE_WIDTH / 2 + segW * 2} y1={0} x2={STROKE_WIDTH / 2 + segW * 2} y2={H} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
      <Line x1={STROKE_WIDTH / 2 + segW * 3} y1={0} x2={STROKE_WIDTH / 2 + segW * 3} y2={H} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
    </Svg>
  );
};

const SHAPE_MAP = {
  'circle-1/2': CircleHalf,
  'circle-1/4': CircleQuarter,
  'square-1/2': SquareHalf,
  'square-1/4': SquareQuarter,
  'rectangle-1/2': RectHalf,
  'rectangle-1/4': RectQuarter,
};

// ─── OptionButton ────────────────────────────────────────────────────────────

const OptionButton = ({ label, index, isSelected, evaluation, disabled, onPress }) => {
  const translateY = useSharedValue(0);
  const bottomWidth = useSharedValue(6);

  const state = evaluation || (isSelected ? 'selected' : 'idle');

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    borderBottomWidth: bottomWidth.value,
  }));

  const handlePressIn = () => {
    if (disabled) return;
    translateY.value = withSpring(4, { damping: 15, stiffness: 300 });
    bottomWidth.value = withSpring(2, { damping: 15, stiffness: 300 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    if (disabled) return;
    translateY.value = withSpring(0, { damping: 15, stiffness: 300 });
    bottomWidth.value = withSpring(6, { damping: 15, stiffness: 300 });
  };

  const colors = {
    idle:     { border: Colors.outlineVariant,        bg: Colors.surfaceContainerLowest, text: Colors.onSurface },
    selected: { border: Colors.secondary,              bg: Colors.secondaryContainer,     text: Colors.onSecondaryContainer },
    correct:  { border: Colors.success,                bg: '#e8f5e9',                     text: Colors.success },
    wrong:    { border: Colors.error,                  bg: '#ffebee',                     text: Colors.error },
  }[state];

  return (
    <Animated.View entering={ZoomIn.springify().delay(index * 100)} style={styles.optionWrapper}>
      <Pressable onPress={() => !disabled && onPress(label)} onPressIn={handlePressIn} onPressOut={handlePressOut} disabled={disabled}>
        <Animated.View style={[styles.optionButton, animatedStyle, { backgroundColor: colors.bg, borderColor: colors.border }]}>
          <Text style={[styles.optionText, { color: colors.text }]}>{String(label)}</Text>
          {state === 'correct' && <Ionicons name="checkmark-circle" size={24} color={Colors.success} style={styles.badge} />}
          {state === 'wrong'   && <Ionicons name="close-circle"     size={24} color={Colors.error}   style={styles.badge} />}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

// ─── CheckButton ─────────────────────────────────────────────────────────────

const CheckButton = ({ onPress, disabled, label = 'CHECK' }) => {
  const translateY = useSharedValue(0);
  const bottomWidth = useSharedValue(6);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    borderBottomWidth: bottomWidth.value,
  }));

  const handlePressIn = () => {
    if (disabled) return;
    translateY.value = withSpring(4);
    bottomWidth.value = withSpring(2);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePressOut = () => {
    translateY.value = withSpring(0);
    bottomWidth.value = withSpring(6);
  };

  return (
    <View style={styles.checkButtonContainer}>
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} disabled={disabled} style={{ width: '100%' }}>
        <Animated.View style={[styles.checkButton, animatedStyle, disabled && styles.checkButtonDisabled]}>
          <Text style={[styles.checkButtonText, disabled && styles.checkButtonTextDisabled]}>{label}</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
};

// ─── FractionShapeEngine ─────────────────────────────────────────────────────

const FractionShapeEngine = ({ data, onResult }) => {
  const { question: questionText, answer, metadata = {} } = data;
  const { shape = 'circle', fraction = '1/2', options = [] } = metadata;

  const [selectedOption, setSelectedOption] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [resolved, setResolved] = useState(false);

  const shuffledOptions = useMemo(() => [...options].sort(() => Math.random() - 0.5), [data]);

  const ShapeDiagram = SHAPE_MAP[`${shape}-${fraction}`] || CircleHalf;

  useEffect(() => {
    setSelectedOption(null);
    setEvaluation(null);
    setResolved(false);
  }, [data]);

  useEffect(() => {
    if (questionText) {
      const timer = setTimeout(() => speechManager.speakInstruction(questionText), 400);
      return () => { clearTimeout(timer); speechManager.stop(); };
    }
  }, [questionText]);

  const handleCheck = () => {
    if (!selectedOption || resolved) return;

    const isCorrect = String(selectedOption).toLowerCase().trim() === String(answer).toLowerCase().trim();

    if (isCorrect) {
      setEvaluation('correct');
      setResolved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      speechManager.speakFeedback('Correct!', true);
      setTimeout(() => onResult(true, [String(selectedOption)]), 800);
    } else {
      setEvaluation('wrong');
      setResolved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      speechManager.speakFeedback('Try again!', false);
      setTimeout(() => onResult(false, [String(selectedOption)]), 1000);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(400)} style={styles.shapeContainer}>
        <ShapeDiagram />
        <Text style={styles.fractionLabel}>{fraction}</Text>
      </Animated.View>

      <View style={styles.optionsList}>
        {shuffledOptions.map((opt, idx) => (
          <OptionButton
            key={`${idx}-${opt}`}
            label={opt}
            index={idx}
            isSelected={selectedOption === opt}
            evaluation={selectedOption === opt ? evaluation : null}
            disabled={resolved}
            onPress={setSelectedOption}
          />
        ))}
      </View>

      <CheckButton
        onPress={handleCheck}
        disabled={!selectedOption || resolved || !!evaluation}
        label={resolved ? 'AWESOME!' : 'CHECK'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  shapeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  fractionLabel: {
    fontFamily: 'Lexend-Bold',
    fontSize: 28,
    color: Colors.onSurface,
    letterSpacing: 1,
  },
  optionsList: {
    gap: 16,
  },
  optionWrapper: {
    width: '100%',
  },
  optionButton: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  optionText: {
    fontFamily: 'Lexend-Medium',
    fontSize: 20,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    right: 16,
  },
  checkButtonContainer: {
    width: '100%',
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

export default FractionShapeEngine;
