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
 */

import { View, Text, StyleSheet } from 'react-native';
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

const GRID_COLS = 5;
const GRID_ROWS = 5;
const DOT_HIT_SIZE = 44;    // touchable area (larger than visual for child UX)
const DOT_VISUAL_SIZE = 18; // rendered circle diameter
const CANVAS_PADDING = 30;  // distance from canvas edge to outermost dot centres

// ─── Shape configuration ─────────────────────────────────────────────────────

const SHAPE_CONFIG = {
  triangle:  { requiredDots: 3, label: 'Triangle',  accentColor: '#5C6BC0' },
  square:    { requiredDots: 4, label: 'Square',    accentColor: '#EF6C00' },
  rectangle: { requiredDots: 4, label: 'Rectangle', accentColor: '#2E7D32' },
};

// Guided-mode hint — a pre-defined valid example for each shape (col, row)
const HINT_VERTICES = {
  triangle:  [{ col: 2, row: 0 }, { col: 4, row: 4 }, { col: 0, row: 4 }],
  square:    [{ col: 1, row: 1 }, { col: 3, row: 1 }, { col: 3, row: 3 }, { col: 1, row: 3 }],
  rectangle: [{ col: 0, row: 1 }, { col: 4, row: 1 }, { col: 4, row: 3 }, { col: 0, row: 3 }],
};

// ─── Geometry helpers (all arithmetic on integers — no floating-point errors) ─

// Squared Euclidean distance between two grid dots
const lenSq = (a, b) => (b.col - a.col) ** 2 + (b.row - a.row) ** 2;

// 2D cross product of vectors AB and AC — non-zero means A, B, C are not collinear
const cross2D = (A, B, C) =>
  (B.col - A.col) * (C.row - A.row) - (B.row - A.row) * (C.col - A.col);

// Sort 4 vertices counter-clockwise by angle from their centroid
const orderVertices = (dots) => {
  const cx = (dots[0].col + dots[1].col + dots[2].col + dots[3].col) / 4;
  const cy = (dots[0].row + dots[1].row + dots[2].row + dots[3].row) / 4;
  return [...dots].sort(
    (a, b) => Math.atan2(a.row - cy, a.col - cx) - Math.atan2(b.row - cy, b.col - cx)
  );
};

// Returns true when the selected dots form the target shape
const validateShape = (dots, targetShape) => {
  const config = SHAPE_CONFIG[targetShape];
  if (!config || dots.length !== config.requiredDots) return false;

  switch (targetShape) {
    case 'triangle':
      // Three dots that are NOT collinear
      return cross2D(dots[0], dots[1], dots[2]) !== 0;

    case 'rectangle':
    case 'square': {
      // Order vertices, then verify all 4 interior angles are exactly 90°
      // (dot product of consecutive edge vectors equals zero for perpendicular vectors)
      const ord = orderVertices(dots);
      for (let i = 0; i < 4; i++) {
        const A = ord[i],         B = ord[(i + 1) % 4], C = ord[(i + 2) % 4];
        const ABx = B.col - A.col, ABy = B.row - A.row;
        const BCx = C.col - B.col, BCy = C.row - B.row;
        if (ABx * BCx + ABy * BCy !== 0) return false;
      }
      // For square: additionally require all four sides to be equal
      if (targetShape === 'square') {
        const sides = ord.map((v, i) => lenSq(v, ord[(i + 1) % 4]));
        if (!sides.every(s => s === sides[0])) return false;
      }
      return true;
    }

    default: return false;
  }
};

// ─── DotNode ──────────────────────────────────────────────────────────────────

// 'idle' | 'first' | 'selected'
const DOT_COLORS = {
  idle:     Colors.surfaceContainerHighest,
  first:    Colors.primary,
  selected: '#AB47BC',
};

const DotNode = ({ col, row, dotState, orderNum, position, onPress, disabled }) => {
  const scale = useSharedValue(1);

  // IMPORTANT: no `entering` prop on this Animated.View — it already carries
  // animatedStyle with a transform, and mixing both causes a Reanimated conflict.
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const tap = Gesture.Tap()
    .onBegin(() => { scale.value = withSpring(0.72, { damping: 8, stiffness: 450 }); })
    .onEnd(() => { runOnJS(onPress)(col, row); })
    .onFinalize(() => { scale.value = withSpring(1, { damping: 10, stiffness: 320 }); })
    .enabled(!disabled);

  const isActive = dotState !== 'idle';
  const bgColor = DOT_COLORS[dotState] ?? DOT_COLORS.idle;

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
            { backgroundColor: bgColor },
            isActive && styles.dotActive,
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
  const { requiredDots, label, accentColor } = config;
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
      // Brief pause so the student can see the last dot placed, then auto-close
      setTimeout(() => setIsClosed(true), 180);
    }
  };

  const handleUndo = () => {
    if (answered || isClosed || selectedDots.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    if (isClosed)                     return 'Tap "Check Shape" when ready!';
    if (selectedDots.length > 0)      return `${selectedDots.length} of ${requiredDots} dots placed.`;
    return `Tap ${requiredDots} dots to form a ${label.toLowerCase()}.`;
  };

  // ── Gesture objects ────────────────────────────────────────────────────────

  const undoTap = Gesture.Tap()
    .enabled(!answered && !isClosed && selectedDots.length > 0)
    .onEnd(() => runOnJS(handleUndo)());

  const resetTap = Gesture.Tap()
    .enabled(!answered && selectedDots.length > 0)
    .onEnd(() => runOnJS(handleReset)());

  const checkTap = Gesture.Tap()
    .enabled(isClosed && !answered)
    .onEnd(() => runOnJS(handleCheck)());

  // ── SVG data derivation ────────────────────────────────────────────────────

  const lineColor = answered
    ? (isCorrectResult ? Colors.success : Colors.error)
    : accentColor;

  // Segment lines between consecutive selected dots
  const lineSegments = selectedDots.length >= 2
    ? selectedDots.slice(1).map((dot, i) => ({
        from: getDotPos(selectedDots[i].col, selectedDots[i].row),
        to:   getDotPos(dot.col, dot.row),
      }))
    : [];

  // Closing line from last selected dot back to first
  const closingLine = isClosed && selectedDots.length >= 3
    ? {
        from: getDotPos(
          selectedDots[selectedDots.length - 1].col,
          selectedDots[selectedDots.length - 1].row
        ),
        to: getDotPos(selectedDots[0].col, selectedDots[0].row),
      }
    : null;

  // Filled result polygon (shown after Check is tapped)
  const fillPolyPoints = answered && isClosed && selectedDots.length >= 3
    ? selectedDots.map(d => { const p = getDotPos(d.col, d.row); return `${p.x},${p.y}`; }).join(' ')
    : null;

  // Guided-mode hint polygon
  const hintPolyPoints = hintVerts
    ? hintVerts.map(v => { const p = getDotPos(v.col, v.row); return `${p.x},${p.y}`; }).join(' ')
    : null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>

      {/* Goal badge */}
      <Animated.View entering={FadeIn.delay(100)} style={styles.goalBadge}>
        <Text style={[styles.goalBadgeText, { color: accentColor }]}>
          Draw a {label}  ({requiredDots} dots)
        </Text>
      </Animated.View>

      {/* Dynamic instruction */}
      <Animated.Text
        entering={FadeIn.delay(180)}
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
                    strokeWidth={2}
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
                    strokeWidth={3.5}
                    strokeLinecap="round"
                  />
                ))}

                {/* Closing line: last selected dot → first selected dot */}
                {closingLine && (
                  <Line
                    x1={closingLine.from.x} y1={closingLine.from.y}
                    x2={closingLine.to.x}   y2={closingLine.to.y}
                    stroke={lineColor}
                    strokeWidth={3.5}
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
                    strokeWidth={3.5}
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

      {/* ── Footer controls ── */}
      <View style={styles.footer}>

        {/* Undo — visible while shape is open and ≥1 dot placed */}
        {!isClosed && selectedDots.length > 0 && !answered && (
          <GestureDetector gesture={undoTap}>
            <Animated.View entering={FadeIn} style={styles.undoButton}>
              <Ionicons name="arrow-undo" size={18} color="#FFF" />
              <Text style={styles.footerBtnText}>Undo</Text>
            </Animated.View>
          </GestureDetector>
        )}

        {/* Reset — visible while ≥1 dot placed and not yet answered */}
        {selectedDots.length > 0 && !answered && (
          <GestureDetector gesture={resetTap}>
            <Animated.View entering={FadeIn} style={styles.resetButton}>
              <Ionicons name="refresh" size={18} color="#FFF" />
              <Text style={styles.footerBtnText}>Reset</Text>
            </Animated.View>
          </GestureDetector>
        )}

        {/* Check Shape — appears when the shape auto-closes */}
        {isClosed && !answered && (
          <GestureDetector gesture={checkTap}>
            <Animated.View entering={ZoomIn.springify()} style={styles.checkButton}>
              <Ionicons name="checkmark-circle" size={22} color="#FFF" />
              <Text style={styles.checkBtnText}>Check Shape</Text>
            </Animated.View>
          </GestureDetector>
        )}

      </View>
    </View>
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
  goalBadge: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  goalBadgeText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 15,
  },
  instructionText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  canvas: {
    flex: 1,
    width: '100%',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    position: 'relative',
    overflow: 'hidden',
  },
  dotHitArea: {
    width: DOT_HIT_SIZE,
    height: DOT_HIT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: DOT_VISUAL_SIZE,
    height: DOT_VISUAL_SIZE,
    borderRadius: DOT_VISUAL_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    width: DOT_VISUAL_SIZE + 6,
    height: DOT_VISUAL_SIZE + 6,
    borderRadius: (DOT_VISUAL_SIZE + 6) / 2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  dotLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 9,
    color: '#FFFFFF',
    lineHeight: 11,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 54,
    paddingBottom: 4,
    width: '100%',
  },
  undoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: Colors.secondary,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: '#78909C',
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 20,
    backgroundColor: Colors.success,
    minHeight: 44,
    minWidth: 44,
  },
  footerBtnText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  checkBtnText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});

export default GeoboardEngine;
