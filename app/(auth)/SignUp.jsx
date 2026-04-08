import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, AntDesign } from '@expo/vector-icons';

// Design System
import Colors from '@constants/Colors';

/**
 * SignUp Screen
 * Mimics the user's provided design structure and ratios exactly.
 * Adheres to the "Golden Rule": Flexbox for core layout, Dimensions for specific ratios.
 */
export default function SignUp() {
  const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = useWindowDimensions();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewPassword, setViewPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(null); 

  const router = useRouter();

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      console.log('Validation: Fill all fields');
      return;
    }
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.replace('/(auth)/SignIn');
    } catch (error) {
      console.log(error);
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
          {/* Header Section - 35% height mimic */}
          <View style={[styles.header, { height: SCREEN_HEIGHT * 0.35 }]}>
            <View style={[styles.headerTitleContainer, { paddingTop: SCREEN_HEIGHT * 0.06 }]}>
              <Text style={styles.headerTitleText}>MathSync</Text>
              <Text style={styles.headerTitleSubText}>Learn, Play, and Grow</Text>
            </View>
          </View>

          {/* Main Container - Overlay logic */}
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
                <Text style={styles.titleText}>Sign Up</Text>
              </View>

              <View style={styles.formContainer}>
                {/* Full Name Input - 8% height mimic */}
                <View style={[
                  styles.inputWrapper,
                  { height: SCREEN_HEIGHT * 0.08 },
                  isFocused === 'name' && styles.inputWrapperFocused
                ]}>
                  <AntDesign name="idcard" size={24} color={Colors.onSurfaceVariant} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    value={name}
                    placeholderTextColor={Colors.onSurfaceVariant}
                    onChangeText={setName}
                    autoCapitalize="words"
                    onFocus={() => setIsFocused('name')}
                    onBlur={() => setIsFocused(null)}
                  />
                </View>

                {/* Email Input - 8% height mimic */}
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
              
                {/* Password Input - 8% height mimic */}
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

                {/* Confirm Password Input - 8% height mimic */}
                <View style={[
                  styles.inputWrapper,
                  { height: SCREEN_HEIGHT * 0.08 },
                  isFocused === 'confirm' && styles.inputWrapperFocused
                ]}> 
                  <Feather name="user-check" size={24} color={Colors.onSurfaceVariant} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor={Colors.onSurfaceVariant}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!viewPassword}
                    onFocus={() => setIsFocused('confirm')}
                    onBlur={() => setIsFocused(null)}
                  />
                </View>

                {/* Sign Up Button - 7% height mimic */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    style={[styles.signupButton, { height: SCREEN_HEIGHT * 0.07 }]} 
                    onPress={handleSignUp}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.signupButtonText}>Create Account</Text>
                    )}
                  </TouchableOpacity>

                  <View style={styles.footerLinks}>
                    <Text style={styles.footerText}>Already have an account?</Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/SignIn')}>
                      <Text style={styles.loginLink}>Login</Text>
                    </TouchableOpacity>
                  </View> 
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
    backgroundColor: Colors.secondary,
  },
  headerTitleContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  headerTitleText: {
    fontSize: 32,
    fontFamily: 'Lexend-Black',
    color: '#FFFFFF',
  },
  headerTitleSubText: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Regular',
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
    borderColor: Colors.secondary,
  },
  input: {
    flex: 1,
    marginLeft: 10, 
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Regular',
    color: '#000000',
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
  },
  signupButton: {
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    marginBottom: 10,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 40,
  },
  footerText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    color: '#000000',
  },
  loginLink: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    color: Colors.primary,
  },
});
