import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Colors from '@/constants/colors';
import GameFeedback from './Shared/GameFeedback';

/**
 * CounterEngine (Universal Interface Component)
 * A generic tap-to-count mechanic for basic numeracy.
 * @param {Object} data - Standardized JSON { question, targetCount }
 * @param {Function} onResult - Callback with bool (isCorrect)
 * @param {Function} onComplete - Callback when engine goal is met
 * @param {Function} onError - Callback if data is corrupted
 */
export default function CounterEngine({ 
  data, 
  onResult, 
  onComplete, 
  onError 
}) {
  const [count, setCount] = useState(0);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Guard Clause for Data Integrity
  if (!data || !data.question || typeof data.targetCount !== 'number') {
    if (onError) onError('Invalid Data: CounterEngine requires question and targetCount.');
    return null;
  }

  const handleSubmit = () => {
    if (feedbackVisible) return;

    const correct = count === data.targetCount;
    setIsCorrect(correct);
    setFeedbackVisible(true);
    
    if (onResult) {
      onResult(correct);
    }
  };

  const handleFeedbackComplete = () => {
    setFeedbackVisible(false);
    if (isCorrect && onComplete) {
      // Signal parent that we finished
      onComplete();
    } else {
      // Optional: Reset count on failure, or let them adjust it
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.questionText}>{data.question}</Text>
      </View>

      <View style={styles.counterDisplay}>
        <Text style={styles.countText}>{count}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.adjustButton} 
          onPress={() => setCount(Math.max(0, count - 1))}
        >
          <Text style={styles.adjustText}>-</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.adjustButton} 
          onPress={() => setCount(count + 1)}
        >
          <Text style={styles.adjustText}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
         <Text style={styles.submitText}>Check Answer</Text>
      </TouchableOpacity>

      <GameFeedback 
        isVisible={feedbackVisible}
        isCorrect={isCorrect}
        onAnimationComplete={handleFeedbackComplete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  questionText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 28,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  counterDisplay: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 4,
    borderColor: Colors.primary,
  },
  countText: {
    fontFamily: 'Lexend-Black',
    fontSize: 64,
    color: Colors.onPrimaryContainer,
  },
  controls: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 40,
  },
  adjustButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surfaceContainerHighest,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 40,
    color: Colors.onSurface,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 100,
  },
  submitText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    color: '#FFFFFF',
  }
});
