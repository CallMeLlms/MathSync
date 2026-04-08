import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, useWindowDimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import Colors from '@/constants/colors';

/**
 * JourneyMapTest — High-Aesthetic Mockup
 * Features a dynamic winding SVG path, tonal layering (no shadows), and tactile nodes.
 */
export default function JourneyMapTest() {
  const { width } = useWindowDimensions();
  const MAP_HEIGHT = 900; // Simulated scrollable height
  const NODE_SIZE = 64;

  // Level data - positioned relatively (x, y are percentages 0-1)
  // Building from bottom (y: 0.9) to top (y: 0.1)
  const levels = [
    { id: 6, title: 'Final Boss', status: 'locked', x: 0.5, y: 0.1 },
    { id: 5, title: 'Fractions', status: 'locked', x: 0.8, y: 0.25 },
    { id: 4, title: 'Geometry', status: 'locked', x: 0.2, y: 0.4 },
    { id: 3, title: 'Multiplication', status: 'active', x: 0.7, y: 0.55 },
    { id: 2, title: 'Subtraction', status: 'completed', x: 0.3, y: 0.7 },
    { id: 1, title: 'Addition', status: 'completed', x: 0.5, y: 0.85 },
  ];

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

      // Cubic bezier to create a smooth 'S' curve between nodes
      const cp1x = prev.x * width;
      const cp1y = prev.y * MAP_HEIGHT + ((curr.y - prev.y) * MAP_HEIGHT) / 2;
      const cp2x = curr.x * width;
      const cp2y = curr.y * MAP_HEIGHT - ((curr.y - prev.y) * MAP_HEIGHT) / 2;

      pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x * width} ${curr.y * MAP_HEIGHT}`;
    }
    return pathD;
  };

  const renderNode = (level) => {
    // Exact center positions
    const top = level.y * MAP_HEIGHT - (NODE_SIZE / 2);
    const left = level.x * width - (NODE_SIZE / 2);

    let NodeContent;
    let icon;

    switch (level.status) {
      case 'completed':
        icon = <Feather name="check" size={28} color="#ffffff" />;
        NodeContent = (
          <LinearGradient
            colors={[Colors.success, '#1b5e20']}
            style={styles.completedNode}
          >
            {icon}
          </LinearGradient>
        );
        break;
      case 'active':
        // Tonal Layering (No shadows): 
        // A larger outer light ring, and a vibrant inner gradient
        icon = <FontAwesome5 name="star" size={24} color="#ffffff" solid />;
        NodeContent = (
          <View style={styles.activeOuterRing}>
            <LinearGradient
              colors={[Colors.primary, '#803400']}
              style={styles.activeInnerNode}
            >
              {icon}
            </LinearGradient>
          </View>
        );
        break;
      case 'locked':
      default:
        icon = <Feather name="lock" size={24} color={Colors.onSurfaceVariant} />;
        NodeContent = (
          <View style={styles.lockedNode}>
            {icon}
          </View>
        );
        break;
    }

    return (
      <View key={level.id} style={[styles.nodeContainer, { top, left }]}>
        <TouchableOpacity activeOpacity={0.8} style={styles.nodeTouchable}>
          {NodeContent}
        </TouchableOpacity>

        <View style={styles.labelContainer}>
          <Text style={[
            styles.labelText,
            level.status === 'active' && styles.labelTextActive,
            level.status === 'locked' && styles.labelTextLocked
          ]}>
            {level.title}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Title Header overlaying scroll */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Math Journey</Text>
        <Text style={styles.headerSubtitle}>Grade 1 Curriculum</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ height: MAP_HEIGHT }}
        showsVerticalScrollIndicator={false}
      >
        {/* Background SVG Path */}
        <Svg height={MAP_HEIGHT} width={width} style={StyleSheet.absoluteFill}>
          {/* Base thick ghost path */}
          <Path
            d={generatePath()}
            fill="none"
            stroke={Colors.surfaceContainerHigh}
            strokeWidth={18}
            strokeLinecap="round"
          />
          {/* Inner pathway detail */}
          <Path
            d={generatePath()}
            fill="none"
            stroke={Colors.surfaceContainerHighest}
            strokeWidth={8}
            strokeLinecap="round"
          />
        </Svg>

        {/* Nodes superimposed on path */}
        {levels.map(renderNode)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface, // Warm paper
  },
  header: {
    padding: 24,
    backgroundColor: 'rgba(255, 248, 243, 0.9)', // Match Colors.surface with opacity
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerLow,
  },
  headerTitle: {
    fontFamily: 'Lexend-Black',
    fontSize: 28,
    color: Colors.onSurface,
  },
  headerSubtitle: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  nodeContainer: {
    position: 'absolute',
    alignItems: 'center',
    width: 64, // Same as NODE_SIZE
  },
  nodeTouchable: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedNode: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.surface, // To break the line underneath visually
  },
  activeOuterRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.surface, // Punches through the SVG track
  },
  activeInnerNode: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  labelContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  labelText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    color: Colors.success, // Completed color
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
});
