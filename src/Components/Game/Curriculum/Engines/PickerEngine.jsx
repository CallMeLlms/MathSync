import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  ZoomIn,
  ZoomOut,
  FadeInUp,
  Layout,
  LinearTransition,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import GameFeedback from '../../Global/GameFeedback';
import AssetDisplay from '../../Global/AssetDisplay';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BUTTON_SIZE = (SCREEN_WIDTH - 64) / 2;

/**
 * ChoiceChip - Sub-component for individual options
 */
const ChoiceChip = ({ option, colorTheme, onPress, disabled, isWrong }) => {
  return (
    <Animated.View
      layout={LinearTransition.springify()}
      entering={ZoomIn.springify()}
      exiting={ZoomOut.duration(150)}
    >
      <TouchableOpacity
        style={[
          styles.choiceButton,
          { 
            backgroundColor: isWrong ? Colors.error : colorTheme.bg, 
            borderColor: isWrong ? Colors.error : colorTheme.border,
            opacity: disabled ? 0.6 : 1 
          }
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {option.assetId ? (
          <View style={styles.choiceAssetWrapper}>
            <AssetDisplay assetId={option.assetId} />
          </View>
        ) : (
          <Text style={[styles.choiceText, { color: colorTheme.text }]}>
            {option.label}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

/**
 * PickerEngine (Universal Interface Component)
 */
export default function PickerEngine({ 
  data, 
  onResult, 
  onComplete, 
  onError 
}) {
  const [placedAnswer, setPlacedAnswer] = useState(null);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [isCorrectState, setIsCorrectState] = useState(false);
  const [showWrongState, setShowWrongState] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);

  const OPTION_THEMES = useMemo(() => [
    { bg: Colors.primaryContainer, border: Colors.primary, text: Colors.onPrimaryContainer },
    { bg: Colors.secondaryContainer, border: Colors.secondary, text: Colors.onSecondaryContainer },
    { bg: Colors.tertiaryContainer, border: Colors.tertiary, text: Colors.onTertiaryContainer },
    { bg: Colors.surfaceContainerHighest, border: Colors.outlineVariant, text: Colors.onSurfaceVariant },
  ], []);

  const shuffledChoices = useMemo(() => {
    if (!data?.choices) return [];
    return [...data.choices].sort(() => Math.random() - 0.5);
  }, [data?.choices]);

  if (!data || !data.question || !data.choices) {
    if (onError) onError('Invalid Data: PickerEngine requires question and choices.');
    return null;
  }

  const handleChoiceTap = (choice) => {
    if (sessionFinished || feedbackVisible) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowWrongState(false);
    setPlacedAnswer(choice);
  };

  const handleRemoveTap = () => {
    if (sessionFinished || feedbackVisible) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowWrongState(false);
    setPlacedAnswer(null);
  };

  const handleCheckAnswer = () => {
    if (!placedAnswer || sessionFinished || feedbackVisible) return;

    const correct = placedAnswer.id === data.correctChoiceId;
    setIsCorrectState(correct);

    if (correct) {
      setSessionFinished(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setFeedbackVisible(true);
      if (onResult) onResult(true);
    } else {
      setShowWrongState(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (onResult) onResult(false);

      setTimeout(() => {
        setPlacedAnswer(null);
        setShowWrongState(false);
      }, 1000);
    }
  };

  const handleFeedbackComplete = () => {
    setFeedbackVisible(false);
    if (isCorrectState && onComplete) {
      onComplete();
    }
  };

  const getThemeForChoice = (choiceId) => {
    const idx = shuffledChoices.findIndex(c => c.id === choiceId);
    return OPTION_THEMES[idx % OPTION_THEMES.length];
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInUp.duration(600)} style={styles.questionContainer}>
        {data.questionAssetId && (
          <View style={styles.questionAssetWrapper}>
            <AssetDisplay assetId={data.questionAssetId} />
          </View>
        )}
        <Text style={styles.questionText}>{data.question}</Text>
      </Animated.View>

      <View style={[
        styles.dropZone, 
        sessionFinished && styles.dropZoneCorrect,
        showWrongState && styles.dropZoneWrong
      ]}>
        {placedAnswer ? (
          <ChoiceChip
            option={placedAnswer}
            colorTheme={getThemeForChoice(placedAnswer.id)}
            onPress={handleRemoveTap}
            disabled={sessionFinished}
            isWrong={showWrongState}
          />
        ) : (
          <Animated.View entering={ZoomIn.springify()} style={styles.emptyBox}>
            <MaterialCommunityIcons name="gesture-tap" size={32} color={Colors.outlineVariant} />
            <Text style={styles.dropZoneHint}>Tap an answer to place</Text>
          </Animated.View>
        )}
      </View>

      <View style={styles.grid}>
        {shuffledChoices.map((choice, i) => {
          if (placedAnswer && choice.id === placedAnswer.id) return null;
          
          return (
            <ChoiceChip
              key={choice.id}
              option={choice}
              colorTheme={OPTION_THEMES[i % OPTION_THEMES.length]}
              onPress={() => handleChoiceTap(choice)}
              disabled={sessionFinished}
            />
          );
        })}
      </View>

      <View style={styles.footer}>
        {placedAnswer && !sessionFinished && (
          <Animated.View entering={ZoomIn.springify()} exiting={ZoomOut}>
            <TouchableOpacity
              style={styles.checkButton}
              onPress={handleCheckAnswer}
              activeOpacity={0.8}
            >
              <Text style={styles.checkButtonText}>Check Answer</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      <GameFeedback 
        isVisible={feedbackVisible}
        isCorrect={isCorrectState}
        onAnimationComplete={handleFeedbackComplete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.surface,
  },
  questionContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  questionAssetWrapper: {
    width: 140,
    height: 140,
    marginBottom: 12,
  },
  questionText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 24,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  dropZone: {
    width: BUTTON_SIZE + 32,
    height: BUTTON_SIZE * 0.75 + 32,
    alignSelf: 'center',
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  dropZoneCorrect: {
    borderColor: Colors.success,
    backgroundColor: Colors.surfaceContainerLowest,
    borderStyle: 'solid',
    borderWidth: 4,
  },
  dropZoneWrong: {
    borderColor: Colors.error,
    borderStyle: 'solid',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },
  dropZoneHint: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 4,
    width: '100%',
  },
  choiceButton: {
    width: '47%',
    aspectRatio: 1.3,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  choiceAssetWrapper: {
    width: '70%',
    height: '70%',
  },
  choiceText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 22,
  },
  footer: {
    marginTop: 24,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButton: {
    backgroundColor: Colors.tertiary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: Colors.onTertiaryContainer,
  },
  checkButtonText: {
    fontFamily: 'Lexend-Bold',
    color: '#FFF',
    fontSize: 18,
  },
});
