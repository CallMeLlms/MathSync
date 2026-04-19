// ClockSetterEngine — Stage 1: hour-only | Stage 2: half-hour
// Stage 1 (mode: 'hour-only'): hour hand rotates, snaps to 12 whole-hour positions.
//   Minute hand frozen at 12 (decorative). Validation: exact hour match.
// Stage 2 (mode: 'half-hour'): both hands interactive.
//   Minute hand snaps to 0 or 180° (0 or 30 min). Validation: hour + minute match.

import { View, Text, StyleSheet } from 'react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  ZoomIn,
  FadeIn,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

// ── Layout constants ──────────────────────────────────────────────
const CLOCK_SIZE         = 280;
const CLOCK_RADIUS       = CLOCK_SIZE / 2;
const NUMBER_INSET       = 30;
const CENTER_DOT_SIZE    = 20;
const HOUR_HAND_LENGTH   = Math.round(CLOCK_RADIUS * 0.52);
const HOUR_HAND_WIDTH    = 14;
const MINUTE_HAND_LENGTH = Math.round(CLOCK_RADIUS * 0.70);
const MINUTE_HAND_WIDTH  = 9;
const CLOCK_NUMBERS      = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// ── Geometry helpers (JS thread) ──────────────────────────────────
const computeHourAngle = (hour, minute = 0) =>
  (((hour % 12) * 30) + minute * 0.5 + 360) % 360;

const computeMinuteAngle = (m) => ((m * 6) + 360) % 360;

// Worklet-safe snap to nearest multiple of step
const snapToStep = (angle, step) => {
  'worklet';
  return (Math.round(angle / step) * step + 360) % 360;
};

// Worklet-safe snap to nearest angle in allowed list (circular distance)
const snapToAllowed = (angle, allowed) => {
  'worklet';
  let best = allowed[0];
  let bestDiff = Infinity;
  for (let i = 0; i < allowed.length; i++) {
    const diff = Math.abs(((angle - allowed[i] + 540) % 360) - 180);
    if (diff < bestDiff) { bestDiff = diff; best = allowed[i]; }
  }
  return best;
};

// ── ClockSetterEngine ─────────────────────────────────────────────
export default function ClockSetterEngine({ data, onResult }) {
  const { targetTime, initialTime = { hour: 12, minute: 0 } } = data;
  const isHalfHour = data.mode === 'half-hour';

  // ── React state ────────────────────────────────────────────────
  const [snapHour,   setSnapHour]   = useState(initialTime.hour ?? 12);
  const [snapMinute, setSnapMinute] = useState(initialTime.minute ?? 0);
  const [answered,   setAnswered]   = useState(false);
  const [isCorrect,  setIsCorrect]  = useState(false);

  // ── Shared values ──────────────────────────────────────────────
  const hourAngle       = useSharedValue(computeHourAngle(initialTime.hour ?? 12));
  const minuteAngle     = useSharedValue(computeMinuteAngle(initialTime.minute ?? 0));
  const clockCenterX    = useSharedValue(0);
  const clockCenterY    = useSharedValue(0);
  const hourHandScale   = useSharedValue(1);
  const minuteHandScale = useSharedValue(1);
  const btnTranslateY   = useSharedValue(0);
  const btnBorderBottom = useSharedValue(6);

  const clockRef = useRef(null);

  // ── Reset on new question ──────────────────────────────────────
  useEffect(() => {
    const h = initialTime?.hour ?? 12;
    const m = initialTime?.minute ?? 0;
    setSnapHour(h);
    setSnapMinute(m);
    setAnswered(false);
    setIsCorrect(false);
    hourAngle.value       = computeHourAngle(h);
    minuteAngle.value     = computeMinuteAngle(m);
    btnTranslateY.value   = 0;
    btnBorderBottom.value = 6;
    hourHandScale.value   = 1;
    minuteHandScale.value = 1;
  }, [data]);

  // ── Clock center measurement ───────────────────────────────────
  const handleClockLayout = () => {
    clockRef.current?.measureInWindow((x, y, w, h) => {
      clockCenterX.value = x + w / 2;
      clockCenterY.value = y + h / 2;
    });
  };

  // ── Snap callbacks — run on JS thread via runOnJS ──────────────
  const onHourSnap = useCallback((newHour) => {
    console.log('[ClockSetter] snapHour →', newHour);
    setSnapHour(newHour);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const onMinuteSnap = useCallback((newMinute) => {
    console.log('[ClockSetter] snapMinute →', newMinute);
    setSnapMinute(newMinute);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // ── Validation ─────────────────────────────────────────────────
  const handleCheck = () => {
    if (answered) return;
    const tH       = targetTime.hour % 12 || 12;
    const hourOk   = snapHour === tH;
    const minuteOk = isHalfHour ? snapMinute === targetTime.minute : true;
    const correct  = hourOk && minuteOk;
    console.log('[ClockSetter] CHECK — hour:', snapHour, '/', tH, '| min:', snapMinute, '/', targetTime.minute, '| correct:', correct);
    setAnswered(true);
    setIsCorrect(correct);
    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => onResult(true, [{ hour: snapHour, minute: snapMinute }]), 700);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      onResult(false, [{ hour: snapHour, minute: snapMinute }]);
      setTimeout(() => {
        const h = initialTime?.hour ?? 12;
        const m = initialTime?.minute ?? 0;
        setAnswered(false);
        setIsCorrect(false);
        setSnapHour(h);
        setSnapMinute(m);
        hourAngle.value   = withSpring(computeHourAngle(h),   { damping: 18, stiffness: 200 });
        minuteAngle.value = withSpring(computeMinuteAngle(m), { damping: 18, stiffness: 200 });
      }, 1400);
    }
  };

  // ── Clock pan — entire face is the drag target for the hour hand ─
  const clockPan = Gesture.Pan()
    .onBegin(() => {
      hourHandScale.value = withSpring(1.1, { damping: 15, stiffness: 300 });
    })
    .onChange((e) => {
      'worklet';
      if (clockCenterX.value === 0 && clockCenterY.value === 0) return;
      const dx = e.absoluteX - clockCenterX.value;
      const dy = e.absoluteY - clockCenterY.value;
      hourAngle.value = ((Math.atan2(dy, dx) * 180 / Math.PI) + 90 + 360) % 360;
    })
    .onEnd(() => {
      'worklet';
      const snapped = snapToStep(hourAngle.value, 30);
      const newH = Math.round(((snapped % 360) + 360) % 360 / 30) % 12 || 12;
      hourAngle.value = withSpring(snapped, { damping: 18, stiffness: 300 });
      runOnJS(onHourSnap)(newH);
      hourHandScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    })
    .enabled(!answered);

  // ── Minute pan — wraps only the minute pivot (half-hour mode only) ─
  const minutePan = Gesture.Pan()
    .onBegin(() => {
      minuteHandScale.value = withSpring(1.1, { damping: 15, stiffness: 300 });
    })
    .onChange((e) => {
      'worklet';
      if (clockCenterX.value === 0 && clockCenterY.value === 0) return;
      const dx = e.absoluteX - clockCenterX.value;
      const dy = e.absoluteY - clockCenterY.value;
      minuteAngle.value = ((Math.atan2(dy, dx) * 180 / Math.PI) + 90 + 360) % 360;
    })
    .onEnd(() => {
      'worklet';
      const snapped = snapToAllowed(minuteAngle.value, [0, 180]);
      const newM = snapped === 0 ? 0 : 30;
      minuteAngle.value = withSpring(snapped, { damping: 18, stiffness: 300 });
      runOnJS(onMinuteSnap)(newM);
      minuteHandScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    })
    .enabled(isHalfHour && !answered);

  // ── Check button tap ───────────────────────────────────────────
  const checkTap = Gesture.Tap()
    .onBegin(() => {
      btnTranslateY.value   = withTiming(4, { duration: 80 });
      btnBorderBottom.value = withTiming(2, { duration: 80 });
    })
    .onEnd(() => { runOnJS(handleCheck)(); })
    .onFinalize(() => {
      btnTranslateY.value   = withSpring(0, { damping: 15, stiffness: 300 });
      btnBorderBottom.value = withSpring(6, { damping: 15, stiffness: 300 });
    })
    .enabled(!answered);

  // ── Animated styles ────────────────────────────────────────────
  const hourPivotStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${hourAngle.value}deg` },
      { scale: hourHandScale.value },
    ],
  }));

  const minutePivotStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${minuteAngle.value}deg` },
      { scale: minuteHandScale.value },
    ],
  }));

  const btnAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: btnTranslateY.value }],
    borderBottomWidth: btnBorderBottom.value,
  }));

  // ── Instruction text ───────────────────────────────────────────
  const getInstruction = () => {
    if (answered && isCorrect)  return "That's right! Great job!";
    if (answered && !isCorrect) return 'Not quite — try again!';
    if (isHalfHour) return 'Drag both hands to show the time!';
    return 'Drag the green hand to show the hour!';
  };

  const instructionColor = answered
    ? (isCorrect ? Colors.success : Colors.error)
    : Colors.onSurfaceVariant;

  // ── Number positions ───────────────────────────────────────────
  const getNumberPosition = (n) => {
    const angleDeg = n * 30 - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    const r  = CLOCK_RADIUS - NUMBER_INSET;
    const cx = CLOCK_RADIUS + r * Math.cos(angleRad);
    const cy = CLOCK_RADIUS + r * Math.sin(angleRad);
    return { left: cx - 14, top: cy - 12 };
  };

  // ── Tick marks ─────────────────────────────────────────────────
  const renderTick = (i) => {
    const isMajor  = i % 5 === 0;
    const tickLen  = isMajor ? 10 : 5;
    const tickW    = isMajor ? 3 : 1.5;
    const angleDeg = i * 6 - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    const r  = CLOCK_RADIUS - tickLen / 2 - 4;
    const cx = CLOCK_RADIUS + r * Math.cos(angleRad);
    const cy = CLOCK_RADIUS + r * Math.sin(angleRad);
    return (
      <View
        key={i}
        style={[
          styles.tick,
          {
            width: tickW,
            height: tickLen,
            left: cx - tickW / 2,
            top: cy - tickLen / 2,
            transform: [{ rotate: `${angleDeg + 90}deg` }],
            backgroundColor: isMajor ? Colors.onSurfaceVariant : Colors.outlineVariant,
          },
        ]}
      />
    );
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Prompt */}
      <Animated.Text entering={FadeIn.delay(80)} style={styles.promptText}>
        {data.question ?? `Set the clock to ${targetTime.hour}:00`}
      </Animated.Text>

      {/* Instruction */}
      <Animated.Text
        entering={FadeIn.delay(150)}
        style={[styles.instructionText, { color: instructionColor }]}
      >
        {getInstruction()}
      </Animated.Text>

      {/* Clock */}
      <Animated.View entering={ZoomIn.springify().delay(100)} style={styles.clockWrapper}>
        <GestureDetector gesture={clockPan}>
          <View
            ref={clockRef}
            style={styles.clockFace}
            onLayout={handleClockLayout}
          >
            {/* Tick marks */}
            {Array.from({ length: 60 }, (_, i) => renderTick(i))}

            {/* Numbers 1–12 */}
            {CLOCK_NUMBERS.map((n) => (
              <Text key={n} style={[styles.clockNumber, getNumberPosition(n)]}>
                {n}
              </Text>
            ))}

            {/* Minute hand — interactive in half-hour, frozen at 12 in hour-only */}
            {isHalfHour ? (
              <GestureDetector gesture={minutePan}>
                <Animated.View style={[styles.handPivot, minutePivotStyle]}>
                  <View style={styles.minuteHand} />
                </Animated.View>
              </GestureDetector>
            ) : (
              <View style={styles.handPivot}>
                <View style={[styles.minuteHand, { opacity: 0.25 }]} />
              </View>
            )}

            {/* Hour hand — interactive */}
            <Animated.View style={[styles.handPivot, hourPivotStyle]}>
              <View style={styles.hourHand} />
            </Animated.View>

            {/* Center dot — sits above both hands */}
            <Animated.View entering={ZoomIn.delay(220)} style={styles.centerDot} />
          </View>
        </GestureDetector>
      </Animated.View>

      {/* Check button */}
      <View style={styles.footer}>
        <GestureDetector gesture={checkTap}>
          <Animated.View
            style={[
              styles.checkButton,
              btnAnimatedStyle,
              answered && styles.checkButtonDisabled,
            ]}
          >
            <Text style={styles.checkButtonText}>CHECK</Text>
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  promptText: {
    fontFamily: 'Lexend-SemiBold',
    fontSize: 20,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  instructionText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    textAlign: 'center',
  },
  clockWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockFace: {
    width: CLOCK_SIZE,
    height: CLOCK_SIZE,
    borderRadius: CLOCK_RADIUS,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    position: 'relative',
  },
  tick: {
    position: 'absolute',
  },
  clockNumber: {
    position: 'absolute',
    width: 28,
    fontFamily: 'Lexend-Bold',
    fontSize: 17,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  // Zero-size anchor at the clock center; children extend upward (bottom: 0)
  handPivot: {
    position: 'absolute',
    top: CLOCK_RADIUS,
    left: CLOCK_RADIUS,
    width: 0,
    height: 0,
  },
  hourHand: {
    position: 'absolute',
    width: HOUR_HAND_WIDTH,
    height: HOUR_HAND_LENGTH,
    borderRadius: HOUR_HAND_WIDTH / 2,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: '#388E3C',
    bottom: 0,
    left: -(HOUR_HAND_WIDTH / 2),
  },
  minuteHand: {
    position: 'absolute',
    width: MINUTE_HAND_WIDTH,
    height: MINUTE_HAND_LENGTH,
    borderRadius: MINUTE_HAND_WIDTH / 2,
    backgroundColor: '#2196F3',
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: '#1565C0',
    bottom: 0,
    left: -(MINUTE_HAND_WIDTH / 2),
  },
  centerDot: {
    position: 'absolute',
    width: CENTER_DOT_SIZE,
    height: CENTER_DOT_SIZE,
    borderRadius: CENTER_DOT_SIZE / 2,
    backgroundColor: Colors.onSurface,
    top: CLOCK_RADIUS - CENTER_DOT_SIZE / 2,
    left: CLOCK_RADIUS - CENTER_DOT_SIZE / 2,
    zIndex: 10,
  },
  footer: {
    width: '100%',
    paddingBottom: 4,
  },
  checkButton: {
    width: '100%',
    minHeight: 56,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: Colors.tertiary,
    borderWidth: 2,
    borderColor: '#004d1d',
    alignItems: 'center',
    justifyContent: 'center',
    // borderBottomWidth driven exclusively by btnAnimatedStyle
  },
  checkButtonText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 17,
    color: Colors.onTertiary,
    letterSpacing: 1.2,
  },
  checkButtonDisabled: {
    opacity: 0.5,
  },
});
