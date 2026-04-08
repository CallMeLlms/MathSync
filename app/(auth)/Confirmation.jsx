import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, useWindowDimensions } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

import Colors from '@constants/Colors';

export default function Confirmation() {
  const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = useWindowDimensions();
  const router = useRouter();

  const handleOk = () => {
    router.replace('/(auth)/SignIn');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient 
        colors={[Colors.primary, '#803400']} 
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.contentContainer}>
        {/* Success Icon */}
        <View style={[styles.iconWrapper, { width: SCREEN_WIDTH * 0.3, height: SCREEN_WIDTH * 0.3, borderRadius: (SCREEN_WIDTH * 0.3) / 2 }]}>
          <Feather name="check-circle" size={SCREEN_WIDTH * 0.15} color={Colors.primary} />
        </View>

        <Text style={styles.titleText}>Registration Successful!</Text>
        
        <View style={styles.cardContainer}>
          <Text style={styles.messageText}>
            Confirmation for admin to accept. Your account is currently pending approval.
          </Text>
          <Text style={styles.subtext}>
            We will notify you once your account has been approved by the administrators.
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.okButton, { height: SCREEN_HEIGHT * 0.07, width: SCREEN_WIDTH * 0.8 }]} 
          onPress={handleOk}
          activeOpacity={0.8}
        >
          <Text style={styles.okButtonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconWrapper: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  titleText: {
    fontSize: 32,
    fontFamily: 'Lexend-Black',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  messageText: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans-Bold',
    color: Colors.onSurface,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtext: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Regular',
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
  },
  okButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  okButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontFamily: 'PlusJakartaSans-Bold',
  },
});
