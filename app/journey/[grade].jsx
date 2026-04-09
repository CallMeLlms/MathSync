import React, { useMemo } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import JourneyMap from '@/Components/GameFlowComponents/JourneyMap';

// Import curriculum data
import G1Data from '@content/lesson-map/G1.json';
import G2Data from '@content/lesson-map/G2.json';

const CURRICULUM_MAP = {
  'G1': G1Data,
  'G2': G2Data,
  // Add more grades as JSON files are created
};

/**
 * Grade Journey Entry - Dynamic Route [grade].jsx
 * Now connected to real curriculum data via CURRICULUM_MAP.
 */
export default function GradeJourney() {
  const { grade } = useLocalSearchParams();
  const router = useRouter();

  // Load curriculum data based on route param
  const curriculum = useMemo(() => {
    return CURRICULUM_MAP[grade] || null;
  }, [grade]);

  const handleNodePress = (node) => {
    if (node.status === 'locked') {
      Alert.alert('Locked', 'This garden path is still growing! Complete the previous lessons to unlock it.');
    } else {
      Alert.alert(
        'Start Lesson', 
        `Ready to explore "${node.title}"?`,
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Start', onPress: () => console.log('Starting lesson:', node.id) }
        ]
      );
    }
  };

  if (!curriculum) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Loading...', headerShadowVisible: false }} />
        <View style={styles.content}>
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
      {/* Branded Header Integration */}
      <Stack.Screen options={{ headerShown: false }} />


      <View style={styles.content}>
        <JourneyMap 
          levels={curriculum.levels} 
          onNodePress={handleNodePress}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface, // #fff8f3
  },
  content: {
    flex: 1,
    paddingTop: 72, // Space for DiscoveryHeader
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
});
