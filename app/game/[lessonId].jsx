import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import CurriculumOrchestrator from '@/Components/Game/Curriculum/CurriculumOrchestrator';
import PracticeOrchestrator from '@/Components/Game/Generative/Orchestrators/PracticeOrchestrator';

/**
 * Universal Game Route.
 * Detects 'type' to switch between static Curriculum and dynamic Practice engines.
 * 
 * Usage: /game/123?type=generative&topicId=ordering-numbers&grade=G2
 */
export default function GameRoute() {
  const params = useLocalSearchParams();
  const { lessonId, type, topicId, grade = 'G2' } = params;

  console.log('[Router] Path Params:', { lessonId, type, topicId, grade });

  // Treat '1' as a test alias for ordering-numbers
  const computedTopicId = lessonId === '1' ? 'ordering-numbers' : (topicId || lessonId);
  const isGenerative = type === 'generative' || computedTopicId === 'ordering-numbers';
  
  const templateData = isGenerative ? {
    templateId: lessonId,
    topicId: computedTopicId,
  } : null;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {isGenerative ? (
        <PracticeOrchestrator 
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
