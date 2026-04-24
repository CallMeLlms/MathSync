import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import lessonService from '@services/lessonService';
import RichTextRenderer from '@/Components/LessonComponents/RichTextRenderer';
import OfflineVideoPlayer from '@/Components/LessonComponents/OfflineVideoPlayer';
import { resolveGameLesson } from '@/constants/classroomLessonMap';

export default function LessonDetail() {
  const { lessonId, grade, quarter } = useLocalSearchParams();
  const router = useRouter();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    fetchLessonData();
  }, [lessonId]);

  const fetchLessonData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await lessonService.getLessonById(lessonId);
      if (response.success) {
        setLesson(response.data);
        setFromCache(response.fromCache);
      } else {
        setError('Failed to load lesson details. Please try again.');
      }
    } catch (err) {
      console.log('Error fetching lesson:', err);
      setError('An error occurred while loading this lesson. Check your network or try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: 'Loading...', headerBackTitleVisible: false }} />
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error || !lesson) {
    return (
      <View style={styles.emptyContainer}>
        <Stack.Screen options={{ title: 'Error', headerBackTitleVisible: false }} />
        <Feather name="alert-circle" size={48} color="#F44336" />
        <Text style={styles.emptyText}>{error || 'Lesson not found.'}</Text>
      </View>
    );
  }

  const gameLessonId = grade === 'G1'
    ? resolveGameLesson(lesson?.title, quarter ? parseInt(quarter, 10) : null)
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: lesson.title || 'Lesson Detail',
          headerStyle: { backgroundColor: Colors.surface, elevation: 0, shadowOpacity: 0 },
          headerTitleStyle: { fontFamily: 'Lexend-Bold', fontSize: 18, color: Colors.onSurface },
          headerTintColor: Colors.primary,
          headerBackTitleVisible: false
        }} 
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {fromCache && (
          <View style={styles.offlineBanner}>
            <Feather name="wifi-off" size={14} color="#F57C00" />
            <Text style={styles.offlineText}>Viewing offline version</Text>
          </View>
        )}

        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>{lesson.title}</Text>
          <View style={styles.metaContainer}>
             <View style={styles.metaBadge}>
                <Feather name="clock" size={14} color={Colors.onSurfaceVariant} />
                <Text style={styles.metaText}>{lesson.duration} mins</Text>
             </View>
             {lesson.gradeLevel && (
                <View style={styles.metaBadge}>
                   <Feather name="book-open" size={14} color={Colors.onSurfaceVariant} />
                   <Text style={styles.metaText}>Grade {lesson.gradeLevel}</Text>
                </View>
             )}
          </View>
          {lesson.description && (
             <Text style={styles.descriptionText}>{lesson.description}</Text>
          )}
        </View>

        {lesson.videoUrl ? (
          <View style={styles.videoSection}>
            <Text style={styles.sectionTitle}>Lesson Video</Text>
            <OfflineVideoPlayer url={lesson.videoUrl} />
          </View>
        ) : null}

        {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
          <View style={styles.infoCard}>
             <Text style={styles.sectionTitle}>Learning Objectives</Text>
             {lesson.learningObjectives.map((obj, i) => (
                <View key={i} style={styles.listItem}>
                   <Text style={styles.bullet}>•</Text>
                   <Text style={styles.listItemText}>{obj}</Text>
                </View>
             ))}
          </View>
        )}

        {lesson.learningCompetencies && lesson.learningCompetencies.length > 0 && (
          <View style={styles.infoCard}>
             <Text style={styles.sectionTitle}>Competencies</Text>
             {lesson.learningCompetencies.map((comp, i) => (
                <View key={i} style={styles.listItem}>
                   <Text style={styles.bullet}>•</Text>
                   <Text style={styles.listItemText}>{comp}</Text>
                </View>
             ))}
          </View>
        )}

        {lesson.lessonContent && (
          <View style={styles.contentSection}>
             <Text style={styles.sectionTitle}>Lesson Content</Text>
             <View style={styles.richTextContainer}>
                <RichTextRenderer content={lesson.lessonContent} />
             </View>
          </View>
        )}

        {gameLessonId !== null && (
          <View style={styles.playSection}>
            <TouchableOpacity
              style={styles.playButton}
              activeOpacity={0.85}
              onPress={() => router.push(`/game/${gameLessonId}?grade=G1`)}
            >
              <Feather name="zap" size={22} color="#FFFFFF" />
              <Text style={styles.playButtonText}>Play Lesson</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F5F7FA',
  },
  emptyText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 16,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3E0',
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  offlineText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: '#F57C00',
    marginLeft: 6,
  },
  headerSection: {
    marginBottom: 24,
  },
  headerTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 28,
    color: '#2C3E50',
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  metaText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    color: '#3F51B5',
    marginLeft: 6,
  },
  descriptionText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 15,
    color: '#78909C',
    lineHeight: 24,
  },
  sectionTitle: {
    fontFamily: 'Lexend-SemiBold',
    fontSize: 20,
    color: '#37474F',
    marginBottom: 12,
  },
  videoSection: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 24,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 15,
    color: '#37474F',
    width: 16,
  },
  listItemText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 15,
    color: '#37474F',
    flex: 1,
    lineHeight: 22,
  },
  contentSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 24,
  },
  richTextContainer: {
    marginTop: 8,
  },
  playSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 14,
  },
  playButtonText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginLeft: 10,
  },
});
