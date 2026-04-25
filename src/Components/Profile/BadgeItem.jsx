import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import AssetDisplay from '@/Components/Game/Global/AssetDisplay';
import Colors from '@/constants/colors';

export default function BadgeItem({ title, subtitle, assetId, earned = false }) {
  const translateY = useSharedValue(0);
  const borderBottomWidth = useSharedValue(6);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    borderBottomWidth: borderBottomWidth.value,
  }));

  const handlePressIn = () => {
    translateY.value = withSpring(4, { damping: 15 });
    borderBottomWidth.value = withSpring(2, { damping: 15 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    translateY.value = withSpring(0, { damping: 15 });
    borderBottomWidth.value = withSpring(6, { damping: 15 });
  };

  const card = (
    <Animated.View style={[styles.card, animatedStyle, earned ? styles.cardEarned : styles.cardLocked]}>
      {earned ? (
        <LinearGradient
          colors={[Colors.primaryContainer, Colors.surfaceContainerLow]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          borderRadius={16}
        />
      ) : null}

      {/* Icon ring */}
      <View style={[styles.iconRing, earned ? styles.iconRingEarned : styles.iconRingLocked]}>
        {earned ? (
          <AssetDisplay assetId={assetId} style={styles.iconAsset} emojiSize={34} />
        ) : (
          <Text style={styles.lockEmoji}>🔒</Text>
        )}
      </View>

      {/* Earned stamp */}
      {earned ? (
        <View style={styles.earnedStamp}>
          <Text style={styles.earnedStampText}>EARNED</Text>
        </View>
      ) : null}

      <Text style={[styles.title, !earned && styles.textMuted]} numberOfLines={2}>
        {title}
      </Text>

      {subtitle ? (
        <Text style={[styles.subtitle, !earned && styles.textMuted]} numberOfLines={2}>
          {subtitle}
        </Text>
      ) : null}
    </Animated.View>
  );

  if (!earned) {
    return <View style={styles.lockedWrapper}>{card}</View>;
  }

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
      {card}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  lockedWrapper: {
    opacity: 0.45,
  },
  card: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 14,
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: Colors.surfaceContainerLow,
  },
  cardEarned: {
    borderColor: Colors.outlineVariant,
  },
  cardLocked: {
    borderColor: Colors.outlineVariant,
  },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
  },
  iconRingEarned: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.onPrimaryContainer,
  },
  iconRingLocked: {
    backgroundColor: Colors.surfaceContainerHighest,
    borderColor: Colors.outlineVariant,
  },
  iconAsset: {
    width: 44,
    height: 44,
  },
  lockEmoji: {
    fontSize: 28,
  },
  earnedStamp: {
    backgroundColor: Colors.tertiary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 8,
  },
  earnedStampText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 9,
    color: Colors.onTertiary,
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: 'Lexend-Bold',
    fontSize: 14,
    color: Colors.onSurface,
    textAlign: 'center',
    marginTop: 2,
  },
  subtitle: {
    marginTop: 4,
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 15,
  },
  textMuted: {
    color: Colors.onSurfaceVariant,
  },
});
