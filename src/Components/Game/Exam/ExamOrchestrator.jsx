import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import useGameEngine from '@/stores/game-stores/useGameEngine';
import { getExamById } from '@/services/examService';
import { submitExam } from '@/services/examSubmissionService';

// Engines — same pool as CurriculumOrchestrator
import PickerEngine from '@/Components/Game/Curriculum/Engines/PickerEngine';
import ComposeEngine from '@/Components/Game/Curriculum/Engines/ComposeEngine';
import NumpadEngine from '@/Components/Game/Curriculum/Engines/NumpadEngine';
import MatcherEngine from '@/Components/Game/Curriculum/Engines/MatcherEngine';
import DragDropEngine from '@/Components/Game/Curriculum/Engines/DragAndDropEngine';
import ConnectDotsEngine from '@/Components/Game/Curriculum/Engines/ConnectTheDotsEngine';
import ShapeTracerEngine from '@/Components/Game/Curriculum/Engines/ShapeTracerEngine';
import ShapeHuntEngine from '@/Components/Game/Curriculum/Engines/ShapeHuntEngine';
import ShapeComposeEngine from '@/Components/Game/Curriculum/Engines/ShapeComposeEngine';
import OrdinalSequenceEngine from '@/Components/Game/Curriculum/Engines/OrdinalSequenceEngine';
import SortEngine from '@/Components/Game/Curriculum/Engines/SortEngine';
import GeoboardEngine from '@/Components/Game/Curriculum/Engines/GeoboardEngine';
import ClockSetterEngine from '@/Components/Game/Curriculum/Engines/ClockSetterEngine';
import VisualNumpadEngine from '@/Components/Game/Curriculum/Engines/VisualNumpadEngine';
import WordProblemEngine from '@/Components/Game/Curriculum/Engines/WordProblemEngine';
import VisualPickerEngine from '@/Components/Game/Curriculum/Engines/VisualPickerEngine';
import ComparePickerEngine from '@/Components/Game/Curriculum/Engines/ComparePickerEngine';
import FractionShapeEngine from '@/Components/Game/Curriculum/Engines/FractionShapeEngine';
import CalendarPageEngine from '@/Components/Game/Curriculum/Engines/CalendarPageEngine';
import CalendarGridEngine from '@/Components/Game/Curriculum/Engines/CalendarGridEngine';
import TurnCompassEngine from '@/Components/Game/Curriculum/Engines/TurnCompassEngine';
import PictographReaderEngine from '@/Components/Game/Curriculum/Engines/PictographReaderEngine';
import DataTableReaderEngine from '@/Components/Game/Curriculum/Engines/DataTableReaderEngine';
import FruitStandEngine from '@/Components/Game/Curriculum/Engines/FruitStandEngine';
import PatternSequenceEngine from '@/Components/Game/Curriculum/Engines/PatternSequenceEngine';
import CompareOrderEngine from '@/Components/Game/Curriculum/Engines/CompareOrderEngine';
import MoneyEngine from '@/Components/Game/Curriculum/Engines/MoneyEngine';

import ExamHUD from './ExamHUD';
import ExamQuestionNav from './ExamQuestionNav';
import ExamResultScreen from './ExamResultScreen';

// Engines whose touch responders conflict with ScrollView — render inside plain View
const GESTURE_ENGINES = new Set(['dragdrop', 'connectdots', 'shapetracer', 'geoboard', 'clocksetter']);

export default function ExamOrchestrator({ examId, classroomId, sectionId, mockData = null }) {
  const router = useRouter();

  const [examData, setExamData]         = useState(null);
  const [loading, setLoading]           = useState(true);
  const [loadError, setLoadError]       = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers]           = useState({});
  // 'exam' while in progress, 'submitting' during API call, 'review' after confirmed
  const [phase, setPhase]               = useState('exam');

  const submittedRef = useRef(false);

  // ─── Load exam data ─────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    submittedRef.current = false;
    setAnswers({});
    setCurrentIndex(0);
    setPhase('exam');

    if (mockData) {
      // Phase 1 dev path — bypass API
      setExamData(mockData);
      useGameEngine.getState().startGameSession(mockData.meta?.examId ?? examId);
      setLoading(false);
      return;
    }

    // Phase 2 live path
    getExamById(examId)
      .then((exam) => {
        setExamData(exam);
        useGameEngine.getState().startGameSession(examId);
      })
      .catch((err) => {
        console.warn('[ExamOrchestrator] Failed to load exam:', err?.message ?? err);
        setLoadError('Could not load the exam. Please try again.');
      })
      .finally(() => setLoading(false));

    return () => {
      // Guard: if the user exits mid-exam without submitting, end session cleanly
      if (!submittedRef.current) {
        useGameEngine.getState().endGameSession();
      }
    };
  }, [examId]);

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const questions = examData?.questions ?? [];
  const currentQuestion = questions[currentIndex] ?? null;
  const answeredCount = Object.values(answers).filter(a => a.status !== 'unanswered').length;
  const allAnswered = answeredCount === questions.length && questions.length > 0;

  // ─── Answer handler — mutable, overwrites previous entry for this question ──
  // NOTE: useGameEngine.recordAnswer() is intentionally NOT called here.
  // Score/XP is derived from the final answers map at submission time, not
  // accumulated per-interaction — students can change answers before submitting.
  const handleResult = (isCorrect, userAnswerItems = []) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion._id]: {
        status:     isCorrect ? 'answered_correct' : 'answered_incorrect',
        userAnswer: userAnswerItems,
        isCorrect,
        snapshot: {
          type:     currentQuestion.type,
          question: currentQuestion.question ?? currentQuestion.instruction ?? currentQuestion.text ?? '',
          answer:   currentQuestion.answer,
          metadata: currentQuestion.metadata ?? null,
        },
      },
    }));
  };

  // ─── Submit — await confirmation before awarding XP ─────────────────────────
  const handleSubmit = async () => {
    if (submittedRef.current || phase !== 'exam') return;
    submittedRef.current = true;
    setPhase('submitting');

    const answersArray = questions.map(q => {
      const entry = answers[q._id];
      return {
        questionId:        q._id,
        learningOutcomeId: q.learningOutcomeId ?? null,
        userAnswer:        entry?.userAnswer ?? [],
        isCorrect:         entry?.isCorrect ?? null,
        status:            entry?.status    ?? 'unanswered',
        questionSnapshot:  entry?.snapshot  ?? null,
      };
    });

    const correct    = answersArray.filter(a => a.isCorrect === true).length;
    const totalItems = questions.length;

    try {
      if (!mockData) {
        await submitExam({ examId, classroomId, sectionId, totalScore: correct, totalItems, answers: answersArray });
      }

      // Submission confirmed (or skipped in mock mode) — safe to award XP/badges
      const engine = useGameEngine.getState();
      // Manually set the final score before ending so endGameSession logs the right XP
      useGameEngine.setState({ totalScore: correct * 10, correctCount: correct });
      engine.endGameSession();

      setPhase('review');
    } catch (err) {
      console.warn('[ExamOrchestrator] Submission failed:', err?.message ?? err);
      submittedRef.current = false;
      setPhase('exam');
      // TODO Phase 3: queue to AsyncStorage for retry on next launch
    }
  };

  const handleBackToClassroom = () => {
    if (classroomId && sectionId) {
      router.replace(`/classroom/${classroomId}?sectionId=${sectionId}`);
    } else {
      router.back();
    }
  };

  // ─── Engine switch — mirrors CurriculumOrchestrator ─────────────────────────
  const renderEngine = () => {
    if (!currentQuestion) return null;
    const engineType = currentQuestion.type?.toLowerCase();
    const props = {
      data:     currentQuestion,
      onResult: handleResult,
      onError:  (err) => console.warn('[ExamEngine] Error:', err),
    };

    switch (engineType) {
      case 'picker':             return <PickerEngine            key={currentIndex} {...props} />;
      case 'visual_picker':      return <VisualPickerEngine      key={currentIndex} {...props} />;
      case 'compare_picker':     return <ComparePickerEngine     key={currentIndex} {...props} />;
      case 'composer':           return <ComposeEngine           key={currentIndex} {...props} />;
      case 'numpad':             return <NumpadEngine            key={currentIndex} {...props} />;
      case 'visual_numpad':      return <VisualNumpadEngine      key={currentIndex} {...props} />;
      case 'word_problem':       return <WordProblemEngine       key={currentIndex} {...props} />;
      case 'dragdrop':           return <DragDropEngine          key={currentIndex} {...props} />;
      case 'connectdots':        return <ConnectDotsEngine       key={currentIndex} {...props} />;
      case 'shapetracer':        return <ShapeTracerEngine       key={currentIndex} {...props} />;
      case 'shape_hunt':         return <ShapeHuntEngine         key={currentIndex} {...props} />;
      case 'compose_drag':       return <ShapeComposeEngine      key={currentIndex} {...props} />;
      case 'ordinal_sequence':   return <OrdinalSequenceEngine   key={currentIndex} {...props} />;
      case 'sort':               return <SortEngine              key={currentIndex} {...props} />;
      case 'geoboard':           return <GeoboardEngine          key={currentIndex} {...props} />;
      case 'clocksetter':        return <ClockSetterEngine       key={currentIndex} {...props} />;
      case 'fraction_shape':     return <FractionShapeEngine     key={currentIndex} {...props} />;
      case 'calendar_page':      return <CalendarPageEngine      key={currentIndex} {...props} />;
      case 'calendar_grid':      return <CalendarGridEngine      key={currentIndex} {...props} />;
      case 'turn_compass':       return <TurnCompassEngine       key={currentIndex} {...props} />;
      case 'pictograph_reader':  return <PictographReaderEngine  key={currentIndex} {...props} />;
      case 'data_table_reader':  return <DataTableReaderEngine   key={currentIndex} {...props} />;
      case 'fruit_stand':        return <FruitStandEngine        key={currentIndex} {...props} />;
      case 'pattern_sequence':   return <PatternSequenceEngine   key={currentIndex} {...props} />;
      case 'compare_order':      return <CompareOrderEngine      key={currentIndex} {...props} />;
      case 'money_engine':       return <MoneyEngine             key={currentIndex} {...props} />;
      case 'matcher':
        return (
          <MatcherEngine
            key={currentIndex}
            question={currentQuestion}
            onAnswer={(isCorrect) => handleResult(isCorrect, [])}
          />
        );
      default:
        return <Text style={styles.errorText}>Engine "{engineType}" not found.</Text>;
    }
  };

  // ─── Render states ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading exam...</Text>
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{loadError}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.retryButton} activeOpacity={0.8}>
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (phase === 'review') {
    return (
      <SafeAreaView style={styles.container}>
        <ExamResultScreen
          examTitle={examData?.title ?? examData?.meta?.title ?? 'Exam Results'}
          questions={questions}
          answers={answers}
          onBackToClassroom={handleBackToClassroom}
        />
      </SafeAreaView>
    );
  }

  const isGestureEngine = GESTURE_ENGINES.has(currentQuestion?.type?.toLowerCase());
  const EngineWrapper = isGestureEngine ? View : ScrollView;

  return (
    <SafeAreaView style={styles.container}>
      <ExamHUD
        title={examData?.title ?? examData?.meta?.title ?? 'Exam'}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        answeredCount={answeredCount}
        onExit={handleBackToClassroom}
      />

      <EngineWrapper style={styles.engineArea} contentContainerStyle={!isGestureEngine ? styles.engineScrollContent : undefined}>
        {renderEngine()}
      </EngineWrapper>

      <ExamQuestionNav
        questions={questions}
        answers={answers}
        currentIndex={currentIndex}
        onSelect={setCurrentIndex}
      />

      <View style={styles.submitBar}>
        <TouchableOpacity
          style={[styles.submitButton, !allAnswered && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={!allAnswered || phase === 'submitting'}
        >
          {phase === 'submitting' ? (
            <ActivityIndicator color={Colors.onPrimary} />
          ) : (
            <Text style={styles.submitText}>
              {allAnswered ? 'Submit Exam' : `${questions.length - answeredCount} remaining`}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 24,
  },
  loadingText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    marginTop: 16,
  },
  errorText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 15,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLow,
  },
  retryText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 15,
    color: Colors.onSurface,
  },
  engineArea: {
    flex: 1,
  },
  engineScrollContent: {
    flexGrow: 1,
  },
  submitBar: {
    padding: 16,
    paddingBottom: 20,
    backgroundColor: Colors.surfaceContainerLowest,
    borderTopWidth: 2,
    borderTopColor: Colors.outlineVariant,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: Colors.onPrimaryContainer,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderColor: Colors.outlineVariant,
  },
  submitText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 16,
    color: Colors.onPrimary,
    letterSpacing: 1.2,
  },
});
