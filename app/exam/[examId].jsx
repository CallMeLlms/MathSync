import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import ExamOrchestrator from '@/Components/Game/Exam/ExamOrchestrator';

// DEV: import mock data for Phase 1 testing — remove when backend endpoints are live
import examLabData from '@content/game-data/dev/examLabQuestionBank.json';

export default function ExamRoute() {
  const { examId, classroomId, sectionId } = useLocalSearchParams();

  // DEV: pass mockData to bypass API — set to null once backend exam endpoints exist
  const mockData = __DEV__ ? examLabData : null;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ExamOrchestrator
        examId={examId}
        classroomId={classroomId}
        sectionId={sectionId}
        mockData={mockData}
      />
    </>
  );
}
