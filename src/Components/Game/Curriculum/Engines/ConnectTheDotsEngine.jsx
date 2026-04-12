/**
 * ConnectDotsEngine — Grade 1 Connect-the-Dots Game Engine
 *
 * Children connect numbered pegs in sequential order by dragging
 * their finger across an SVG canvas. A visible line follows the
 * finger and snaps between connected pegs.
 *
 * Uses Gesture Handler (Gesture.Pan) for finger tracking,
 * react-native-svg for rendering pegs and lines, and
 * Reanimated 3.x useAnimatedProps for the live tracking line.
 *
 * Shadow-Free Design System compliant.
 *
 * Props Contract: { data, onResult } (standard Orchestrator API)
 *
 * JSON question shape:
 *   { pegs: [{ label, x, y }, ...], answer: ["1","2","3"] }
 *
 * Required Assets (future):
 *   - g1_q1_connectdots_star, g1_q1_connectdots_house
 *   - g1_q1_connectdots_tree (reveal images after completion)
 */

import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  ZoomIn,
  ZoomOut,
  FadeIn,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle, Line, Text as SvgText, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import speechManager from '@/utils/speechManager';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CANVAS_HEIGHT = SCREEN_HEIGHT * 0.35;
const PEG_RADIUS = 22;
const HIT_RADIUS = 40; // Generous hit zone for small fingers

// Create an animated SVG Line for the tracking line
const AnimatedLine = Animated.createAnimatedComponent(Line);

// Haptic helper — safe to call via runOnJS from worklets
const hapticLight = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

// ─── ConnectDotsEngine: main engine component ───
const ConnectDotsEngine = ({ data, onResult }) => {
  const { pegs = [], answer = [], question: instructionText } = data;

  const [connectedPegs, setConnectedPegs] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Ref for synchronous tracking (avoids stale closures)
  const connectedCountRef = useRef(0);
  const canvasRef = useRef(null);

  // Shared values for UI-thread gesture tracking
  const fingerX = useSharedValue(0);
  const fingerY = useSharedValue(0);
  const lastPegX = useSharedValue(0);
  const lastPegY = useSharedValue(0);
  const nextPegScreenX = useSharedValue(0);
  const nextPegScreenY = useSharedValue(0);
  const canvasOffsetX = useSharedValue(0);
  const canvasOffsetY = useSharedValue(0);
  const pegJustConnected = useSharedValue(false);
  const gestureActive = useSharedValue(false);

  const allConnected = connectedPegs.length >= answer.length;

  // Reset engine state when `data` changes (next question from Orchestrator)
  useEffect(() => {
    setConnectedPegs([]);
    setIsDragging(false);
    setAnswered(false);
    connectedCountRef.current = 0;
  }, [data]);

  // Auto-speak on question load via speechManager
  useEffect(() => {
    const text = instructionText || 'Drag from dot to dot in order';
    const timer = setTimeout(() => speechManager.speakInstruction(text), 500);
    return () => {
      clearTimeout(timer);
      speechManager.stop();
    };
  }, [instructionText]);

  // Compute peg screen positions from normalized (0-1) coordinates
  const pegPositions = useMemo(() => {
    if (canvasSize.width === 0) return [];
    return pegs.map(peg => ({
      ...peg,
      screenX: peg.x * canvasSize.width,
      screenY: peg.y * canvasSize.height,
    }));
  }, [pegs, canvasSize]);

  // Initialize the first target peg's shared values
  useEffect(() => {
    if (pegPositions.length === 0 || answer.length === 0) return;
    const nextIdx = connectedCountRef.current;
    if (nextIdx < answer.length) {
      const nextPeg = pegPositions.find(p => p.label === answer[nextIdx]);
      if (nextPeg) {
        nextPegScreenX.value = nextPeg.screenX;
        nextPegScreenY.value = nextPeg.screenY;
      }
    }
  }, [pegPositions, answer]);

  // Measure canvas absolute position on layout
  const handleCanvasLayout = useCallback((e) => {
    const { width, height } = e.nativeEvent.layout;
    setCanvasSize({ width, height });
    // Measure absolute position for gesture coordinate conversion
    setTimeout(() => {
      canvasRef.current?.measureInWindow((x, y) => {
        canvasOffsetX.value = x;
        canvasOffsetY.value = y;
      });
    }, 100);
  }, []);

  // Called via runOnJS when finger hits the next target peg
  const handlePegConnected = useCallback(() => {
    const nextIdx = connectedCountRef.current;
    if (nextIdx >= answer.length) return;

    const nextLabel = answer[nextIdx];
    connectedCountRef.current += 1;
    setConnectedPegs(prev => [...prev, nextLabel]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Update "last connected peg" shared values for tracking line origin
    const justPeg = pegPositions.find(p => p.label === nextLabel);
    if (justPeg) {
      lastPegX.value = justPeg.screenX;
      lastPegY.value = justPeg.screenY;
    }

    // Update "next target peg" shared values for hit detection
    const newNextIdx = nextIdx + 1;
    if (newNextIdx < answer.length) {
      const newNextPeg = pegPositions.find(p => p.label === answer[newNextIdx]);
      if (newNextPeg) {
        nextPegScreenX.value = newNextPeg.screenX;
        nextPegScreenY.value = newNextPeg.screenY;
      }
    }
  }, [answer, pegPositions]);

  // Gesture: tracks finger and detects peg hits on UI thread
  const pan = Gesture.Pan()
    .enabled(!answered && !allConnected)
    .minDistance(0)
    .onStart((event) => {
      gestureActive.value = true;
      fingerX.value = event.absoluteX - canvasOffsetX.value;
      fingerY.value = event.absoluteY - canvasOffsetY.value;
      pegJustConnected.value = false;
      runOnJS(setIsDragging)(true);
      runOnJS(hapticLight)();
    })
    .onUpdate((event) => {
      const relX = event.absoluteX - canvasOffsetX.value;
      const relY = event.absoluteY - canvasOffsetY.value;
      fingerX.value = relX;
      fingerY.value = relY;

      // Check distance to next target peg (UI thread math)
      const dx = relX - nextPegScreenX.value;
      const dy = relY - nextPegScreenY.value;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < HIT_RADIUS && !pegJustConnected.value) {
        pegJustConnected.value = true;
        runOnJS(handlePegConnected)();
      }

      // Reset flag when finger moves away from the peg
      if (dist >= HIT_RADIUS * 1.2) {
        pegJustConnected.value = false;
      }
    })
    .onEnd(() => {
      gestureActive.value = false;
      runOnJS(setIsDragging)(false);
    });

  // Animated props for the live tracking line (UI thread, 60 FPS)
  const trackingLineProps = useAnimatedProps(() => ({
    x1: lastPegX.value,
    y1: lastPegY.value,
    x2: fingerX.value,
    y2: fingerY.value,
  }));

  // Check Answer — always correct since we enforce sequential order
  const handleCheckAnswer = useCallback(() => {
    if (!allConnected || answered) return;
    setAnswered(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    speechManager.speakFeedback('Well done! All dots connected!', true);
    setTimeout(() => onResult(true, connectedPegs), 700);
  }, [allConnected, answered, onResult, connectedPegs]);

  // Helper: determine peg visual state
  const getPegState = useCallback((pegLabel) => {
    if (connectedPegs.includes(pegLabel)) return 'connected';
    const nextIdx = connectedPegs.length;
    if (nextIdx < answer.length && answer[nextIdx] === pegLabel) return 'next';
    if (answer.includes(pegLabel)) return 'future';
    return 'distractor';
  }, [connectedPegs, answer]);

  const PEG_STYLES = {
    connected: { fill: Colors.tertiaryContainer, stroke: Colors.success, textFill: Colors.success },
    next: { fill: Colors.primaryContainer, stroke: Colors.primary, textFill: Colors.onPrimaryContainer },
    future: { fill: Colors.surfaceContainerHigh, stroke: Colors.outlineVariant, textFill: Colors.onSurfaceVariant },
    distractor: { fill: Colors.surfaceContainerLowest, stroke: Colors.outlineVariant, textFill: Colors.outlineVariant },
  };

  // Dynamic instruction text
  const getInstruction = () => {
    if (answered) return '✅ All dots connected!';
    if (allConnected) return 'All dots connected! Check your answer.';
    return `${connectedPegs.length} / ${answer.length} dots connected`;
  };

  // Check tap gesture
  const checkTap = Gesture.Tap()
    .onEnd(() => runOnJS(handleCheckAnswer)())
    .enabled(allConnected && !answered);

  return (
    <View style={styles.container}>
      {/* Instruction Hint */}
      <Animated.View entering={FadeIn.delay(100)} style={styles.hintContainer}>
        <Ionicons name="finger-print" size={16} color={Colors.onSurfaceVariant} />
        <Text style={styles.hintText}>
          {allConnected
            ? 'All dots connected! Check your answer.'
            : 'Drag from dot to dot in order'}
        </Text>
      </Animated.View>

      {/* SVG Canvas */}
      <View
        ref={canvasRef}
        onLayout={handleCanvasLayout}
        style={[
          styles.canvas,
          answered && styles.canvasCorrect,
        ]}
      >
        <GestureDetector gesture={pan}>
          <Animated.View style={styles.canvasInner}>
            {canvasSize.width > 0 && (
              <Svg
                width={canvasSize.width}
                height={canvasSize.height}
                viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
              >
                {/* Connected lines */}
                {connectedPegs.length > 1 &&
                  connectedPegs.map((label, i) => {
                    if (i === 0) return null;
                    const prevPeg = pegPositions.find(
                      (p) => p.label === connectedPegs[i - 1]
                    );
                    const currPeg = pegPositions.find((p) => p.label === label);
                    if (!prevPeg || !currPeg) return null;
                    return (
                      <Line
                        key={`line-${i}`}
                        x1={prevPeg.screenX}
                        y1={prevPeg.screenY}
                        x2={currPeg.screenX}
                        y2={currPeg.screenY}
                        stroke={Colors.success}
                        strokeWidth={4}
                        strokeLinecap="round"
                      />
                    );
                  })}

                {/* Tracking line (animated, follows finger) */}
                {isDragging &&
                  connectedPegs.length > 0 &&
                  !allConnected && (
                    <AnimatedLine
                      animatedProps={trackingLineProps}
                      stroke={Colors.primary}
                      strokeWidth={3}
                      strokeDasharray="8,4"
                      strokeLinecap="round"
                    />
                  )}

                {/* Pegs */}
                {pegPositions.map((peg) => {
                  const state = getPegState(peg.label);
                  const style = PEG_STYLES[state];
                  const isDistractor = state === 'distractor';

                  return (
                    <G key={`peg-${peg.label}`}>
                      {/* Peg circle */}
                      <Circle
                        cx={peg.screenX}
                        cy={peg.screenY}
                        r={isDistractor ? PEG_RADIUS * 0.75 : PEG_RADIUS}
                        fill={style.fill}
                        stroke={style.stroke}
                        strokeWidth={state === 'connected' ? 4 : 3}
                        opacity={isDistractor ? 0.5 : 1}
                      />
                      {/* Peg label */}
                      <SvgText
                        x={peg.screenX}
                        y={peg.screenY + 5}
                        textAnchor="middle"
                        fontSize={isDistractor ? 13 : 16}
                        fontWeight="bold"
                        fill={style.textFill}
                        opacity={isDistractor ? 0.5 : 1}
                      >
                        {peg.label}
                      </SvgText>
                      {/* Checkmark on connected pegs */}
                      {state === 'connected' && (
                        <SvgText
                          x={peg.screenX + PEG_RADIUS * 0.7}
                          y={peg.screenY - PEG_RADIUS * 0.5}
                          textAnchor="middle"
                          fontSize={12}
                        >
                          ✓
                        </SvgText>
                      )}
                    </G>
                  );
                })}
              </Svg>
            )}
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {getInstruction()}
        </Text>
      </View>

      {/* Check Answer Button */}
      <View style={styles.footer}>
        {allConnected && !answered && (
          <GestureDetector gesture={checkTap}>
            <Animated.View entering={ZoomIn.springify()} exiting={ZoomOut} style={styles.checkButton}>
              <Ionicons name="checkmark-circle" size={22} color="#FFF" />
              <Text style={styles.checkButtonText}>Check Answer</Text>
            </Animated.View>
          </GestureDetector>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: 'rgba(0,110,42,0.06)',
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
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 20,
    minHeight: 44,
    minWidth: 44,
    gap: 8,
  },
  checkButtonText: {
    fontFamily: 'Lexend-Bold',
    color: '#FFF',
    fontSize: SCREEN_HEIGHT * 0.019,
  },
});

export default ConnectDotsEngine;
