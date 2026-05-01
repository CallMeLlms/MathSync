import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';

// Base dimensions match the interactive clock in ClockSetterEngine (280px)
// so all scale factors stay consistent.
const BASE = 280;
const CLOCK_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const computeHourAngle = (hour, minute = 0) =>
  (((hour % 12) * 30) + minute * 0.5 + 360) % 360;

const computeMinuteAngle = (m) => ((m * 6) + 360) % 360;

export default function StaticClockFace({ hour, minute = 0, size = 110 }) {
  const sc = size / BASE;
  const radius = size / 2;

  const hourHandLength  = Math.round(radius * 0.52);
  const hourHandWidth   = Math.max(3, Math.round(14 * sc));
  const minuteHandLength = Math.round(radius * 0.70);
  const minuteHandWidth  = Math.max(2, Math.round(9 * sc));
  const centerDotSize   = Math.max(4, Math.round(20 * sc));
  const numberInset     = 30 * sc;
  const numberFontSize  = Math.max(8, Math.round(17 * sc));
  const numberBoxWidth  = Math.max(Math.round(numberFontSize * 1.6), Math.round(28 * sc));

  const hourAngle   = computeHourAngle(hour, minute);
  const minuteAngle = computeMinuteAngle(minute);

  const getNumberPosition = (n) => {
    const angleDeg = n * 30 - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    const r = radius - numberInset;
    return {
      left: radius + r * Math.cos(angleRad) - numberBoxWidth / 2,
      top:  radius + r * Math.sin(angleRad) - numberFontSize * 0.75,
    };
  };

  const renderTick = (i) => {
    const isMajor  = i % 5 === 0;
    const tickLen  = (isMajor ? 10 : 5) * sc;
    const tickW    = (isMajor ? 3 : 1.5) * sc;
    const angleDeg = i * 6 - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    const r  = radius - tickLen / 2 - 4 * sc;
    const cx = radius + r * Math.cos(angleRad);
    const cy = radius + r * Math.sin(angleRad);
    return (
      <View
        key={i}
        style={{
          position: 'absolute',
          width: tickW,
          height: tickLen,
          left: cx - tickW / 2,
          top: cy - tickLen / 2,
          transform: [{ rotate: `${angleDeg + 90}deg` }],
          backgroundColor: isMajor ? Colors.onSurfaceVariant : Colors.outlineVariant,
        }}
      />
    );
  };

  return (
    <View
      style={[
        styles.clockFace,
        {
          width: size,
          height: size,
          borderRadius: radius,
          borderWidth: Math.max(1, Math.round(2 * sc)),
        },
      ]}
    >
      {Array.from({ length: 60 }, (_, i) => renderTick(i))}

      {CLOCK_NUMBERS.map((n) => {
        const pos = getNumberPosition(n);
        return (
          <Text
            key={n}
            style={[
              styles.number,
              {
                left: pos.left,
                top: pos.top,
                fontSize: numberFontSize,
                width: numberBoxWidth,
              },
            ]}
          >
            {n}
          </Text>
        );
      })}

      {/* Minute hand */}
      <View
        style={{
          position: 'absolute',
          top: radius,
          left: radius,
          width: 0,
          height: 0,
          transform: [{ rotate: `${minuteAngle}deg` }],
        }}
      >
        <View
          style={{
            position: 'absolute',
            width: minuteHandWidth,
            height: minuteHandLength,
            borderRadius: minuteHandWidth / 2,
            backgroundColor: '#2196F3',
            borderWidth: Math.max(1, Math.round(2 * sc)),
            borderBottomWidth: Math.max(2, Math.round(4 * sc)),
            borderColor: '#1565C0',
            bottom: 0,
            left: -(minuteHandWidth / 2),
          }}
        />
      </View>

      {/* Hour hand */}
      <View
        style={{
          position: 'absolute',
          top: radius,
          left: radius,
          width: 0,
          height: 0,
          transform: [{ rotate: `${hourAngle}deg` }],
        }}
      >
        <View
          style={{
            position: 'absolute',
            width: hourHandWidth,
            height: hourHandLength,
            borderRadius: hourHandWidth / 2,
            backgroundColor: '#4CAF50',
            borderWidth: Math.max(1, Math.round(2 * sc)),
            borderBottomWidth: Math.max(2, Math.round(4 * sc)),
            borderColor: '#388E3C',
            bottom: 0,
            left: -(hourHandWidth / 2),
          }}
        />
      </View>

      {/* Center dot — sits above both hands */}
      <View
        style={{
          position: 'absolute',
          width: centerDotSize,
          height: centerDotSize,
          borderRadius: centerDotSize / 2,
          backgroundColor: Colors.onSurface,
          top: radius - centerDotSize / 2,
          left: radius - centerDotSize / 2,
          zIndex: 10,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  clockFace: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderColor: Colors.outlineVariant,
    position: 'relative',
  },
  number: {
    position: 'absolute',
    fontFamily: 'Lexend-Bold',
    color: Colors.onSurface,
    textAlign: 'center',
  },
});
