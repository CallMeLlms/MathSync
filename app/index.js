import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

// Design System
import Colors from '../src/constants/Colors';

/**
 * Welcome Screen - Root Entry Point
 * Implements "The Tactile Discovery Garden" aesthetic: Flat, bold, and asymmetric.
 */
export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Brand Header - Bold Asymmetry */}
        <View style={styles.brandWrapper}>
          <Text style={styles.brandTitle}>MathSync</Text>
          <Text style={styles.brandTagline}>Learning in Bloom</Text>
        </View>

        {/* Action Section */}
        <View style={styles.actionWrapper}>
          <TouchableOpacity 
            style={styles.buttonContainer}
            activeOpacity={0.8}
            onPress={() => router.push('/(auth)/signIn')}
          >
            <LinearGradient
              colors={[Colors.primary, '#803400']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.disclaimText}>Tap to start your discovery</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface, // Warm Paper Base
  },
  content: {
    flex: 1,
    padding: 32,
    justifyContent: 'space-between',
    paddingVertical: 100,
  },
  brandWrapper: {
    alignItems: 'flex-start', // Editorial Asymmetry
  },
  brandTitle: {
    fontFamily: 'Lexend-Black',
    fontSize: 64,
    color: Colors.primary,
    lineHeight: 72,
  },
  brandTagline: {
    fontFamily: 'Lexend-Light',
    fontSize: 24,
    color: Colors.onSurface,
    marginTop: -8,
  },
  actionWrapper: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    paddingVertical: 20,
    borderRadius: 100, // Pill shaped
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    color: '#ffffff',
    letterSpacing: 1,
  },
  disclaimText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
});
