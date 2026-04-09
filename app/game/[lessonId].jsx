import React from 'react';
import { Stack } from 'expo-router';
import Grade1GameScreen from '@/Components/Game/Orchestrators/Grade1/GameScreen';

/**
 * Universal Game Route.
 * Depending on the lessonId/grade, this route component can map to 
 * different GameScreens. For this MVP, it directly mounts Grade1.
 */
export default function GameRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Grade1GameScreen />
    </>
  );
}
