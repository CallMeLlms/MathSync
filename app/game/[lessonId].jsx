import React from 'react';
import { Stack } from 'expo-router';
import CurriculumOrchestrator from '@/Components/Game/Curriculum/CurriculumOrchestrator';

/**
 * Universal Game Route.
 * Automatically maps to the generic CurriculumOrchestrator.
 */
export default function GameRoute() {
  const { lessonId } = useLocalSearchParams();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <CurriculumOrchestrator lessonId={lessonId} gradeKey="G1" />
    </>
  );
}
