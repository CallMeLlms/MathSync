import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Feather, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  FadeIn,
  ZoomIn,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Colors from '@/constants/colors';

const AnimatedTouchable = Animated.View;

// ─── Firefly Particle ───
const Firefly = ({ delay, startX, startY, size = 6 }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay,
      withRepeat(
        withSequence(
          withTiming(0.7, { duration: 1500 }),
          withTiming(0.1, { duration: 2000 }),
          withTiming(0.5, { duration: 1000 }),
          withTiming(0, { duration: 1500 })
        ),
        -1,
        false
      )
    );
    translateY.value = withDelay(delay,
      withRepeat(
        withSequence(
          withTiming(-20, { duration: 3000 }),
          withTiming(10, { duration: 2500 }),
          withTiming(-15, { duration: 2000 })
        ),
        -1,
        true
      )
    );
    translateX.value = withDelay(delay,
      withRepeat(
        withSequence(
          withTiming(12, { duration: 2500 }),
          withTiming(-8, { duration: 3000 }),
          withTiming(5, { duration: 2000 })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.firefly,
        animatedStyle,
        {
          left: startX,
          top: startY,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    />
  );
};

// ─── Pulsing Active Node ───
const ActiveNode = ({ level, onPress, theme }) => {
  const pulseScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.4);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1000 }),
        withTiming(1.0, { duration: 1000 })
      ),
      -1,
      true
    );
    ringOpacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
  }));

  const tap = Gesture.Tap()
    .onEnd(() => {
      if (onPress) runOnJS(onPress)(level);
    });

  return (
    <GestureDetector gesture={tap}>
      <Animated.View entering={ZoomIn.springify()} style={[styles.activeOuterRing, pulseStyle]}>
        {/* Animated glow ring */}
        <Animated.View style={[styles.glowRing, ringStyle]} />
        <LinearGradient
          colors={[Colors.primary, '#803400']}
          style={styles.activeInnerNode}
        >
          {level.type === 'boss' ? (
            <FontAwesome5 name="star" size={24} color="#ffffff" solid />
          ) : (
            <MaterialIcons name={level.icon || 'play-arrow'} size={28} color="#ffffff" />
          )}
        </LinearGradient>
      </Animated.View>
    </GestureDetector>
  );
};

/**
 * JourneyMap Component
 * Standardized, high-aesthetic curriculum map renderer with ambient animations.
 * 
 * @param {Array} levels - Array of node objects [{id, title, x, y, status, icon, type}]
 * @param {Function} onNodePress - Callback when a node is tapped
 */
export default function JourneyMap({ levels = [], onNodePress }) {
  const { width } = useWindowDimensions();
  const MAP_HEIGHT = 1000;
  const NODE_SIZE = 64;

  // Sort levels by Y coordinate to draw the path correctly top-to-bottom
  const sortedLevels = [...levels].sort((a, b) => a.y - b.y);

  // Generate a smooth curvy path between the nodes
  const generatePath = () => {
    if (sortedLevels.length === 0) return "";
    const firstP = sortedLevels[0];
    let pathD = `M ${firstP.x * width} ${firstP.y * MAP_HEIGHT}`;

    for (let i = 1; i < sortedLevels.length; i++) {
      const prev = sortedLevels[i - 1];
      const curr = sortedLevels[i];

      const cp1x = prev.x * width;
      const cp1y = prev.y * MAP_HEIGHT + ((curr.y - prev.y) * MAP_HEIGHT) / 2;
      const cp2x = curr.x * width;
      const cp2y = curr.y * MAP_HEIGHT - ((curr.y - prev.y) * MAP_HEIGHT) / 2;

      pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x * width} ${curr.y * MAP_HEIGHT}`;
    }
    return pathD;
  };

  // Generate firefly positions scattered across the map
  const fireflies = React.useMemo(() => {
    const particles = [];
    for (let i = 0; i < 12; i++) {
      particles.push({
        id: `firefly-${i}`,
        x: Math.random() * (width - 20),
        y: Math.random() * (MAP_HEIGHT - 40) + 20,
        delay: i * 400,
        size: Math.random() * 4 + 4,
      });
    }
    return particles;
  }, [width]);

  const renderNode = (level, index) => {
    const top = level.y * MAP_HEIGHT - (NODE_SIZE / 2);
    const left = level.x * width - (NODE_SIZE / 2);

    let NodeContent;

    switch (level.status) {
      case 'completed': {
        const completedTap = Gesture.Tap()
          .onEnd(() => { if (onNodePress) runOnJS(onNodePress)(level); });

        NodeContent = (
          <GestureDetector gesture={completedTap}>
            <Animated.View entering={FadeIn.delay(index * 100)}>
              <LinearGradient
                colors={[Colors.success, '#1b5e20']}
                style={styles.completedNode}
              >
                <Feather name="check" size={28} color="#ffffff" />
              </LinearGradient>
            </Animated.View>
          </GestureDetector>
        );
        break;
      }
      case 'active':
        NodeContent = (
          <ActiveNode
            level={level}
            onPress={onNodePress}
          />
        );
        break;
      case 'locked':
      default: {
        const lockedTap = Gesture.Tap()
          .onEnd(() => { if (onNodePress) runOnJS(onNodePress)(level); });

        NodeContent = (
          <GestureDetector gesture={lockedTap}>
            <Animated.View entering={FadeIn.delay(index * 100)} style={styles.lockedNode}>
              <Feather name={level.status === 'locked' ? 'lock' : 'circle'} size={24} color={Colors.onSurfaceVariant} />
            </Animated.View>
          </GestureDetector>
        );
        break;
      }
    }

    return (
      <View key={level.id} style={[styles.nodeContainer, { top, left }]}>
        <View style={styles.nodeTouchable}>
          {NodeContent}
        </View>

        <Animated.View entering={FadeIn.delay(index * 100 + 200)} style={styles.labelContainer}>
          <Text style={[
            styles.labelText,
            level.status === 'active' && styles.labelTextActive,
            level.status === 'locked' && styles.labelTextLocked
          ]}>
            {level.title}
          </Text>
          {level.subtitle && (
            <Text style={styles.subtitleText}>{level.subtitle}</Text>
          )}
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ height: MAP_HEIGHT + 160, paddingVertical: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Background SVG Path */}
        <Svg height={MAP_HEIGHT} width={width} style={StyleSheet.absoluteFill}>
          <Path
            d={generatePath()}
            fill="none"
            stroke={Colors.surfaceContainerHigh}
            strokeWidth={18}
            strokeLinecap="round"
          />
          <Path
            d={generatePath()}
            fill="none"
            stroke={Colors.surfaceContainerHighest}
            strokeWidth={8}
            strokeLinecap="round"
          />
        </Svg>

        {/* Ambient Firefly Particles */}
        {fireflies.map((f) => (
          <Firefly
            key={f.id}
            startX={f.x}
            startY={f.y}
            delay={f.delay}
            size={f.size}
          />
        ))}

        {/* Nodes superimposed on path */}
        {levels.map((level, index) => renderNode(level, index))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // ─── Firefly ───
  firefly: {
    position: 'absolute',
    backgroundColor: Colors.primary,
    opacity: 0,
  },
  // ─── Node Layout ───
  nodeContainer: {
    position: 'absolute',
    alignItems: 'center',
    width: 80,
  },
  nodeTouchable: {
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ─── Completed ───
  completedNode: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.surface,
  },
  // ─── Active (Pulsing) ───
  activeOuterRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  glowRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  activeInnerNode: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ─── Locked ───
  lockedNode: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  // ─── Labels ───
  labelContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    minWidth: 110,
    alignItems: 'center',
  },
  labelText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    color: Colors.success,
    textAlign: 'center',
  },
  labelTextActive: {
    fontFamily: 'Lexend-Bold',
    color: Colors.primary,
    fontSize: 15,
  },
  labelTextLocked: {
    fontFamily: 'PlusJakartaSans-Medium',
    color: Colors.onSurfaceVariant,
  },
  subtitleText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 2,
  },
});
