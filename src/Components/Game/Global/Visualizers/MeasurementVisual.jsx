import React, { memo } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import Colors from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * Unit conversion reference data for visual display
 */
const UNIT_RELATIONSHIPS = {
  "cm-m": { factor: "100 cm = 1 m", smallLabel: "cm", bigLabel: "m", ratio: 100 },
  "m-cm": { factor: "1 m = 100 cm", smallLabel: "cm", bigLabel: "m", ratio: 100 },
  "m-km": { factor: "1000 m = 1 km", smallLabel: "m", bigLabel: "km", ratio: 1000 },
  "km-m": { factor: "1 km = 1000 m", smallLabel: "m", bigLabel: "km", ratio: 1000 },
  "in-ft": { factor: "12 in = 1 ft", smallLabel: "in", bigLabel: "ft", ratio: 12 },
  "ft-in": { factor: "1 ft = 12 in", smallLabel: "in", bigLabel: "ft", ratio: 12 },
  "g-kg": { factor: "1000 g = 1 kg", smallLabel: "g", bigLabel: "kg", ratio: 1000 },
  "kg-g": { factor: "1 kg = 1000 g", smallLabel: "g", bigLabel: "kg", ratio: 1000 },
  "oz-lb": { factor: "16 oz = 1 lb", smallLabel: "oz", bigLabel: "lb", ratio: 16 },
  "lb-oz": { factor: "1 lb = 16 oz", smallLabel: "oz", bigLabel: "lb", ratio: 16 },
  "mL-L": { factor: "1000 mL = 1 L", smallLabel: "mL", bigLabel: "L", ratio: 1000 },
  "L-mL": { factor: "1 L = 1000 mL", smallLabel: "mL", bigLabel: "L", ratio: 1000 },
  "cups-pints": { factor: "2 cups = 1 pint", smallLabel: "cups", bigLabel: "pint", ratio: 2 },
  "pints-quarts": { factor: "2 pints = 1 quart", smallLabel: "pints", bigLabel: "quart", ratio: 2 },
  "quarts-gallons": { factor: "4 quarts = 1 gallon", smallLabel: "quarts", bigLabel: "gallon", ratio: 4 },
};

// Map categories to high-contrast MathSync colors
const CATEGORY_STYLES = {
  length: { barColor: "#00897B", bgColor: "#E0F2F1", iconColor: "#00695C" },
  weight: { barColor: "#E65100", bgColor: "#FFF3E0", iconColor: "#BF360C" },
  capacity: { barColor: "#1565C0", bgColor: "#E3F2FD", iconColor: "#0D47A1" },
};

const MeasurementVisual = ({ 
  fromUnit, 
  toUnit, 
  category = 'length',
  categoryIcon = '📏',
  theme 
}) => {
  const key = `${fromUnit}-${toUnit}`;
  const relationship = UNIT_RELATIONSHIPS[key];
  const catStyle = CATEGORY_STYLES[category] || CATEGORY_STYLES.length;

  if (!relationship) return null;

  // Cap visual segments at 10 for clean UI
  const visualRatio = Math.min(relationship.ratio, 10);

  return (
    <Animated.View 
      layout={LinearTransition}
      style={[
        styles.container, 
        { 
          backgroundColor: catStyle.bgColor,
          borderColor: catStyle.barColor, // Match border to category theme
        }
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.icon}>{categoryIcon}</Text>
        <Text style={[styles.factText, { color: catStyle.iconColor, fontFamily: theme?.fontFamily?.title || 'System' }]}>
          {relationship.factor}
        </Text>
      </View>

      <View style={styles.barsContainer}>
        {/* Large Unit Bar */}
        <View style={styles.barRow}>
          <View style={[styles.bigBar, { backgroundColor: catStyle.barColor, borderColor: catStyle.iconColor }]}>
            <Text style={[styles.barLabel, { fontFamily: theme?.fontFamily?.accent || 'System' }]}>
              1 {relationship.bigLabel}
            </Text>
          </View>
        </View>

        {/* Small Unit Segments */}
        <View style={styles.barRow}>
          <View style={styles.segmentedBar}>
            {Array.from({ length: visualRatio }).map((_, i) => (
              <Animated.View
                key={`seg-${i}`}
                entering={FadeIn.delay(i * 50).duration(200)}
                style={[
                  styles.segment,
                  {
                    backgroundColor: catStyle.barColor + "60",
                    borderRightWidth: i < visualRatio - 1 ? 2 : 0,
                    borderRightColor: catStyle.bgColor,
                    borderTopLeftRadius: i === 0 ? 8 : 0,
                    borderBottomLeftRadius: i === 0 ? 8 : 0,
                    borderTopRightRadius: i === visualRatio - 1 ? 8 : 0,
                    borderBottomRightRadius: i === visualRatio - 1 ? 8 : 0,
                    borderWidth: 2,
                    borderColor: 'transparent', // Space out slightly
                  },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.segmentLabel, { color: catStyle.iconColor, fontFamily: theme?.fontFamily?.accent || 'System' }]}>
            {relationship.ratio > 10 ? `${relationship.ratio} ${relationship.smallLabel}` : `${visualRatio} ${relationship.smallLabel}`}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 12,
    borderWidth: 3,
    borderBottomWidth: 6, // Tactile depth
    width: '100%',
    maxWidth: 400,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 12,
  },
  icon: {
    fontSize: 28,
  },
  factText: {
    fontSize: 20,
  },
  barsContainer: {
    gap: 12,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bigBar: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderBottomWidth: 4, // Tactile inner
    justifyContent: "center",
    alignItems: "center",
  },
  barLabel: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  segmentedBar: {
    flex: 1,
    height: 32,
    flexDirection: "row",
  },
  segment: {
    flex: 1,
  },
  segmentLabel: {
    fontSize: 14,
    minWidth: 60,
  },
});

export default memo(MeasurementVisual);
