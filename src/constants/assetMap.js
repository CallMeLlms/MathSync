/**
 * MathSync Game Asset Registry — Smart Registry
 *
 * All game asset IDs are registered here. The registry supports two types:
 *   1. Image assets: `require('@assets/...')` — rendered as <Image> by AssetDisplay.
 *   2. Emoji assets: `'emoji:🦆'` strings — rendered as <Text> by AssetDisplay.
 *
 * SVG icon components are in src/constants/iconRegistry.js (checked first by AssetDisplay).
 * When real production assets are ready to replace an emoji, change the value here.
 * No changes needed in JSON banks or in any Engine component.
 */
export const AssetMap = {

  // ─── Shared: Shapes (Real Assets) ────────────────────────────────
  'shape_circle':    require('@assets/games/shared/shapes/CircleShape.webp'),
  'shape_rectangle': require('@assets/games/shared/shapes/RectangleShpae.webp'),
  'shape_square':    require('@assets/games/shared/shapes/SquareShape.webp'),
  'shape_triangle':  require('@assets/games/shared/shapes/TriangleShape.webp'),

  // ─── Shared: Philippine Icons (Real Assets) ───────────────────────
  'icon_bread':      require('@assets/games/shared/icons/Bread.webp'),
  'icon_calamansi':  require('@assets/games/shared/icons/Calamansi.webp'),
  'icon_mango':      require('@assets/games/shared/icons/Mango.webp'),
  'icon_seashells':  require('@assets/games/shared/icons/Seashells.webp'),

  // ─── Shared: Philippine Money (Real Assets) ───────────────────────
  'money_bill_50':   require('@assets/games/shared/money/Bill50.webp'),
  'money_bill_100':  require('@assets/games/shared/money/Bill100.webp'),
  'money_bill_500':  require('@assets/games/shared/money/Bill500.webp'),
  'money_bill_1000': require('@assets/games/shared/money/Bill1000.webp'),
  'money_coin_1':    require('@assets/games/shared/money/Coin1.webp'),
  'money_coin_5':    require('@assets/games/shared/money/Coin5.webp'),
  'money_coin_10':   require('@assets/games/shared/money/Coin10.webp'),
  'money_coin_20':   require('@assets/games/shared/money/Coin20.webp'),

  // ─── Shared: Clocks (Real Assets) ────────────────────────────────
  'clock_face_1_00':  require('@assets/games/shared/clocks/Clock-Face-1.webp'),
  'clock_face_2_00':  require('@assets/games/shared/clocks/Clock-Face-2.webp'),
  'clock_face_3_00':  require('@assets/games/shared/clocks/Clock-Face-3.webp'),
  'clock_face_4_00':  require('@assets/games/shared/clocks/Clock-Face-4.webp'),
  'clock_face_5_00':  require('@assets/games/shared/clocks/Clock-Face-5.webp'),
  'clock_face_6_00':  require('@assets/games/shared/clocks/Clock-Face-6.webp'),
  'clock_face_7_30':  require('@assets/games/shared/clocks/Clock-Face-7.webp'),
  'clock_face_8_00':  require('@assets/games/shared/clocks/Clock-Face-8.webp'),
  'clock_face_9_00':  require('@assets/games/shared/clocks/Clock-Face-9.webp'),
  'clock_face_10_00': require('@assets/games/shared/clocks/Clock-Face-10.webp'),
  'clock_face_11_00': require('@assets/games/shared/clocks/Clock-Face-11.webp'),
  'clock_face_12_00': require('@assets/games/shared/clocks/Clock-Face-12.webp'),

  // ─── Shared: Base-10 Blocks (Real Assets) ────────────────────────
  'block_tens':                    require('@assets/games/shared/blocks/Base-10-Block.webp'),
  'block_ones':                    require('@assets/games/shared/blocks/Base-10-1-Block.webp'),
  'g1_q2_manipulative_tens_block': require('@assets/games/shared/blocks/Base-10-Block.webp'),
  'g1_q2_diagram_base10_addition': require('@assets/games/shared/blocks/Base-10-1-Block.webp'),

  // ─── Shared: Sticks (Real Assets) ────────────────────────────────
  'stick_single':       require('@assets/games/shared/sticks/Stick-1.webp'),
  'stick_bundle_10':    require('@assets/games/shared/sticks/Stick-Bundle-10.webp'),
  'stick_bundle_10_v1': require('@assets/games/shared/sticks/Stick-Bundle-10-Var-1.webp'),
  'stick_bundle_10_v2': require('@assets/games/shared/sticks/Stick-Bundle-10-Var-2.webp'),

  // ─── Shared: Measurement Tools (Real Assets) ─────────────────────
  'tool_hand':      require('@assets/games/shared/paperclip-ruler-hand/Hand.webp'),
  'tool_paperclip': require('@assets/games/shared/paperclip-ruler-hand/Paperclip.webp'),
  'tool_ruler':     require('@assets/games/shared/paperclip-ruler-hand/Ruler.webp'),

  // ─── Q1 Lesson 1 — Shapes (Real Assets) ─────────────────────────────
  'mg_1_shapes_004':   require('@assets/games/q1-assets/mg_1_shapes_004.png'),
  'mg_1_shapes_007':   require('@assets/games/q1-assets/mg_1_shapes_007.png'),
  'mg_1_props_001':    require('@assets/games/q1-assets/mg_1_props_001.png'),
  'mg_1_props_004':    require('@assets/games/q1-assets/mg_1_props_004.png'),
  'mg_1_props_007':    require('@assets/games/q1-assets/mg_1_props_007.png'),
  'mg_1_comp_004':     require('@assets/games/q1-assets/mg_1_comp_004.png'),

  // ─── Q1 Lesson 2 — Numbers & Addition (Real Assets) ─────────────────
  'na_1_addprop_001':  require('@assets/games/q1-assets/na_1_addprop_001.png'),
  'na_1_addprop_004':  require('@assets/games/q1-assets/na_1_addprop_004.png'),
  'na_1_basicadd_001': require('@assets/games/q1-assets/na_1_basicadd_001.png'),
  'na_1_basicadd_004': require('@assets/games/q1-assets/na_1_basicadd_004.png'),
  'na_1_addword_001':  require('@assets/games/q1-assets/na_1_addword_001.png'),
  'na_1_addword_004':  require('@assets/games/q1-assets/na_1_addword_004.png'),
  'na_1_addword_007':  require('@assets/games/q1-assets/na_1_addword_007.png'),
  'Big_square':        require('@assets/games/q1-assets/Big_square.png'),

  // ─── Quarter 1: Shapes — TODO: Add PNG/SVG assets to @assets/images/games/ ──
  // 'g1_q1_shape_triangle': require('@assets/images/games/g1_q1_shape_triangle.png'),
  // 'g1_q1_shape_square':   require('@assets/images/games/g1_q1_shape_square.png'),
  // 'g1_q1_object_door':    require('@assets/images/games/g1_q1_object_door.png'),

  // ─── Quarter 4: Money — TODO: Add high-fidelity peso denomination assets ──────
  // 'g1_q4_money_peso_1_coin':   require('@assets/images/games/g1_q4_money_peso_1_coin.png'),
  // 'g1_q4_money_peso_5_coin':   require('@assets/images/games/g1_q4_money_peso_5_coin.png'),
  // 'g1_q4_money_peso_20_bill':  require('@assets/images/games/g1_q4_money_peso_20_bill.png'),
  // 'g1_q4_money_peso_100_bill': require('@assets/images/games/g1_q4_money_peso_100_bill.png'),
  // 'g1_q4_money_peso_coins_set':require('@assets/images/games/g1_q4_money_peso_coins_set.png'),

  // ─── Emoji Registry: Animals ─────────────────────────────────────
  'icon_duck':       'emoji:🦆',
  'icon_bird':       'emoji:🐦',
  'icon_fish':       'emoji:🐟',
  'icon_giraffe':    'emoji:🦒',
  'icon_elephant':   'emoji:🐘',
  'icon_cat':        'emoji:🐱',
  'icon_dog':        'emoji:🐶',
  'icon_butterfly':  'emoji:🦋',
  'icon_chicken':    'emoji:🐔',
  'icon_pig':        'emoji:🐷',
  'icon_frog':       'emoji:🐸',

  // ─── Emoji Registry: Food & Fruits ──────────────────────────────
  'icon_apple':      'emoji:🍎',
  'icon_banana':     'emoji:🍌',
  'icon_orange':     'emoji:🍊',
  'icon_cookie':     'emoji:🍪',
  'icon_candy':      'emoji:🍬',
  'icon_lollipop':   'emoji:🍭',
  'icon_cake':       'emoji:🎂',
  'icon_pie':        'emoji:🥧',
  'icon_rice':       'emoji:🍚',
  'icon_egg':        'emoji:🥚',
  'icon_cherry':     'emoji:🍒',
  'icon_carrot':     'emoji:🥕',
  'icon_star_fruit': 'emoji:🌟',

  // ─── Emoji Registry: Objects & School ────────────────────────────
  'icon_pencil':        'emoji:✏️',
  'icon_pen':           'emoji:🖊️',
  'icon_crayon':        'emoji:🖍️',
  'icon_marker':        'emoji:🖍️',
  'icon_book':          'emoji:📚',
  'icon_ruler':         'emoji:📏',
  'icon_paper':         'emoji:📄',
  'icon_scissors':      'emoji:✂️',
  'icon_backpack':      'emoji:🎒',
  'icon_toy_car':       'emoji:🚗',
  'icon_ball':          'emoji:⚽',
  'icon_balloon':       'emoji:🎈',
  'icon_ribbon':        'emoji:🎀',
  'icon_paperclip':     'emoji:📎',
  'icon_sticker':       'emoji:⭐',
  'icon_watch':         'emoji:⌚',
  'icon_door':          'emoji:🚪',
  'icon_house':         'emoji:🏠',
  'icon_tree':          'emoji:🌳',
  'icon_flower':        'emoji:🌸',
  'icon_sun':           'emoji:☀️',
  'icon_moon':          'emoji:🌙',
  'icon_star':          'emoji:⭐',
  'icon_cloud':         'emoji:☁️',
  'icon_rainbow':       'emoji:🌈',
  'icon_umbrella':      'emoji:☂️',
  'icon_shoe':          'emoji:👟',
  'icon_sock':          'emoji:🧦',
  'icon_arrow_right':   'emoji:➡️',

  // ─── Emoji Registry: People & Positions ─────────────────────────
  'icon_boy':           require('@assets/games/shared/characters/Boy-Character.webp'),
  'icon_girl':          require('@assets/games/shared/characters/Girl-Character.webp'),
  'icon_teacher':       'emoji:🧑‍🏫',
  'icon_student':       'emoji:🧑‍🎓',
  'icon_face_happy':    'emoji:😊',
  'icon_face_sad':      'emoji:😢',
  'icon_family':        'emoji:👨‍👩‍👧‍👦',
  'icon_runner_1st':    'emoji:🥇',
  'icon_runner_2nd':    'emoji:🥈',
  'icon_runner_3rd':    'emoji:🥉',

  // ─── Emoji Registry: Math Manipulatives & Abstracts ─────────────
  'icon_block_blue':    'emoji:🟦',
  'icon_block_red':     'emoji:🟥',
  'icon_block_green':   'emoji:🟩',
  'icon_block_yellow':  'emoji:🟨',
  'icon_block_orange':  'emoji:🟧',
  'icon_block_purple':  'emoji:🟪',
  'icon_block_white':   'emoji:⬜',
  'icon_block_brown':   'emoji:🟫',
  'icon_ten_block':     'emoji:🔷',
  'icon_one_block':     'emoji:🔹',
  'icon_bundle_sticks': 'emoji:🪵',
  'icon_stick':         'emoji:📏',
  'icon_number_line':   'emoji:📊',
  'icon_heart':         'emoji:❤️',
  'icon_diamond':       'emoji:💠',
  'icon_circle_big':    'emoji:⭕',

  // ─── Emoji Registry: Time & Calendar ────────────────────────────
  'icon_calendar':      'emoji:📅',
  'icon_clock_noon':    'emoji:🕛',
  'icon_clock_2':       'emoji:🕑',
  'icon_clock_3':       'emoji:🕒',
  'icon_clock_7':       'emoji:🕖',
  'icon_clock_9':       'emoji:🕘',
  'icon_weekend':       'emoji:📆',

  // ─── Emoji Registry: Nature & Environment ────────────────────────
  'icon_grass':         'emoji:🌿',
  'icon_rock':          'emoji:🪨',
  'icon_leaf':          'emoji:🍃',
  'icon_mushroom':      'emoji:🍄',
  'icon_mountain':      'emoji:⛰️',
  'icon_river':         'emoji:🏞️',
  'icon_ocean':         'emoji:🌊',
  'icon_puddle':        'emoji:💧',
};

/**
 * Returns all require()-based image assets as an array for use with Asset.loadAsync().
 * Emoji string entries are excluded — they need no preloading.
 */
export const getPreloadableAssets = () =>
  Object.values(AssetMap).filter((v) => typeof v !== 'string');

/**
 * Helper function to retrieve an asset by ID
 * @param {string} assetId
 * @returns {any} The React Native required asset source
 */
export const getAsset = (assetId) => {
  if (!assetId) return null;

  // If it's already an emoji string (resolved by an orchestrator or in JSON), 
  // pass it through directly to let AssetDisplay handle the rendering.
  if (typeof assetId === 'string' && assetId.startsWith('emoji:')) {
    return assetId;
  }

  const asset = AssetMap[assetId];
  if (!asset) {
    console.warn(`[AssetMap] Warning: Asset "${assetId}" not found in registry.`);
    return null;
  }
  return asset;
};
