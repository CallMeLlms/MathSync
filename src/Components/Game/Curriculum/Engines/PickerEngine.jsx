import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  ZoomIn,
  FadeIn,
  FadeOut,
  Layout,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import speechManager from '@/utils/speechManager';

// ─── OptionButton (Tactile "Bulky" Style) ───
const OptionButton = ({ 
  label, 
  index, 
  isSelected, 
  evaluation, 
  disabled, 
  onPress 
}) => {
  const translateY = useSharedValue(0);
  const bottomWidth = useSharedValue(6);

  // States: 'idle', 'selected', 'correct', 'wrong'
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
    idle: {
      border: Colors.outlineVariant,
      bg: Colors.surfaceContainerLowest,
      text: Colors.onSurface,
    },
    selected: {
      border: Colors.secondary,
      bg: Colors.secondaryContainer,
      text: Colors.onSecondaryContainer,
    },
    correct: {
      border: Colors.success,
      bg: '#e8f5e9',
      text: Colors.success,
    },
    wrong: {
      border: Colors.error,
      bg: '#ffebee',
      text: Colors.error,
    },
  }[state];

  return (
    <Animated.View
      entering={ZoomIn.springify().delay(index * 100)}
      layout={Layout.springify()}
      style={styles.optionWrapper}
    >
      <Pressable
        onPress={() => !disabled && onPress(label)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        <Animated.View
          style={[
            styles.optionButton,
            animatedStyle,
            {
              backgroundColor: colors.bg,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.optionText, { color: colors.text }]}>
            {String(label)}
          </Text>
          
          {state === 'correct' && (
            <Ionicons name="checkmark-circle" size={24} color={Colors.success} style={styles.badge} />
          )}
          {state === 'wrong' && (
            <Ionicons name="close-circle" size={24} color={Colors.error} style={styles.badge} />
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

// ─── CheckButton (Main Action) ───
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

// ─── PickerEngine ───
const PickerEngine = ({ data, onResult }) => {
  const { question: questionText, answer, metadata = {} } = data;
  const options = metadata.options || [];

  const [selectedOption, setSelectedOption] = useState(null);
  const [evaluation, setEvaluation] = useState(null); // 'correct' | 'wrong' | null
  const [resolved, setResolved] = useState(false);

  const shuffledOptions = useMemo(
    () => [...options].sort(() => Math.random() - 0.5),
    [data]
  );

  useEffect(() => {
    setSelectedOption(null);
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
    if (!selectedOption || resolved) return;

    const normalizedSelected = String(selectedOption).toLowerCase().trim();
    const normalizedAnswer = String(answer).toLowerCase().trim();
    const isCorrect = normalizedSelected === normalizedAnswer;

    if (isCorrect) {
      setEvaluation('correct');
      setResolved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      speechManager.speakFeedback('Correct!', true);
      setTimeout(() => onResult(true, [String(selectedOption)]), 800);
    } else {
      setEvaluation('wrong');
      setResolved(true); // Prevent further interaction
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      speechManager.speakFeedback('Try again!', false);
      // Auto-advance even if wrong
      setTimeout(() => onResult(false, [String(selectedOption)]), 1000);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.optionsList}>
        {shuffledOptions.map((opt, idx) => (
          <OptionButton
            key={`${idx}-${opt}`}
            label={opt}
            index={idx}
            isSelected={selectedOption === opt}
            evaluation={selectedOption === opt ? evaluation : null}
            disabled={resolved || evaluation === 'wrong'}
            onPress={setSelectedOption}
          />
        ))}
      </View>

      <CheckButton
        onPress={handleCheck}
        disabled={!selectedOption || resolved || !!evaluation}
        label={resolved ? 'AWESOME!' : 'CHECK'}
      />
    </View>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  questionContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  questionText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 24,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  optionsList: {
    gap: 16,
  },
  optionWrapper: {
    width: '100%',
  },
  optionButton: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  optionText: {
    fontFamily: 'Lexend-Medium',
    fontSize: 20,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    right: 16,
  },
  checkButtonContainer: {
    width: '100%',
  },
  checkButton: {
    width: '100%',
    backgroundColor: Colors.tertiary,
    borderColor: '#004d1e', // Darker shade for depth
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

export default PickerEngine;
