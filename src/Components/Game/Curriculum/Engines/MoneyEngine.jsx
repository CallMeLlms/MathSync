import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  ZoomIn,
  FadeInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import AssetDisplay from '@/Components/Game/Global/AssetDisplay';
import speechManager from '@/utils/speechManager';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COIN_SIZE = SCREEN_WIDTH * 0.22;

// ─── MoneyOptionButton ───
// Full-width horizontal option button: WEBP asset on left, value label centre-right, badge on far right.
const MoneyOptionButton = ({ assetId, value, index, isSelected, evaluation, disabled, onPress }) => {
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
    idle:     { border: Colors.outlineVariant, bg: Colors.surfaceContainerLowest, text: Colors.onSurface },
    selected: { border: Colors.secondary,      bg: Colors.secondaryContainer,      text: Colors.onSecondaryContainer },
    correct:  { border: Colors.success,        bg: '#e8f5e9',                      text: Colors.success },
    wrong:    { border: Colors.error,          bg: '#ffebee',                      text: Colors.error },
  }[state];

  return (
    <Animated.View entering={ZoomIn.springify().delay(index * 90)} style={styles.idOptionWrapper}>
      <Pressable
        onPress={() => !disabled && onPress(assetId)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        <Animated.View
          style={[
            styles.idOptionButton,
            animatedStyle,
            { backgroundColor: colors.bg, borderColor: colors.border },
          ]}
        >
          {/* Left: Asset */}
          <View style={styles.idOptionLeft}>
            <AssetDisplay assetId={assetId} style={styles.idOptionAsset} resizeMode="contain" />
          </View>

          {/* Centre: Value label */}
          <Text style={[styles.idOptionLabel, { color: colors.text }]}>₱{value}</Text>

          {/* Right: Status icon */}
          <View style={styles.idOptionBadge}>
            {state === 'correct' && (
              <Ionicons name="checkmark-circle" size={28} color={Colors.success} />
            )}
            {state === 'wrong' && (
              <Ionicons name="close-circle" size={28} color={Colors.error} />
            )}
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

// ─── NumpadInput (for value questions) ───
const NumpadInput = ({ value, onValueChange, evaluation, disabled }) => {
  const displayColor = evaluation === 'wrong'
    ? Colors.error
    : evaluation === 'correct'
      ? Colors.success
      : Colors.onSurface;

  const bgColor = evaluation === 'wrong'
    ? '#ffebee'
    : evaluation === 'correct'
      ? '#e8f5e9'
      : Colors.surfaceContainerLowest;

  const borderColor = evaluation === 'wrong'
    ? Colors.error
    : evaluation === 'correct'
      ? Colors.success
      : Colors.outlineVariant;

  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '⌫'];

  const handleKey = (key) => {
    if (disabled) return;
    if (key === 'C') {
      onValueChange('');
    } else if (key === '⌫') {
      onValueChange(value.slice(0, -1));
    } else {
      if (value.length < 4) {
        onValueChange(value + String(key));
      }
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.numpadContainer}>
      {/* Display */}
      <View style={[styles.numpadDisplay, { backgroundColor: bgColor, borderColor }]}>
        <Text style={styles.pesoPrefix}>₱</Text>
        <Text style={[styles.numpadDisplayText, { color: displayColor }]}>
          {value || '—'}
        </Text>
      </View>

      {/* Keys */}
      <View style={styles.numpadGrid}>
        {keys.map((key, idx) => (
          <Pressable
            key={idx}
            onPress={() => handleKey(key)}
            disabled={disabled}
            style={({ pressed }) => [
              styles.numpadKey,
              pressed && !disabled && styles.numpadKeyPressed,
              typeof key === 'string' && key !== '⌫' && key !== 'C'
                ? null
                : key === 'C' ? styles.numpadKeyAction : key === '⌫' ? styles.numpadKeyAction : null,
            ]}
          >
            <Text style={[
              styles.numpadKeyText,
              (key === 'C' || key === '⌫') && styles.numpadKeyActionText,
            ]}>
              {key}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
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

// ─── MoneyEngine ───
const MoneyEngine = ({ data, onResult }) => {
  const { question: questionText, answer, assetId, metadata = {} } = data;
  const { interactionType, moneyItems = [] } = metadata;

  const [selectedItem, setSelectedItem] = useState(null);
  const [numpadValue, setNumpadValue] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [resolved, setResolved] = useState(false);

  // Shuffle money cards for identification
  const shuffledMoneyItems = useMemo(
    () => [...moneyItems].sort(() => Math.random() - 0.5),
    [data]
  );

  useEffect(() => {
    setSelectedItem(null);
    setNumpadValue('');
    setEvaluation(null);
    setResolved(false);
  }, [data]);

  useEffect(() => {
    if (questionText) {
      const timer = setTimeout(() => speechManager.speakInstruction(questionText), 400);
      return () => { clearTimeout(timer); speechManager.stop(); };
    }
  }, [questionText]);

  // word_problem also uses numpadValue, same as value
  const hasSelection = (interactionType === 'value' || interactionType === 'word_problem')
    ? numpadValue.length > 0
    : selectedItem !== null;

  const handleCheck = () => {
    if (!hasSelection || resolved) return;

    let isCorrect = false;

    if (interactionType === 'identification') {
      isCorrect = selectedItem === answer;
    } else if (interactionType === 'value' || interactionType === 'word_problem') {
      isCorrect = Number(numpadValue) === Number(answer);
    }

    if (isCorrect) {
      setEvaluation('correct');
      setResolved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      speechManager.speakFeedback('Correct!', true);
      setTimeout(() => onResult(true, [String(selectedItem || numpadValue)]), 800);
    } else {
      setEvaluation('wrong');
      setResolved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      speechManager.speakFeedback('Not quite!', false);
      setTimeout(() => onResult(false, [String(selectedItem || numpadValue)]), 1000);
    }
  };

  // ─── Render: Identification ───
  const renderIdentification = () => (
    <View style={styles.idOptionsList}>
      {shuffledMoneyItems.map((item, idx) => (
        <MoneyOptionButton
          key={`${item.assetId}-${idx}`}
          assetId={item.assetId}
          value={item.value}
          index={idx}
          isSelected={selectedItem === item.assetId}
          evaluation={selectedItem === item.assetId ? evaluation : null}
          disabled={resolved}
          onPress={setSelectedItem}
        />
      ))}
    </View>
  );

  // ─── Render: Value (show coins + numpad) ───
  const renderValue = () => (
    <View style={styles.valueContainer}>
      {/* Display the coins/bills to count */}
      <Animated.View entering={FadeInDown.springify()} style={styles.moneyDisplayRow}>
        {moneyItems.map((item, idx) => (
          <Animated.View
            key={`display-${idx}`}
            entering={ZoomIn.springify().delay(idx * 120)}
            style={styles.moneyDisplayCard}
          >
            <AssetDisplay assetId={item.assetId} style={styles.moneyDisplayAsset} resizeMode="contain" />
          </Animated.View>
        ))}
      </Animated.View>

      {/* Numpad for inputting the total */}
      <NumpadInput
        value={numpadValue}
        onValueChange={setNumpadValue}
        evaluation={evaluation}
        disabled={resolved}
      />
    </View>
  );

  // ─── Render: Word Problem (equation visual + numpad input) ───
  const renderWordProblem = () => (
    <View style={styles.wordProblemContainer}>
      {/* Visual equation row — assets interspersed with operators */}
      {moneyItems.length > 0 && (
        <Animated.View entering={FadeInDown.springify()} style={styles.moneyContextRow}>
          {moneyItems.map((item, idx) => {
            // Operator token (e.g. { operator: '-' })
            if (item.operator) {
              return (
                <Animated.View
                  key={`op-${idx}`}
                  entering={ZoomIn.springify().delay(idx * 120)}
                  style={styles.operatorToken}
                >
                  <Text style={styles.operatorTokenText}>{item.operator}</Text>
                </Animated.View>
              );
            }
            // Money asset card
            return (
              <Animated.View
                key={`wp-${idx}`}
                entering={ZoomIn.springify().delay(idx * 120)}
                style={styles.moneyContextCard}
              >
                <AssetDisplay assetId={item.assetId} style={styles.moneyContextAsset} resizeMode="contain" />
                <View style={styles.valueBadge}>
                  <Text style={styles.valueBadgeText}>₱{item.value}</Text>
                </View>
              </Animated.View>
            );
          })}
        </Animated.View>
      )}

      {/* Numpad — same tactile input as value mode */}
      <NumpadInput
        value={numpadValue}
        onValueChange={setNumpadValue}
        evaluation={evaluation}
        disabled={resolved}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Story Header — character narration bubble */}
        <Animated.View entering={FadeInDown.springify().delay(80)} style={styles.storyHeader}>
          {assetId && (
            <View style={styles.assetCard}>
              <AssetDisplay assetId={assetId} style={styles.assetImage} resizeMode="contain" />
            </View>
          )}
          <View style={[styles.speechBubble, !assetId && styles.speechBubbleFull]}>
            {assetId && <View style={styles.bubbleTail} />}
            <Text style={styles.speechText}>{questionText}</Text>
          </View>
        </Animated.View>

        {/* Interaction area based on type */}
        {interactionType === 'identification' && renderIdentification()}
        {interactionType === 'value' && renderValue()}
        {interactionType === 'word_problem' && renderWordProblem()}
      </View>

      {/* Deliberate Check Button — always at bottom */}
      <CheckButton
        onPress={handleCheck}
        disabled={!hasSelection || resolved || !!evaluation}
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
  content: {
    gap: 20,
  },

  // ─── Story Header (Character Narration) ───
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  assetCard: {
    width: COIN_SIZE * 1.1,
    height: COIN_SIZE * 1.1,
    flexShrink: 0,
    backgroundColor: Colors.primaryContainer,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: Colors.primary,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  assetImage: {
    width: '100%',
    height: '100%',
  },
  speechBubble: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    borderTopLeftRadius: 4,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    padding: 14,
    position: 'relative',
  },
  speechBubbleFull: {
    borderTopLeftRadius: 20,
  },
  bubbleTail: {
    position: 'absolute',
    left: -13,
    top: 0,
    width: 0,
    height: 0,
    borderTopWidth: 13,
    borderTopColor: Colors.outlineVariant,
    borderLeftWidth: 13,
    borderLeftColor: 'transparent',
  },
  speechText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 15,
    color: Colors.onSurface,
    lineHeight: 22,
  },

  // ─── Identification Options (vertical list) ───
  idOptionsList: {
    gap: 14,
  },
  idOptionWrapper: {
    width: '100%',
  },
  idOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 2,
    gap: 14,
    minHeight: 76,
  },
  idOptionLeft: {
    width: COIN_SIZE * 1.05,
    height: COIN_SIZE * 1.05,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idOptionAsset: {
    width: '100%',
    height: '100%',
  },
  idOptionLabel: {
    flex: 1,
    fontFamily: 'Lexend-Bold',
    fontSize: 22,
    textAlign: 'center',
  },
  idOptionBadge: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },


  // ─── Money Display Row (Value & Word Problem) ───
  moneyDisplayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    padding: 16,
  },
  moneyDisplayCard: {
    width: COIN_SIZE * 0.85,
    height: COIN_SIZE * 0.85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moneyDisplayAsset: {
    width: '100%',
    height: '100%',
  },

  // ─── Value Container ───
  valueContainer: {
    gap: 16,
  },

  // ─── Word Problem ───
  wordProblemContainer: {
    gap: 16,
  },

  // ─── Numpad ───
  numpadContainer: {
    gap: 12,
  },
  numpadDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 4,
  },
  pesoPrefix: {
    fontFamily: 'Lexend-Bold',
    fontSize: 28,
    color: Colors.onSurfaceVariant,
  },
  numpadDisplayText: {
    fontFamily: 'Lexend-Black',
    fontSize: 32,
    textAlign: 'center',
    minWidth: 60,
  },
  numpadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  numpadKey: {
    width: (SCREEN_WIDTH - 40 - 32) / 3,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numpadKeyPressed: {
    borderBottomWidth: 2,
    backgroundColor: Colors.surfaceContainerHighest,
  },
  numpadKeyAction: {
    backgroundColor: Colors.surfaceContainerHigh,
  },
  numpadKeyText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 20,
    color: Colors.onSurface,
  },
  numpadKeyActionText: {
    color: Colors.onSurfaceVariant,
    fontSize: 18,
  },

  // ─── Word Problem Context (prominent bill/coin display with operator tokens) ───
  moneyContextRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primaryContainer,
    borderRadius: 24,
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: Colors.primary,
    padding: 16,
  },
  moneyContextCard: {
    width: COIN_SIZE * 1.6,
    height: COIN_SIZE * 1.0,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  moneyContextAsset: {
    width: '100%',
    height: '100%',
  },
  operatorToken: {
    backgroundColor: Colors.secondaryContainer,
    borderRadius: 12,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: Colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  operatorTokenText: {
    fontFamily: 'Lexend-Black',
    fontSize: 22,
    color: Colors.onSecondaryContainer,
  },

  // ─── Check Button ───
  checkButtonContainer: {
    width: '100%',
    marginTop: 24,
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

export default MoneyEngine;
