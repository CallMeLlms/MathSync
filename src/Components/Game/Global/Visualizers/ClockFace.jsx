import React, { memo } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Colors from '@/constants/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
// Max out the clock size for better readability on tablets, but keep it constrained
const CLOCK_SIZE = Math.min(SCREEN_HEIGHT * 0.25, 220);
const CENTER = CLOCK_SIZE / 2;
const HOUR_HAND_LENGTH = CENTER * 0.45;
const MINUTE_HAND_LENGTH = CENTER * 0.75;
const HOUR_HAND_THICKNESS = 6;
const MINUTE_HAND_THICKNESS = 4;
const NUMBER_FONT_SIZE = Math.max(14, CLOCK_SIZE * 0.08);

/**
 * Get x,y position on the clock circle for a given angle and radius.
 * 0° = 12 o'clock position.
 */
const polarToXY = (angleDeg, radius) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
};

const ClockHand = ({ angle, length, thickness, color, zIndex }) => (
  <View
    style={{
      position: "absolute",
      left: CENTER,
      top: CENTER - thickness / 2,
      width: length,
      height: thickness,
      backgroundColor: color,
      borderRadius: thickness / 2,
      zIndex,
      transform: [
        { translateX: -1 },               // slight nudge so hand starts from center
        { rotate: `${angle}deg` },
      ],
      transformOrigin: `0% 50%`,           // rotate from the left edge (center of clock)
    }}
  />
);

const ClockFace = ({ hour, minute, theme }) => {
  // If no time is provided, default to a visually pleasing 10:10 
  const safeHour = hour !== undefined ? hour : 10;
  const safeMinute = minute !== undefined ? minute : 10;

  // 0° = 12 o'clock. Each minute = 6°, each hour = 30° + continuous offset.
  const minuteAngle = (safeMinute / 60) * 360;
  const hourAngle = ((safeHour % 12) / 12) * 360 + (safeMinute / 60) * 30;

  const clockBorderColor = theme?.primaryColor || Colors.primary;
  const clockTextColor = theme?.primaryColor || Colors.primary;

  return (
    <View style={styles.clockContainer}>
      <View style={[styles.clockFace, { borderColor: clockBorderColor }]}>
        {/* Tick marks for each hour position */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * 360;
          const pos = polarToXY(angle, CENTER * 0.9);
          return (
            <View
              key={`tick-${i}`}
              style={[
                styles.tickMark,
                { left: pos.x - 2, top: pos.y - 2 },
              ]}
            />
          );
        })}

        {/* Hour numbers 1-12 */}
        {Array.from({ length: 12 }, (_, i) => {
          const num = i + 1;
          const angle = (num / 12) * 360;
          const pos = polarToXY(angle, CENTER * 0.75);
          return (
            <Text
              key={`num-${num}`}
              style={[
                styles.hourNumber,
                {
                  fontFamily: theme?.fontFamily?.title || "SatoshiBlack",
                  color: clockTextColor,
                  left: pos.x - NUMBER_FONT_SIZE * 0.6,
                  top: pos.y - NUMBER_FONT_SIZE * 0.6,
                  fontSize: NUMBER_FONT_SIZE,
                  width: NUMBER_FONT_SIZE * 1.2,
                  height: NUMBER_FONT_SIZE * 1.2,
                  lineHeight: NUMBER_FONT_SIZE * 1.2,
                },
              ]}
            >
              {num}
            </Text>
          );
        })}

        {/* Hour hand (shorter, thicker, darker) */}
        <ClockHand
          angle={hourAngle}
          length={HOUR_HAND_LENGTH}
          thickness={HOUR_HAND_THICKNESS}
          color={Colors.onSurface}
          zIndex={2}
        />

        {/* Minute hand (longer, thinner, accent) */}
        <ClockHand
          angle={minuteAngle}
          length={MINUTE_HAND_LENGTH}
          thickness={MINUTE_HAND_THICKNESS}
          color={theme?.secondaryColor || '#E53935'}
          zIndex={3}
        />

        {/* Center dot */}
        <View style={[styles.centerDot, { backgroundColor: Colors.onSurface }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  clockContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
  },
  clockFace: {
    width: CLOCK_SIZE,
    height: CLOCK_SIZE,
    borderRadius: CLOCK_SIZE / 2,
    backgroundColor: "#FFFFFF",
    borderWidth: 6,
    borderBottomWidth: 10, // Tactile depth
    position: "relative",
  },
  hourNumber: {
    position: "absolute",
    textAlign: "center",
  },
  tickMark: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#B0BEC5",
  },
  centerDot: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    left: CENTER - 7,
    top: CENTER - 7,
    zIndex: 5,
  },
});

export default memo(ClockFace);
