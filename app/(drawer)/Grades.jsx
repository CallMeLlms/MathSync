import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import useUserStore from '@/stores/user-stores/useUserStore';

/**
 * Grades Screen - Grade Selection Portal
 * Implements "The Tactile Discovery Garden" aesthetic: Flat, bold, and asymmetric.
 * Students choose their grade to navigate to their official Journey Map.
 */
export default function Grades() {
  const router = useRouter();
  const setCurrentGrade = useUserStore((state) => state.setCurrentGrade);

  const gradeData = [
    { id: 'G1', title: 'Grade 1', icon: 'school', color: Colors.primary, bg: Colors.primaryContainer },
    { id: 'G2', title: 'Grade 2', icon: 'auto-stories', color: Colors.secondary, bg: Colors.secondaryContainer },
    { id: 'G3', title: 'Grade 3', icon: 'architecture', color: Colors.tertiary, bg: Colors.tertiaryContainer },
    { id: 'G4', title: 'Grade 4', icon: 'functions', color: Colors.success, bg: '#E8F5E9' },
    { id: 'G5', title: 'Grade 5', icon: 'calculate', color: '#D84315', bg: '#FFCCBC' },
    { id: 'G6', title: 'Grade 6', icon: 'biotech', color: '#4527A0', bg: '#EDE7F6' },
  ];

  const handleGradeSelect = (gradeId) => {
    setCurrentGrade(gradeId);
    router.push(`/journey/${gradeId}`);
  };

  const renderGradeCard = (grade) => (
    <TouchableOpacity
      key={grade.id}
      style={[styles.card, { backgroundColor: grade.bg }]}
      activeOpacity={0.8}
      onPress={() => handleGradeSelect(grade.id)}
    >
      <View style={styles.iconWrapper}>
        <MaterialIcons name={grade.icon} size={40} color={grade.color} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, { color: grade.color }]}>{grade.title}</Text>
        <Text style={styles.cardSubtitle}>Start Journey</Text>
      </View>
      <View style={styles.arrowIcon}>
        <Feather name="arrow-right" size={20} color={grade.color} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Garden</Text>
          <Text style={styles.subtitle}>Select your grade level to begin your learning discovery!</Text>
        </View>

        <View style={styles.grid}>
          {gradeData.map(renderGradeCard)}
        </View>

        <View style={styles.footerNote}>
          <MaterialCommunityIcons name="flower-outline" size={24} color={Colors.onSurfaceVariant} />
          <Text style={styles.footerText}>Stay curious, explorer!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface, // #fff8f3
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
    marginTop: 16,
  },
  title: {
    fontFamily: 'Lexend-Black',
    fontSize: 32,
    color: Colors.onSurface,
    lineHeight: 40,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    marginTop: 8,
    lineHeight: 24,
  },
  grid: {
    flexDirection: 'column',
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    position: 'relative',
    overflow: 'hidden',
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 22,
  },
  cardSubtitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
    opacity: 0.7,
  },
  arrowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 48,
    gap: 12,
  },
  footerText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
});
