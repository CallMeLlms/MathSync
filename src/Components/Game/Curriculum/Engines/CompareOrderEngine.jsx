import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  ZoomIn,
  FadeInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import speechManager from '@/utils/speechManager';

// ─── Asset → emoji map ────────────────────────────────────────────────────────
const ASSET_EMOJI = {
  icon_calamansi: '🍋',
  icon_mango:     '🥭',
  icon_cookie:    '🍪',
  icon_apple:     '🍎',
  icon_star:      '⭐',
  icon_banana:    '🍌',
  icon_candy:     '🍬',
  icon_flower:    '🌸',
};
const resolveEmoji = (assetId) => ASSET_EMOJI[assetId] ?? '●';

// ─── Sub-mode detection ───────────────────────────────────────────────────────
// pile_compare  → metadata has pile_a / pile_b
// multi_compare → metadata has plate_a / plate_b / plate_c
// sequence_order → metadata has items[]
const resolveMode = (metadata) => {
  if (!metadata) return 'pile_compare';
  if (Array.isArray(metadata.items)) return 'sequence_order';
  if (metadata.plate_a !== undefined) return 'multi_compare';
  return 'pile_compare';
};

// ─── EmojiGrid ────────────────────────────────────────────────────────────────
const EmojiGrid = ({ emoji, count, compact }) => (
  <View style={styles.emojiGrid}>
    {Array.from({ length: Math.min(count, 20) }).map((_, i) => (
      <Text key={i} style={[styles.emojiItem, compact && styles.emojiItemCompact]}>
        {emoji}
      </Text>
    ))}
  </View>
);

// ─── CompareCard ──────────────────────────────────────────────────────────────
const CompareCard = ({ cardKey, count, emoji, compact, isSelected, evaluation, disabled, onPress, index }) => {
  const translateY  = useSharedValue(0);
  const bottomWidth = useSharedValue(6);
  const opacity     = useSharedValue(1);
  const scale       = useSharedValue(1);

  const state = evaluation ?? (isSelected ? 'selected' : 'idle');

  const CARD_COLORS = {
    idle:     { border: Colors.outlineVariant,        bg: Colors.surfaceContainerLowest,  text: Colors.onSurface },
    selected: { border: Colors.secondary,              bg: Colors.secondaryContainer,      text: Colors.onSecondaryContainer },
    correct:  { border: Colors.success,                bg: '#e8f5e9',                      text: Colors.success },
    wrong:    { border: Colors.error,                  bg: '#ffebee',                      text: Colors.error },
  };
  const c = CARD_COLORS[state] ?? CARD_COLORS.idle;

  // Wrong → dim flash (no shake). Correct → gentle pop.
  useEffect(() => {
    if (evaluation === 'wrong') {
      opacity.value = withSequence(
        withTiming(0.4, { duration: 150 }),
        withTiming(1.0, { duration: 350 })
      );
    }
    if (evaluation === 'correct') {
      scale.value = withSequence(
        withSpring(1.06, { damping: 6, stiffness: 200 }),
        withSpring(1.0,  { damping: 10 })
      );
    }
  }, [evaluation]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    borderBottomWidth: bottomWidth.value,
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (disabled) return;
    translateY.value  = withSpring(4, { damping: 15, stiffness: 300 });
    bottomWidth.value = withSpring(2, { damping: 15, stiffness: 300 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    if (disabled) return;
    translateY.value  = withSpring(0, { damping: 15, stiffness: 300 });
    bottomWidth.value = withSpring(6, { damping: 15, stiffness: 300 });
  };

  return (
    <Animated.View
      entering={ZoomIn.springify().delay(index * 100)}
      style={styles.cardWrapper}
    >
      <Pressable
        onPress={() => !disabled && onPress(cardKey)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={{ flex: 1 }}
      >
        <Animated.View
          style={[styles.card, animStyle, { backgroundColor: c.bg, borderColor: c.border }]}
        >
          {state === 'correct' && (
            <View style={styles.badge}>
              <Ionicons name="checkmark-circle" size={28} color={Colors.success} />
            </View>
          )}
          {state === 'wrong' && (
            <View style={styles.badge}>
              <Ionicons name="close-circle" size={28} color={Colors.error} />
            </View>
          )}
          <EmojiGrid emoji={emoji} count={count} compact={compact} />
          <Text style={[styles.countLabel, compact && styles.countLabelCompact, { color: c.text }]}>
            {count}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

// ─── CheckButton ──────────────────────────────────────────────────────────────
const CheckButton = ({ onPress, disabled, label }) => {
  const translateY  = useSharedValue(0);
  const bottomWidth = useSharedValue(6);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    borderBottomWidth: bottomWidth.value,
  }));

  const handlePressIn = () => {
    if (disabled) return;
    translateY.value  = withSpring(4);
    bottomWidth.value = withSpring(2);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePressOut = () => {
    translateY.value  = withSpring(0);
    bottomWidth.value = withSpring(6);
  };

  return (
    <View style={styles.checkBtnContainer}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={{ width: '100%' }}
      >
        <Animated.View style={[styles.checkBtn, animStyle, disabled && styles.checkBtnDisabled]}>
          <Text style={[styles.checkBtnText, disabled && styles.checkBtnTextDisabled]}>
            {label}
          </Text>
        </Animated.View>
      </Pressable>
    </View>
  );
};

// ─── SequenceSlot ─────────────────────────────────────────────────────────────
const SequenceSlot = ({ value, slotEval, index, onRemove, disabled }) => {
  const filled = value !== undefined && value !== null;

  const borderColor = slotEval === 'correct' ? Colors.success
    : slotEval === 'wrong'   ? Colors.error
    : filled                 ? Colors.secondary
    : Colors.outlineVariant;

  const bgColor = slotEval === 'correct' ? '#e8f5e9'
    : slotEval === 'wrong'   ? '#ffebee'
    : filled                 ? Colors.secondaryContainer
    : 'transparent';

  const textColor = slotEval === 'correct' ? Colors.success
    : slotEval === 'wrong'   ? Colors.error
    : Colors.onSecondaryContainer;

  return (
    <Animated.View
      entering={FadeInDown.springify().delay(index * 60)}
      style={[styles.seqSlot, { borderColor, backgroundColor: bgColor }]}
    >
      <Pressable
        onPress={() => filled && !disabled && onRemove && onRemove(index)}
        disabled={!filled || disabled}
        style={styles.seqSlotPressable}
      >
        {filled
          ? <Text style={[styles.seqSlotText, { color: textColor }]}>{value}</Text>
          : <Text style={styles.seqSlotEmpty}>—</Text>
        }
      </Pressable>
    </Animated.View>
  );
};

// ─── SequenceTile ─────────────────────────────────────────────────────────────
const SequenceTile = ({ number, isTapped, onPress, index }) => {
  const scale   = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value   = withSpring(isTapped ? 0.85 : 1.0);
    opacity.value = withTiming(isTapped ? 0.3 : 1.0, { duration: 200 });
  }, [isTapped]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (isTapped) return;
    scale.value = withSpring(0.92, { damping: 8, stiffness: 400 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    if (!isTapped) scale.value = withSpring(1.0);
  };

  return (
    <Animated.View
      entering={ZoomIn.springify().delay(index * 80)}
      style={[styles.seqTileWrapper, animStyle]}
    >
      <Pressable
        onPress={() => !isTapped && onPress(number)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isTapped}
      >
        <View style={[styles.seqTile, isTapped && styles.seqTileTapped]}>
          <Text style={[styles.seqTileText, isTapped && styles.seqTileTextTapped]}>
            {number}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// ─── CompareOrderEngine ───────────────────────────────────────────────────────
export default function CompareOrderEngine({ data, onResult }) {
  const { answer, metadata = {}, assetId } = data;
  const mode     = resolveMode(metadata);
  const emoji    = resolveEmoji(assetId);
  const isCompact = mode === 'multi_compare';

  // Compare state (pile_compare & multi_compare)
  const [selectedKey, setSelectedKey] = useState(null);
  const [evaluation,  setEvaluation]  = useState(null);
  const [resolved,    setResolved]    = useState(false);

  // Sequence state
  const [tappedOrder,   setTappedOrder]   = useState([]);
  const [tappedSet,     setTappedSet]     = useState(new Set());
  const [seqEvaluation, setSeqEvaluation] = useState('idle');

  useEffect(() => {
    setSelectedKey(null);
    setEvaluation(null);
    setResolved(false);
    setTappedOrder([]);
    setTappedSet(new Set());
    setSeqEvaluation('idle');
  }, [data]);

  // ── Compare handlers ──────────────────────────────────────────────────────
  const handleCardPress = (key) => {
    if (resolved) return;
    setSelectedKey(key);
  };

  const handleCheck = () => {
    if (!selectedKey || resolved) return;
    const isCorrect = selectedKey === answer;
    setEvaluation(isCorrect ? 'correct' : 'wrong');
    setResolved(true);
    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      speechManager.speakFeedback('Great job!', true);
      setTimeout(() => onResult(true, [selectedKey]), 700);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      speechManager.speakFeedback('Try again!', false);
      setTimeout(() => onResult(false, [selectedKey]), 1000);
    }
  };

  // ── Sequence handlers ─────────────────────────────────────────────────────
  const handleTileTap = (num) => {
    if (tappedSet.has(num) || seqEvaluation !== 'idle') return;
    const newOrder = [...tappedOrder, num];
    const newSet   = new Set([...tappedSet, num]);
    setTappedOrder(newOrder);
    setTappedSet(newSet);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSlotRemove = (slotIndex) => {
    if (seqEvaluation !== 'idle') return;
    const removed  = tappedOrder[slotIndex];
    const newOrder = tappedOrder.filter((_, i) => i !== slotIndex);
    const newSet   = new Set(newOrder);
    setTappedOrder(newOrder);
    setTappedSet(newSet);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSeqCheck = () => {
    if (tappedOrder.length !== metadata.items.length || seqEvaluation !== 'idle') return;
    const sorted    = [...metadata.items].sort((a, b) => a - b);
    const isCorrect = tappedOrder.every((n, i) => n === sorted[i]);
    setSeqEvaluation(isCorrect ? 'correct' : 'wrong');
    setResolved(true);
    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      speechManager.speakFeedback('Great job!', true);
      setTimeout(() => onResult(true, [tappedOrder.join(', ')]), 800);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      speechManager.speakFeedback('Try again!', false);
      setTimeout(() => onResult(false, [tappedOrder.join(', ')]), 1000);
    }
  };

  // ── Sequence render ───────────────────────────────────────────────────────
  if (mode === 'sequence_order') {
    const items = metadata.items ?? [];
    const allPlaced = tappedOrder.length === items.length;

    const hintColor = seqEvaluation === 'correct' ? Colors.success
      : seqEvaluation === 'wrong' ? Colors.error
      : Colors.onSurfaceVariant;

    const hintText = seqEvaluation === 'correct' ? '✅  Correct! Well done!'
      : seqEvaluation === 'wrong'   ? '❌  Not quite — moving on!'
      : tappedOrder.length === 0    ? 'Tap the numbers from smallest to largest.'
      : `${tappedOrder.length} of ${items.length} placed — tap a slot to undo`;

    return (
      <View style={styles.container}>
        <Animated.View entering={FadeInDown.springify().delay(50)} style={styles.seqHint}>
          <Text style={[styles.seqHintText, { color: hintColor }]}>{hintText}</Text>
        </Animated.View>

        <View style={styles.seqSlotsRow}>
          {items.map((_, i) => (
            <SequenceSlot
              key={i}
              value={tappedOrder[i]}
              slotEval={allPlaced ? seqEvaluation : null}
              index={i}
              onRemove={handleSlotRemove}
              disabled={resolved}
            />
          ))}
        </View>

        <View style={styles.seqTilesRow}>
          {items.map((num, i) => (
            <SequenceTile
              key={num}
              number={num}
              isTapped={tappedSet.has(num)}
              onPress={handleTileTap}
              index={i}
            />
          ))}
        </View>

        <CheckButton
          onPress={handleSeqCheck}
          disabled={!allPlaced || resolved}
          label={resolved ? 'AWESOME!' : 'CHECK'}
        />
      </View>
    );
  }

  // ── Compare render (pile_compare & multi_compare) ─────────────────────────
  const cards = mode === 'multi_compare'
    ? ['plate_a', 'plate_b', 'plate_c']
        .filter(k => metadata[k] !== undefined)
        .map(k => ({ key: k, count: metadata[k] }))
    : [
        { key: 'pile_a', count: metadata.pile_a ?? 0 },
        { key: 'pile_b', count: metadata.pile_b ?? 0 },
      ];

  return (
    <View style={styles.container}>
      <View style={styles.cardsRow}>
        {cards.map((card, i) => (
          <CompareCard
            key={card.key}
            cardKey={card.key}
            count={card.count}
            emoji={emoji}
            compact={isCompact}
            isSelected={selectedKey === card.key}
            evaluation={selectedKey === card.key ? evaluation : null}
            disabled={resolved}
            onPress={handleCardPress}
            index={i}
          />
        ))}
      </View>
      <CheckButton
        onPress={handleCheck}
        disabled={!selectedKey || resolved}
        label={resolved ? 'AWESOME!' : 'CHECK'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  // ── Compare ───────────────────────────────────────────────────────────────
  cardsRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 16,
  },
  cardWrapper: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 2,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 3,
    maxWidth: '100%',
  },
  emojiItem: {
    fontSize: 22,
  },
  emojiItemCompact: {
    fontSize: 16,
  },
  countLabel: {
    fontFamily: 'Lexend-Black',
    fontSize: 36,
  },
  countLabelCompact: {
    fontSize: 24,
  },
  // ── Check button ──────────────────────────────────────────────────────────
  checkBtnContainer: {
    width: '100%',
  },
  checkBtn: {
    backgroundColor: Colors.tertiary,
    borderColor: '#004d1e',
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBtnDisabled: {
    backgroundColor: Colors.surfaceContainerHighest,
    borderColor: Colors.outlineVariant,
  },
  checkBtnText: {
    fontFamily: 'Lexend-Black',
    fontSize: 18,
    color: Colors.onTertiary,
    letterSpacing: 1.2,
  },
  checkBtnTextDisabled: {
    color: Colors.onSurfaceVariant,
    opacity: 0.5,
  },
  // ── Sequence ──────────────────────────────────────────────────────────────
  seqHint: {
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  seqHintText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 15,
    textAlign: 'center',
  },
  seqSlotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 40,
  },
  seqSlot: {
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seqSlotPressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  seqSlotText: {
    fontFamily: 'Lexend-Black',
    fontSize: 28,
  },
  seqSlotEmpty: {
    fontFamily: 'Lexend-Regular',
    fontSize: 20,
    color: Colors.outlineVariant,
  },
  seqTilesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  seqTileWrapper: {},
  seqTile: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: Colors.secondary,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seqTileTapped: {
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLow,
    borderBottomWidth: 2,
  },
  seqTileText: {
    fontFamily: 'Lexend-Black',
    fontSize: 32,
    color: Colors.onSecondaryContainer,
  },
  seqTileTextTapped: {
    color: Colors.outlineVariant,
  },
});
