import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Colors from '@/constants/colors';
import GameFeedback from './Shared/GameFeedback';
import AssetDisplay from './Shared/AssetDisplay';

/**
 * PickerEngine (Universal Interface Component)
 * A generic 2xN grid where the user selects the right answer.
 * @param {Object} data - Standardized JSON { question, correctChoiceId, choices: [{id, label, assetId}] }
 * @param {Function} onResult - Callback with bool (isCorrect)
 * @param {Function} onComplete - Callback when engine goal is met
 * @param {Function} onError - Callback if data is corrupted
 */
export default function PickerEngine({ 
  data, 
  onResult, 
  onComplete, 
  onError 
}) {
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // Guard Clause for Data Integrity
  if (!data || !data.question || !data.choices) {
    if (onError) onError('Invalid Data: PickerEngine requires question and choices arrays.');
    return null;
  }

  const handleChoicePress = (choice) => {
    // If waiting on animation, ignore presses
    if (feedbackVisible) return;

    const correct = choice.id === data.correctChoiceId;
    setIsCorrect(correct);
    setFeedbackVisible(true);
    
    if (onResult) {
      onResult(correct);
    }
  };

  const handleFeedbackComplete = () => {
    setFeedbackVisible(false);
    if (isCorrect && onComplete) {
      // Typically the Parent Container hears this and passes new data
      onComplete(); 
    }
  };

  return (
    <View style={styles.container}>
      {/* Question UI */}
      <View style={styles.questionContainer}>
        {data.questionAssetId && (
          <View style={styles.assetWrapper}>
            <AssetDisplay assetId={data.questionAssetId} />
          </View>
        )}
        <Text style={styles.questionText}>{data.question}</Text>
      </View>

      {/* Interactive Choices */}
      <View style={styles.choicesGrid}>
        {data.choices.map((choice) => (
          <TouchableOpacity
            key={choice.id}
            style={styles.choiceButton}
            onPress={() => handleChoicePress(choice)}
            activeOpacity={0.7}
          >
            {choice.assetId ? (
              <View style={styles.choiceAssetWrapper}>
                 <AssetDisplay assetId={choice.assetId} />
              </View>
            ) : (
              <Text style={styles.choiceText}>{choice.label}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

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
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  assetWrapper: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  questionText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 28,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  choicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  choiceButton: {
    width: '45%',
    aspectRatio: 1,
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    padding: 16,
  },
  choiceAssetWrapper: {
    width: '80%',
    height: '80%',
  },
  choiceText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 24,
    color: Colors.primary,
  }
});
