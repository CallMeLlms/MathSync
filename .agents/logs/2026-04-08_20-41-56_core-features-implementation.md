# Timeline Log: Core Features Implementation (Auth, Classroom, Assignments)

**Date:** 2026-04-08  
**Topic:** Core Application Infrastructure & Student Workflow

---

## 🚀 Overview
This log documents the implementation of the primary application architecture for MathSync, covering Authentication, Classroom Management, and the Assignment/Submission system. These features form the backbone of the student experience and the communication link between teachers and learners.

---

## 🔐 1. Authentication & Security
### Features
- **Sign In/Up Flow**: Structured entry with validation and grade level selection.
- **Pending State**: Account approval mechanism implemented via `Confirmation.jsx`.
- **Token Management**:
    - Persistent session storage using `AsyncStorage`.
    - Automated Bearer token injection for all API calls.
    - **Self-Healing Auth**: Axios interceptors handled in `apiManager.js` detect `401 Unauthorized` errors and automatically attempt a refresh via the `token/refresh` endpoint without user intervention.

### Files Involved
- `app/(auth)/SignIn.jsx`, `SignUp.jsx`, `Confirmation.jsx`
- `src/services/authService.js`
- `src/services/apiManager.js`

---

## 🏫 2. Classroom & Curriculum
### Features
- **Classroom Dashboard**: Detail view with tabbed navigation for Lessons and Assignments.
- **Curriculum Hierarchy**: Lessons are organized by **Quarters** with expandable detail cards showing learning outcomes and lesson descriptions.
- **Dynamic Fetching**: Class metadata and section-specific lessons are fetched concurrently.

### Files Involved
- `app/classroom/[id].jsx`
- `src/services/classroomService.js`

---

## 📝 3. Assignment & Submission System
### Features
- **Assignment Display**: High-fidelity detail screen showing points, rubrics, and teacher-provided reference materials.
- **Submission Engine**:
    - Integrated with **Expo Document Picker** for file selection.
    - **Multipart Uploads**: Handles binary file transfers for student work.
    - **Grade Feedback**: Visual status tracking (Pending/Graded) with feedback display and scoring.

### Files Involved
- `app/classroom/assignment/[assignmentId].jsx`
- `src/services/assignmentService.js`
- `src/services/submissionService.js`

---

## 🛠 Dependencies Established
- `axios`: API Communication.
- `expo-document-picker`: File system interaction.
- `@react-native-async-storage/async-storage`: Local persistence.
- `expo-linear-gradient`: UI Aesthetics.
- `@expo/vector-icons`: UI Iconography.

---

_This log serves as the baseline for the MathSync student module features as of April 2026._
