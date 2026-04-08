import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, useWindowDimensions, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

import authService from '../../src/services/authService';

// Design System
import Colors from '@/constants/colors';

export default function SignIn() {
  const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewPassword, setViewPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(null);

  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await authService.signIn(email, password);
      router.replace('/(drawer)/Home');
    } catch (error) {
       Alert.alert('Login Failed', error.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={[styles.header, { height: SCREEN_HEIGHT * 0.4 }]}>
            <LinearGradient
              colors={[Colors.primary, '#803400']}
              style={StyleSheet.absoluteFill}
            />
            <View style={[styles.headerTitleContainer, { paddingTop: SCREEN_HEIGHT * 0.06 }]}>
              <Text style={styles.headerTitleText}>MathSync</Text>
              <Text style={styles.headerTitleSubText}>Start your learning adventure</Text>
            </View>
          </View>

          {/* Main Container */}
          <View style={[
            styles.mainContainer,
            {
              marginTop: -SCREEN_HEIGHT * 0.08,
              padding: SCREEN_WIDTH * 0.08,
              minHeight: SCREEN_HEIGHT * 0.75
            }
          ]}>
            <View style={styles.wrapper}>
              <View style={styles.titleContainer}>
                <Text style={styles.titleText}>Login.</Text>
              </View>

              <View style={styles.formContainer}>
                {/* Email Input */}
                <View style={[
                  styles.inputWrapper,
                  { height: SCREEN_HEIGHT * 0.08 },
                  isFocused === 'email' && styles.inputWrapperFocused
                ]}>
                  <Feather name="mail" size={24} color={Colors.onSurfaceVariant} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    value={email}
                    placeholderTextColor={Colors.onSurfaceVariant}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => setIsFocused('email')}
                    onBlur={() => setIsFocused(null)}
                  />
                </View>

                {/* Password Input */}
                <View style={[
                  styles.inputWrapper,
                  { height: SCREEN_HEIGHT * 0.08 },
                  isFocused === 'password' && styles.inputWrapperFocused
                ]}>
                  <Feather name="lock" size={24} color={Colors.onSurfaceVariant} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={Colors.onSurfaceVariant}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!viewPassword}
                    onFocus={() => setIsFocused('password')}
                    onBlur={() => setIsFocused(null)}
                  />
                  <TouchableOpacity onPress={() => setViewPassword(!viewPassword)}>
                    <Feather
                      name={viewPassword ? "eye" : "eye-off"}
                      size={20}
                      color={Colors.onSurfaceVariant}
                    />
                  </TouchableOpacity>
                </View>

                {/* Login Button */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.loginButton, { height: SCREEN_HEIGHT * 0.07 }]}
                    onPress={handleLogin}
                    activeOpacity={0.8}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={[Colors.primary, '#803400']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.loginButtonText}>Login</Text>
                    )}
                  </TouchableOpacity>

                  <View style={styles.footerLinks}>
                    <Text style={styles.footerText}>Don't have an account?</Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/SignUp')}>
                      <Text style={styles.signUpLink}>Sign Up</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Guest Button (Left mainly for rapid testing but can be removed based on requirement) */}
                  <TouchableOpacity
                    style={[styles.guestButton, { height: SCREEN_HEIGHT * 0.07 }]}
                    onPress={() => router.replace('/(drawer)/Home')}
                  >
                    <Text style={styles.guestButtonText}>Guest</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b4b4b4',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    width: '100%',
  },
  headerTitleContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  headerTitleText: {
    fontSize: 36,
    fontFamily: 'Lexend-Black',
    color: '#FFFFFF',
  },
  headerTitleSubText: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#FFFFFF',
    marginTop: 4,
  },
  mainContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    width: '100%',
    overflow: 'hidden',
  },
  wrapper: {
    flex: 1,
  },
  titleContainer: {
    marginBottom: 10,
    marginTop: 10,
  },
  titleText: {
    fontSize: 48,
    fontFamily: 'Lexend-Black',
    color: Colors.onSurface,
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 212, 212, 0.86)',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputWrapperFocused: {
    borderColor: Colors.primary,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#000000',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
  },
  loginButton: {
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 15,
  },
  footerText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    color: '#000000',
  },
  signUpLink: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    color: Colors.primary,
  },
  guestButton: {
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(250, 42, 42, 0.88)',
  },
  guestButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'PlusJakartaSans-Bold',
  },
});
