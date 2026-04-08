import React from 'react';
import { withLayoutContext } from 'expo-router';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';

const { Navigator } = createStackNavigator();

/**
 * Custom Stack component that wraps the JS-based navigator
 * and makes it compatible with Expo Router's file-based routing.
 */
export const Stack = withLayoutContext(Navigator);

const AuthLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        ...TransitionPresets.RevealFromBottomAndroid, // Achieving the "reveal from bottom" effect
      }}
    >
      <Stack.Screen
        name="SignIn"
        options={{
          // TODO: Add Toast configuration here later if needed
        }}
      />
      <Stack.Screen
        name="SignUp"
        options={{
          // TODO: Add Toast configuration here later if needed
        }}
      />
    </Stack>
  );
};

export default AuthLayout;
