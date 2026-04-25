import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  ZoomIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import AssetDisplay from '@/Components/Game/Global/AssetDisplay';
import speechManager from '@/utils/speechManager';

// ─── PileDisplay — renders emoji repeated N times in a wrap grid ───
const PileDisplay = ({ assetId, count }) => {
  const items = Array.from({ length: Math.min(count, 10) });
  return (
    <View style={styles.pileGrid}>
      {items.map((_, i) => (
        <AssetDisplay key={i} assetId={assetId} style={styles.pileAsset} />
      ))}
    </View>
  );
};

// ─── TileCard — bulky tactile selection tile ───
const TileCard = ({ pileKey, count, assetId, isSelected, evaluation, disabled, onPress, index }) => {
  const translateY = useSharedValue(0);
  const bottomWidth = useSharedValue(6);

  const state = evaluation || (isSelected ? 'selected' : 'idle');

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    borderBottomWidth: bottomWidth.value,
  }));

  const handlePressIn = () => {
    if (disabled) return;
    translateY.value = withSpring(4, { damping: 15, stiffness: 300 });
    bottomWidth.value = withSpring(2, { damping: 15, stiffness: 300 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    if (disabled) return;
    translateY.value = withSpring(0, { damping: 15, stiffness: 300 });
    bottomWidth.value = withSpring(6, { damping: 15, stiffness: 300 });
  };

  const colors = {
    idle:     { border: Colors.outlineVariant,      bg: Colors.surfaceContainerLowest,  text: Colors.onSurface },
    selected: { border: Colors.secondary,            bg: Colors.secondaryContainer,      text: Colors.onSecondaryContainer },
    correct:  { border: Colors.success,              bg: '#e8f5e9',                      text: Colors.success },
    wrong:    { border: Colors.error,                bg: '#ffebee',                      text: Colors.error },
  }[state];

  return (
    <Animated.View
      entering={ZoomIn.springify().delay(index * 120)}
      style={styles.tileWrapper}
    >
      <Pressable
        onPress={() => !disabled && onPress(pileKey)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        <Animated.View
          style={[
            styles.tileCard,
            animatedStyle,
            { backgroundColor: colors.bg, borderColor: colors.border },
          ]}
        >
          {/* Badge */}
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

          {/* Asset pile */}
          <PileDisplay assetId={assetId} count={count} />

          {/* Count label */}
          <Text style={[styles.countLabel, { color: colors.text }]}>{count}</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

// ─── CheckButton ───
const CheckButton = ({ onPress, disabled, label = 'CHECK' }) => {
  const translateY = useSharedValue(0);
  const bottomWidth = useSharedValue(6);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    borderBottomWidth: bottomWidth.value,
  }));

  const handlePressIn = () => {
    if (disabled) return;
    translateY.value = withSpring(4);
    bottomWidth.value = withSpring(2);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePressOut = () => {
    translateY.value = withSpring(0);
    bottomWidth.value = withSpring(6);
  };

  return (
    <View style={styles.checkButtonContainer}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={{ width: '100%' }}
      >
        <Animated.View
          style={[
            styles.checkButton,
            animatedStyle,
            disabled && styles.checkButtonDisabled,
          ]}
        >
          <Text style={[styles.checkButtonText, disabled && styles.checkButtonTextDisabled]}>
            {label}
          </Text>
        </Animated.View>
      </Pressable>
    </View>
  );
};

// ─── ComparePickerEngine ───
const ComparePickerEngine = ({ data, onResult }) => {
  const { question: questionText, answer, metadata = {} } = data;
  const pileA = metadata.pile_a ?? 0;
  const pileB = metadata.pile_b ?? 0;
  
  // Support distinct assets for each pile, fallback to generic assetId or emoji
  const resolveAsset = (id, metaKey) => {
    const rawValue = metadata[metaKey] ?? metadata.emoji ?? metadata.assetId ?? data.assetId ?? 'icon_star';
    // If it's a raw emoji string not in standard format, wrap it
    if (typeof rawValue === 'string' && rawValue.length <= 2 && !rawValue.startsWith('emoji:')) {
      return `emoji:${rawValue}`;
    }
    return rawValue;
  };

  const assetIdA = resolveAsset(metadata.assetId_a, 'emoji_a');
  const assetIdB = resolveAsset(metadata.assetId_b, 'emoji_b');

  const [selectedTile, setSelectedTile] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    setSelectedTile(null);
    setEvaluation(null);
    setResolved(false);
  }, [data]);

  useEffect(() => {
    if (questionText) {
      const timer = setTimeout(() => speechManager.speakInstruction(questionText), 400);
      return () => { clearTimeout(timer); speechManager.stop(); };
    }
  }, [questionText]);

  const handleCheck = () => {
    if (!selectedTile || resolved) return;

    const isCorrect = selectedTile === answer;

    if (isCorrect) {
      setEvaluation('correct');
      setResolved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      speechManager.speakFeedback('Correct!', true);
      setTimeout(() => onResult(true, [selectedTile]), 800);
    } else {
      setEvaluation('wrong');
      setResolved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      speechManager.speakFeedback('Try again!', false);
      setTimeout(() => onResult(false, [selectedTile]), 1000);
    }
  };

  return (
    <View style={styles.container}>
      {/* Two comparison tiles — full-width vertical stack */}
      <View style={styles.tilesColumn}>
          <TileCard
            pileKey="pile_a"
            count={pileA}
            assetId={assetIdA}
            isSelected={selectedTile === 'pile_a'}
            evaluation={selectedTile === 'pile_a' ? evaluation : null}
            disabled={resolved}
            onPress={setSelectedTile}
            index={0}
          />
          <TileCard
            pileKey="pile_b"
            count={pileB}
            assetId={assetIdB}
            isSelected={selectedTile === 'pile_b'}
            evaluation={selectedTile === 'pile_b' ? evaluation : null}
            disabled={resolved}
            onPress={setSelectedTile}
            index={1}
          />
      </View>

      <CheckButton
        onPress={handleCheck}
        disabled={!selectedTile || resolved || !!evaluation}
        label={resolved ? 'AWESOME!' : 'CHECK'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  tilesColumn: {
    flex: 1,
    flexDirection: 'column',
    gap: 16,
  },
  tileWrapper: {
    flex: 1,
  },
  tileCard: {
    minHeight: 180,
    borderRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 6,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  pileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
    maxWidth: '100%',
  },
  pileAsset: {
    width: 32,
    height: 32,
  },
  countLabel: {
    fontFamily: 'Lexend-Black',
    fontSize: 32,
  },
  checkButtonContainer: {
    width: '100%',
  },
  checkButton: {
    width: '100%',
    backgroundColor: Colors.tertiary,
    borderColor: '#004d1e',
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonDisabled: {
    backgroundColor: Colors.surfaceContainerHighest,
    borderColor: Colors.outlineVariant,
  },
  checkButtonText: {
    fontFamily: 'Lexend-Black',
    fontSize: 18,
    color: '#fff',
    letterSpacing: 1.2,
  },
  checkButtonTextDisabled: {
    color: Colors.onSurfaceVariant,
    opacity: 0.5,
  },
});

export default ComparePickerEngine;
