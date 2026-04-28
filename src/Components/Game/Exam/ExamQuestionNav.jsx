import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text } from 'react-native';
import Colors from '@/constants/colors';

// Status → color mapping
const STATUS_COLORS = {
  unanswered:         Colors.outlineVariant,
  answered_correct:   Colors.tertiary,
  answered_incorrect: Colors.error,
};

export default function ExamQuestionNav({ questions, answers, currentIndex, onSelect }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Questions</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {questions.map((q, idx) => {
          const status = answers[q._id]?.status ?? 'unanswered';
          const isActive = idx === currentIndex;
          return (
            <TouchableOpacity
              key={q._id}
              style={[
                styles.dot,
                { backgroundColor: STATUS_COLORS[status] },
                isActive && styles.dotActive,
              ]}
              onPress={() => onSelect(idx)}
              activeOpacity={0.75}
            >
              <Text style={[styles.dotText, isActive && styles.dotTextActive]}>
                {idx + 1}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceContainerLow,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 2,
    borderTopColor: Colors.outlineVariant,
  },
  label: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    marginBottom: 8,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  scrollContent: {
    gap: 8,
    paddingBottom: 2,
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: Colors.onSurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotActive: {
    borderColor: Colors.primary,
    borderBottomWidth: 4,
  },
  dotText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 13,
    color: Colors.onSurface,
  },
  dotTextActive: {
    color: Colors.primary,
  },
});
