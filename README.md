<div align="center">

<img src="./assets/icon.png" alt="MathSync Logo" width="120" height="120" />

# MathSync

### A Mobile-Based Math Learning Management System for Primary Students

[![React Native](https://img.shields.io/badge/React%20Native-0.76.9-61DAFB?style=flat-square&logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~52.0.49-000020?style=flat-square&logo=expo)](https://expo.dev/)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20%7C%20Web-lightgrey?style=flat-square)](https://github.com/CallMeLlms/MathSync)
[![License](https://img.shields.io/badge/License-Private-red?style=flat-square)](./package.json)
[![Version](https://img.shields.io/badge/Version-1.0.0-brightgreen?style=flat-square)](./app.json)

</div>

---

## 📖 Overview

**MathSync** is a mobile-first Math Learning Management System (LMS) designed to support primary school students and teachers. Built with **React Native** and **Expo**, MathSync delivers gamified math activities, offline learning support, and a teacher-facing analytics dashboard — all aligned with the **DepEd MATATAG Curriculum**.

The app bridges the digital learning gap by providing an accessible, engaging, and data-driven math learning experience — right from a mobile device.

---

## ✨ Features

### 👩‍🏫 For Teachers
- **Web Portal Dashboard** — View student performance metrics and analytics at a glance
- **Classroom Code Enrollment** — Easily onboard students using unique classroom codes
- **Progress Tracking** — Monitor individual and class-wide learning journeys
- **Content Management** — Manage math modules and activities per grade level

### 👦 For Students
- **Gamified Activities** — Engaging, game-like math exercises that make learning fun
- **Offline Mode** — Continue learning even without an internet connection (powered by `expo-sqlite` and `AsyncStorage`)
- **Speech Support** — Audio-assisted learning via `expo-speech`
- **Animated Interactions** — Smooth, lottie-powered animations for rewards and feedback
- **Progress Visualization** — Students can track their own growth with visual indicators

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | React Native 0.76.9 |
| **Platform** | Expo ~52.0.49 (EAS Build) |
| **Routing** | Expo Router ~4.0.22 |
| **Navigation** | React Navigation v7 (Stack, Bottom Tabs, Drawer) |
| **State Management** | Zustand ^5.0.9 |
| **Server State** | TanStack React Query ^5.82.0 |
| **HTTP Client** | Axios ^1.10.0 |
| **Local Storage** | Expo SQLite ~15.1.4, AsyncStorage 1.23.1 |
| **Secure Storage** | Expo SecureStore ~14.0.1 |
| **Animations** | Lottie React Native 7.1.0, React Native Reanimated ~3.16.1 |
| **Media** | Expo AV ~15.0.2, Expo Speech ~13.0.1 |
| **UI Components** | Expo Linear Gradient, React Native SVG, React Native Calendars |
| **Typography** | Lexend, Plus Jakarta Sans (via Google Fonts) |
| **Gestures** | React Native Gesture Handler ~2.20.2 |
| **Testing** | Jest + jest-expo |
| **Linting** | ESLint (eslint-config-expo) |

---

## 📁 Project Structure

```
MathSync/
├── .agents/
│   └── guidelines/          # AI agent guidelines for the project
├── app/                     # Expo Router screens and navigation
├── assets/                  # Images, icons, fonts, and animation files
├── content/                 # Static content (modules, lessons, questions)
├── src/                     # Source code (components, hooks, services, utils)
├── app.json                 # Expo app configuration
├── babel.config.js          # Babel configuration
├── eas.json                 # EAS Build configuration
├── jsconfig.json            # JS path aliases
├── package.json             # Project dependencies and scripts
└── .eslintrc.js             # ESLint rules
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Expo Go](https://expo.dev/client) app on your Android/iOS device *(for development)*

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/CallMeLlms/MathSync.git
cd MathSync
```

2. **Install dependencies**

```bash
npm install
```

3. **Start the development server**

```bash
npx expo start
```

4. **Run on a device or emulator**

```bash
# Android
npx expo run:android

# Web (browser)
npx expo start --web
```

> Scan the QR code in the terminal using the **Expo Go** app on your phone to launch the app instantly.

---

## 🧪 Running Tests

```bash
npm test
```

This runs the test suite using **Jest** with the `jest-expo` preset in watch mode.

---

## 🔧 Available Scripts

| Command | Description |
|---|---|
| `npm start` | Start the Expo development server |
| `npm run android` | Build and run on Android |
| `npm run web` | Run in the browser |
| `npm test` | Run the test suite |
| `npm run lint` | Lint the codebase with ESLint |
| `npm run reset-project` | Reset the project to its initial state |

---

## 📱 Building for Production

This project uses **EAS (Expo Application Services)** for production builds.

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to your Expo account
eas login

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

> EAS Project ID: `52e8764d-0c6e-411b-90ca-ce4cdbb0d826`

---

## 🤝 Contributing

This is a capstone project. Contributions are currently closed to the core development team. If you have suggestions or find bugs, feel free to open an [Issue](https://github.com/CallMeLlms/MathSync/issues).

---

