import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Feather, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  ZoomIn,
} from 'react-native-reanimated';
import Colors from '@/constants/colors';
import JourneyMap from '@/Components/Game/Flow/JourneyMap';
import useUserStore from '@/stores/user-stores/useUserStore';
import { isGradeAuthorized } from '@/utils/gradeMapping';

// Import curriculum data
import G1Data from '@content/lesson-map/G1.json';
import G2Data from '@content/lesson-map/G2.json';
import G3Data from '@content/lesson-map/G3.json';
import G4Data from '@content/lesson-map/G4.json';
import G5Data from '@content/lesson-map/G5.json';
import G6Data from '@content/lesson-map/G6.json';

const CURRICULUM_MAP = {
  'G1': G1Data,
  'G2': G2Data,
  'G3': G3Data,
  'G4': G4Data,
  'G5': G5Data,
  'G6': G6Data,
};

/**
 * LevelStartOverlay
 * A polished, in-app overlay that replaces Alert.alert for starting or previewing lessons.
 */
const LevelStartOverlay = ({ node, onStart, onCancel, isLocked }) => {
  if (!node) return null;

  const icon = isLocked ? 'lock' : node.type === 'boss' ? 'star' : 'sprout';
  const title = isLocked ? 'Path Still Growing' : node.title;
  const subtitle = isLocked
    ? 'Complete the previous lessons to unlock this path!'
    : node.subtitle || 'Ready to explore?';

  return (
    <View style={[StyleSheet.absoluteFillObject, styles.overlayBackdrop]}>
      <Animated.View entering={ZoomIn.springify()} style={styles.overlayCard}>
        <View style={styles.overlayIconContainer}>
          <MaterialCommunityIcons name={icon} size={48} color={isLocked ? Colors.onSurfaceVariant : Colors.primary} />
        </View>
        <Text style={styles.overlayTitle}>{title}</Text>
        <Text style={styles.overlaySubtitle}>{subtitle}</Text>

        <View style={styles.overlayActions}>
          <TouchableOpacity style={styles.overlaySecondary} onPress={onCancel} activeOpacity={0.7}>
            <Text style={styles.overlaySecondaryText}>{isLocked ? 'Got It' : 'Later'}</Text>
          </TouchableOpacity>

          {!isLocked && (
            <TouchableOpacity style={styles.overlayPrimary} onPress={onStart} activeOpacity={0.8}>
              <MaterialIcons name="play-arrow" size={22} color="#FFF" />
              <Text style={styles.overlayPrimaryText}>Start</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const EMPTY_PROGRESS = {};
const CURRICULUM_GRADES = ['G1']; // Only G1 uses locked/curriculum progression

/**
 * Grade Journey Entry - Dynamic Route [grade].jsx
 * Connected to real curriculum data and user progress via useUserStore.
 */
export default function GradeJourney() {
  const { grade } = useLocalSearchParams();
  const router = useRouter();

  const completedLessonsMap = useUserStore((s) => s.completedLessons);
  const completedLessons = completedLessonsMap[grade] || EMPTY_PROGRESS;

  const [selectedNode, setSelectedNode] = useState(null);

  // Load curriculum data based on route param
  const curriculum = useMemo(() => {
    return CURRICULUM_MAP[grade] || null;
  }, [grade]);

  // Compute dynamic statuses based on progress
  const computedLevels = useMemo(() => {
    if (!curriculum) return [];

    // Guard Clause: Redirect if the user manually hits a URL for an unauthorized grade
    const profile = useUserStore.getState().profile;
    if (!isGradeAuthorized(grade, profile)) {
      // Since useMemo runs during render, we use a setTimeout or a separate effect to redirect
      // safely without causing React state warnings.
      globalThis.setTimeout(() => router.replace('/Grades'), 0);
      return [];
    }

    const isGenerativeGrade = !CURRICULUM_GRADES.includes(grade);

    return curriculum.levels.map((level, index) => {
      // For generative grades (G2-G6), all nodes are unlocked by default
      if (isGenerativeGrade) {
        return { ...level, status: 'active' };
      }

      // For curriculum grades (G1), use gated progression logic
      const id = String(level.id);
      const isCompleted = completedLessons[id]?.completed === true;

      const allPreviousCompleted = curriculum.levels
        .slice(0, index)
        .every((prev) => completedLessons[String(prev.id)]?.completed === true);

      let status;
      if (isCompleted) {
        status = 'completed';
      } else if (allPreviousCompleted) {
        status = 'active';
      } else {
        status = 'locked';
      }

      return { ...level, status };
    });
  }, [curriculum, completedLessons, grade]);

  const handleNodePress = (node) => {
    setSelectedNode(node);
  };

  const handleStartLesson = () => {
    if (!selectedNode) return;
    setSelectedNode(null);

    if (CURRICULUM_GRADES.includes(grade)) {
      router.push(`/game/${selectedNode.id}?grade=${grade}`);
    } else {
      router.push(`/game/${selectedNode.topicId}?grade=${grade}&type=generative`);
    }
  };

  if (!curriculum) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Loading...', headerShadowVisible: false }} />
        <View style={styles.emptyContent}>
          <Feather name="search" size={48} color={Colors.onSurfaceVariant} />
          <Text style={styles.welcomeTitle}>Curriculum Not Found</Text>
          <Text style={styles.welcomeDesc}>We couldn't find the curriculum map for this grade yet.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.content}>
        <JourneyMap
          levels={computedLevels}
          onNodePress={handleNodePress}
        />
      </View>

      {/* Level Start Overlay */}
      {selectedNode && (
        <LevelStartOverlay
          node={selectedNode}
          isLocked={selectedNode.status === 'locked'}
          onStart={handleStartLesson}
          onCancel={() => setSelectedNode(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  welcomeTitle: {
    fontFamily: 'Lexend-Black',
    fontSize: 28,
    color: Colors.onSurface,
    textAlign: 'center',
    marginTop: 20,
  },
  welcomeDesc: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
    paddingHorizontal: 40,
  },
  backButton: {
    marginTop: 32,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 100,
    backgroundColor: Colors.primary,
  },
  backButtonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  // ─── Level Start Overlay ───
  overlayBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    zIndex: 100,
  },
  overlayCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.surface,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: Colors.primary,
    padding: 32,
    alignItems: 'center',
  },
  overlayIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  overlayTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 24,
    color: Colors.onSurface,
    textAlign: 'center',
    marginBottom: 8,
  },
  overlaySubtitle: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  overlayActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  overlaySecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
  },
  overlaySecondaryText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 15,
    color: Colors.onSurfaceVariant,
  },
  overlayPrimary: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: Colors.primary,
  },
  overlayPrimaryText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
