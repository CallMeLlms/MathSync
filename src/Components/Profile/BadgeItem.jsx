import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AssetDisplay from '@/Components/Game/Global/AssetDisplay';
import Colors from '@/constants/colors';

export default function BadgeItem({ title, subtitle, assetId, earned = false }) {
  return (
    <View style={[styles.card, earned ? styles.cardEarned : styles.cardLocked]}>
      <View style={[styles.iconShell, earned ? styles.iconEarned : styles.iconLocked]}>
        <AssetDisplay assetId={assetId} style={styles.iconAsset} emojiSize={36} />
      </View>

      <Text style={[styles.title, !earned && styles.lockedText]} numberOfLines={2}>
        {title}
      </Text>

      {subtitle ? (
        <Text style={[styles.subtitle, !earned && styles.lockedText]} numberOfLines={2}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 168,
  },
  cardEarned: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderColor: Colors.outlineVariant,
  },
  cardLocked: {
    backgroundColor: Colors.surfaceContainerLow,
    borderColor: Colors.surfaceContainerHigh,
  },
  iconShell: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
  },
  iconEarned: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.outlineVariant,
  },
  iconLocked: {
    backgroundColor: Colors.surfaceContainerHighest,
    borderColor: Colors.outlineVariant,
  },
  iconAsset: {
    width: 52,
    height: 52,
  },
  title: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 6,
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  lockedText: {
    color: Colors.onSurfaceVariant,
  },
});
