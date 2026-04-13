import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import useGameEngine from '@/stores/game-stores/useGameEngine';
import useUserStore from '@/stores/user-stores/useUserStore';
import { getGameTheme } from '@/theme/gameThemes';
import { getBundledLesson } from './lessonResolver';
import speechManager from '@/utils/speechManager';

// Engines
// import PickerEngine from './Engines/PickerEngine';
// import CounterEngine from './Engines/CounterEngine';
import ComposeEngine from './Engines/ComposeEngine';
import NumpadEngine from './Engines/NumpadEngine';
import MatcherEngine from './Engines/MatcherEngine';
import DragDropEngine from './Engines/DragAndDropEngine';
import ConnectDotsEngine from './Engines/ConnectTheDotsEngine';
import ShapeTracerEngine from './Engines/ShapeTracerEngine';
import OrdinalSequenceEngine from './Engines/OrdinalSequenceEngine';
import SortEngine from './Engines/SortEngine';
import ExitModal from '@/Components/Game/Global/ExitModal';
import ResultModal from '@/Components/Game/Global/ResultModal';

/**
 * CurriculumOrchestrator
 * A unified, data-driven container for all curriculum lessons.
 * Adapted to support multiple grades and dynamic themes.
 */
export default function CurriculumOrchestrator({ 
  lessonId, 
  gradeKey = 'G1' 
}) {
  const router = useRouter();
  const theme = getGameTheme(gradeKey);
  const [lessonContent, setLessonContent] = useState(null);
  
  const { 
    startGameSession, 
    endGameSession, 
    recordAnswer, 
    nextQuestion, 
    currentQuestionIndex,
    totalScore 
  } = useGameEngine();

  const [showExitModal, setShowExitModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [lastResultData, setLastResultData] = useState({ isCorrect: false, userAnswerItems: [], currentQuestion: null });

  // Load Content Data
  useEffect(() => {
    const content = getBundledLesson(gradeKey, lessonId);
    if (content) {
      setLessonContent(content);
      startGameSession(lessonId);
    } else {
       speechManager.speakInstruction(theme.loadingText);
    }
    
    return () => {
      endGameSession();
      speechManager.stop();
    };
  }, [lessonId, gradeKey]);

  useEffect(() => {
    if (lessonContent && lessonContent.questions) {
      const currentQ = lessonContent.questions[currentQuestionIndex];
      // Note: Assuming 'instruction' or 'question' text exists on currentQ. If not, it can be adjusted.
      // Often times questions might have 'text' or 'instruction' field.
      const textToSpeak = currentQ?.instruction || currentQ?.text || currentQ?.questionText;
      if (textToSpeak) {
        speechManager.speakInstruction(textToSpeak);
      }
    }
  }, [lessonContent, currentQuestionIndex]);

  if (!lessonContent) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundColor }]}>
        <ActivityIndicator size="large" color={theme.primaryColor} />
        <Text style={[styles.loadingText, { color: Colors.onSurfaceVariant, fontFamily: theme.fontFamily.body }]}>
          {theme.loadingText}
        </Text>
      </View>
    );
  }

  const currentQuestion = lessonContent.questions[currentQuestionIndex];
  const isFinished = currentQuestionIndex >= lessonContent.questions.length;

  const handleResult = (isCorrect, userAnswerItems = []) => {
    recordAnswer(isCorrect);
    setLastResultData({
      isCorrect,
      userAnswerItems,
      currentQuestion
    });
    setShowResultModal(true);
  };

  const handleContinue = () => {
    setShowResultModal(false);
    setTimeout(() => {
      handleComplete();
    }, 300);
  };

  const handleComplete = () => {
    if (currentQuestionIndex + 1 < lessonContent.questions.length) {
      nextQuestion();
    } else {
      nextQuestion(); // Trigger finish state
    }
  };

  const renderEngine = () => {
    const props = {
      data: currentQuestion,
      onResult: handleResult,
      onError: (err) => console.warn(`[Engine Error] ${err}`)
    };

    // Evaluate engine type per-question, not per-lesson.
    // This enables multi-engine lessons where the UI layer swaps automatically
    // as the student advances (e.g. Matcher → Numpad → Composer).
    const engineType = currentQuestion?.type?.toLowerCase();

    switch (engineType) {
      // case 'picker': return <PickerEngine {...props} />;
      // case 'counter': return <CounterEngine {...props} />;
      case 'composer': return <ComposeEngine {...props} />;
      case 'numpad': return <NumpadEngine {...props} />;
      case 'dragdrop': return <DragDropEngine key={currentQuestionIndex} {...props} />;
      case 'connectdots': return <ConnectDotsEngine key={currentQuestionIndex} {...props} />;
      case 'shapetracer': return <ShapeTracerEngine key={currentQuestionIndex} {...props} />;
      case 'ordinal_sequence': return <OrdinalSequenceEngine key={currentQuestionIndex} {...props} />;
      case 'sort': return <SortEngine key={currentQuestionIndex} {...props} />;
      // MatcherEngine uses a different prop contract (question/onAnswer) than the
      // standard Orchestrator API (data/onResult). Bridge inline to avoid touching the engine.
      case 'matcher': return (
        <MatcherEngine
          key={currentQuestionIndex}
          question={currentQuestion}
          onAnswer={(isCorrect) => handleResult(isCorrect, [])}
        />
      );
      default: return <Text style={styles.errorText}>Engine "{engineType}" not found.</Text>;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      {/* HUD */}
      <View style={styles.hud}>
        <TouchableOpacity style={styles.exitButton} onPress={() => setShowExitModal(true)}>
          <Text style={[styles.exitText, { fontFamily: theme.fontFamily.accent }]}>{theme.exitText}</Text>
        </TouchableOpacity>
        <Text style={[styles.scoreText, { color: theme.primaryColor, fontFamily: theme.fontFamily.accent }]}>
          {theme.scoreLabel}: {totalScore}
        </Text>
      </View>

      {/* Gameplay Area */}
      <View style={styles.engineWrapper}>
        {isFinished ? (
           <View style={styles.successContainer}>
             <Text style={[styles.successTitle, { color: theme.primaryColor, fontFamily: theme.fontFamily.title }]}>
               {theme.finishTitle}
             </Text>
             <Text style={[styles.successScore, { fontFamily: theme.fontFamily.body }]}>
               You collected {totalScore} points
             </Text>
             <TouchableOpacity 
               style={[styles.finishButton, { backgroundColor: theme.primaryColor }]} 
               onPress={() => {
                  useUserStore.getState().markLessonComplete(gradeKey, lessonId);
                  router.back();
               }}
             >
                <Text style={[styles.finishText, { fontFamily: theme.fontFamily.accent }]}>
                  {theme.finishButtonText}
                </Text>
             </TouchableOpacity>
           </View>
        ) : (
          renderEngine()
        )}
      </View>

      <ExitModal 
        isVisible={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onConfirm={() => {
          setShowExitModal(false);
          router.back();
        }}
        theme={theme}
      />
      <ResultModal
        isVisible={showResultModal}
        isCorrect={lastResultData.isCorrect}
        problem={lastResultData.currentQuestion}
        userAnswer={lastResultData.userAnswerItems ? lastResultData.userAnswerItems.join(', ') : ''}
        onContinue={handleContinue}
        theme={theme}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  exitButton: {
    padding: 8,
  },
  exitText: {
    color: Colors.onSurfaceVariant,
    fontSize: 16,
  },
  scoreText: {
    fontSize: 18,
  },
  engineWrapper: {
    flex: 1,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successTitle: {
    fontSize: 32,
    marginBottom: 16,
    textAlign: 'center',
  },
  successScore: {
    fontSize: 20,
    color: Colors.onSurface,
    marginBottom: 40,
  },
  finishButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 100,
  },
  finishText: {
    color: '#FFF',
    fontSize: 16,
  },
  errorText: {
    color: Colors.error,
    textAlign: 'center',
    marginTop: 32,
  },
  comingSoonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 48,
    fontSize: 18,
  }
});
