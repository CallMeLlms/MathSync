import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import SequenceVisualizer from '@/Components/Game/Global/Visualizers/SequenceVisualizer';

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

  useEffect(() => {
    if (isVisible) {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
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

  if (!isVisible) return null;

  const metadata = problem?.metadata || {};
  const emoji = isCorrect ? '🎉' : '💪';
  const statusTitle = isCorrect ? 'Perfect!' : 'Not Quite!';
  const statusColor = isCorrect ? Colors.success : Colors.error;

  // Decide which visualizer to use based on topic
  const renderVisualizer = (items, label, isCorrectValue) => {
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
              {renderVisualizer(metadata.correctOrder || [problem.answer], isCorrect ? "Result" : "Correct Answer", true)}
              
              {/* User Answer Display (if wrong) */}
              {!isCorrect && userAnswer && (
                renderVisualizer(userAnswer.split(', '), "Your Try", false)
              )}
            </View>
          </View>

          {/* Footer Action */}
          <TouchableOpacity 
            style={[styles.continueButton, { backgroundColor: statusColor }]}
            onPress={onContinue}
            activeOpacity={0.8}
          >
            <Text style={[styles.continueText, { fontFamily: theme.fontFamily.accent }]}>Continue</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
         
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
    elevation: 99,
    zIndex: 100,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.surface,
    borderRadius: 32,
    borderWidth: 4,
    padding: 32,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    marginBottom: 24,
    textAlign: 'center',
  },
  contentContainer: {
    width: '100%',
    marginBottom: 32,
  },
  reviewContainer: {
    backgroundColor: Colors.surfaceVariant + '40',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    gap: 16,
  },
  reviewBlock: {
    alignItems: 'center',
  },
  reviewLabel: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  reviewText: {
    fontSize: 18,
    color: Colors.onSurface,
  },
  continueButton: {
    width: '100%',
    height: 64,
    borderRadius: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  continueText: {
    color: '#FFF',
    fontSize: 20,
  }
});
