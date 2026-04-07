import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>MathSync</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8f3', // Warm paper base
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Lexend-Black',
    fontSize: 48,
    color: '#9f4200', // Action Orange
  },
});
