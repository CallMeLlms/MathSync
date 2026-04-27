# Classroom-to-Game Alignment Guide (Grade 1)

**Date:** 2026-04-27  
**Status:** Operational (High Precision)

---

## 1. Overview

MathSync uses a multi-layered resolution system to bridge **Backend Classroom Lessons** (managed via MongoDB) with the **Local Game Engines** (managed via JSON banks). This ensures that when a student taps "Play Lesson" in their classroom, they are routed to the specific local curriculum content that matches the teacher's lesson.

## 2. The "Chain of Truth" (Mapping Flow)

The alignment follows a four-step resolution chain:

1.  **Registry (`classroomLessonMap.js`)**: Matches the **MongoDB ObjectId** of a classroom lesson to a numeric **Local Lesson ID** (e.g., `3` for Ranking Vines).
2.  **Bundle (`lessonResolver.js`)**: Maps the **Local Lesson ID** to a list of imports. One ID can bundle multiple JSON banks to provide variety.
3.  **Content (`QuestionBank.json`)**: Each question in the JSON files defines its own `"type"` (e.g., `"ORDINAL_SEQUENCE"`).
4.  **Engine (`CurriculumOrchestrator.jsx`)**: The orchestrator reads the question type and renders the corresponding **Game Engine**.

## 3. Configuration & Maintenance

### Layer 1: Explicit Alignment
Add new mappings to `src/constants/classroomLessonMap.js` inside the `OBJECT_ID_MAP` object. 

```javascript
const OBJECT_ID_MAP = {
  '69d8ae56e2515f832fd20ac4': 3, // Links MongoDB Lesson to Local Ranking Vines
};
```

### Layer 2: Keyword Fallback
If an ID is missing, the system falls back to keyword matching on the lesson title, scoped by **Quarter**. This is defined in `KEYWORD_MAP`.

## 4. Resilience Enhancements (Before vs After)

To solve the "missing play button" issue, several layers of the application were made more robust.

### A. Grade Normalization (`ClassroomDetail.jsx`)
Previously, any classroom name that wasn't exactly `"GRADE 1"` would fail to generate the `G1` key, hiding the button for "Grade 1" or "grade 1" classrooms.

| | Before | After (Robust) |
| :--- | :--- | :--- |
| **Code** | `name.replace('GRADE ', 'G')` | `name.toUpperCase().includes('GRADE 1') ? 'G1' : ...` |
| **Result** | Case-sensitive; exact match only. | Case-insensitive; handles any casing of "Grade 1". |

### B. ID Normalization (`classroomLessonMap.js`)
Previously, the lookup was strict. If the MongoDB ID or Route Param had a single leading space, the mapping would fail.

| | Before | After (Robust) |
| :--- | :--- | :--- |
| **Code** | `lessonId in OBJECT_ID_MAP` | `lessonId.toString().trim() in OBJECT_ID_MAP` |
| **Result** | Brittle; fails on whitespace. | Resilient; cleans the ID before matching. |

### C. Logic Gate Normalization (`LessonDetail.jsx`)
The gate that renders the button was made resilient to data types (handling strings or arrays from Expo Router).

| | Before | After (Robust) |
| :--- | :--- | :--- |
| **Code** | `grade === 'G1'` | `grade.toUpperCase() === 'G1'` |
| **Result** | Strict string match. | Case-insensitive and type-normalized. |

## 5. Debugging & Trace (Discovery Log)

During this implementation, we discovered that **runtime lesson IDs** often differ from documentation IDs. 

**Case Study (Ordinal Numbers):**
- **Documentation ID:** `69d36053d4917097e571d497`
- **Real Runtime ID:** `69d8ae56e2515f832fd20ac4` (Discovered via Debugger)

A persistent logging system is now built into `LessonDetail.jsx`. When viewing any lesson, check the terminal or browser console for this block:

```text
--- [MathSync Alignment Debug] ---
MongoDB Lesson ID: 69d8ae56e2515f832fd20ac4
Classroom Grade: G1
Is G1 Gate Passed: YES
Resolved Game ID: 3
----------------------------------
```

---
*Refer to `src/constants/classroomLessonMap.js` for the active registry.*
