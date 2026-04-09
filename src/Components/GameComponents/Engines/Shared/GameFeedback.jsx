import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

/**
 * Standardized "Correct/Try Again" Overlay logic.
 * This can be used by Engines to provide immediate answer feedback.
 */
export default function GameFeedback({
  isVisible,
  isCorrect,
  onAnimationComplete,
  duration = 1500
}) {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (isVisible) {
      // Pop in
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        })
      ]).start(() => {
        // Hold, then fade out
        setTimeout(() => {
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            if (onAnimationComplete) onAnimationComplete();
            // Reset for next time
            scale.setValue(0.5);
          });
        }, duration);
      });
    }
  }, [isVisible, isCorrect, duration, opacity, scale, onAnimationComplete]); 

  if (!isVisible && opacity._value === 0) return null;

  return (
    <Animated.View 
      style={[
        styles.overlay, 
        { 
          opacity, 
          transform: [{ scale }] 
        }
      ]}
      pointerEvents="none"
    >
      <View style={[
        styles.feedbackBox, 
        { backgroundColor: isCorrect ? Colors.success : Colors.error }
      ]}>
        <MaterialIcons 
          name={isCorrect ? 'check-circle' : 'error'} 
          size={56} 
          color="#FFFFFF" 
        />
        <Text style={styles.feedbackText}>
          {isCorrect ? 'Great Job!' : 'Try Again!'}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 32,
    gap: 16,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.4)', // Tonal layering without shadow
  },
  feedbackText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 28,
    color: '#FFFFFF',
  }
});
