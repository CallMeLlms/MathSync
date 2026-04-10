import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { getGameTheme } from '@/theme/gameThemes';
import useGameEngine from '@/stores/game-stores/useGameEngine';

/**
 * GenerativeOrchestrator
 * The structural home for logic-driven games.
 * This component will handle sessions that generate problems on-the-fly.
 */
export default function GenerativeOrchestrator({ 
  templateData, 
  gradeKey = 'G1' 
}) {
  const router = useRouter();
  const theme = getGameTheme(gradeKey);
  const [currentProblem, setCurrentProblem] = useState(null);
  const { startGameSession, endGameSession, totalScore } = useGameEngine();

  useEffect(() => {
    if (templateData) {
      startGameSession(templateData.templateId);
    }
    return () => endGameSession();
  }, [templateData]);

  if (!currentProblem && !templateData) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundColor }]}>
        <ActivityIndicator size="large" color={theme.primaryColor} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.hud}>
        <TouchableOpacity style={styles.exitButton} onPress={() => router.back()}>
          <Text style={[styles.exitText, { fontFamily: theme.fontFamily.accent }]}>End Practice</Text>
        </TouchableOpacity>
        <Text style={[styles.scoreText, { color: theme.primaryColor, fontFamily: theme.fontFamily.accent }]}>
          Score: {totalScore}
        </Text>
      </View>

      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Generative Engine Coming Soon...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontFamily: 'Lexend-Bold', fontSize: 18, color: Colors.onSurfaceVariant }
});
