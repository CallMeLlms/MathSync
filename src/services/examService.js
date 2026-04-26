import apiManager from '@/services/apiManager';

// SCAFFOLD — endpoints not yet implemented on backend.
// Build these routes in: BackEnd/src/routers/exam.route.js
// Reference model:       BackEnd/src/models/exam.model.js
//
// ─── GET /api/v1/exams/:examId ────────────────────────────────────────────────
// Middleware: authorize (student + teacher)
// Response (200):
// {
//   "success": true,
//   "exam": {
//     "_id":       "<ObjectId>",
//     "title":     "Quarter 1 Exam",
//     "description": "...",
//     "timeLimit": 1800,            // seconds; null = no limit
//     "questions": [
//       {
//         "_id":               "<ObjectId>",
//         "type":              "PICKER",   // same type strings used by engine switch
//         "question":          "What is 3 + 4?",
//         "answer":            "7",
//         "learningOutcomeId": "<ObjectId | null>",
//         "metadata":          { "options": ["5", "6", "7", "8"] }
//         // Additional fields vary by engine type:
//         // NUMPAD:  equation: { left, operator, blank }, maxDigits
//         // VISUAL_PICKER: assetId, metadata.addends
//         // COMPARE_PICKER: metadata.emoji, metadata.pile_a, metadata.pile_b
//       }
//     ]
//   }
// }
// Response (404): { "success": false, "message": "Exam not found" }
// Response (403): { "success": false, "message": "Access denied" }
export async function getExamById(examId) {
  const res = await apiManager.get(`/exams/${examId}`);
  return res.data.exam;
}

// ─── GET /api/v1/classrooms/:classroomId/exams ────────────────────────────────
// Middleware: authorize (student + teacher)
// Response (200):
// {
//   "success": true,
//   "exams": [
//     {
//       "_id":        "<ObjectId>",
//       "title":      "Quarter 1 Exam",
//       "dueDate":    "<ISO string | null>",
//       "totalItems": 10
//     }
//   ]
// }
// Backend must verify the requesting user is enrolled in a section of this classroom.
export async function getClassroomExams(classroomId) {
  const res = await apiManager.get(`/classrooms/${classroomId}/exams`);
  return res.data.exams;
}
