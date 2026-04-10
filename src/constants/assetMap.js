/**
 * MathSync Game Asset Registry
 * React Native bundlers cannot require() dynamic paths at runtime easily.
 * All dynamic game images must be registered here.
 */
export const AssetMap = {
  // --- Game Imagery ---
  // Example for future:
  // 'apple': require('@assets/images/games/apple.png'),
  
  // --- Audio ---
  // Example for future:
  // 'correct_bell': require('@assets/audio/games/correct_bell.mp3'),
};

/**
 * Helper function to retrieve an asset by ID
 * @param {string} assetId 
 * @returns {any} The React Native required asset source
 */
export const getAsset = (assetId) => {
  if (!assetId) return null;
  const asset = AssetMap[assetId];
  if (!asset) {
    console.warn(`[AssetMap] Warning: Asset "${assetId}" not found in registry.`);
    return null;
  }
  return asset;
};
