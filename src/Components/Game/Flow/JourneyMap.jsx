import React from 'react';
import { StyleSheet, Text, View, ScrollView, useWindowDimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Feather, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import Colors from '@/constants/colors';

/**
 * JourneyMap Component
 * Standardized, high-aesthetic curriculum map renderer.
 * 
 * @param {Array} levels - Array of node objects [{id, title, x, y, status, icon, type}]
 * @param {Function} onNodePress - Callback when a node is tapped
 */
export default function JourneyMap({ levels = [], onNodePress }) {
  const { width } = useWindowDimensions();
  const MAP_HEIGHT = 900; 
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
    let iconSize = 24;

    switch (level.status) {
      case 'completed':
        NodeContent = (
          <LinearGradient
            colors={[Colors.success, '#1b5e20']}
            style={styles.completedNode}
          >
            <Feather name="check" size={28} color="#ffffff" />
          </LinearGradient>
        );
        break;
      case 'active':
        NodeContent = (
          <View style={styles.activeOuterRing}>
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
          </View>
        );
        break;
      case 'locked':
      default:
        NodeContent = (
          <View style={styles.lockedNode}>
            <Feather name={level.status === 'locked' ? 'lock' : 'circle'} size={24} color={Colors.onSurfaceVariant} />
          </View>
        );
        break;
    }

    return (
      <View key={level.id} style={[styles.nodeContainer, { top, left }]}>
        <TouchableOpacity 
          activeOpacity={0.8} 
          style={styles.nodeTouchable}
          onPress={() => onNodePress && onNodePress(level)}
        >
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
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ height: MAP_HEIGHT }}
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
        {levels.map(renderNode)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  nodeContainer: {
    position: 'absolute',
    alignItems: 'center',
    width: 64, 
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
    borderColor: Colors.surface, 
  },
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
});
