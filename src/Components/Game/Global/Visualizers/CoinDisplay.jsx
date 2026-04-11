import React, { memo, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  cancelAnimation
} from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const COIN_SIZE = Math.min(SCREEN_HEIGHT * 0.08, 60);
const MAX_VISUAL_HEIGHT = SCREEN_HEIGHT * 0.3;

const COIN_STYLES = {
  quarters: {
    bg: "#FFD54F",
    border: "#F9A825",
    label: "25¢",
    name: "Quarter",
  },
  dimes: {
    bg: "#E0E0E0",
    border: "#9E9E9E",
    label: "10¢",
    name: "Dime",
  },
  nickels: {
    bg: "#FFE0B2",
    border: "#FB8C00",
    label: "5¢",
    name: "Nickel",
  },
  pennies: {
    bg: "#FFAB91",
    border: "#D84315",
    label: "1¢",
    name: "Penny",
  },
};

/**
 * Animated Coin wrapper for pop-in entrance
 */
const AnimatedCoin = ({ bg, border, label, index }) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      index * 50,
      withSpring(1, { damping: 10, stiffness: 200 })
    );
    return () => cancelAnimation(scale);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.coin,
        { backgroundColor: bg, borderColor: border },
        animatedStyle,
      ]}
    >
      <Text style={styles.coinLabel}>{label}</Text>
    </Animated.View>
  );
};

const CoinDisplay = ({ coins, theme }) => {
  if (!coins) return null;

  const visibleCoins = Object.entries(coins)
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => ({ type, count, ...COIN_STYLES[type] }));

  if (visibleCoins.length === 0) return null;

  let globalCoinIndex = 0;

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {visibleCoins.map(({ type, count, bg, border, label, name }) => (
        <View key={type} style={styles.coinGroup}>
          <View style={styles.coinRow}>
            {Array.from({ length: Math.min(count, 10) }, (_, i) => {
              const animIndex = globalCoinIndex++;
              return (
                <AnimatedCoin 
                  key={`${type}-${i}`} 
                  bg={bg} 
                  border={border} 
                  label={label} 
                  index={animIndex} 
                />
              );
            })}
          </View>
          {/* Using theme font mapping if available */}
          <Text style={[styles.coinName, theme ? { fontFamily: theme.fontFamily.accent } : {}]}>
            {count}× {name}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    maxHeight: MAX_VISUAL_HEIGHT,
    width: "100%",
  },
  contentContainer: {
    alignItems: "center",
    paddingVertical: 10,
    gap: 16,
  },
  coinGroup: {
    alignItems: "center",
    width: "100%",
  },
  coinRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    marginBottom: 6,
    paddingHorizontal: 12,
  },
  coin: {
    width: COIN_SIZE,
    height: COIN_SIZE,
    borderRadius: COIN_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderBottomWidth: 4, // Tactile depth
  },
  coinLabel: {
    fontFamily: "SatoshiBlack", // Legacy fallback, we generally override via theme in parent, but hardcoded inner text is fine
    fontSize: COIN_SIZE * 0.35,
    color: "#37474F",
  },
  coinName: {
    fontFamily: "SatoshiMedium",
    fontSize: 14,
    color: "#78909C",
    marginTop: 2,
  },
});

export default memo(CoinDisplay);
