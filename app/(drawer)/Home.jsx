import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import Colors from '@constants/Colors';

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to MathSync</Text>
        <Text style={styles.subtitle}>Your mathematical journey starts here.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  content: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Lexend-Bold',
    fontSize: 28,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    marginTop: 12,
    textAlign: 'center',
  },
});
