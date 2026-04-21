/**
 * ShapeTracerEngine — Grade 1 Shape Tracing Game Engine
 *
 * Children trace 2D shape outlines (triangle, square, rectangle)
 * with their finger on an SVG canvas. The engine validates
 * tracing accuracy by dividing the shape path into small segments
 * and checking finger proximity to each segment.
 *
 * Three CRA trace modes:
 *   guided     — full dashed outline + shape label (concrete)
 *   semi_guided — faint outline, no label (pictorial)
 *   freeform   — corner dots only, no guide lines (abstract)
 *
 * Props Contract: { data, onResult } (standard Orchestrator API)
 *
 * JSON question shape:
 *   { shape: "triangle"|"square"|"rectangle", traceMode: "guided"|"semi_guided"|"freeform", answer: "triangle" }
 */

import { View, Text, Dimensions, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import speechManager from '@/utils/speechManager';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const CANVAS_HEIGHT = SCREEN_HEIGHT * 0.40;
const TRACE_TOLERANCE = 35;
const COVERAGE_THRESHOLD = 0.80;
const SEGMENT_LENGTH = 15;
const TRACE_THROTTLE_MS = 16; // ~1 frame — limits runOnJS bridge hops during pan

// Normalized vertex coordinates (0-1) for each shape — closed loop
const SHAPE_PATHS = {
  triangle: [
    { x: 0.5, y: 0.1 },
    { x: 0.85, y: 0.85 },
    { x: 0.15, y: 0.85 },
  ],
  square: [
    { x: 0.2, y: 0.15 },
    { x: 0.8, y: 0.15 },
    { x: 0.8, y: 0.85 },
    { x: 0.2, y: 0.85 },
  ],
  rectangle: [
    { x: 0.1, y: 0.2 },
    { x: 0.9, y: 0.2 },
    { x: 0.9, y: 0.8 },
    { x: 0.1, y: 0.8 },
  ],
};

// Guide config per trace mode
const GUIDE_CONFIGS = {
  guided: { pathOpacity: 0.6, dashArray: '10,6', dotRadius: 12, showLabel: true },
  semi_guided: { pathOpacity: 0.25, dashArray: '6,8', dotRadius: 8, showLabel: false },
  freeform: { pathOpacity: 0, dashArray: '0,0', dotRadius: 6, showLabel: false },
};

// Haptic helpers — safe to call via runOnJS
const hapticLight = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

/**
 * Given screen-space vertices, generate an array of small segments
 * along each edge. Each segment: { index, x1, y1, x2, y2, mx, my }
 * where mx, my is the midpoint for hit detection.
 */
function generateSegments(vertices) {
  const segments = [];
  let idx = 0;
  const numEdges = vertices.length;

  for (let e = 0; e < numEdges; e++) {
    const v1 = vertices[e];
    const v2 = vertices[(e + 1) % numEdges];
    const dx = v2.sx - v1.sx;
    const dy = v2.sy - v1.sy;
    const edgeLen = Math.sqrt(dx * dx + dy * dy);
    const numSegs = Math.max(1, Math.round(edgeLen / SEGMENT_LENGTH));

    for (let s = 0; s < numSegs; s++) {
      const t1 = s / numSegs;
      const t2 = (s + 1) / numSegs;
      const x1 = v1.sx + dx * t1;
      const y1 = v1.sy + dy * t1;
      const x2 = v1.sx + dx * t2;
      const y2 = v1.sy + dy * t2;
      segments.push({
        index: idx++,
        x1, y1, x2, y2,
        mx: (x1 + x2) / 2,
        my: (y1 + y2) / 2,
      });
    }
  }
  return segments;
}

/**
 * Find the nearest segment midpoint to a given point.
 * Returns { segIndex, distance }.
 */
function findNearestSegment(px, py, segments) {
  let minDist = Infinity;
  let minIdx = -1;
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    const dx = px - s.mx;
    const dy = py - s.my;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDist) {
      minDist = dist;
      minIdx = i;
    }
  }
  return { segIndex: minIdx, distance: minDist };
}

// ─── TactileFooterButton — Duolingo-style sinking press button ───
const TactileFooterButton = ({
  onPress, label, iconName,
  bgColor, borderColor, textColor = Colors.onPrimary,
  fullWidth = false, disabled = false,
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
      onPress={disabled ? null : onPress}
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
          disabled && styles.tactileButtonDisabled,
          animatedStyle,
        ]}
      >
        {iconName && <Ionicons name={iconName} size={20} color={textColor} />}
        <Text style={[styles.tactileButtonText, { color: textColor }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
};

// ─── ShapeTracerEngine: main engine component ───
const ShapeTracerEngine = ({ data, onResult }) => {
  const { shape = 'triangle', traceMode = 'guided', question: instructionText } = data;

  const [tracedSet, setTracedSet] = useState(new Set());
  const [userPath, setUserPath] = useState([]);
  const [answered, setAnswered] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const tracedSetRef = useRef(new Set());
  const userPathRef = useRef([]);
  const lastTraceCallRef = useRef(0); // throttle gate for runOnJS in pan.onUpdate

  const guideConfig = GUIDE_CONFIGS[traceMode] || GUIDE_CONFIGS.guided;

  // Reset engine state when `data` changes (next question from Orchestrator)
  useEffect(() => {
    tracedSetRef.current = new Set();
    userPathRef.current = [];
    lastTraceCallRef.current = 0;
    setTracedSet(new Set());
    setUserPath([]);
    setAnswered(false);
  }, [data]);

  // Auto-speak on question load via speechManager
  useEffect(() => {
    const text = instructionText || `Trace the ${shape} with your finger`;
    const timer = setTimeout(() => speechManager.speakInstruction(text), 500);
    return () => {
      clearTimeout(timer);
      speechManager.stop();
    };
  }, [instructionText, shape]);

  // Compute screen-space vertices from normalized coordinates
  const vertices = useMemo(() => {
    if (canvasSize.width === 0) return [];
    const raw = SHAPE_PATHS[shape.toLowerCase()] || SHAPE_PATHS.triangle;
    return raw.map(v => ({
      ...v,
      sx: v.x * canvasSize.width,
      sy: v.y * canvasSize.height,
    }));
  }, [shape, canvasSize]);

  // Generate path segments for hit detection
  const segments = useMemo(() => {
    if (vertices.length === 0) return [];
    return generateSegments(vertices);
  }, [vertices]);

  const totalSegments = segments.length;
  const tracedCount = tracedSet.size;
  const coverage = totalSegments > 0 ? tracedCount / totalSegments : 0;
  const coveragePct = Math.round(coverage * 100);
  const canCheck = tracedCount > 0 && !answered;

  // Generate SVG edges for the guide path
  const edges = useMemo(() => {
    if (vertices.length === 0) return [];
    return vertices.map((v, i) => {
      const next = vertices[(i + 1) % vertices.length];
      return { key: `edge-${i}`, x1: v.sx, y1: v.sy, x2: next.sx, y2: next.sy };
    });
  }, [vertices]);

  // Build polyline points string from user path
  const polylinePoints = useMemo(() => {
    return userPath.map(p => `${p.x},${p.y}`).join(' ');
  }, [userPath]);

  // Capture canvas dimensions for shape scaling
  const handleCanvasLayout = useCallback((e) => {
    const { width, height } = e.nativeEvent.layout;
    setCanvasSize({ width, height });
  }, []);

  // Called via runOnJS — check if finger is near a segment
  const handleTraceUpdate = useCallback((relX, relY) => {
    if (segments.length === 0) return;

    const lastPt = userPathRef.current[userPathRef.current.length - 1];
    if (!lastPt || Math.abs(relX - lastPt.x) > 3 || Math.abs(relY - lastPt.y) > 3) {
      userPathRef.current = [...userPathRef.current, { x: relX, y: relY }];
      setUserPath(userPathRef.current);
    }

    const { segIndex, distance } = findNearestSegment(relX, relY, segments);
    if (distance < TRACE_TOLERANCE && !tracedSetRef.current.has(segIndex)) {
      const newSet = new Set(tracedSetRef.current);
      newSet.add(segIndex);
      tracedSetRef.current = newSet;
      setTracedSet(newSet);
    }
  }, [segments]);

  const handleTraceStart = useCallback((relX, relY) => {
    userPathRef.current = [{ x: relX, y: relY }];
    setUserPath(userPathRef.current);
  }, []);

  // Throttled bridge call — fires at most once per TRACE_THROTTLE_MS
  const handleTraceUpdateThrottled = useCallback((x, y) => {
    const now = Date.now();
    if (now - lastTraceCallRef.current < TRACE_THROTTLE_MS) return;
    lastTraceCallRef.current = now;
    handleTraceUpdate(x, y);
  }, [handleTraceUpdate]);

  // Gesture: tracks finger across canvas using local coordinates
  const pan = Gesture.Pan()
    .enabled(!answered)
    .minDistance(0)
    .onStart((event) => {
      runOnJS(handleTraceStart)(event.x, event.y);
      runOnJS(hapticLight)();
    })
    .onUpdate((event) => {
      runOnJS(handleTraceUpdateThrottled)(event.x, event.y);
    });

  // Check Answer
  const handleCheckAnswer = useCallback(() => {
    if (answered || !canCheck) return;
    setAnswered(true);

    if (coverage >= COVERAGE_THRESHOLD) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      speechManager.speakFeedback('Great tracing!', true);
      setTimeout(() => onResult(true, [shape]), 700);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      speechManager.speakFeedback('Try tracing more carefully.', false);
      setTimeout(() => onResult(false, [shape]), 700);
    }
  }, [answered, canCheck, coverage, onResult, shape]);

  // Clear all tracing
  const handleReset = useCallback(() => {
    tracedSetRef.current = new Set();
    userPathRef.current = [];
    setTracedSet(new Set());
    setUserPath([]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const shapeLabel = shape.charAt(0).toUpperCase() + shape.slice(1).toLowerCase();

  const getInstruction = () => {
    if (answered) return 'Great job!';
    if (canCheck) return 'Looking good! Check your answer.';
    return `Trace the ${shapeLabel} — ${coveragePct}% done`;
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Instruction Hint */}
      <Animated.View entering={FadeIn.delay(100)} style={styles.hintContainer}>
        <Ionicons name="finger-print" size={16} color={Colors.onSurfaceVariant} />
        <Text style={styles.hintText}>{getInstruction()}</Text>
      </Animated.View>

      {/* SVG Canvas */}
      <View
        onLayout={handleCanvasLayout}
        style={styles.canvas}
      >
        <GestureDetector gesture={pan}>
          <Animated.View style={styles.canvasInner}>
            {canvasSize.width > 0 && (
              <Svg
                width={canvasSize.width}
                height={canvasSize.height}
                viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
              >
                {/* Layer 1: Guide path edges (dashed) */}
                {guideConfig.pathOpacity > 0 && edges.map(edge => (
                  <Line
                    key={edge.key}
                    x1={edge.x1}
                    y1={edge.y1}
                    x2={edge.x2}
                    y2={edge.y2}
                    stroke={Colors.outlineVariant}
                    strokeWidth={3}
                    strokeDasharray={guideConfig.dashArray}
                    opacity={guideConfig.pathOpacity}
                    strokeLinecap="round"
                  />
                ))}

                {/* Layer 2: Traced segments (solid green) */}
                {segments.map(seg => {
                  if (!tracedSet.has(seg.index)) return null;
                  return (
                    <Line
                      key={`traced-${seg.index}`}
                      x1={seg.x1}
                      y1={seg.y1}
                      x2={seg.x2}
                      y2={seg.y2}
                      stroke={Colors.success}
                      strokeWidth={6}
                      strokeLinecap="round"
                    />
                  );
                })}

                {/* Layer 3: User's freeform stroke (orange polyline) */}
                {userPath.length > 1 && (
                  <Polyline
                    points={polylinePoints}
                    stroke={Colors.primary}
                    strokeWidth={4}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.6}
                  />
                )}

                {/* Layer 4: Corner dots */}
                {vertices.map((v, i) => (
                  <Circle
                    key={`dot-${i}`}
                    cx={v.sx}
                    cy={v.sy}
                    r={guideConfig.dotRadius}
                    fill={Colors.primary}
                    stroke={Colors.onPrimaryContainer}
                    strokeWidth={2}
                  />
                ))}

                {/* Layer 5: Shape label (guided mode only) */}
                {guideConfig.showLabel && canvasSize.width > 0 && (
                  <SvgText
                    x={canvasSize.width / 2}
                    y={canvasSize.height * 0.55}
                    textAnchor="middle"
                    fontSize={SCREEN_HEIGHT * 0.022}
                    fontWeight="bold"
                    fill={Colors.outlineVariant}
                  >
                    {shapeLabel}
                  </SvgText>
                )}
              </Svg>
            )}
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>{coveragePct}% traced</Text>
      </View>

      {/* Footer — always visible, disabled state controls availability */}
      <View style={styles.footer}>
        <View style={styles.secondaryActions}>
          <TactileFooterButton
            label="Clear"
            iconName="refresh"
            onPress={handleReset}
            bgColor={Colors.surfaceContainerHigh}
            borderColor={Colors.outlineVariant}
            textColor={Colors.onSurfaceVariant}
            disabled={tracedCount === 0 || answered}
          />
        </View>
        <TactileFooterButton
          label="Check Answer"
          iconName="checkmark-circle"
          onPress={handleCheckAnswer}
          bgColor={Colors.success}
          borderColor="#1b5e20"
          fullWidth
          disabled={!canCheck}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: '100%',
  },
  container: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    gap: 12,
    paddingVertical: 10,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  hintText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: SCREEN_HEIGHT * 0.014,
    color: Colors.onSurfaceVariant,
  },
  canvas: {
    width: '100%',
    height: CANVAS_HEIGHT,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    overflow: 'hidden',
  },
  canvasCorrect: {
    borderColor: Colors.success,
    borderStyle: 'solid',
    backgroundColor: Colors.tertiaryContainer,
  },
  canvasInner: {
    flex: 1,
  },
  progressContainer: {
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  progressText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: SCREEN_HEIGHT * 0.015,
    color: Colors.onSurfaceVariant,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 4,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tactileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 6,
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
    fontFamily: 'Lexend-Bold',
    fontSize: SCREEN_HEIGHT * 0.019,
    letterSpacing: 0.5,
  },
});

export default ShapeTracerEngine;
