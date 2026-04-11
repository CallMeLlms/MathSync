import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';

/**
 * FractionVisual
 * 
 * Consistent math visualizer for rendering vertical fractions with a solid vinculum (fraction line).
 */
const FractionVisual = ({ 
  numerator, 
  denominator, 
  theme, 
  isActive = false, 
  isInput = false 
}) => {
  
  const textColor = isInput 
    ? (isActive ? theme.primaryColor : Colors.onSurface)
    : Colors.onSurface;

  // Render a question mark if a field is "missing" in input mode
  const displayNumerator = (isInput && !numerator) ? "?" : numerator;
  const displayDenominator = (isInput && !denominator) ? "?" : denominator;

  return (
    <View style={styles.fractionContainer}>
      <Text style={[
        styles.fractionText, 
        { 
          fontFamily: theme?.fontFamily?.title || "System", 
          color: (isInput && isActive) ? theme.primaryColor : Colors.onSurface,
          opacity: (isInput && !numerator) ? 0.3 : 1
        }
      ]}>
        {displayNumerator}
      </Text>
      
      <View style={[styles.fractionLine, { backgroundColor: Colors.onSurface }]} />
      
      <Text style={[
        styles.fractionText, 
        { 
          fontFamily: theme?.fontFamily?.title || "System", 
          color: (isInput && isActive) ? theme.primaryColor : Colors.onSurface,
          opacity: (isInput && !denominator) ? 0.3 : 1
        }
      ]}>
        {displayDenominator}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fractionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  fractionText: {
    fontSize: 42,
    lineHeight: 50,
  },
  fractionLine: {
    width: 48,
    height: 4,
    borderRadius: 2,
    marginVertical: 4,
  },
});

export default FractionVisual;
