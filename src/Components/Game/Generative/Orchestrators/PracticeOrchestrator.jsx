import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { getGameTheme } from '@/theme/gameThemes';
import useGameEngine from '@/stores/game-stores/useGameEngine';
import { getGeneratorById } from '@/utils/generators/registry.js';
import ResultModal from '@/Components/Game/Global/ResultModal';
import ExitModal from '@/Components/Game/Global/ExitModal';

// Engines mapping
import OrderingEngine from '@/Components/Game/Generative/Engines/OrderingEngine';

const ENGINE_REGISTRY = {
  'ordering-numbers': OrderingEngine,
  'ordering-decimals': OrderingEngine,
};

/**
 * PracticeOrchestrator
 * Standardized Orchestrator for Logic-driven (Stack 2) practice sessions.
 * Formerly GenerativeOrchestrator.
 */
export default function PracticeOrchestrator({ 
  templateData, 
  gradeKey = 'G2' 
}) {
  const router = useRouter();
  const theme = getGameTheme(gradeKey);
  const { startGameSession, endGameSession, updateScore, totalScore } = useGameEngine();

  const [topicId, setTopicId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [generator, setGenerator] = useState(null);

  // Feedback and UI state
  const [showFeedback, setShowFeedback] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isLastAnswerCorrect, setIsLastAnswerCorrect] = useState(false);
  const [lastUserAnswer, setLastUserAnswer] = useState(null);

  // 1. Session Setup
  useEffect(() => {
    if (templateData) {
      startGameSession(templateData.templateId);
      const tid = templateData.topicId || 'ordering-numbers';
      setTopicId(tid);
      const gen = getGeneratorById(tid);
      setGenerator(() => gen);
    }
  }, [templateData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => endGameSession();
  }, [endGameSession]);

  // Handle hardware back button
  useEffect(() => {
    const handleBackPress = () => {
      if (showExitModal) {
        setShowExitModal(false);
        return true;
      }
      if (showFeedback) {
        return true;
      }
      setShowExitModal(true);
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
  }, [showExitModal, showFeedback]);

  // 2. Generate new problem when needed
  useEffect(() => {
    if (generator && !showFeedback) {
      const newProblem = generator(templateData?.rules || {});
      setCurrentProblem(newProblem);
    }
  }, [generator, currentIndex]);

  // 3. Handle Engine Answer
  const handleAnswer = useCallback((isCorrect, userAnswerStr) => {
    setIsLastAnswerCorrect(isCorrect);
    setLastUserAnswer(userAnswerStr);
    setShowFeedback(true);
    
    if (isCorrect) {
      updateScore(10);
    } else {
      updateScore(-2);
    }
  }, [updateScore]);

  // 4. Feedback sequence completes
  const handleFeedbackComplete = useCallback(() => {
    setShowFeedback(false);
    if (isLastAnswerCorrect) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [isLastAnswerCorrect]);

  if (!currentProblem || !topicId) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundColor }]}>
        <ActivityIndicator size="large" color={theme.primaryColor} />
        <Text style={[styles.loadingText, { color: Colors.onSurfaceVariant, fontFamily: theme.fontFamily.body }]}>
          {theme.loadingText}
        </Text>
      </View>
    );
  }

  const EngineComponent = ENGINE_REGISTRY[topicId];

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Universal Header */}
        <View style={styles.hud}>
          <TouchableOpacity 
            style={styles.exitButton} 
            onPress={() => setShowExitModal(true)}
            accessibilityLabel="Quit practice"
          >
            <Text style={[styles.exitText, { fontFamily: theme.fontFamily.accent }]}>End Practice</Text>
          </TouchableOpacity>
          <Text style={[styles.scoreText, { color: theme.primaryColor, fontFamily: theme.fontFamily.accent }]}>
            Score: {totalScore}
          </Text>
        </View>

        {/* Dynamic Engine */}
        <View style={styles.engineContainer}>
          {EngineComponent ? (
            <EngineComponent 
              key={`engine-${currentIndex}`}
              problem={currentProblem}
              theme={theme}
              onAnswer={handleAnswer}
            />
          ) : (
            <Text style={styles.placeholderText}>Engine for {topicId} not found.</Text>
          )}
        </View>
      </SafeAreaView>

      {/* Shared Global Modals (Siblings to SafeAreaView for full-screen coverage) */}
      <ResultModal 
        isVisible={showFeedback}
        isCorrect={isLastAnswerCorrect}
        problem={currentProblem}
        userAnswer={lastUserAnswer}
        onContinue={handleFeedbackComplete}
        theme={theme}
      />

      <ExitModal 
        isVisible={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onConfirm={() => router.back()}
        theme={theme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  hud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  exitButton: { padding: 8 },
  exitText: { color: Colors.error, fontSize: 14 },
  scoreText: { fontSize: 20 },
  engineContainer: { flex: 1 },
  placeholderText: { fontFamily: 'Lexend-Bold', fontSize: 18, color: Colors.onSurfaceVariant, textAlign: 'center', marginTop: 100 }
});
