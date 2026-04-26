import apiManager from '@/services/apiManager';

// SCAFFOLD — endpoint not yet implemented on backend.
// Build these routes in: BackEnd/src/routers/exam.route.js
// Reference model:       BackEnd/src/models/exam.submission.model.js
// Reference existing:    BackEnd/src/models/game.submission.model.js
//
// ─── POST /api/v1/exam-submissions ────────────────────────────────────────────
// Middleware: authorize (student)
// NOTE: studentId is NOT sent in the body. Backend reads req.user.id from JWT.
//       Same pattern as POST /api/v1/game-submissions.
//
// Request body:
// {
//   "examId":      "<ObjectId>",
//   "classroomId": "<ObjectId>",
//   "sectionId":   "<ObjectId>",
//   "totalScore":  8,
//   "totalItems":  10,
//   "answers": [
//     {
//       "questionId":        "<ObjectId>",
//       "learningOutcomeId": "<ObjectId | null>",
//       "userAnswer":        ["7"],         // what student typed/selected
//       "isCorrect":         true,          // null if unanswered
//       "status":            "answered_correct", // "unanswered" | "answered_correct" | "answered_incorrect"
//       "questionSnapshot": {              // frozen copy at answer time
//         "type":     "PICKER",
//         "question": "What is 3 + 4?",
//         "answer":   "7",
//         "metadata": { "options": ["5","6","7","8"] }
//       }
//     }
//   ]
// }
//
// Response (201):
// { "success": true, "message": "Exam submission successful", "newSubmission": { ... } }
//
// Response (400): { "success": false, "message": "<error details>" }
// Response (409): { "success": false, "message": "Already submitted" }  ← unique [examId, studentId]
//
// ─── Backend validation requirements ──────────────────────────────────────────
// 1. Verify exam._id exists and exam.classroomId matches submitted classroomId.
// 2. Verify req.user.id is in section.students for the given sectionId.
// 3. Enforce unique index on [examId, studentId] — return 409 on duplicate.
// 4. Never trust classroomId/sectionId from body alone — verify against DB.
export async function submitExam({ examId, classroomId, sectionId, totalScore, totalItems, answers }) {
  const res = await apiManager.post('/exam-submissions', {
    examId,
    classroomId,
    sectionId,
    totalScore,
    totalItems,
    answers,
  });
  return res.data;
}

// ─── GET /api/v1/exam-submissions/analytics/section/:sectionId ───────────────
// Middleware: authorizeAdmin (teacher)
// Response (200):
// {
//   "success": true,
//   "submissions": [
//     {
//       "studentId":   "<ObjectId>",
//       "examId":      "<ObjectId>",
//       "totalScore":  8,
//       "totalItems":  10,
//       "createdAt":   "<ISO string>"
//     }
//   ]
// }
export async function getExamAnalytics(sectionId) {
  const res = await apiManager.get(`/exam-submissions/analytics/section/${sectionId}`);
  return res.data.submissions;
}
