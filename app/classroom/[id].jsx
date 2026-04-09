import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import classroomService from '../../src/services/classroom.service';
import assignmentService from '../../src/services/assignment.service';

export default function ClassroomDetail() {
  const router = useRouter();
  const { id, sectionId } = useLocalSearchParams(); // id = classId

  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons' or 'assignments'

  const [classDetails, setClassDetails] = useState(null);
  const [lessonsData, setLessonsData] = useState([]); // This holds quarters
  const [assignments, setAssignments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [expandedQuarters, setExpandedQuarters] = useState({});

  useEffect(() => {
    fetchData();
  }, [id, sectionId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch classroom name/details
      if (id) {
        const cDetails = await classroomService.getClassroomDetails(id);
        if (cDetails.success) {
          setClassDetails(cDetails.data);
        }
      }

      // Fetch Lessons & Assignments
      if (sectionId) {
        const [lessRes, assRes] = await Promise.all([
          classroomService.getLessonsBySection(sectionId),
          assignmentService.getAssignments(sectionId)
        ]);

        if (lessRes.success) {
          setLessonsData(lessRes.quarters || []);
        }
        if (assRes && Array.isArray(assRes)) {
          setAssignments(assRes);
        }
      }
    } catch (error) {
      console.log('Error fetching classroom data', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleQuarter = (quarterNum) => {
    setExpandedQuarters(prev => ({
      ...prev,
      [quarterNum]: !prev[quarterNum]
    }));
  };

  // --- Rendering Functions ---

  const renderLessons = () => {
    if (lessonsData.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Feather name="book" size={48} color={Colors.onSurfaceVariant} />
          <Text style={styles.emptyText}>No lessons available yet.</Text>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {lessonsData.map((quarterData, index) => {
          const isExpanded = expandedQuarters[quarterData.quarter];
          return (
            <View key={index} style={styles.quarterCard}>
              <TouchableOpacity
                style={styles.quarterHeader}
                activeOpacity={0.8}
                onPress={() => toggleQuarter(quarterData.quarter)}
              >
                <Text style={styles.quarterTitle}>Quarter {quarterData.quarter}</Text>
                <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={24} color={Colors.onSurface} />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.quarterContent}>
                  {/* Learning Outcomes */}
                  {quarterData.learningOutcomes && quarterData.learningOutcomes.length > 0 && (
                    <View style={styles.outcomesContainer}>
                      <Text style={styles.sectionSubTitle}>Learning Outcomes:</Text>
                      {quarterData.learningOutcomes.map((outcome, idx) => (
                        <Text key={idx} style={styles.outcomeLine}>• {outcome}</Text>
                      ))}
                    </View>
                  )}

                  {/* Lesson Cards */}
                  <Text style={[styles.sectionSubTitle, { marginTop: 16 }]}>Lessons:</Text>
                  {(!quarterData.lessons || quarterData.lessons.length === 0) ? (
                    <Text style={styles.noLessonsText}>No lessons assigned.</Text>
                  ) : (
                    quarterData.lessons.map((lesson) => (
                      <TouchableOpacity
                        key={lesson._id}
                        style={styles.lessonCard}
                        activeOpacity={0.8}
                        onPress={() => router.push(`/classroom/lesson/${lesson._id}?sectionId=${sectionId}`)}
                      >
                        <View style={styles.lessonIconBox}>
                          <MaterialIcons name="play-lesson" size={24} color={Colors.primary} />
                        </View>
                        <View style={styles.lessonInfo}>
                          <Text style={styles.lessonTitle}>{lesson.title}</Text>
                          <Text style={styles.lessonDesc} numberOfLines={2}>{lesson.description}</Text>
                        </View>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    );
  };

  const renderAssignments = () => {
    if (assignments.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Feather name="file-text" size={48} color={Colors.onSurfaceVariant} />
          <Text style={styles.emptyText}>No assignments posted.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={assignments}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.assignmentCard}
            activeOpacity={0.8}
            onPress={() => router.push(`/classroom/assignment/${item._id}?sectionId=${sectionId}`)}
          >
            <View style={styles.assignmentIconBox}>
              <Feather name="edit-3" size={24} color="#FFF" />
            </View>
            <View style={styles.assignmentInfo}>
              <Text style={styles.assignmentTitle}>{item.title}</Text>
              <Text style={styles.assignmentPoints}>{item.points} Points Available</Text>
              <Text style={styles.assignmentPoints}>
                Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'No Due Date'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: classDetails ? classDetails.name : 'Classroom',
          headerStyle: { backgroundColor: Colors.surface, elevation: 0, shadowOpacity: 0 },
          headerTitleStyle: { fontFamily: 'Lexend-Bold', fontSize: 18, color: Colors.onSurface },
          headerTintColor: Colors.primary,
          headerBackTitleVisible: false
        }}
      />

      {/* Custom Minimalist Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'lessons' && styles.tabButtonActive]}
          onPress={() => setActiveTab('lessons')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'lessons' && styles.tabTextActive]}>Lessons</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'assignments' && styles.tabButtonActive]}
          onPress={() => setActiveTab('assignments')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'assignments' && styles.tabTextActive]}>Assignments</Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <View style={styles.contentArea}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          activeTab === 'lessons' ? renderLessons() : renderAssignments()
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    color: Colors.onSurfaceVariant,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  contentArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 16,
  },

  // Lessons Styles
  quarterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quarterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  quarterTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 20,
    color: Colors.onSurface,
  },
  quarterContent: {
    padding: 20,
    paddingTop: 0,
    backgroundColor: '#FFFFFF',
  },
  sectionSubTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    color: Colors.onSurface,
    marginBottom: 8,
  },
  outcomesContainer: {
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
  },
  outcomeLine: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: 4,
  },
  noLessonsText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  lessonCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F7FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  lessonIconBox: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    color: Colors.onSurface,
  },
  lessonDesc: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },

  // Assignments Styles
  assignmentCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  assignmentIconBox: {
    width: 48,
    height: 48,
    backgroundColor: Colors.secondary || '#9C27B0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentTitle: {
    fontFamily: 'Lexend-SemiBold',
    fontSize: 18,
    color: Colors.onSurface,
    marginBottom: 4,
  },
  assignmentPoints: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  }
});
