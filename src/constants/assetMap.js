/**
 * MathSync Game Asset Registry — Smart Registry
 *
 * All game asset IDs are registered here. The registry supports two types:
 *   1. Image assets: `require('@assets/...')` — rendered as <Image> by AssetDisplay.
 *   2. Emoji assets: `'emoji:🦆'` strings — rendered as <Text> by AssetDisplay.
 *
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
  'clock_face_3_00':  require('@assets/games/shared/clocks/Clock-Face-3_00.webp'),
  'clock_face_7_30':  require('@assets/games/shared/clocks/Clock-Face-7_30.webp'),
  'clock_face_10_00': require('@assets/games/shared/clocks/Clock-Face-10_00.webp'),

  // ─── Quarter 1: Shapes — TODO: Add PNG/SVG assets to @assets/images/games/ ──
  // 'g1_q1_shape_triangle': require('@assets/images/games/g1_q1_shape_triangle.png'),
  // 'g1_q1_shape_square':   require('@assets/images/games/g1_q1_shape_square.png'),
  // 'g1_q1_object_door':    require('@assets/images/games/g1_q1_object_door.png'),

  // ─── Quarter 2: Pictorial Addition — TODO: Add Base-10 Block assets ──────────
  // 'g1_q2_manipulative_tens_block':      require('@assets/images/games/g1_q2_manipulative_tens_block.png'),
  // 'g1_q2_manipulative_tens_ones_block': require('@assets/images/games/g1_q2_manipulative_tens_ones_block.png'),
  // 'g1_q2_manipulative_stick_bundle':    require('@assets/images/games/g1_q2_manipulative_stick_bundle.png'),
  // 'g1_q2_diagram_base10_addition':      require('@assets/images/games/g1_q2_diagram_base10_addition.png'),
  // 'g1_q2_diagram_bundle_count':         require('@assets/images/games/g1_q2_diagram_bundle_count.png'),

  // ─── Quarter 4: Money — TODO: Add high-fidelity peso denomination assets ──────
  // 'g1_q4_money_peso_1_coin':   require('@assets/images/games/g1_q4_money_peso_1_coin.png'),
  // 'g1_q4_money_peso_5_coin':   require('@assets/images/games/g1_q4_money_peso_5_coin.png'),
  // 'g1_q4_money_peso_20_bill':  require('@assets/images/games/g1_q4_money_peso_20_bill.png'),
  // 'g1_q4_money_peso_100_bill': require('@assets/images/games/g1_q4_money_peso_100_bill.png'),
  // 'g1_q4_money_peso_coins_set':require('@assets/images/games/g1_q4_money_peso_coins_set.png'),

  // ─── Quarter 4: Time — TODO: Add additional clock face assets ───────────────
  // 'clock_face_noon':  require('@assets/games/shared/clocks/Clock-Face-12_00.webp'),
  // 'clock_face_2_00':  require('@assets/games/shared/clocks/Clock-Face-2_00.webp'),
  // 'clock_face_9_00':  require('@assets/games/shared/clocks/Clock-Face-9_00.webp'),

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
  'icon_carrot':     'emoji:🥕',
  'icon_star_fruit': 'emoji:🌟',

  // ─── Emoji Registry: Objects & School ────────────────────────────
  'icon_pencil':        'emoji:✏️',
  'icon_pen':           'emoji:🖊️',
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

  // ─── Emoji Registry: People & Positions ─────────────────────────
  'icon_boy':           'emoji:👦',
  'icon_girl':          'emoji:👧',
  'icon_teacher':       'emoji:🧑‍🏫',
  'icon_student':       'emoji:🧑‍🎓',
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
  'icon_clock_3':       'emoji:🕒',
  'icon_clock_7':       'emoji:🕖',
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
