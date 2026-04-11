import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

/**
 * SequenceVisualizer
 * Renders a horizontal list of items with arrows between them.
 * Used for ordering games feedback.
 */
export default function SequenceVisualizer({ 
  items = [], 
  isCorrect = true, 
  theme 
}) {
  if (!items || items.length === 0) return null;

  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <View key={`${item}-${index}`} style={styles.itemWrapper}>
          <View style={[
            styles.chip,
            { 
              borderColor: isCorrect ? theme.primaryColor : Colors.outlineVariant,
              backgroundColor: isCorrect ? `${theme.primaryColor}10` : Colors.surface 
            }
          ]}>
            <Text style={[
              styles.chipText,
              { 
                fontFamily: theme.fontFamily.accent,
                color: isCorrect ? theme.primaryColor : Colors.onSurface 
              }
            ]}>
              {item}
            </Text>
          </View>
          
          {index < items.length - 1 && (
            <MaterialIcons 
              name="arrow-forward" 
              size={16} 
              color={Colors.onSurfaceVariant} 
              style={styles.arrow}
            />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  itemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    minWidth: 44,
    alignItems: 'center',
  },
  chipText: {
    fontSize: 16,
  },
  arrow: {
    marginHorizontal: 4,
  }
});
