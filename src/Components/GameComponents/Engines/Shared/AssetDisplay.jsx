import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { getAsset } from './AssetMap';
import Colors from '@/constants/colors';

/**
 * Universal Game Asset Render
 * Handles displaying images retrieved from the AssetMap safely.
 */
export default function AssetDisplay({
  assetId,
  style,
  resizeMode = 'contain',
  fallbackContent = null,
}) {
  const assetSource = getAsset(assetId);

  if (!assetSource) {
    if (fallbackContent) return fallbackContent;
    
    // Default fallback UI if asset is missing to prevent crash
    return (
      <View style={[styles.fallbackContainer, style]}>
        <View style={styles.fallbackBox} />
      </View>
    );
  }

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
  }
});
