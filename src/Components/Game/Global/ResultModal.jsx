import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue,
  withTiming,
  interpolate
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import SequenceVisualizer from '@/Components/Game/Global/Visualizers/SequenceVisualizer';
import AssetDisplay from '@/Components/Game/Global/AssetDisplay';
import speechManager from '@/utils/speechManager';

const { width, height } = Dimensions.get('window');

/**
 * ResultModal
 * Detailed feedback modal for all game modes.
 * Focuses on pedagogical explanation and visual answer review.
 */
export default function ResultModal({
  isVisible,
  isCorrect,
  problem,
  userAnswer,
  onContinue,
  theme
}) {
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);
  const pressTranslation = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      opacity.value = withSpring(1);
    } else {
      scale.value = 0.85;
      opacity.value = 0;
    }
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }]
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: pressTranslation.value }],
      borderBottomWidth: interpolate(
        pressTranslation.value,
        [0, 4],
        [6, 2]
      )
    };
  });

  const emoji = isCorrect ? '🎉' : '💪';
  const statusTitle = isCorrect ? 'Perfect! Great job!' : "Not quite! Let's try once more!";
  const statusColor = isCorrect ? Colors.success : Colors.error;

  useEffect(() => {
    if (isVisible) {
      speechManager.speakFeedback(statusTitle, isCorrect);
    }
  }, [isVisible, isCorrect, statusTitle]);

  if (!isVisible) return null;

  const metadata = problem?.metadata || {};

  const isAssetId = (val) => typeof val === 'string' && (val.includes('_') || val.startsWith('icon_') || val.startsWith('emoji:'));

  // Decide which visualizer to use based on topic
  const renderVisualizer = (items, label, isCorrectValue) => {
    // Check if any items are asset IDs
    const hasAssets = items.some(isAssetId);

    if (hasAssets) {
      return (
        <View style={styles.reviewBlock}>
          <Text style={[styles.reviewLabel, { fontFamily: theme.fontFamily.body }]}>{label}:</Text>
          <View style={styles.assetRow}>
            {items.map((item, idx) => (
              <View key={idx} style={styles.assetWrapper}>
                <AssetDisplay assetId={item.trim()} style={styles.feedbackAsset} />
              </View>
            ))}
          </View>
        </View>
      );
    }

    if (metadata.type === 'ordering-numbers' || metadata.type === 'ordering-decimals') {
      return (
        <View style={styles.reviewBlock}>
          <Text style={[styles.reviewLabel, { fontFamily: theme.fontFamily.body }]}>{label}:</Text>
          <SequenceVisualizer 
            items={items} 
            isCorrect={isCorrectValue} 
            theme={theme} 
          />
        </View>
      );
    }
    // Fallback for simple text answers
    return (
      <View style={styles.reviewBlock}>
        <Text style={[styles.reviewLabel, { fontFamily: theme.fontFamily.body }]}>{label}:</Text>
        <Text style={[styles.reviewText, { fontFamily: theme.fontFamily.accent }]}>{items.join(', ')}</Text>
      </View>
    );
  };

  const getCorrectAnswerArray = () => {
    if (metadata.correctOrder) return metadata.correctOrder;
    if (problem?.answer !== undefined) return [problem.answer];
    if (problem?.target !== undefined) return [problem.target];
    if (problem?.pairs) return ['Match the pairs'];
    return ['']; // Safest fallback
  };

  return (
    <View style={[StyleSheet.absoluteFillObject, styles.overlay]}>
        <Animated.View style={[styles.card, animatedStyle, { borderColor: statusColor }]}>
          
          {/* Hero Section */}
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={[styles.title, { fontFamily: theme.fontFamily.title, color: statusColor }]}>
            {statusTitle}
          </Text>

          {/* Main Visual Review Section */}
          <View style={styles.contentContainer}>
            <View style={styles.reviewContainer}>
              {/* Correct Answer Display */}
              {renderVisualizer(getCorrectAnswerArray(), isCorrect ? "Result" : "Correct Answer", true)}
              
              {/* User Answer Display (if wrong) */}
              {!isCorrect && userAnswer && (
                renderVisualizer(userAnswer.split(', '), "Your Try", false)
              )}
            </View>
          </View>

          {/* Footer Action */}
          <Pressable 
            onPressIn={() => {
              pressTranslation.value = withTiming(4, { duration: 100 });
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            onPressOut={() => {
              pressTranslation.value = withTiming(0, { duration: 100 });
            }}
            onPress={onContinue}
            style={styles.buttonWrapper}
          >
            <Animated.View style={[
              styles.continueButton, 
              buttonAnimatedStyle,
              { backgroundColor: statusColor, borderColor: 'rgba(0,0,0,0.1)' }
            ]}>
              <Text style={[styles.continueText, { fontFamily: theme.fontFamily.accent }]}>Continue</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
            </Animated.View>
          </Pressable>
         
        </Animated.View>
      </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 100,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.surface,
    borderRadius: 32,
    borderWidth: 2,
    borderBottomWidth: 8,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 28,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 34,
  },
  contentContainer: {
    width: '100%',
    marginBottom: 32,
  },
  reviewContainer: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.05)',
    padding: 20,
    width: '100%',
    gap: 20,
  },
  reviewBlock: {
    alignItems: 'center',
  },
  reviewLabel: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    opacity: 0.7,
  },
  reviewText: {
    fontSize: 20,
    color: Colors.onSurface,
  },
  assetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 4,
  },
  assetWrapper: {
    width: 72,
    height: 72,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackAsset: {
    width: '100%',
    height: '100%',
  },
  buttonWrapper: {
    width: '100%',
  },
  continueButton: {
    width: '100%',
    height: 64,
    borderRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  continueText: {
    color: '#FFF',
    fontSize: 20,
    letterSpacing: 1,
  }
});
