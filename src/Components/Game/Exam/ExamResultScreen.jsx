import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

const STATUS_CONFIG = {
  answered_correct:   { icon: 'checkmark-circle',  color: Colors.tertiary  },
  answered_incorrect: { icon: 'close-circle',       color: Colors.error     },
  unanswered:         { icon: 'remove-circle',      color: Colors.outlineVariant },
};

export default function ExamResultScreen({ examTitle, questions, answers, onBackToClassroom }) {
  const correct    = Object.values(answers).filter(a => a.status === 'answered_correct').length;
  const total      = questions.length;
  const unanswered = questions.filter(q => !answers[q._id] || answers[q._id].status === 'unanswered').length;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <View style={styles.container}>
      {/* Score Header */}
      <View style={styles.scoreHeader}>
        <Text style={styles.examTitle}>{examTitle}</Text>
        <Text style={styles.scoreValue}>{correct}<Text style={styles.scoreTotal}>/{total}</Text></Text>
        <Text style={styles.scorePercent}>{percentage}%</Text>
        {unanswered > 0 && (
          <Text style={styles.unansweredNote}>{unanswered} question{unanswered > 1 ? 's' : ''} left unanswered</Text>
        )}
      </View>

      {/* Per-question review list */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {questions.map((q, idx) => {
          const entry  = answers[q._id];
          const status = entry?.status ?? 'unanswered';
          const config = STATUS_CONFIG[status];
          const questionText = q.question ?? q.instruction ?? q.text ?? q.prompt ?? '';
          const correctAnswer = String(entry?.snapshot?.answer ?? q.answer ?? '—');
          const userAnswer    = entry?.userAnswer?.join(', ') ?? '—';

          return (
            <View key={q._id} style={styles.reviewCard}>
              <View style={styles.reviewRow}>
                <Ionicons name={config.icon} size={22} color={config.color} style={styles.reviewIcon} />
                <Text style={styles.questionNum}>Q{idx + 1}</Text>
              </View>
              <Text style={styles.questionText}>{questionText}</Text>
              <View style={styles.answerRow}>
                <Text style={styles.answerLabel}>Your answer: </Text>
                <Text style={[styles.answerValue, { color: config.color }]}>{userAnswer}</Text>
              </View>
              {status !== 'answered_correct' && (
                <View style={styles.answerRow}>
                  <Text style={styles.answerLabel}>Correct: </Text>
                  <Text style={[styles.answerValue, { color: Colors.tertiary }]}>{correctAnswer}</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Back button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={onBackToClassroom} activeOpacity={0.8}>
          <Text style={styles.backButtonText}>Back to Classroom</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scoreHeader: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 24,
    backgroundColor: Colors.surfaceContainerLow,
    borderBottomWidth: 2,
    borderBottomColor: Colors.outlineVariant,
  },
  examTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginBottom: 8,
  },
  scoreValue: {
    fontFamily: 'Lexend-Black',
    fontSize: 52,
    color: Colors.onSurface,
  },
  scoreTotal: {
    fontFamily: 'Lexend-Regular',
    fontSize: 28,
    color: Colors.onSurfaceVariant,
  },
  scorePercent: {
    fontFamily: 'Lexend-Bold',
    fontSize: 20,
    color: Colors.primary,
    marginTop: 4,
  },
  unansweredNote: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    color: Colors.error,
    marginTop: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  reviewCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: Colors.outlineVariant,
    padding: 16,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewIcon: {
    marginRight: 6,
  },
  questionNum: {
    fontFamily: 'Lexend-Bold',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  questionText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 15,
    color: Colors.onSurface,
    marginBottom: 10,
    lineHeight: 22,
  },
  answerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  answerLabel: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  answerValue: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 13,
  },
  footer: {
    padding: 16,
    paddingBottom: 28,
    backgroundColor: Colors.surfaceContainerLowest,
    borderTopWidth: 2,
    borderTopColor: Colors.outlineVariant,
  },
  backButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: Colors.onPrimaryContainer,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 16,
    color: Colors.onPrimary,
    letterSpacing: 1.2,
  },
});
