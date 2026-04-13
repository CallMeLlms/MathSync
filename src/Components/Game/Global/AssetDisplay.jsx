import React from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import { getAsset } from '@/constants/assetMap';
import Colors from '@/constants/colors';

/**
 * Universal Game Asset Render
 *
 * Handles displaying assets retrieved from the Smart Registry (assetMap.js) safely.
 *
 * Supports two asset types:
 *   1. Image assets: require() objects — rendered as a standard <Image>.
 *   2. Emoji assets: Strings prefixed with 'emoji:' (e.g., 'emoji:🦆') — rendered
 *      as a scaled <Text> component. This bridges the "TODO" visual asset gap while
 *      real production assets are being created.
 *
 * When a real asset is ready, only assetMap.js needs to be updated — no component changes needed.
 */
export default function AssetDisplay({
  assetId,
  style,
  resizeMode = 'contain',
  fallbackContent = null,
  emojiSize,
}) {
  const assetSource = getAsset(assetId);

  // --- Emoji path ---
  if (typeof assetSource === 'string' && assetSource.startsWith('emoji:')) {
    const emoji = assetSource.slice(6); // strip 'emoji:' prefix
    return (
      <View style={[styles.emojiContainer, style]}>
        <Text
          style={[
            styles.emojiText,
            emojiSize ? { fontSize: emojiSize } : null,
          ]}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {emoji}
        </Text>
      </View>
    );
  }

  // --- Missing asset path ---
  if (!assetSource) {
    if (fallbackContent) return fallbackContent;
    return (
      <View style={[styles.fallbackContainer, style]}>
        <View style={styles.fallbackBox} />
      </View>
    );
  }

  // --- Image path ---
  return (
    <Image
      source={assetSource}
      style={[styles.image, style]}
      resizeMode={resizeMode}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  emojiContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  emojiText: {
    fontSize: 48,
    textAlign: 'center',
  },
  fallbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    overflow: 'hidden',
  },
  fallbackBox: {
    width: '50%',
    height: '50%',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 4,
  },
});
