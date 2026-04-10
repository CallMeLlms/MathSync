import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Colors from '@/constants/colors';
import GameFeedback from '../../Global/GameFeedback';

/**
 * DragDropEngine (Minimal MVP Version)
 */
export default function DragDropEngine({ 
  data, 
  onResult, 
  onComplete, 
  onError 
}) {
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  if (!data || !data.question || !data.draggables || !data.dropZones) {
    if (onError) onError('Invalid Data for DragDropEngine');
    return null;
  }

  const handleSelectDraggable = (item) => {
    setSelectedItem(item);
  };

  const handleSelectDropZone = (zone) => {
    if (!selectedItem || feedbackVisible) return;

    const correct = selectedItem.id === zone.expectedDraggableId;
    setIsCorrect(correct);
    setFeedbackVisible(true);
    setSelectedItem(null); 
    
    if (onResult) {
      onResult(correct);
    }
  };

  const handleFeedbackComplete = () => {
    setFeedbackVisible(false);
    if (isCorrect && onComplete) {
      onComplete();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>{data.question}</Text>

      <View style={styles.dropZoneContainer}>
        {data.dropZones.map(zone => (
          <TouchableOpacity 
            key={zone.id} 
            style={styles.dropZone}
            onPress={() => handleSelectDropZone(zone)}
          >
             <Text style={styles.zoneText}>Tap here to drop</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.draggableContainer}>
        {data.draggables.map(item => (
          <TouchableOpacity 
            key={item.id} 
            style={[
              styles.draggable,
              selectedItem?.id === item.id && styles.selectedDraggable
            ]}
            onPress={() => handleSelectDraggable(item)}
          >
            <Text style={styles.draggableText}>{item.label}</Text>
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
    justifyContent: 'space-between',
  },
  questionText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 24,
    textAlign: 'center',
    color: Colors.onSurface,
  },
  dropZoneContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  dropZone: {
    width: 120,
    height: 120,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    borderStyle: 'dashed',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
  },
  zoneText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  draggableContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    flexWrap: 'wrap',
    paddingBottom: 40,
  },
  draggable: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.primaryContainer,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedDraggable: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceContainerHighest,
  },
  draggableText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    color: Colors.onPrimaryContainer,
  }
});
