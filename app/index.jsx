import React from 'react';
import { Redirect } from 'expo-router';

/**
 * Root Entry Point
 * Redirects to the SignIn screen within the (auth) group.
 */
export default function Index() {
  return <Redirect href="/SignIn" />;
}
