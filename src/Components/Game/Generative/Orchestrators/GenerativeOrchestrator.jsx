import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { getGameTheme } from '@/theme/gameThemes';
import useGameEngine from '@/stores/game-stores/useGameEngine';
import { getGeneratorById } from '@/utils/generators/registry.js';
import ResultModal from '@/Components/Game/Global/ResultModal';
import ExitModal from '@/Components/Game/Global/ExitModal';

// Engines mapping
import OrderingEngine from '@/Components/Game/Generative/Engines/OrderingEngine';
import DecimalOrderingEngine from '@/Components/Game/Generative/Engines/DecimalOrderingEngine';
import RoundingEngine from '@/Components/Game/Generative/Engines/RoundingEngine';
import PlaceValueEngine from '@/Components/Game/Generative/Engines/PlaceValueEngine';
import MatchingEngine from '@/Components/Game/Generative/Engines/MatchingEngine';
import TimeMoneyEngine from '@/Components/Game/Generative/Engines/TimeMoneyEngine';
import AdvancedFractionsEngine from '@/Components/Game/Generative/Engines/AdvancedFractionsEngine';
import MeasurementEngine from '@/Components/Game/Generative/Engines/MeasurementEngine';
import AlgebraEngine from '@/Components/Game/Generative/Engines/AlgebraEngine';

const ENGINE_REGISTRY = {
  'ordering-numbers': OrderingEngine,
  'ordering-decimals': DecimalOrderingEngine,
  'rounding': RoundingEngine,
  'place-value': PlaceValueEngine,
  'multiplication-matching': MatchingEngine,
  'time-money': TimeMoneyEngine,
  'advanced-fractions': AdvancedFractionsEngine,
  'measurement': MeasurementEngine,
  'algebra-basics': AlgebraEngine,
};

/**
 * GenerativeOrchestrator
 * Standardized Orchestrator for Logic-driven (Stack 2) practice sessions.
 * Formerly PracticeOrchestrator.
 */
export default function GenerativeOrchestrator({ 
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

  // 2. Generate new problem (Internal Helper)
  const generateNextProblem = useCallback((currentRules) => {
    if (generator) {
      const newProblem = generator(currentRules || {});
      setCurrentProblem(newProblem);
    }
  }, [generator]);

  // Initial generation
  useEffect(() => {
    if (generator && !currentProblem) {
      generateNextProblem(templateData?.rules);
    }
  }, [generator]);

  // 3. Handle Engine Answer
  const handleAnswer = useCallback((isCorrect, userAnswerStr) => {
    console.log('[GenerativeOrchestrator] handleAnswer triggered:', { isCorrect, userAnswerStr });
    setIsLastAnswerCorrect(isCorrect);
    setLastUserAnswer(userAnswerStr);
    
    try {
      setShowFeedback(true);
      console.log('[GenerativeOrchestrator] Feedback modal requested');
      
      if (isCorrect) {
        updateScore(10);
      } else {
        updateScore(-2);
      }
    } catch (e) {
      console.error('[GenerativeOrchestrator] scoring/feedback state update crash:', e);
    }
  }, [updateScore]);

  // 4. Feedback sequence completes
  const handleFeedbackComplete = useCallback(() => {
    setShowFeedback(false);
    if (isLastAnswerCorrect) {
      try {
        // Synchronously prepare next state to prevent frame lag
        generateNextProblem(templateData?.rules);
      } catch (e) {
        console.error('[GenerativeOrchestrator] Generator error:', e);
      }
      setCurrentIndex(prev => prev + 1);
    }
  }, [isLastAnswerCorrect, generateNextProblem, templateData]);

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
    <LinearGradient 
      colors={[Colors.surface, theme.backgroundColor]}
      style={styles.container}
    >
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

        {/* Dynamic Engine (Transitionless for performance) */}
        <View style={styles.engineContainer}>
          {EngineComponent ? (
            <View 
              key={`engine-${currentIndex}`}
              style={styles.engineWrapper}
            >
              <EngineComponent 
                problem={currentProblem}
                theme={theme}
                onAnswer={handleAnswer}
              />
            </View>
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
    </LinearGradient>
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
  engineContainer: { flex: 1, overflow: 'hidden' },
  engineWrapper: { flex: 1 },
  placeholderText: { fontFamily: 'Lexend-Bold', fontSize: 18, color: Colors.onSurfaceVariant, textAlign: 'center', marginTop: 100 }
});
