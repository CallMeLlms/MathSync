import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import useGameEngine from '@/stores/game-stores/useGameEngine';

// Generic Engines 
import PickerEngine from '@/Components/Game/Engines/PickerEngine';
import CounterEngine from '@/Components/Game/Engines/CounterEngine';
import DragDropEngine from '@/Components/Game/Engines/DragDropEngine';

// Data (In a real app, this might be fetched via API based on lessonId)
import G1LessonData from '@content/game-data/G1-Q1-Lessons.json'; 

/**
 * Grade 1 GameScreen Orchestrator
 * This is the "Parent Container" that fetches the data and mounts the correct Engine.
 */
export default function GameScreen() {
  const { lessonId } = useLocalSearchParams();
  const router = useRouter();
  
  const [lessonContent, setLessonContent] = useState(null);
  
  // Game Store Actions
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
    if (lessonId) {
      const foundLesson = G1LessonData.lessons.find(l => l.id === lessonId);
      if (foundLesson) {
        setLessonContent(foundLesson);
        startGameSession(lessonId);
      } else {
        // Fallback for demo
        setLessonContent(G1LessonData.lessons[0]);
        startGameSession(G1LessonData.lessons[0].id);
      }
    }
    
    return () => {
      endGameSession();
    };
  }, [lessonId]);

  if (!lessonContent) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Planting Seeds...</Text>
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
      // Finished all questions for this lesson, we let `isFinished` render the success screen
      nextQuestion();
    }
  };

  const handleError = (errorMsg) => {
    console.warn(`[GameScreen Error] ${errorMsg}`);
  };
  
  // Dynamic Engine Injection
  const renderEngine = () => {
    const props = {
      data: currentQuestion,
      onResult: handleResult,
      onComplete: handleComplete,
      onError: handleError
    };

    switch (lessonContent.type) {
      case 'picker':
        return <PickerEngine {...props} />;
      case 'counter':
        return <CounterEngine {...props} />;
      case 'dragdrop':
        return <DragDropEngine {...props} />;
      default:
        return <Text style={styles.errorText}>Game Logic "{lessonContent.type}" not found.</Text>;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HUD (Heads Up Display) */}
      <View style={styles.hud}>
        <TouchableOpacity style={styles.exitButton} onPress={() => router.back()}>
          <Text style={styles.exitText}>Leave Garden</Text>
        </TouchableOpacity>
        <Text style={styles.scoreText}>Activity Score: {totalScore}</Text>
      </View>

      {/* Engine Area */}
      <View style={styles.engineWrapper}>
        {isFinished ? (
           <View style={styles.successContainer}>
             <Text style={styles.successTitle}>Lesson Complete!</Text>
             <Text style={styles.successScore}>You collected {totalScore} points</Text>
             <TouchableOpacity style={styles.finishButton} onPress={() => router.back()}>
                <Text style={styles.finishText}>Back to Map</Text>
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
    backgroundColor: Colors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontFamily: 'PlusJakartaSans-Medium',
    color: Colors.onSurfaceVariant,
  },
  errorText: {
    fontFamily: 'PlusJakartaSans-Bold',
    color: Colors.error,
    textAlign: 'center',
    marginTop: 32,
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
    fontFamily: 'PlusJakartaSans-Bold',
    color: Colors.onSurfaceVariant,
  },
  scoreText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 18,
    color: Colors.primary,
  },
  engineWrapper: {
    flex: 1,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontFamily: 'Lexend-Black',
    fontSize: 32,
    color: Colors.primary,
    marginBottom: 16,
  },
  successScore: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 20,
    color: Colors.onSurface,
    marginBottom: 40,
  },
  finishButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 100,
  },
  finishText: {
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#FFF',
    fontSize: 16,
  }
});
