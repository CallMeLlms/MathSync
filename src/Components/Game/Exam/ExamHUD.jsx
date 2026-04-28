import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

export default function ExamHUD({ title, currentIndex, totalQuestions, answeredCount, onExit }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onExit} style={styles.exitButton} activeOpacity={0.7}>
        <Ionicons name="close" size={24} color={Colors.onSurface} />
      </TouchableOpacity>

      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.progress}>{answeredCount} / {totalQuestions} answered</Text>
      </View>

      <View style={styles.indexBadge}>
        <Text style={styles.indexText}>{currentIndex + 1}</Text>
        <Text style={styles.indexTotal}>/{totalQuestions}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surfaceContainerLowest,
    borderBottomWidth: 2,
    borderBottomColor: Colors.outlineVariant,
  },
  exitButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 4,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontFamily: 'Lexend-Bold',
    fontSize: 15,
    color: Colors.onSurface,
  },
  progress: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  indexBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    minWidth: 40,
    justifyContent: 'flex-end',
  },
  indexText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 18,
    color: Colors.primary,
  },
  indexTotal: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
});
