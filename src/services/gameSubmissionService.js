import apiManager from '@/services/apiManager';

export async function submitGameSession({ sectionId, classroomId, lessonId, totalScore, totalItems, answers }) {
  console.log('[GameSubmission] Sending payload:', JSON.stringify({
    sectionId, classroomId, lessonId, totalScore, totalItems, answers,
  }, null, 2));

  const response = await apiManager.post('/game-submissions', {
    sectionId,
    classroomId,
    lessonId,
    totalScore,
    totalItems,
    answers,
  });

  console.log('[GameSubmission] Response:', JSON.stringify(response.data, null, 2));
  return response.data;
}
