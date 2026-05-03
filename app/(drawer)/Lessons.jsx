import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView,
  RefreshControl,
  StatusBar
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import lessonCacheService from '@services/lessonCacheService';

export default function LessonsScreen() {
  const [cachedLessons, setCachedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadCachedLessons = async () => {
    try {
      const lessons = await lessonCacheService.getAllCachedLessons();
      setCachedLessons(lessons);
    } catch (error) {
      console.error('Error loading cached lessons:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCachedLessons();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadCachedLessons();
  };

  const renderLessonItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.lessonCard}
      onPress={() => {
        const gradeParam = item.gradeLevel ? `G${item.gradeLevel}` : '';
        router.push({
          pathname: `/classroom/lesson/${item._id}`,
          params: { grade: gradeParam }
        });
      }}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="book-open-variant" size={24} color={Colors.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.lessonTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.lessonDescription} numberOfLines={2}>
            {item.description || 'No description available.'}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Feather name="clock" size={12} color={Colors.onSurfaceVariant} />
              <Text style={styles.metaText}>{item.duration} mins</Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="layers" size={12} color={Colors.onSurfaceVariant} />
              <Text style={styles.metaText}>Grade {item.gradeLevel}</Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="download" size={12} color="#4CAF50" />
              <Text style={[styles.metaText, { color: '#4CAF50' }]}>Available Offline</Text>
            </View>
          </View>
        </View>
        <Feather name="chevron-right" size={20} color={Colors.onSurfaceVariant} />
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Lessons</Text>
        <Text style={styles.headerSubtitle}>View your downloaded and cached lessons</Text>
      </View>

      <FlatList
        data={cachedLessons}
        renderItem={renderLessonItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Feather name="download-cloud" size={48} color={Colors.onSurfaceVariant} />
            </View>
            <Text style={styles.emptyTitle}>No Lessons Cached</Text>
            <Text style={styles.emptySubtitle}>
              Lessons you view while online are automatically saved for offline access.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 28,
    color: '#1E293B',
  },
  headerSubtitle: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  lessonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  lessonTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 17,
    color: '#0F172A',
    marginBottom: 4,
  },
  lessonDescription: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 11,
    color: '#64748B',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 20,
    color: '#334155',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});
