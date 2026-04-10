import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import useGameEngine from '@/stores/game-stores/useGameEngine';
import { getGameTheme } from '@/theme/gameThemes';
import { getBundledLesson } from './lessonResolver';

// Engines
import PickerEngine from './Engines/PickerEngine';
import CounterEngine from './Engines/CounterEngine';
import DragDropEngine from './Engines/DragDropEngine';

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

  // Load Content Data
  useEffect(() => {
    const content = getBundledLesson(gradeKey, lessonId);
    if (content) {
      setLessonContent(content);
      startGameSession(lessonId);
    }
    
    return () => {
      endGameSession();
    };
  }, [lessonId, gradeKey]);

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

  const handleResult = (isCorrect) => {
    recordAnswer(isCorrect);
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
      onComplete: handleComplete,
      onError: (err) => console.warn(`[Engine Error] ${err}`)
    };

    switch (lessonContent.type) {
      case 'picker': return <PickerEngine {...props} />;
      case 'counter': return <CounterEngine {...props} />;
      case 'dragdrop': return <DragDropEngine {...props} />;
      default: return <Text style={styles.errorText}>Engine "{lessonContent.type}" not found.</Text>;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      {/* HUD */}
      <View style={styles.hud}>
        <TouchableOpacity style={styles.exitButton} onPress={() => router.back()}>
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
               onPress={() => router.back()}
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
  }
});
