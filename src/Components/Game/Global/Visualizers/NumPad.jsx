import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from '@/constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/**
 * NumPad Component
 * 
 * Reusable 3x4 tactile number pad for direct numerical input.
 * Includes digits 0-9, backspace, and a submit button.
 */
const NumPad = ({ 
  onKeyPress, 
  onBackspace, 
  onSubmit, 
  disabled = false,
  canSubmit = false,
  theme // Pass theme for dynamic styling
}) => {
  const handlePress = (key) => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onKeyPress(key);
  };

  const handleBackspace = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onBackspace();
  };

  const handleSubmit = () => {
    if (disabled || !canSubmit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onSubmit();
  };

  const primaryColor = theme?.primaryColor || Colors.primary;

  const renderKey = (value, isSpecial = false, onPressHandler = null) => {
    const isSubmit = value === "submit";
    const isBackspace = value === "backspace";
    const isDisabled = disabled || (isSubmit && !canSubmit);

    // Determine the style of the button
    let bgColor = Colors.surface;
    let borderColor = Colors.outlineVariant;
    let textColor = Colors.onSurface;

    if (isSpecial) {
      bgColor = Colors.surfaceVariant;
    }
    
    if (isSubmit && canSubmit) {
      bgColor = primaryColor;
      borderColor = primaryColor;
      textColor = Colors.surface;
    }

    return (
      <TouchableOpacity
        key={value}
        style={[
          styles.key,
          { backgroundColor: bgColor, borderColor: borderColor },
          isSubmit && canSubmit && styles.submitKeyActive,
          isDisabled && styles.keyDisabled,
        ]}
        onPress={onPressHandler || (() => handlePress(value))}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        {isBackspace ? (
          <Ionicons name="backspace-outline" size={32} color={isDisabled ? Colors.onSurfaceVariant : Colors.onSurface} />
        ) : isSubmit ? (
          <Ionicons 
            name="checkmark-circle" 
            size={36} 
            color={canSubmit ? Colors.surface : Colors.onSurfaceVariant} 
          />
        ) : (
          <Text style={[
            styles.keyText, 
            { color: textColor, fontFamily: theme?.fontFamily?.accent || "System" }
          ]}>
            {value}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {renderKey("1")}
        {renderKey("2")}
        {renderKey("3")}
      </View>
      <View style={styles.row}>
        {renderKey("4")}
        {renderKey("5")}
        {renderKey("6")}
      </View>
      <View style={styles.row}>
        {renderKey("7")}
        {renderKey("8")}
        {renderKey("9")}
      </View>
      <View style={styles.row}>
        {renderKey("backspace", true, handleBackspace)}
        {renderKey("0")}
        {renderKey("submit", true, handleSubmit)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: Colors.surface,
    alignSelf: 'center', // Centers it instead of taking full width blindly
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
    gap: 10,
  },
  key: {
    width: 80,
    height: 70,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderBottomWidth: 6, // Tactile depth
  },
  submitKeyActive: {
    borderBottomWidth: 6,
  },
  keyDisabled: {
    opacity: 0.5,
  },
  keyText: {
    fontSize: 32,
  },
});

export default NumPad;
