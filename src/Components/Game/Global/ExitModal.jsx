import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

/**
 * ExitModal
 * Intercepts game exit to prevent accidental data loss.
 * Follows the shadow-free tactile design system.
 */
export default function ExitModal({
  isVisible,
  onCancel,
  onConfirm,
  theme
}) {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      opacity.value = withSpring(1);
    } else {
      scale.value = 0.9;
      opacity.value = 0;
    }
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }]
  }));

  if (!isVisible) return null;

  return (
    <View style={[StyleSheet.absoluteFillObject, styles.overlay]}>
        <Animated.View 
          style={[styles.card, animatedStyle]}
          accessibilityRole="alert"
        >
          {/* Header */}
          <View style={styles.iconCircle}>
            <MaterialIcons name="help-outline" size={40} color={theme.primaryColor} />
          </View>
          
          <Text style={[styles.title, { fontFamily: theme.fontFamily.title }]}>
            Leaving so soon?
          </Text>
          
          <Text style={[styles.message, { fontFamily: theme.fontFamily.body }]}>
            Your current progress in this practice session won't be saved.
          </Text>

          {/* Actions */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              activeOpacity={0.7}
              accessibilityLabel="Keep playing and stay in the game"
            >
              <Text style={[styles.cancelText, { fontFamily: theme.fontFamily.accent }]}>
                Keep Playing
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
              activeOpacity={0.7}
              accessibilityLabel="Quit practice and return to map"
            >
              <Text style={[styles.confirmText, { fontFamily: theme.fontFamily.accent }]}>
                Quit Practice
              </Text>
              <MaterialIcons name="logout" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
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
    elevation: 100,
    zIndex: 100,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.surface,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: Colors.outlineVariant,
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    color: Colors.onSurface,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: Colors.surfaceVariant,
  },
  confirmButton: {
    backgroundColor: Colors.error,
  },
  cancelText: {
    fontSize: 16,
    color: Colors.onSurface,
  },
  confirmText: {
    fontSize: 16,
    color: '#FFF',
  }
});
