# MathSync User Manual

## Document Purpose

This user manual explains how to use MathSync, a math learning application built with Expo and React Native. It is intended for learners, teachers, and project maintainers who need a clear guide to the application's main screens, learning flows, and support features.

This manual is based on the current MathSync repository structure and project guidance in:

- `CLAUDE.md`
- `.agents/guidelines/folder-structure-guidelines.md`

---

## 1. Application Overview

MathSync is a mobile and web math learning app for grade-based practice. It supports:

- Student sign in and account registration
- Grade selection and learning journeys
- Interactive math games
- Mental math practice
- Badges and progress tracking
- Activity calendar
- Leaderboards
- User profile statistics
- Classroom and assignment features

The application is designed for Android and web usage through Expo.

---

## 2. Supported Users

### 2.1 Students

Students use MathSync to select grade levels, complete lessons, practice math skills, earn badges, and track their learning progress.

### 2.2 Teachers

Teachers use classroom-related features to guide learners through assigned lessons and classroom activities.

### 2.3 Maintainers

Maintainers use the documented project structure to understand where screens, game engines, assets, services, and content are located.

---

## 3. Getting Started

### 3.1 Opening the App

When the app launches, MathSync starts from the main entry screen and redirects the user to the appropriate area depending on their session state.

Common first-time flow:

1. Open MathSync.
2. Create an account or sign in.
3. Choose a grade level.
4. Start a lesson, game, or practice mode.

### 3.2 Account Registration

To create an account:

1. Go to the sign-up screen.
2. Enter the required account information.
3. Submit the form.
4. Complete confirmation if prompted.
5. Sign in using the registered credentials.

### 3.3 Signing In

To sign in:

1. Open the sign-in screen.
2. Enter your login credentials.
3. Submit the form.
4. After successful sign-in, the app opens the main dashboard.

---

## 4. Main Navigation

MathSync uses a drawer-style main navigation. The main screens include:

| Screen | Purpose |
| --- | --- |
| Home | Main dashboard and landing area |
| Grades | Grade selection portal |
| Mental Math | Quick math practice |
| Badges | Badge collection and achievements |
| Calendar | Learning activity calendar |
| Leaderboard | Ranking and performance comparison |
| Profile | User progress and statistics |
| Settings | Application preferences |

---

## 5. Using the Grade Journey

The grade journey is the main learning path for students.

### 5.1 Selecting a Grade

1. Open the `Grades` screen.
2. Choose the desired grade.
3. The app opens the journey map for that grade.

### 5.2 Starting a Lesson

1. Select an available lesson node on the journey map.
2. Review the lesson or activity prompt.
3. Start the game session.
4. Answer the interactive math questions.
5. Complete the session to save progress.

### 5.3 Lesson Progression

Grade 1 uses a structured progression where lessons may appear as locked, active, or completed. Higher grades may show available nodes differently depending on the configured grade behavior.

---

## 6. Game Modes

MathSync uses three game pipelines. Users do not need to manage these directly, but understanding them helps explain why different grade levels may feel different.

### 6.1 Curriculum Games

Curriculum games are structured lessons driven by prepared question banks. These are used for Grade 1 lessons.

Typical activities include:

- Number input
- Matching
- Drag and drop
- Shape recognition
- Money activities
- Time and clock activities
- Calendar activities
- Word problems

### 6.2 Generative Games

Generative games create practice questions dynamically. These are used for Grades 2 to 6.

Typical topics include:

- Place value
- Rounding
- Multiplication
- Time and money
- Fractions
- Measurement
- Decimals
- Factors and multiples
- Mean and median
- Percentages
- Algebra
- Integer ordering
- Order of operations

### 6.3 Exam Mode

Exam mode exists in the codebase, but it is not yet an active production feature. If enabled in the future, it will support fixed-question exam sessions with question navigation and result tracking.

---

## 7. Completing a Game Session

During a game session:

1. Read the question carefully.
2. Interact with the available controls or visuals.
3. Submit an answer.
4. Review feedback.
5. Continue to the next question.
6. Complete the session to view results.

Game progress, score, and session state are managed by the application while the student moves through the activity.

---

## 8. Badges and Achievements

The badge system rewards user progress and activity.

To view badges:

1. Open the `Badges` screen.
2. Review earned and available badges.
3. Continue completing lessons and practice sessions to unlock more badges.

Badge rules are stored in the app's structured content and evaluated by the application.

---

## 9. Calendar and Activity Tracking

The calendar screen shows learning activity over time.

Users can use it to:

- Review recent learning activity
- Track practice consistency
- See active learning days
- Monitor progress habits

---

## 10. Leaderboard

The leaderboard shows comparative performance information. It helps learners see their ranking or progress compared with others when leaderboard data is available.

---

## 11. Profile

The profile screen displays user statistics and progress information.

Common profile information may include:

- Learning activity
- Progress summaries
- Badge status
- Performance charts

---

## 12. Classroom and Assignments

MathSync includes classroom-related screens for teacher-led learning.

Classroom features may include:

- Viewing a classroom
- Opening classroom lessons
- Starting assignment sessions
- Submitting game or lesson results

Classroom data is connected to the backend API. Some classroom lesson IDs are mapped internally so the mobile app can open the correct MathSync lesson.

---

## 13. Settings

The settings screen contains app preferences and account-related options. Available options may vary depending on the current build and enabled features.

---

## 14. Troubleshooting

### 14.1 Cannot Sign In

Try the following:

1. Check that the email or username is correct.
2. Check that the password is correct.
3. Confirm that the device has an internet connection.
4. Try closing and reopening the app.

### 14.2 Lesson Does Not Open

Possible causes:

- The lesson is locked.
- The grade journey node is not mapped to a lesson.
- The app cannot load required lesson data.
- There is a network issue for classroom or backend-driven lessons.

### 14.3 Game Asset Does Not Display

Possible causes:

- The asset is missing from the `assets/` directory.
- The asset was not registered in the app's asset registry.
- The question data references an incorrect asset key.

### 14.4 Progress Does Not Save

Possible causes:

- The session was exited before completion.
- The device storage is unavailable.
- The backend request failed.
- The user session expired.

Try signing in again and completing a new session.

---

## 15. Maintainer Quick Reference

This section is for developers or project maintainers.

### 15.1 Running the App

Common commands:

```bash
npm start
npm run android
npm run web
npm run lint
npm test
```

### 15.2 Important Project Folders

| Folder | Purpose |
| --- | --- |
| `app/` | Expo Router screens and route groups |
| `src/` | Core app source, UI, services, state, utilities |
| `content/` | Structured lesson, badge, and journey data |
| `assets/` | Static images and game media |
| `.agents/` | Project documentation, logs, guidelines |
| `scratch/` | Temporary or experimental scripts |
| `scripts/` | Build and utility scripts |

### 15.3 Game Architecture

The app uses three isolated game stacks:

| Stack | Path | Status |
| --- | --- | --- |
| Curriculum | `src/Components/Game/Curriculum/` | Active for Grade 1 |
| Generative | `src/Components/Game/Generative/` | Active for Grades 2 to 6 |
| Exam | `src/Components/Game/Exam/` | Exists, pending feature decision |

### 15.4 Development Conventions

Maintain these rules when editing the project:

- Use JavaScript only.
- Use `.jsx` for React components.
- Use `.js` for non-component files.
- Use `@/`, `@assets`, and `@content` aliases only.
- Use PascalCase for component files and folders.
- Use camelCase for non-component files.
- Use lowercase or kebab-case for non-component folders.
- Use `StyleSheet.create()` for React Native styles.
- Register dynamic game media in `src/constants/assetMap.js`.
- Render registered dynamic game media through `AssetDisplay`.

---

## 16. Glossary

| Term | Meaning |
| --- | --- |
| Grade Journey | The visual learning path for a grade level |
| Lesson Node | A selectable point on the journey map |
| Curriculum Game | A JSON-driven Grade 1 lesson activity |
| Generative Game | A dynamically generated practice activity |
| Orchestrator | The component that controls a game session |
| Engine | The UI component that renders one question type |
| Badge | An achievement earned through learning activity |
| Classroom | A teacher-managed learning space |
| Assignment | A classroom activity assigned to learners |

---

## 17. Notes

This manual reflects the current documented MathSync architecture as of May 15, 2026. Some features, especially exam mode and backend-dependent classroom behavior, may depend on active implementation status and backend availability.
