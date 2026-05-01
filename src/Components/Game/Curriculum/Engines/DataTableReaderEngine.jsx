import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  FadeIn,
  FadeInDown,
  ZoomIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import speechManager from '@/utils/speechManager';
import QuestionHeader from '@/Components/Game/Global/QuestionHeader';

// ─── NumKey ──────────────────────────────────────────────────────────────────

const NumKey = ({ label, onPress, disabled }) => {
  const ty = useSharedValue(0);
  const bw = useSharedValue(5);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }],
    borderBottomWidth: bw.value,
  }));

  const handleIn = () => {
    if (disabled) return;
    ty.value = withSpring(3, { damping: 15, stiffness: 300 });
    bw.value = withSpring(2, { damping: 15, stiffness: 300 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleOut = () => {
    ty.value = withSpring(0);
    bw.value = withSpring(5);
  };

  return (
    <View style={styles.keyWrap}>
      <Pressable onPress={() => !disabled && onPress(label)} onPressIn={handleIn} onPressOut={handleOut} disabled={disabled}>
        <Animated.View style={[styles.key, animStyle, disabled && styles.keyDisabled]}>
          <Text style={[styles.keyLabel, disabled && styles.keyLabelDisabled]}>{label}</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
};

// ─── MiniPictographRow ───────────────────────────────────────────────────────

const MiniPictographRow = ({ label, count, emoji, index }) => (
  <Animated.View entering={FadeInDown.delay(index * 60).springify()} style={styles.miniRow}>
    <Text style={styles.miniRowLabel}>{label}</Text>
    <View style={styles.miniRowDivider} />
    <Text style={styles.miniEmoji}>{emoji.repeat(count)}</Text>
    <Text style={styles.miniCount}>({count})</Text>
  </Animated.View>
);

// ─── TableRow ────────────────────────────────────────────────────────────────

const TableRow = ({ label, value, isTarget, resolved, input }) => {
  const pulseOpacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isTarget && !resolved) {
      pulseOpacity.value = withRepeat(
        withSequence(withTiming(0.4, { duration: 650 }), withTiming(1, { duration: 650 })),
        -1,
        true
      );
    }
    if (isTarget && resolved) {
      pulseOpacity.value = 1;
      scale.value = withSpring(1.05, { damping: 10, stiffness: 200 }, () => {
        scale.value = withSpring(1);
      });
    }
  }, [isTarget, resolved]);

  const blankStyle = useAnimatedStyle(() => ({ opacity: pulseOpacity.value }));
  const rowStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const displayValue = isTarget
    ? resolved
      ? input
      : null
    : value;

  return (
    <Animated.View style={[styles.tableRow, isTarget && styles.tableRowTarget, rowStyle]}>
      <View style={styles.tableCell}>
        <Text style={[styles.tableCellText, isTarget && styles.tableCellTextTarget]}>{label}</Text>
      </View>
      <View style={[styles.tableCellDivider]} />
      <View style={[styles.tableCell, styles.tableCellValue]}>
        {displayValue !== null ? (
          <Animated.Text
            entering={isTarget && resolved ? ZoomIn.springify() : undefined}
            style={[styles.tableCellText, isTarget && resolved && styles.tableCellAnswerText]}
          >
            {String(displayValue)}
          </Animated.Text>
        ) : (
          <Animated.View style={[styles.blankCell, blankStyle]}>
            <Text style={styles.blankCellText}>?</Text>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
};

// ─── CheckButton ─────────────────────────────────────────────────────────────

const CheckButton = ({ onPress, disabled, label }) => {
  const ty = useSharedValue(0);
  const bw = useSharedValue(6);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }],
    borderBottomWidth: bw.value,
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        if (disabled) return;
        ty.value = withSpring(4);
        bw.value = withSpring(2);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }}
      onPressOut={() => {
        ty.value = withSpring(0);
        bw.value = withSpring(6);
      }}
      disabled={disabled}
    >
      <Animated.View style={[styles.checkBtn, animStyle, disabled && styles.checkBtnDisabled]}>
        <Text style={[styles.checkBtnText, disabled && styles.checkBtnTextDisabled]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
};

// ─── DataTableReaderEngine ───────────────────────────────────────────────────

const DataTableReaderEngine = ({ data, onResult }) => {
  const { question: questionText, answer, pictograph = {}, table = {} } = data;
  const { title: pictoTitle = '', rows: pictoRows = [] } = pictograph;
  const { headers = ['Item', 'Count'], targetRow = '', rows: tableRows = [] } = table;

  const [input, setInput] = useState('');
  const [resolved, setResolved] = useState(false);
  const [isWrong, setIsWrong] = useState(false);

  const shakeX = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  useEffect(() => {
    setInput('');
    setResolved(false);
    setIsWrong(false);
  }, [data]);

  useEffect(() => {
    if (questionText) {
      const t = setTimeout(() => speechManager.speakInstruction(questionText), 400);
      return () => {
        clearTimeout(t);
        speechManager.stop();
      };
    }
  }, [questionText]);

  const handleKey = (key) => {
    if (resolved) return;
    if (key === '⌫') {
      setInput(prev => prev.slice(0, -1));
    } else if (input.length < 2) {
      setInput(prev => prev + key);
    }
    setIsWrong(false);
  };

  const handleCheck = () => {
    if (!input || resolved) return;

    const isCorrect = parseInt(input, 10) === Number(answer);

    if (isCorrect) {
      setResolved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      speechManager.speakFeedback('Correct!', true);
      setTimeout(() => onResult(true, [input]), 1000);
    } else {
      setIsWrong(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      speechManager.speakFeedback('Try again!', false);
      shakeX.value = withSequence(
        withTiming(-10, { duration: 55 }),
        withTiming(10, { duration: 55 }),
        withTiming(-7, { duration: 55 }),
        withTiming(7, { duration: 55 }),
        withTiming(0, { duration: 55 })
      );
      setTimeout(() => {
        setInput('');
        setIsWrong(false);
      }, 1000);
      setTimeout(() => onResult(false, [input]), 1200);
    }
  };

  const NUMPAD = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['⌫', '0', null],
  ];

  return (
    <View style={styles.container}>
      <QuestionHeader text={questionText} />
      {/* Mini Pictograph */}
      <Animated.View entering={FadeIn.delay(100).duration(350)} style={styles.pictoCard}>
        <View style={styles.pictoHeader}>
          <Text style={styles.pictoTitle}>{pictoTitle}</Text>
          <Text style={styles.pictoHint}>1 symbol = 1</Text>
        </View>
        <View style={styles.pictoBody}>
          {pictoRows.map((row, i) => (
            <MiniPictographRow
              key={row.label}
              label={row.label}
              count={row.count}
              emoji={row.emoji}
              index={i}
            />
          ))}
        </View>
      </Animated.View>

      {/* Arrow connector */}
      <Animated.View entering={FadeIn.delay(300).duration(300)} style={styles.arrowConnector}>
        <Text style={styles.arrowConnectorText}>↓ Now fill in the table ↓</Text>
      </Animated.View>

      {/* Data Table */}
      <Animated.View entering={FadeIn.delay(400).duration(350)} style={styles.tableCard}>
        {/* Header */}
        <View style={styles.tableHeader}>
          {headers.map((h, i) => (
            <View key={i} style={[styles.tableCell, i === 1 && styles.tableCellValue]}>
              <Text style={styles.tableHeaderText}>{h}</Text>
            </View>
          ))}
        </View>
        {/* Rows */}
        <Animated.View style={shakeStyle}>
          {tableRows.map((row) => (
            <TableRow
              key={row.label}
              label={row.label}
              value={row.value}
              isTarget={row.label === targetRow}
              resolved={resolved}
              input={input}
            />
          ))}
        </Animated.View>
      </Animated.View>

      {/* Input + Numpad */}
      <View style={styles.inputRow}>
        <View style={[styles.inputBox, isWrong && styles.inputBoxWrong]}>
          <Text style={[styles.inputText, !input && styles.inputPlaceholder]}>
            {input || '?'}
          </Text>
        </View>
      </View>

      <View style={styles.numpad}>
        {NUMPAD.map((row, ri) => (
          <View key={ri} style={styles.numpadRow}>
            {row.map((key, ki) =>
              key !== null ? (
                <NumKey key={ki} label={key} onPress={handleKey} disabled={resolved} />
              ) : (
                <View key={ki} style={styles.keyWrap} />
              )
            )}
          </View>
        ))}
      </View>

      <CheckButton
        onPress={handleCheck}
        disabled={!input || resolved}
        label={resolved ? 'AWESOME! ✓' : 'FILL IN TABLE'}
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
    gap: 10,
  },
  // ── Mini Pictograph
  pictoCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    borderRadius: 16,
    overflow: 'hidden',
  },
  pictoHeader: {
    backgroundColor: Colors.primaryContainer,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderBottomWidth: 2,
    borderBottomColor: Colors.outlineVariant,
  },
  pictoTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 14,
    color: Colors.onPrimaryContainer,
  },
  pictoHint: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    color: Colors.onPrimaryContainer,
    opacity: 0.7,
  },
  pictoBody: {
    paddingVertical: 2,
  },
  miniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  miniRowLabel: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    width: 60,
  },
  miniRowDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.outlineVariant,
    marginHorizontal: 8,
  },
  miniEmoji: {
    fontSize: 14,
    letterSpacing: 1,
    flex: 1,
  },
  miniCount: {
    fontFamily: 'Lexend-Bold',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginLeft: 4,
  },
  // ── Arrow connector
  arrowConnector: {
    alignItems: 'center',
  },
  arrowConnectorText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 12,
    color: Colors.secondary,
    letterSpacing: 0.3,
  },
  // ── Data Table
  tableCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    borderRadius: 16,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.secondaryContainer,
    borderBottomWidth: 2,
    borderBottomColor: Colors.outlineVariant,
  },
  tableHeaderText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 13,
    color: Colors.onSecondaryContainer,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  tableRowTarget: {
    backgroundColor: Colors.tertiaryContainer,
  },
  tableCell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  tableCellValue: {
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: Colors.outlineVariant,
  },
  tableCellDivider: {
    width: 0,
  },
  tableCellText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: Colors.onSurface,
  },
  tableCellTextTarget: {
    fontFamily: 'PlusJakartaSans-Bold',
    color: Colors.onTertiaryContainer,
  },
  tableCellAnswerText: {
    fontFamily: 'Lexend-Black',
    fontSize: 18,
    color: Colors.success,
  },
  blankCell: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.secondary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondaryContainer,
  },
  blankCellText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 18,
    color: Colors.secondary,
  },
  // ── Input
  inputRow: {
    alignItems: 'center',
  },
  inputBox: {
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  inputBoxWrong: {
    borderColor: Colors.error,
    backgroundColor: '#ffebee',
  },
  inputText: {
    fontFamily: 'Lexend-Black',
    fontSize: 32,
    color: Colors.onSurface,
    letterSpacing: 2,
  },
  inputPlaceholder: {
    color: Colors.outlineVariant,
  },
  // ── Numpad
  numpad: {
    gap: 6,
  },
  numpadRow: {
    flexDirection: 'row',
    gap: 6,
  },
  keyWrap: {
    flex: 1,
  },
  key: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyDisabled: {
    backgroundColor: Colors.surfaceContainerHighest,
    opacity: 0.5,
  },
  keyLabel: {
    fontFamily: 'Lexend-Bold',
    fontSize: 20,
    color: Colors.onSurface,
  },
  keyLabelDisabled: {
    color: Colors.onSurfaceVariant,
  },
  // ── Check Button
  checkBtn: {
    backgroundColor: Colors.tertiary,
    borderWidth: 2,
    borderColor: '#004d1e',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkBtnDisabled: {
    backgroundColor: Colors.surfaceContainerHighest,
    borderColor: Colors.outlineVariant,
  },
  checkBtnText: {
    fontFamily: 'Lexend-Black',
    fontSize: 17,
    color: Colors.onTertiary,
    letterSpacing: 1.2,
  },
  checkBtnTextDisabled: {
    color: Colors.onSurfaceVariant,
    opacity: 0.5,
  },
});

export default DataTableReaderEngine;
