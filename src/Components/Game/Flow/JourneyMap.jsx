import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Colors from '@/constants/colors';

const NODE_SIZE = 64;
const NODE_PADDING = 120; // px breathing room at top and bottom

// ─── Active Node ───
const ActiveNode = ({ level, onPress }) => {
  const tap = Gesture.Tap()
    .onEnd(() => {
      if (onPress) runOnJS(onPress)(level);
    });

  return (
    <GestureDetector gesture={tap}>
      <View style={styles.activeOuterRing}>
        <View style={styles.glowRing} />
        <LinearGradient
          colors={[Colors.primary, '#803400']}
          style={styles.activeInnerNode}
        >
          {level.type === 'boss' ? (
            <FontAwesome5 name="star" size={24} color="#ffffff" solid />
          ) : (
            <Feather name={level.icon || 'play'} size={26} color="#ffffff" />
          )}
        </LinearGradient>
      </View>
    </GestureDetector>
  );
};

/**
 * JourneyMap Component
 * Standardized curriculum map renderer.
 *
 * @param {Array} levels - Array of node objects [{id, title, x, y, status, icon, type}]
 * @param {Function} onNodePress - Callback when a node is tapped
 */
export default function JourneyMap({ levels = [], onNodePress }) {
  const { width } = useWindowDimensions();
  const scrollRef = useRef(null);

  // ── Dynamic height calculation ──────────────────────────────────────
  // y values in the JSON can go negative (e.g. Q4 nodes). We normalize
  // the full y range → [NODE_PADDING, MAP_HEIGHT - NODE_PADDING] so every
  // node always lands inside the scrollable content area.
  const yValues = levels.map(l => l.y);
  const yMin = yValues.length > 0 ? Math.min(...yValues) : 0;
  const yMax = yValues.length > 0 ? Math.max(...yValues) : 1;
  const ySpan = (yMax - yMin) || 1;

  // Keep ~2400 px density for a y-range of 1.0; scale up for larger spans.
  const MAP_HEIGHT = Math.ceil(ySpan * 2400) + NODE_PADDING * 2;

  // Convert a raw y coordinate to an absolute pixel position.
  const mapY = (y) =>
    ((y - yMin) / ySpan) * (MAP_HEIGHT - NODE_PADDING * 2) + NODE_PADDING;

  // Sort by ascending mapped y (top → bottom in scroll direction)
  const sortedLevels = [...levels].sort((a, b) => a.y - b.y);

  // Scroll to the bottom on mount so the user starts at node 1 (first lesson)
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: false });
    }, 100);
    return () => clearTimeout(timer);
  }, [levels]);

  // ── SVG path ────────────────────────────────────────────────────────
  const generatePath = () => {
    if (sortedLevels.length === 0) return '';
    const firstP = sortedLevels[0];
    let pathD = `M ${firstP.x * width} ${mapY(firstP.y)}`;

    for (let i = 1; i < sortedLevels.length; i++) {
      const prev = sortedLevels[i - 1];
      const curr = sortedLevels[i];
      const prevPx = mapY(prev.y);
      const currPx = mapY(curr.y);
      const midDiff = (currPx - prevPx) / 2;

      const cp1x = prev.x * width;
      const cp1y = prevPx + midDiff;
      const cp2x = curr.x * width;
      const cp2y = currPx - midDiff;

      pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x * width} ${currPx}`;
    }
    return pathD;
  };

  // ── Node renderer ────────────────────────────────────────────────────
  const renderNode = (level) => {
    const top = mapY(level.y) - NODE_SIZE / 2;
    const left = level.x * width - NODE_SIZE / 2;

    let NodeContent;

    switch (level.status) {
      case 'completed': {
        const completedTap = Gesture.Tap()
          .onEnd(() => { if (onNodePress) runOnJS(onNodePress)(level); });

        NodeContent = (
          <GestureDetector gesture={completedTap}>
            <View>
              <LinearGradient
                colors={[Colors.success, '#1b5e20']}
                style={styles.completedNode}
              >
                <Feather name="check" size={28} color="#ffffff" />
              </LinearGradient>
            </View>
          </GestureDetector>
        );
        break;
      }
      case 'active':
        NodeContent = (
          <ActiveNode level={level} onPress={onNodePress} />
        );
        break;
      case 'locked':
      default: {
        const lockedTap = Gesture.Tap()
          .onEnd(() => { if (onNodePress) runOnJS(onNodePress)(level); });

        NodeContent = (
          <GestureDetector gesture={lockedTap}>
            <View style={styles.lockedNode}>
              <Feather name={level.status === 'locked' ? 'lock' : 'circle'} size={24} color={Colors.onSurfaceVariant} />
            </View>
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
        <View style={styles.labelContainer}>
          <Text style={[
            styles.labelText,
            level.status === 'active' && styles.labelTextActive,
            level.status === 'locked' && styles.labelTextLocked,
          ]}>
            {level.title}
          </Text>
          {level.subtitle && (
            <Text style={styles.subtitleText}>{level.subtitle}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ height: MAP_HEIGHT + 100 }}
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

        {/* Nodes superimposed on path */}
        {levels.map((level) => renderNode(level))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  // ─── Active ───
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
