/**
 * GeoboardEngine — Shape Drawing on a Dot Grid
 *
 * Students freely tap dots on a 5×5 grid to connect them and form a target
 * shape (triangle, square, rectangle). Unlike ConnectTheDotsEngine (numbered
 * order) or ShapeTracerEngine (trace a fixed path), here the student *chooses*
 * which dots to connect — the answer is validated by integer-grid geometry.
 *
 * Data contract (from Orchestrator `data` prop):
 *   {
 *     question:  "Draw a triangle on the dot board!",
 *     shape:     "triangle" | "square" | "rectangle",
 *     traceMode: "free" | "guided",
 *     answer:    "triangle"   // same as shape, consumed by ResultModal
 *   }
 *
 * Props: { data, onResult } — standard Orchestrator API
 *
 * Design: Tactile Bulky / Duolingo-style — no shadows, Tonal Layering,
 *         mechanical sinking buttons via translateY + borderBottomWidth.
 */

import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  ZoomIn,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Line, Polygon } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import speechManager from '@/utils/speechManager';

// ─── Grid constants ──────────────────────────────────────────────────────────

const GRID_COLS = 3;
const GRID_ROWS = 3;
const DOT_HIT_SIZE = 48;    // touchable area (larger than visual for child UX)
const DOT_VISUAL_SIZE = 20; // rendered circle diameter
const CANVAS_PADDING = 32;  // distance from canvas edge to outermost dot centres

// ─── Shape configuration ─────────────────────────────────────────────────────

const SHAPE_CONFIG = {
  triangle:  { requiredDots: 3, label: 'Triangle',  emoji: '▲', accentColor: Colors.secondary,  accentBorder: '#003d8f' },
  square:    { requiredDots: 4, label: 'Square',    emoji: '■', accentColor: '#EF6C00',          accentBorder: '#b34e00' },
  rectangle: { requiredDots: 4, label: 'Rectangle', emoji: '▬', accentColor: Colors.tertiary,   accentBorder: '#00531e' },
};

// Guided-mode hint — a pre-defined valid example for each shape (col, row)
const HINT_VERTICES = {
  triangle:  [{ col: 1, row: 0 }, { col: 2, row: 2 }, { col: 0, row: 2 }],
  square:    [{ col: 0, row: 0 }, { col: 2, row: 0 }, { col: 2, row: 2 }, { col: 0, row: 2 }],
  rectangle: [{ col: 0, row: 0 }, { col: 2, row: 0 }, { col: 2, row: 1 }, { col: 0, row: 1 }],
};

// ─── Geometry helpers (all arithmetic on integers — no floating-point errors) ─

const lenSq = (a, b) => (b.col - a.col) ** 2 + (b.row - a.row) ** 2;

const cross2D = (A, B, C) =>
  (B.col - A.col) * (C.row - A.row) - (B.row - A.row) * (C.col - A.col);

/** Remove colinear "redundant" intermediate dots from the closed loop. */
const simplifyPath = (dots) => {
  if (dots.length < 3) return dots;
  const simplified = [];
  for (let i = 0; i < dots.length; i++) {
    const prev = dots[(i - 1 + dots.length) % dots.length];
    const curr = dots[i];
    const next = dots[(i + 1) % dots.length];
    if (cross2D(prev, curr, next) !== 0) simplified.push(curr);
  }
  return simplified;
};

const orderVertices = (dots) => {
  const cx = dots.reduce((s, d) => s + d.col, 0) / dots.length;
  const cy = dots.reduce((s, d) => s + d.row, 0) / dots.length;
  return [...dots].sort(
    (a, b) => Math.atan2(a.row - cy, a.col - cx) - Math.atan2(b.row - cy, b.col - cx)
  );
};

const validateShape = (rawDots, targetShape) => {
  const dots = simplifyPath(rawDots);
  const config = SHAPE_CONFIG[targetShape];
  if (!config || dots.length !== config.requiredDots) return false;

  switch (targetShape) {
    case 'triangle':
      return cross2D(dots[0], dots[1], dots[2]) !== 0;

    case 'rectangle':
    case 'square': {
      const ord = orderVertices(dots);
      for (let i = 0; i < 4; i++) {
        const A = ord[i], B = ord[(i + 1) % 4], C = ord[(i + 2) % 4];
        const ABx = B.col - A.col, ABy = B.row - A.row;
        const BCx = C.col - B.col, BCy = C.row - B.row;
        if (ABx * BCx + ABy * BCy !== 0) return false;
      }
      if (targetShape === 'square') {
        const sides = ord.map((v, i) => lenSq(v, ord[(i + 1) % 4]));
        if (!sides.every(s => s === sides[0])) return false;
      }
      return true;
    }

    default: return false;
  }
};

// ─── TactileFooterButton ──────────────────────────────────────────────────────

/**
 * Reusable Tactile Bulky button following the MathSync sinking mechanic.
 * Idle:   translateY=0, borderBottomWidth=6
 * Pressed: translateY=4, borderBottomWidth=2
 */
const TactileFooterButton = ({
  onPress,
  label,
  iconName,
  bgColor,
  borderColor,
  fullWidth = false,
  disabled = false,
}) => {
  const translateY = useSharedValue(0);
  const bottomWidth = useSharedValue(6);

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
    translateY.value = withSpring(0, { damping: 15, stiffness: 300 });
    bottomWidth.value = withSpring(6, { damping: 15, stiffness: 300 });
  };

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={fullWidth ? { width: '100%' } : undefined}
    >
      <Animated.View
        style={[
          styles.tactileButton,
          fullWidth && styles.tactileButtonFull,
          { backgroundColor: bgColor, borderColor },
          animatedStyle,
          disabled && styles.tactileButtonDisabled,
        ]}
      >
        {iconName && <Ionicons name={iconName} size={18} color={Colors.onPrimary} />}
        <Text style={[
          styles.tactileButtonText,
          fullWidth && styles.tactileButtonTextFull,
        ]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

// ─── DotProgressBar ───────────────────────────────────────────────────────────

/** Visual dot-count tracker — filled circles for placed, outlined for remaining. */
const DotProgressBar = ({ placed, required, accentColor }) => {
  return (
    <View style={styles.progressBar}>
      {Array.from({ length: required }, (_, i) => {
        const isFilled = i < placed;
        return (
          <Animated.View
            key={i}
            entering={isFilled ? ZoomIn.springify().damping(14) : undefined}
            style={[
              styles.progressDot,
              isFilled
                ? { backgroundColor: accentColor, borderColor: accentColor }
                : { backgroundColor: 'transparent', borderColor: Colors.outlineVariant },
            ]}
          />
        );
      })}
    </View>
  );
};

// ─── DotNode ──────────────────────────────────────────────────────────────────

// 'idle' | 'first' | 'selected'
const DOT_BG = {
  idle:     Colors.surfaceContainerHigh,
  first:    Colors.primary,
  selected: Colors.secondary,
};
const DOT_BORDER = {
  idle:     Colors.outlineVariant,
  first:    Colors.onPrimaryContainer,
  selected: Colors.onSecondaryContainer,
};

const DotNode = ({ col, row, dotState, orderNum, position, onPress, disabled }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const tap = Gesture.Tap()
    .onBegin(() => { scale.value = withSpring(0.70, { damping: 8, stiffness: 450 }); })
    .onEnd(() => { runOnJS(onPress)(col, row); })
    .onFinalize(() => { scale.value = withSpring(1, { damping: 10, stiffness: 320 }); })
    .enabled(!disabled);

  const isActive = dotState !== 'idle';
  const bgColor = DOT_BG[dotState] ?? DOT_BG.idle;
  const borderColor = DOT_BORDER[dotState] ?? DOT_BORDER.idle;
  const visualSize = isActive ? DOT_VISUAL_SIZE + 8 : DOT_VISUAL_SIZE;

  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        style={[
          styles.dotHitArea,
          {
            position: 'absolute',
            left: position.x - DOT_HIT_SIZE / 2,
            top: position.y - DOT_HIT_SIZE / 2,
          },
          animatedStyle,
        ]}
      >
        <View
          style={[
            styles.dot,
            {
              width: visualSize,
              height: visualSize,
              borderRadius: visualSize / 2,
              backgroundColor: bgColor,
              borderColor,
              borderWidth: isActive ? 2.5 : 1.5,
            },
          ]}
        >
          {orderNum !== null && (
            <Text style={styles.dotLabel}>{orderNum}</Text>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

// ─── GeoboardEngine ──────────────────────────────────────────────────────────

const GeoboardEngine = ({ data, onResult }) => {
  const { question: questionText, shape = 'triangle', traceMode = 'free' } = data;
  const config = SHAPE_CONFIG[shape] ?? SHAPE_CONFIG.triangle;
  const { requiredDots, label, emoji, accentColor, accentBorder } = config;
  const hintVerts = traceMode === 'guided' ? (HINT_VERTICES[shape] ?? null) : null;

  const [selectedDots, setSelectedDots] = useState([]);  // { col, row }[]
  const [isClosed, setIsClosed]         = useState(false);
  const [answered, setAnswered]         = useState(false);
  const [isCorrectResult, setIsCorrectResult] = useState(false);
  const [canvasSize, setCanvasSize]     = useState({ width: 0, height: 0 });

  // Full reset whenever the question data changes (also covered by key= in Orchestrator)
  useEffect(() => {
    setSelectedDots([]);
    setIsClosed(false);
    setAnswered(false);
    setIsCorrectResult(false);
  }, [data]);

  // Speak the question prompt
  useEffect(() => {
    if (!questionText) return;
    const timer = setTimeout(() => speechManager.speakInstruction(questionText), 400);
    return () => { clearTimeout(timer); speechManager.stop(); };
  }, [questionText]);

  // Convert (col, row) grid address → pixel centre within the canvas
  const getDotPos = useCallback((col, row) => {
    const { width, height } = canvasSize;
    if (!width || !height) return { x: 0, y: 0 };
    const stepX = (width  - 2 * CANVAS_PADDING) / (GRID_COLS - 1);
    const stepY = (height - 2 * CANVAS_PADDING) / (GRID_ROWS - 1);
    return {
      x: CANVAS_PADDING + col * stepX,
      y: CANVAS_PADDING + row * stepY,
    };
  }, [canvasSize]);

  // ── Interaction handlers ───────────────────────────────────────────────────

  const handleDotPress = (col, row) => {
    if (answered || isClosed) return;
    if (selectedDots.some(d => d.col === col && d.row === row)) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = [...selectedDots, { col, row }];
    setSelectedDots(next);

    if (next.length === requiredDots) {
      setTimeout(() => setIsClosed(true), 180);
    }
  };

  const handleUndo = () => {
    if (answered || isClosed || selectedDots.length === 0) return;
    setSelectedDots(prev => prev.slice(0, -1));
  };

  const handleReset = () => {
    if (answered) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedDots([]);
    setIsClosed(false);
  };

  const handleCheck = () => {
    if (!isClosed || answered) return;
    const isCorrect = validateShape(selectedDots, shape);
    setAnswered(true);
    setIsCorrectResult(isCorrect);

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      speechManager.speakFeedback('Great job!', true);
      setTimeout(() => onResult(true, [shape]), 800);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      speechManager.speakFeedback('Not quite — try again!', false);
      onResult(false, [shape]);
      setTimeout(() => {
        setSelectedDots([]);
        setIsClosed(false);
        setAnswered(false);
        setIsCorrectResult(false);
      }, 1400);
    }
  };

  const getInstruction = () => {
    if (answered && isCorrectResult)  return '✅ Correct!';
    if (answered && !isCorrectResult) return 'Not quite — try again!';
    if (selectedDots.length > 0)      return `${selectedDots.length} of ${requiredDots} dots placed.`;
    return `Tap ${requiredDots} dots to form a ${label.toLowerCase()}.`;
  };

  // ── SVG data derivation ────────────────────────────────────────────────────

  const lineColor = answered
    ? (isCorrectResult ? Colors.success : Colors.error)
    : accentColor;

  const lineSegments = selectedDots.length >= 2
    ? selectedDots.slice(1).map((dot, i) => ({
        from: getDotPos(selectedDots[i].col, selectedDots[i].row),
        to:   getDotPos(dot.col, dot.row),
      }))
    : [];

  const closingLine = isClosed && selectedDots.length >= 3
    ? {
        from: getDotPos(
          selectedDots[selectedDots.length - 1].col,
          selectedDots[selectedDots.length - 1].row
        ),
        to: getDotPos(selectedDots[0].col, selectedDots[0].row),
      }
    : null;

  const fillPolyPoints = answered && isClosed && selectedDots.length >= 3
    ? selectedDots.map(d => { const p = getDotPos(d.col, d.row); return `${p.x},${p.y}`; }).join(' ')
    : null;

  const hintPolyPoints = hintVerts
    ? hintVerts.map(v => { const p = getDotPos(v.col, v.row); return `${p.x},${p.y}`; }).join(' ')
    : null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <ScrollView
      style={{ flex: 1, width: '100%' }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >

      {/* Goal badge */}
      <Animated.View entering={FadeIn.delay(100)} style={styles.goalBadge}>
        <Text style={[styles.goalBadgeEmoji]}>{emoji}</Text>
        <Text style={[styles.goalBadgeText, { color: accentColor }]}>
          Draw a {label}
        </Text>
      </Animated.View>

      {/* Dot-count progress bar */}
      <Animated.View entering={FadeIn.delay(150)}>
        <DotProgressBar
          placed={selectedDots.length}
          required={requiredDots}
          accentColor={accentColor}
        />
      </Animated.View>

      {/* Dynamic instruction */}
      <Animated.Text
        entering={FadeIn.delay(200)}
        style={[
          styles.instructionText,
          answered && isCorrectResult  && { color: Colors.success },
          answered && !isCorrectResult && { color: Colors.error },
        ]}
      >
        {getInstruction()}
      </Animated.Text>

      {/* ── Geoboard canvas ── */}
      <View
        style={styles.canvas}
        onLayout={e => setCanvasSize({
          width: e.nativeEvent.layout.width,
          height: e.nativeEvent.layout.height,
        })}
      >
        {canvasSize.width > 0 && (
          <>
            {/* SVG overlay — non-interactive, sits above canvas background */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <Svg width={canvasSize.width} height={canvasSize.height}>

                {/* Guided-mode hint silhouette (faint dashed polygon) */}
                {hintPolyPoints && (
                  <Polygon
                    points={hintPolyPoints}
                    fill="none"
                    stroke={accentColor}
                    strokeWidth={2.5}
                    strokeDasharray="8 5"
                    opacity={0.28}
                  />
                )}

                {/* Connection lines between consecutive selected dots */}
                {lineSegments.map((seg, i) => (
                  <Line
                    key={`seg-${i}`}
                    x1={seg.from.x} y1={seg.from.y}
                    x2={seg.to.x}   y2={seg.to.y}
                    stroke={lineColor}
                    strokeWidth={4.5}
                    strokeLinecap="round"
                  />
                ))}

                {/* Closing line: last selected dot → first selected dot */}
                {closingLine && (
                  <Line
                    x1={closingLine.from.x} y1={closingLine.from.y}
                    x2={closingLine.to.x}   y2={closingLine.to.y}
                    stroke={lineColor}
                    strokeWidth={4.5}
                    strokeLinecap="round"
                  />
                )}

                {/* Result fill polygon (correct = green tint, wrong = red tint) */}
                {fillPolyPoints && (
                  <Polygon
                    points={fillPolyPoints}
                    fill={isCorrectResult
                      ? 'rgba(76,175,80,0.22)'
                      : 'rgba(211,47,47,0.18)'}
                    stroke={isCorrectResult ? Colors.success : Colors.error}
                    strokeWidth={4.5}
                    strokeLinejoin="round"
                  />
                )}

              </Svg>
            </View>

            {/* 5 × 5 dot grid — absolute-positioned interactive nodes */}
            {Array.from({ length: GRID_ROWS * GRID_COLS }, (_, idx) => {
              const row = Math.floor(idx / GRID_COLS);
              const col = idx % GRID_COLS;
              const pos = getDotPos(col, row);
              const selIdx = selectedDots.findIndex(d => d.col === col && d.row === row);
              const isSelected = selIdx !== -1;
              const dotState = !isSelected ? 'idle' : selIdx === 0 ? 'first' : 'selected';

              return (
                <DotNode
                  key={`dot-${col}-${row}`}
                  col={col}
                  row={row}
                  dotState={dotState}
                  orderNum={isSelected ? selIdx + 1 : null}
                  position={pos}
                  onPress={handleDotPress}
                  disabled={answered || isClosed || isSelected}
                />
              );
            })}
          </>
        )}
      </View>

      {/* ── Footer controls ── always rendered to prevent canvas resize ── */}
      <View style={styles.footer}>

        {/* Undo & Reset — always visible, disabled when not applicable */}
        <View style={styles.secondaryActions}>
          <TactileFooterButton
            onPress={handleUndo}
            label="Undo"
            iconName="arrow-undo"
            bgColor={Colors.secondary}
            borderColor="#003d8f"
            disabled={answered || isClosed || selectedDots.length === 0}
          />
          <TactileFooterButton
            onPress={handleReset}
            label="Reset"
            iconName="refresh"
            bgColor="#546E7A"
            borderColor="#37474F"
            disabled={answered || selectedDots.length === 0}
          />
        </View>

        {/* Check Shape — always visible, disabled until shape is closed */}
        <TactileFooterButton
          onPress={handleCheck}
          label="CHECK SHAPE"
          iconName="checkmark-circle"
          bgColor={Colors.success}
          borderColor="#1b5e20"
          fullWidth
          disabled={!isClosed || answered}
        />

      </View>
    </ScrollView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },

  // ── Goal Badge ──
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: Colors.outlineVariant,
    alignSelf: 'center',
  },
  goalBadgeEmoji: {
    fontSize: 16,
  },
  goalBadgeText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 15,
  },

  // ── Progress Bar ──
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
  },
  progressDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },

  // ── Instruction Text ──
  instructionText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },

  // ── Canvas ──
  canvas: {
    flex: 1,
    width: '100%',
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: Colors.outlineVariant,
    position: 'relative',
    overflow: 'hidden',
  },

  // ── Dot Nodes ──
  dotHitArea: {
    width: DOT_HIT_SIZE,
    height: DOT_HIT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 9,
    color: Colors.onPrimary,
    lineHeight: 11,
  },

  // ── Footer ──
  footer: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
    minHeight: 54,
    paddingBottom: 4,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Tactile Buttons ──
  tactileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 6,   // overridden by Animated style at runtime
  },
  tactileButtonFull: {
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 28,
    borderRadius: 20,
    minHeight: 56,
  },
  tactileButtonDisabled: {
    opacity: 0.4,
  },
  tactileButtonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    color: Colors.onPrimary,
  },
  tactileButtonTextFull: {
    fontFamily: 'Lexend-Bold',
    fontSize: 16,
    letterSpacing: 1.1,
  },
});

export default GeoboardEngine;
