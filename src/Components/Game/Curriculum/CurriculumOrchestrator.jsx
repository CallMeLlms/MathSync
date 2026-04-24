import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import useGameEngine from '@/stores/game-stores/useGameEngine';
import useUserStore from '@/stores/user-stores/useUserStore';
import { getGameTheme } from '@/theme/gameThemes';
import { getBundledLesson } from './lessonResolver';
import speechManager from '@/utils/speechManager';

// Engines
// import PickerEngine from './Engines/PickerEngine';
// import CounterEngine from './Engines/CounterEngine';
import PickerEngine from './Engines/PickerEngine';
import ComposeEngine from './Engines/ComposeEngine';
import NumpadEngine from './Engines/NumpadEngine';
import MatcherEngine from './Engines/MatcherEngine';
import DragDropEngine from './Engines/DragAndDropEngine';
import ConnectDotsEngine from './Engines/ConnectTheDotsEngine';
import ShapeTracerEngine from './Engines/ShapeTracerEngine';
import ShapeHuntEngine from './Engines/ShapeHuntEngine';
import ShapeComposeEngine from './Engines/ShapeComposeEngine';
import OrdinalSequenceEngine from './Engines/OrdinalSequenceEngine';
import SortEngine from './Engines/SortEngine';
import GeoboardEngine from './Engines/GeoboardEngine';
import ClockSetterEngine from './Engines/ClockSetterEngine';
import VisualNumpadEngine from './Engines/VisualNumpadEngine';
import WordProblemEngine from './Engines/WordProblemEngine';
import VisualPickerEngine from './Engines/VisualPickerEngine';
import ComparePickerEngine from './Engines/ComparePickerEngine';
import FractionShapeEngine from './Engines/FractionShapeEngine';
import CalendarPageEngine from './Engines/CalendarPageEngine';
import TurnCompassEngine from './Engines/TurnCompassEngine';
import PictographReaderEngine from './Engines/PictographReaderEngine';
import DataTableReaderEngine from './Engines/DataTableReaderEngine';
import FruitStandEngine from './Engines/FruitStandEngine';
import PatternSequenceEngine from './Engines/PatternSequenceEngine';
// Gesture-heavy engines must render inside a plain View — a ScrollView would
// intercept their touch responder and break drag/draw interactions.
const GESTURE_ENGINES = new Set(['dragdrop', 'connectdots', 'shapetracer', 'geoboard', 'clocksetter']);

import AssetDisplay from '@/Components/Game/Global/AssetDisplay';
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
    totalScore,
    correctCount
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
  const questionText = currentQuestion?.question || currentQuestion?.instruction || currentQuestion?.text || currentQuestion?.prompt || null;

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
      // Lesson finished — persist result to store and navigate.
      const questionLength = lessonContent.questions.length;
      
      useUserStore.getState().recordSessionResult(gradeKey, lessonId, {
        correctCount,
        totalQuestions: questionLength,
        score: totalScore
      });

      endGameSession();
      
      router.replace({
        pathname: '/game/result',
        params: { lessonId, gradeKey },
      });
    }
  };

  // Hoisted so the JSX wrapper can read it for the ScrollView/View decision.
  const engineType = currentQuestion?.type?.toLowerCase();

  const renderEngine = () => {
    const props = {
      data: currentQuestion,
      onResult: handleResult,
      onError: (err) => console.warn(`[Engine Error] ${err}`)
    };

    // Evaluate engine type per-question, not per-lesson.
    // This enables multi-engine lessons where the UI layer swaps automatically
    // as the student advances (e.g. Matcher → Numpad → Composer).

    switch (engineType) {
      // case 'picker': return <PickerEngine {...props} />;
      // case 'counter': return <CounterEngine {...props} />;
      case 'picker': return <PickerEngine key={currentQuestionIndex} {...props} />;
      case 'visual_picker': return <VisualPickerEngine key={currentQuestionIndex} {...props} />;
      case 'compare_picker': return <ComparePickerEngine key={currentQuestionIndex} {...props} />;
      case 'composer': return <ComposeEngine {...props} />;
      case 'numpad': return <NumpadEngine key={currentQuestionIndex} {...props} />;
      case 'visual_numpad': return <VisualNumpadEngine key={currentQuestionIndex} {...props} />;
      case 'word_problem': return <WordProblemEngine key={currentQuestionIndex} {...props} />;
      case 'dragdrop': return <DragDropEngine key={currentQuestionIndex} {...props} />;
      case 'connectdots': return <ConnectDotsEngine key={currentQuestionIndex} {...props} />;
      case 'shapetracer': return <ShapeTracerEngine key={currentQuestionIndex} {...props} />;
      case 'shape_hunt': return <ShapeHuntEngine key={currentQuestionIndex} {...props} />;
      case 'compose_drag': return <ShapeComposeEngine key={currentQuestionIndex} {...props} />;
      case 'ordinal_sequence': return <OrdinalSequenceEngine key={currentQuestionIndex} {...props} />;
      case 'sort': return <SortEngine key={currentQuestionIndex} {...props} />;
      case 'geoboard': return <GeoboardEngine key={currentQuestionIndex} {...props} />;
      case 'clocksetter': return <ClockSetterEngine key={currentQuestionIndex} {...props} />;
      case 'fraction_shape': return <FractionShapeEngine key={currentQuestionIndex} {...props} />;
      case 'calendar_page': return <CalendarPageEngine key={currentQuestionIndex} {...props} />;
      case 'turn_compass': return <TurnCompassEngine key={currentQuestionIndex} {...props} />;
      case 'pictograph_reader': return <PictographReaderEngine key={currentQuestionIndex} {...props} />;
      case 'data_table_reader': return <DataTableReaderEngine key={currentQuestionIndex} {...props} />;
      case 'fruit_stand': return <FruitStandEngine key={currentQuestionIndex} {...props} />;
      case 'pattern_sequence': return <PatternSequenceEngine key={currentQuestionIndex} {...props} />;
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
          <Ionicons name="close" size={24} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      {/* Question Header */}
      {questionText && engineType !== 'visual_picker' ? (
        <View style={styles.questionHeader}>
          <Text style={styles.questionHeaderText}>{questionText}</Text>
        </View>
      ) : null}

      {/* Question Asset — shown when the question references an illustration or manipulative.
          Engines that own their own visual layout (VISUAL_NUMPAD, WORD_PROBLEM) render their
          asset internally; skip the shared top-asset slot to avoid duplication. */}
      {currentQuestion?.assetId
        && currentQuestion?.assetType !== 'text'
        && engineType !== 'visual_numpad'
        && engineType !== 'word_problem'
        && engineType !== 'visual_picker' ? (
        <View style={styles.questionAssetContainer}>
          <AssetDisplay
            assetId={currentQuestion.assetId}
            style={styles.questionAsset}
            resizeMode="contain"
          />
        </View>
      ) : null}

      {/* Gameplay Area — gesture engines use a plain View to preserve touch
          responders; all other engines use a ScrollView so content is never
          clipped on smaller devices. */}
      {GESTURE_ENGINES.has(engineType) ? (
        <View style={styles.engineWrapper}>
          {isFinished ? null : renderEngine()}
        </View>
      ) : (
        <ScrollView
          style={styles.engineScrollWrapper}
          contentContainerStyle={styles.engineScrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {isFinished ? null : renderEngine()}
        </ScrollView>
      )}

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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  exitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  questionHeader: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  questionHeaderText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 24,
    color: Colors.onSurface,
    textAlign: 'center',
    lineHeight: 32,
  },
  engineWrapper: {
    flex: 1,
    paddingTop: 24,
  },
  engineScrollWrapper: {
    flex: 1,
  },
  engineScrollContent: {
    flexGrow: 1,
    paddingTop: 24,
    paddingBottom: 32,
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
  },
  questionAssetContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  questionAsset: {
    width: 200,
    height: 160,
  },
});
