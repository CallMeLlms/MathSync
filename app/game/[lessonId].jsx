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
  const { lessonId, type, topicId, grade = 'G1', sectionId, classroomId, mongoLessonId, rules: rulesParam } = params;

  console.log('[GameRoute] params received — lessonId:', lessonId, '| grade:', grade, '| topicId:', topicId, '| rulesParam:', rulesParam);

  const computedTopicId = topicId || lessonId;
  const isGenerative = type === 'generative' ||
    [
      'ordering-numbers', 'rounding', 'place-value',
      'multiplication', 'multiplication-matching', 'time-money',
      'advanced-fractions', 'ordering-decimals', 'measurement',
      'factors-multiples', 'mean-median', 'percentages',
      'algebra-basics',
      'mental-math',
    ].includes(computedTopicId);

  const parsedRules = rulesParam ? JSON.parse(rulesParam) : undefined;

  const templateData = isGenerative ? {
    templateId: lessonId,
    topicId: computedTopicId,
    rules: parsedRules,
  } : null;
  console.log('[GameRoute] templateData built — isGenerative:', isGenerative, '| rules:', JSON.stringify(parsedRules));

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
          sectionId={sectionId}
          classroomId={classroomId}
          mongoLessonId={mongoLessonId}
        />
      )}
    </>
  );
}
