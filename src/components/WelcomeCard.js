import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

// ✅ Using the Path Alias for assets
import AppIcon from '@assets/adaptive-icon.png';

/**
 * A sample component demonstrating the use of path aliases and ES6 imports.
 */
export default function WelcomeCard() {
  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['#2c3e50', '#000000']}
        style={styles.gradient}
      >
        <Image 
          source={AppIcon} 
          style={styles.icon}
          contentFit="contain" 
        />
        <Text style={styles.title}>Welcome to MathSync</Text>
        <Text style={styles.body}>Your environment is correctly configured!</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    margin: 20,
    elevation: 5,
  },
  gradient: {
    padding: 30,
    alignItems: 'center',
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  body: {
    color: '#ccc',
    marginTop: 10,
    textAlign: 'center',
  },
});
