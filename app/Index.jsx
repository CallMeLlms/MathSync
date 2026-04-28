import React from 'react';
import { Redirect } from 'expo-router';

/**
 * Welcome Screen - Root Entry Point
 * Implements "The Tactile Discovery Garden" aesthetic: Flat, bold, and asymmetric.
 * 
 * NOTE: Currently configured to redirect to SignIn automatically as per requirements.
 */
export default function Home() {
  return <Redirect href="/(auth)/SignIn" />;
}
