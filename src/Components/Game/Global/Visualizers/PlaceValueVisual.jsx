import React, { memo, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withDelay,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";

// Threshold for switching from individual blocks to grouped (×N) display
const GROUP_THRESHOLD = 5;

// Standard base-10 block colors for educational clarity
const BLOCK_COLORS = {
  thousands: { fill: "#9C27B0", border: "#6A1B9A" },
  hundreds: { fill: "#FF5722", border: "#D84315" },
  tens: { fill: "#2196F3", border: "#1565C0" },
  ones: { fill: "#4CAF50", border: "#2E7D32" },
};

/**
 * PlaceGroup Component
 * Renders a group of blocks for a specific place (ones, tens, hundreds, thousands).
 * Retains multiplier logic for performance and clean UI when count > 5.
 */
const PlaceGroup = memo(({ place, count, index, isHighlighted, compact, theme }) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      index * 60,
      withSpring(1, { damping: 12, stiffness: 120 })
    );
    return () => cancelAnimation(scale);
  }, [index, count]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const colors = BLOCK_COLORS[place] || { fill: theme.primaryColor, border: theme.secondaryColor || '#333' };
  const blockSize = getBlockSize(place, compact);
  
  const useMultiplier = count > GROUP_THRESHOLD;
  const displayCount = useMultiplier ? 1 : count;

  const highlightStyle = isHighlighted ? {
    shadowColor: colors.fill,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  } : {};

  if (count === 0) return null; // Don't render empty places for cleanliness

  return (
    <Animated.View style={[styles.placeGroup, animatedStyle, highlightStyle]}>
      <View style={styles.blocksContainer}>
        {useMultiplier ? (
          // Grouped format
          <View style={styles.groupedBlock}>
            <View style={[styles.block, blockSize, { backgroundColor: colors.fill, borderColor: colors.border }]}>
              {renderBlockContent(place, compact)}
            </View>
            <View style={[styles.multiplierBadge, { backgroundColor: colors.border }]}>
              <Text style={[styles.multiplierText, { fontFamily: theme.fontFamily.accent }]}>×{count}</Text>
            </View>
          </View>
        ) : (
          // Individual blocks layout
          <View style={styles.individualBlocks}>
            {Array.from({ length: displayCount }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.block,
                  blockSize,
                  { backgroundColor: colors.fill, borderColor: colors.border },
                  i < displayCount - 1 && styles.blockMargin,
                ]}
              >
                {renderBlockContent(place, compact)}
              </View>
            ))}
          </View>
        )}
      </View>
      <Text style={[styles.placeLabel, { color: colors.border, fontFamily: theme.fontFamily.accent }]}>
        {getPlaceLabel(place)}
      </Text>
    </Animated.View>
  );
});

/**
 * Renders the internal structural markings of each block type
 */
const renderBlockContent = (place, compact) => {
  if (compact) return null;

  switch (place) {
    case "thousands":
      return <View style={styles.cubeContent}><Text style={styles.blockIcon}>🧊</Text></View>;
    case "hundreds":
      return (
        <View style={styles.flatContent}>
          <View style={styles.flatGrid}>
            {[...Array(9)].map((_, i) => <View key={i} style={styles.flatCell} />)}
          </View>
        </View>
      );
    case "tens":
      return (
        <View style={styles.rodContent}>
          {[...Array(5)].map((_, i) => <View key={i} style={styles.rodCell} />)}
        </View>
      );
    case "ones":
      return <View style={styles.unitContent}><View style={styles.unitDot} /></View>;
    default:
      return null;
  }
};

const getBlockSize = (place, compact) => {
  const m = compact ? 0.7 : 1;
  switch (place) {
    case "thousands": return { width: 50 * m, height: 50 * m };
    case "hundreds": return { width: 44 * m, height: 44 * m };
    case "tens": return { width: 22 * m, height: 50 * m };
    case "ones": return { width: 20 * m, height: 20 * m };
    default: return { width: 30, height: 30 };
  }
};

const getPlaceLabel = (place) => {
  switch (place) {
    case "thousands": return "1000s";
    case "hundreds": return "100s";
    case "tens": return "10s";
    case "ones": return "1s";
    default: return place;
  }
};

/**
 * PlaceValueVisual
 * Renders base-10 block representations dynamically based on problem values.
 */
export default function PlaceValueVisual({ 
  placeValues, 
  highlightPlace = null, 
  compact = false,
  theme 
}) {
  if (!placeValues) return null;

  const { ones = 0, tens = 0, hundreds = 0, thousands = 0 } = placeValues;

  const places = [];
  if (thousands > 0) places.push({ place: "thousands", count: thousands });
  if (hundreds > 0 || thousands > 0) places.push({ place: "hundreds", count: hundreds });
  if (tens > 0 || hundreds > 0 || thousands > 0) places.push({ place: "tens", count: tens });
  places.push({ place: "ones", count: ones });

  return (
    <View style={styles.container}>
      <View style={[styles.blocksRow, compact && styles.blocksRowCompact]}>
        {places.map(({ place, count }, index) => (
          <PlaceGroup
            key={place}
            place={place}
            count={count}
            index={index}
            isHighlighted={highlightPlace === place}
            compact={compact}
            theme={theme}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  blocksRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 16,
  },
  blocksRowCompact: {
    gap: 10,
  },
  placeGroup: {
    alignItems: "center",
  },
  blocksContainer: {
    marginBottom: 6,
  },
  groupedBlock: {
    position: "relative",
    alignItems: "center",
  },
  individualBlocks: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 2,
    maxWidth: 90,
  },
  block: {
    borderRadius: 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  blockMargin: {
    marginRight: 2,
  },
  multiplierBadge: {
    position: "absolute",
    top: -10,
    right: -12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  multiplierText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  placeLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  // Block Content Specs
  cubeContent: { alignItems: "center", justifyContent: "center" },
  blockIcon: { fontSize: 20 },
  flatContent: { flex: 1, padding: 3 },
  flatGrid: { flexDirection: "row", flexWrap: "wrap", gap: 1 },
  flatCell: { width: 10, height: 10, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 1 },
  rodContent: { flex: 1, paddingVertical: 4, gap: 2, alignItems: "center" },
  rodCell: { width: 12, height: 6, backgroundColor: "rgba(255,255,255,0.4)", borderRadius: 2 },
  unitContent: { flex: 1, alignItems: "center", justifyContent: "center" },
  unitDot: { width: 8, height: 8, backgroundColor: "rgba(255,255,255,0.5)", borderRadius: 4 },
});
