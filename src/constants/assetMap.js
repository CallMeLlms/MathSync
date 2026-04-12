/**
 * MathSync Game Asset Registry
 * React Native bundlers cannot require() dynamic paths at runtime easily.
 * All dynamic game images must be registered here.
 */
export const AssetMap = {
  // ─── Quarter 1: Shapes (shapesQuestionBank.json) ───────────────
  // TODO: Add actual PNG/SVG assets to @assets/images/games/
  // 'g1_q1_shape_triangle': require('@assets/images/games/g1_q1_shape_triangle.png'),
  // 'g1_q1_shape_square': require('@assets/images/games/g1_q1_shape_square.png'),
  // 'g1_q1_object_door': require('@assets/images/games/g1_q1_object_door.png'),

  // ─── Quarter 2: Pictorial Addition (pictorialAdditionTo100QuestionBank.json) ───
  // 'g1_q2_manipulative_tens_block': require('@assets/images/games/g1_q2_manipulative_tens_block.png'),
  // 'g1_q2_manipulative_tens_ones_block': require('@assets/images/games/g1_q2_manipulative_tens_ones_block.png'),
  // 'g1_q2_manipulative_stick_bundle': require('@assets/images/games/g1_q2_manipulative_stick_bundle.png'),
  // 'g1_q2_diagram_base10_addition': require('@assets/images/games/g1_q2_diagram_base10_addition.png'),
  // 'g1_q2_diagram_bundle_count': require('@assets/images/games/g1_q2_diagram_bundle_count.png'),

  // ─── Shared: Icons ───────────────────────────────────────────
  'icon_bread': require('@assets/games/shared/icons/Bread.webp'),
  'icon_calamansi': require('@assets/games/shared/icons/Calamansi.webp'),
  'icon_mango': require('@assets/games/shared/icons/Mango.webp'),
  'icon_seashells': require('@assets/games/shared/icons/Seashells.webp'),

  // ─── Shared: Shapes ───────────────────────────────────────────
  'shape_circle': require('@assets/games/shared/shapes/CircleShape.webp'),
  'shape_rectangle': require('@assets/games/shared/shapes/RectangleShpae.webp'),
  'shape_square': require('@assets/games/shared/shapes/SquareShape.webp'),
  'shape_triangle': require('@assets/games/shared/shapes/TriangleShape.webp'),

  // ─── Shared: Money ───────────────────────────────────────────
  'money_bill_50': require('@assets/games/shared/money/Bill50.webp'),
  'money_bill_100': require('@assets/games/shared/money/Bill100.webp'),
  'money_bill_500': require('@assets/games/shared/money/Bill500.webp'),
  'money_bill_1000': require('@assets/games/shared/money/Bill1000.webp'),
  'money_coin_1': require('@assets/games/shared/money/Coin1.webp'),
  'money_coin_5': require('@assets/games/shared/money/Coin5.webp'),
  'money_coin_10': require('@assets/games/shared/money/Coin10.webp'),
  'money_coin_20': require('@assets/games/shared/money/Coin20.webp'),

  // ─── Shared: Clocks ───────────────────────────────────────────
  'clock_face_3_00': require('@assets/games/shared/clocks/Clock-Face-3_00.webp'),
  'clock_face_7_30': require('@assets/games/shared/clocks/Clock-Face-7_30.webp'),
  'clock_face_10_00': require('@assets/games/shared/clocks/Clock-Face-10_00.webp'),

  // ─── Quarter 4: Money (moneyIdentificationQuestionBank.json) ───
  // 'g1_q4_money_peso_1_coin': require('@assets/images/games/g1_q4_money_peso_1_coin.png'),
  // 'g1_q4_money_peso_5_coin': require('@assets/images/games/g1_q4_money_peso_5_coin.png'),
  // 'g1_q4_money_peso_20_bill': require('@assets/images/games/g1_q4_money_peso_20_bill.png'),
  // 'g1_q4_money_peso_100_bill': require('@assets/images/games/g1_q4_money_peso_100_bill.png'),
  // 'g1_q4_money_peso_coins_set': require('@assets/images/games/g1_q4_money_peso_coins_set.png'),
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
