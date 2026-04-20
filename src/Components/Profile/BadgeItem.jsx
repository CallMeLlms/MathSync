import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  runOnJS
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
    translateY.value = withSpring(4);
    borderBottomWidth.value = withSpring(2);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    translateY.value = withSpring(0);
    borderBottomWidth.value = withSpring(6);
  };

  const CardContent = (
    <>
      <Animated.View style={[styles.iconShell, earned ? styles.iconEarned : styles.iconLocked]}>
        <AssetDisplay assetId={assetId} style={styles.iconAsset} emojiSize={36} />
      </Animated.View>

      <Text style={[styles.title, !earned && styles.lockedText]} numberOfLines={2}>
        {title}
      </Text>

      {subtitle ? (
        <Text style={[styles.subtitle, !earned && styles.lockedText]} numberOfLines={2}>
          {subtitle}
        </Text>
      ) : null}
    </>
  );

  return (
    <Pressable 
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[
        styles.card, 
        earned ? styles.cardEarned : styles.cardLocked,
        animatedStyle
      ]}>
        {earned ? (
          <LinearGradient
            colors={[Colors.surfaceContainerLowest, Colors.surfaceContainerLow]}
            style={StyleSheet.absoluteFill}
            borderRadius={20}
          />
        ) : null}
        {CardContent}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 168,
    overflow: 'hidden',
    borderColor: Colors.outlineVariant,
  },
  cardEarned: {
    backgroundColor: Colors.surfaceContainerLowest,
  },
  cardLocked: {
    backgroundColor: Colors.surfaceContainerLow,
    borderColor: Colors.outlineVariant,
    opacity: 0.8,
  },
  iconShell: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
  },
  iconEarned: {
    backgroundColor: Colors.primaryContainer,
  },
  iconLocked: {
    backgroundColor: Colors.surfaceContainerHighest,
  },
  iconAsset: {
    width: 48,
    height: 48,
  },
  title: {
    fontFamily: 'Lexend-Bold',
    fontSize: 15,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 4,
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 14,
  },
  lockedText: {
    color: Colors.onSurfaceVariant,
  },
});
