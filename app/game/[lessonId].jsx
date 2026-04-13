import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import CurriculumOrchestrator from '@/Components/Game/Curriculum/CurriculumOrchestrator';
import GenerativeOrchestrator from '@/Components/Game/Generative/Orchestrators/GenerativeOrchestrator';

/**
 * Universal Game Route.
 * Detects 'type' to switch between static Curriculum and dynamic Practice engines.
 * 
 * Usage: /game/123?type=generative&topicId=ordering-numbers&grade=G2
 */
export default function GameRoute() {
  const params = useLocalSearchParams();
  const { lessonId, type, topicId, grade = 'G1' } = params;

  console.log('[Router] Path Params:', { lessonId, type, topicId, grade });

  const computedTopicId = topicId || lessonId;
  const isGenerative = type === 'generative' ||
    [
      'ordering-numbers', 'rounding', 'place-value',
      'multiplication', 'multiplication-matching', 'time-money',
      'advanced-fractions', 'ordering-decimals', 'measurement',
      'factors-multiples', 'mean-median', 'percentages',
      'algebra-basics',
    ].includes(computedTopicId);
  
  const templateData = isGenerative ? {
    templateId: lessonId,
    topicId: computedTopicId,
  } : null;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {isGenerative ? (
        <GenerativeOrchestrator 
          templateData={templateData} 
          gradeKey={grade} 
        />
      ) : (
        <CurriculumOrchestrator 
          lessonId={lessonId} 
          gradeKey={grade} 
        />
      )}
    </>
  );
}
