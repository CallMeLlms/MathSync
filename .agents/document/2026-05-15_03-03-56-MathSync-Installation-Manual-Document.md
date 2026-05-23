# MathSync Installation Manual

## Document Purpose

This installation manual explains how to set up, install dependencies, run, and verify the MathSync application in a local development environment.

MathSync is an Expo / React Native application using JavaScript, Expo Router, Zustand, AsyncStorage, SQLite, and Axios-based backend services.

---

## 1. System Requirements

Before installing MathSync, prepare the following tools:

| Requirement | Purpose |
| --- | --- |
| Node.js | Runs the JavaScript toolchain |
| npm | Installs project dependencies and runs scripts |
| Git | Clones and manages the project repository |
| Expo CLI | Runs the Expo development server |
| Android Studio | Required for Android emulator/device builds |
| Web browser | Required for web testing |

Recommended development targets:

- Android through `expo run:android`
- Web through `expo start --web`

---

## 2. Project Location

The current local project path is:

```text
D:\LAWLL\VISUALSHIT\GITREPO\Projects\MathSync
```

Open a terminal in this folder before running installation or development commands.

---

## 3. Installation Steps

### 3.1 Open the Project Folder

```bash
cd D:\LAWLL\VISUALSHIT\GITREPO\Projects\MathSync
```

### 3.2 Install Dependencies

Run:

```bash
npm install
```

This installs the dependencies listed in `package.json`, including Expo, React Native, Expo Router, React Navigation, Zustand, Axios, Jest, and the required Expo modules.

### 3.3 Verify Installation

After installation, confirm that `node_modules/` exists and that `package-lock.json` is present.

Then run:

```bash
npm run lint
```

This verifies the project with Expo linting.

---

## 4. Running the App

### 4.1 Start the Expo Development Server

```bash
npm start
```

This runs:

```bash
expo start
```

Use the Expo terminal menu to choose a target platform.

### 4.2 Run on Web

```bash
npm run web
```

This runs:

```bash
expo start --web
```

The app opens in a browser or provides a local web URL.

### 4.3 Run on Android

```bash
npm run android
```

This runs:

```bash
expo run:android
```

Use this when testing on an Android emulator or connected Android device.

---

## 5. Android Setup

To run MathSync on Android:

1. Install Android Studio.
2. Install the Android SDK through Android Studio.
3. Create or start an Android emulator.
4. Enable USB debugging if using a physical Android device.
5. Open the project folder in a terminal.
6. Run `npm run android`.

If the Android device is not detected, check:

- The emulator is running.
- The physical device has USB debugging enabled.
- The correct Android SDK is installed.
- The terminal can access Android platform tools.

---

## 6. Web Setup

To run MathSync on web:

1. Open the project folder in a terminal.
2. Run `npm run web`.
3. Wait for Expo to start the web build.
4. Open the local URL shown in the terminal.

Use a modern browser such as Chrome, Edge, or Firefox.

---

## 7. Backend Configuration

MathSync connects to a paired Express.js backend.

Known backend URLs:

| Environment | Base URL |
| --- | --- |
| Production | `https://backend-clkn.onrender.com/api/v1` |
| Local development | `http://localhost:5500/api/v1` |

The mobile app's API client is located at:

```text
src/services/apiManager.js
```

Authentication uses JWT access and refresh tokens. The app injects the Bearer token through the Axios service layer.

Backend-dependent features include:

- Authentication
- Classrooms
- Assignments
- Lesson fetching
- Game submissions
- Exam scaffold endpoints

If these features fail locally, verify that the backend server is running and that the configured base URL is reachable.

---

## 8. Project Scripts

The following scripts are available in `package.json`:

| Command | Description |
| --- | --- |
| `npm start` | Starts the Expo development server |
| `npm run android` | Builds and runs the app on Android |
| `npm run web` | Starts the app for web |
| `npm run lint` | Runs Expo lint |
| `npm test` | Runs Jest in watch mode |
| `npm run reset-project` | Runs the project reset script |

To run one Jest test file:

```bash
npx jest path/to/file.test.js
```

To run tests by name:

```bash
npx jest -t "test name"
```

---

## 9. Important Configuration Files

| File | Purpose |
| --- | --- |
| `package.json` | Project scripts and dependencies |
| `package-lock.json` | Locked dependency versions |
| `app.json` | Expo app configuration |
| `babel.config.js` | Babel and path alias configuration |
| `jsconfig.json` | Editor path configuration |
| `CLAUDE.md` | Project guidance and architecture reference |

---

## 10. Path Aliases

MathSync uses the following supported aliases from `babel.config.js`:

| Alias | Resolves To |
| --- | --- |
| `@/` | `src/` |
| `@assets` | `assets/` |
| `@content` | `content/` |

Use only these aliases when adding or editing imports.

---

## 11. Verification Checklist

After installation, verify the setup with this checklist:

- `npm install` completes without dependency errors.
- `npm run lint` completes successfully or reports only known project issues.
- `npm run web` starts the app in a browser.
- `npm run android` starts the app on an emulator or connected device.
- Sign-in screens load.
- Grade selection opens.
- At least one game session can be started.
- Backend-dependent features are tested with a reachable backend URL.

---

## 12. Common Issues and Fixes

### 12.1 Dependencies Fail to Install

Try:

```bash
npm install
```

If the problem continues, confirm:

- Node.js is installed.
- npm is available in the terminal.
- The internet connection is working.
- The project is opened from the correct folder.

### 12.2 Expo Command Is Not Found

Use npm scripts instead of calling Expo directly:

```bash
npm start
```

The project includes Expo as a dependency, so npm scripts can resolve it locally.

### 12.3 Android Build Fails

Check:

- Android Studio is installed.
- An emulator is running.
- Android SDK tools are installed.
- The device is connected and authorized.
- The package name in `app.json` is valid: `com.justcallmellams.MathSync`.

### 12.4 Web App Does Not Open

Try:

1. Stop the running Expo process.
2. Run `npm run web` again.
3. Open the local URL manually in the browser.
4. Check the terminal for bundling errors.

### 12.5 Backend Features Do Not Work

Check:

- The backend server is running.
- The API base URL is correct.
- The device or browser has network access.
- The user account and token are valid.

---

## 13. Clean Reinstall Procedure

Use this only when dependency state appears broken.

1. Stop the development server.
2. Delete `node_modules/`.
3. Reinstall dependencies:

```bash
npm install
```

4. Run lint:

```bash
npm run lint
```

5. Start the app again:

```bash
npm start
```

---

## 14. Notes for Maintainers

MathSync is JavaScript-only. Do not add TypeScript files unless the project direction changes.

Follow the existing project conventions:

- Components use `.jsx`.
- Non-component files use `.js`.
- React Native styles use `StyleSheet.create()`.
- Dynamic game assets must be registered in `src/constants/assetMap.js`.
- Use documented aliases only: `@/`, `@assets`, and `@content`.

---

## 15. Document References

This manual is based on:

- `package.json`
- `app.json`
- `babel.config.js`
- `CLAUDE.md`
- `.agents/guidelines/folder-structure-guidelines.md`

Last updated: May 15, 2026.
