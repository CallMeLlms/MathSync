import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import useUserStore from '@/stores/user-stores/useUserStore';

/**
 * Grades Screen - Grade Selection Portal
 * Overhauled with the "Discovery Garden" Bento Grid UI.
 * Depth is achieved through tonal shifting and tactile borders (Shadow-Free).
 */
export default function Grades() {
  const router = useRouter();
  const setCurrentGrade = useUserStore((state) => state.setCurrentGrade);
  const currentGrade = useUserStore((state) => state.currentGrade);

  const gradeData = [
    { 
      id: 'G1', 
      title: 'Grade 1', 
      desc: 'Start your journey with sprouting seeds and magic soil.',
      icon: 'local-florist', 
      color: Colors.primary, 
      bg: Colors.surfaceContainerLowest 
    },
    { 
      id: 'G2', 
      title: 'Grade 2', 
      desc: 'Discover the helpful bugs that guard our garden ecosystem.',
      icon: 'bug-report', 
      color: Colors.secondary, 
      bg: Colors.surfaceContainerLow 
    },
    { 
      id: 'G3', 
      title: 'Grade 3', 
      desc: 'Learning the secrets of vertical forests and tall vines.',
      icon: 'potted-plant', 
      color: Colors.tertiary, 
      bg: Colors.surfaceContainerLow 
    },
    { 
      id: 'G4', 
      title: 'Grade 4', 
      desc: 'Master the flow of water and crystal clear streams.',
      icon: 'water-drop', 
      color: Colors.success, 
      bg: Colors.surfaceContainerLow 
    },
    { 
      id: 'G5', 
      title: 'Grade 5', 
      desc: 'Harness the power of sunlight for solar-powered blooms.',
      icon: 'wb-sunny', 
      color: '#D84315', 
      bg: Colors.surfaceContainerLow 
    },
    { 
      id: 'G6', 
      title: 'Grade 6', 
      desc: 'Become a Master Gardener and curate the Great Forest.',
      icon: 'forest', 
      color: '#4527A0', 
      bg: Colors.surfaceContainerLow 
    },
  ];

  const handleGradeSelect = (gradeId) => {
    // Only allow selecting G1 or G2 for now (demo logic)
    if (gradeId === 'G1' || gradeId === 'G2') {
      setCurrentGrade(gradeId);
      router.push(`/journey/${gradeId}`);
    }
  };

  const renderGradeCard = (grade) => {
    const isLocked = grade.id !== 'G1' && grade.id !== 'G2';
    const isActive = grade.id === 'G1'; // Grade 1 is the starting point

    return (
      <TouchableOpacity
        key={grade.id}
        style={[
          styles.card, 
          { backgroundColor: grade.bg },
          isActive && styles.activeCard,
          isLocked && styles.lockedCard
        ]}
        activeOpacity={isLocked ? 1 : 0.7}
        onPress={() => handleGradeSelect(grade.id)}
      >
        {isActive && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>Active Explorer</Text>
          </View>
        )}

        {isLocked && (
          <View style={styles.lockIcon}>
            <MaterialIcons name="lock" size={24} color={Colors.onSurfaceVariant} style={{ opacity: 0.4 }} />
          </View>
        )}

        <View style={[styles.iconBox, { backgroundColor: isActive ? Colors.primaryContainer : Colors.surfaceContainerHigh }]}>
          <MaterialIcons 
            name={grade.icon} 
            size={48} 
            color={isActive ? Colors.primary : isLocked ? Colors.onSurfaceVariant : grade.color} 
            style={{ opacity: isLocked ? 0.3 : 1 }}
          />
        </View>

        <Text style={[styles.cardTitle, isLocked && styles.lockedText]}>
          {grade.title}
        </Text>
        
        <Text style={[styles.cardDesc, isLocked && styles.lockedText]}>
          {grade.desc}
        </Text>

        {isActive ? (
          <View style={styles.statusPillActive}>
            <MaterialIcons name="stars" size={16} color={Colors.onTertiaryContainer} />
            <Text style={styles.statusTextActive}>Current Level</Text>
          </View>
        ) : (
          <View style={styles.statusPillLocked}>
            <Text style={styles.statusTextLocked}>{isLocked ? 'Future Level' : 'Available'}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Pick Your Adventure</Text>
          <Text style={styles.heroSubtitle}>
            Welcome back, Explorer! Choose your level to start your learning journey.
          </Text>
        </View>

        <View style={styles.bentoGrid}>
          {gradeData.map(renderGradeCard)}
        </View>

      {/* Footer Decoration Removed */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  heroSection: {
    marginBottom: 40,
    marginTop: 8,
  },
  heroTitle: {
    fontFamily: 'Lexend-Black',
    fontSize: 36,
    color: Colors.onSurface,
    lineHeight: 42,
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 17,
    color: Colors.onSurfaceVariant,
    marginTop: 12,
    lineHeight: 26,
    maxWidth: '90%',
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 20,
  },
  card: {
    width: '100%',
    borderRadius: 32,
    padding: 28,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'visible',
  },
  activeCard: {
    borderColor: Colors.primary,
    borderWidth: 4,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  lockedCard: {
    opacity: 0.8,
  },
  activeBadge: {
    position: 'absolute',
    top: -16,
    right: -8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  activeBadgeText: {
    fontFamily: 'Lexend-Bold',
    color: Colors.onPrimary,
    fontSize: 12,
  },
  lockIcon: {
    position: 'absolute',
    top: 24,
    right: 24,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 28,
    color: Colors.primary,
    marginBottom: 8,
  },
  lockedText: {
    color: Colors.onSurfaceVariant,
    opacity: 0.5,
  },
  cardDesc: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 15,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: 24,
  },
  statusPillActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(105, 255, 135, 0.3)', // tertiaryContainer with 0.3 opacity
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    gap: 8,
  },
  statusTextActive: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 13,
    color: Colors.onTertiaryContainer,
  },
  statusPillLocked: {
    backgroundColor: Colors.surfaceContainerHigh,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
  statusTextLocked: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
