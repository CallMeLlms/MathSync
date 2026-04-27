import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import classroomService from '@/services/classroomService';
import gameAnalyticsService from '@/services/gameAnalyticsService';

// ─── Medal helpers ────────────────────────────────────────────────────────────

const MEDAL_CONFIGS = [
  { color: '#F5A623', bg: '#FFF8E1', border: '#F5A623', label: '🥇' },
  { color: '#9E9E9E', bg: '#F5F5F5', border: '#BDBDBD', label: '🥈' },
  { color: '#CD7F32', bg: '#FBE9E7', border: '#CD7F32', label: '🥉' },
];

function getRankConfig(index) {
  return MEDAL_CONFIGS[index] || null;
}

// ─── Leaderboard Row ─────────────────────────────────────────────────────────

function LeaderboardRow({ entry, index }) {
  const medal = getRankConfig(index);
  const isTop3 = index < 3;

  return (
    <View style={[styles.row, isTop3 && styles.rowTop3, medal && { borderLeftColor: medal.color, backgroundColor: medal.bg }]}>
      {/* Rank */}
      <View style={styles.rankBox}>
        {isTop3 ? (
          <Text style={styles.medalEmoji}>{medal.label}</Text>
        ) : (
          <Text style={styles.rankNumber}>#{entry.rank}</Text>
        )}
      </View>

      {/* Avatar */}
      <View style={[styles.avatarBox, medal && { borderColor: medal.color }]}>
        {entry.student?.avatar ? (
          <Image source={{ uri: entry.student.avatar }} style={styles.avatarImage} />
        ) : (
          <Feather name="user" size={18} color={Colors.onSurfaceVariant} />
        )}
      </View>

      {/* Name + stats */}
      <View style={styles.nameBlock}>
        <Text style={[styles.username, isTop3 && { color: Colors.onSurface }]} numberOfLines={1}>
          {entry.student?.username ?? 'Unknown'}
        </Text>
        <Text style={styles.subStats}>
          {entry.totalSubmissions} {entry.totalSubmissions === 1 ? 'play' : 'plays'} · {entry.passRate}% pass rate
        </Text>
      </View>

      {/* Score */}
      <View style={styles.scoreBox}>
        <Text style={[styles.scoreValue, medal && { color: medal.color }]}>
          {entry.averageScore}%
        </Text>
        <Text style={styles.scoreLabel}>avg</Text>
      </View>
    </View>
  );
}

// ─── Classroom Selector Chip ──────────────────────────────────────────────────

function ClassroomChip({ item, isActive, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.chip, isActive && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, isActive && styles.chipTextActive]} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function Leaderboard() {
  const [classrooms, setClassrooms] = useState([]);
  const [classroomsLoading, setClassroomsLoading] = useState(true);

  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(null);

  const [refreshing, setRefreshing] = useState(false);

  // ── Fetch classrooms ──────────────────────────────────────────────────────
  const fetchClassrooms = useCallback(async () => {
    try {
      const res = await classroomService.getMyClassrooms();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setClassrooms(res.data);
        // Auto-select first classroom
        if (!selectedClassroom) {
          setSelectedClassroom(res.data[0]);
        }
      } else {
        setClassrooms([]);
      }
    } catch (err) {
      console.log('Error fetching classrooms for leaderboard', err);
    } finally {
      setClassroomsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClassrooms();
  }, [fetchClassrooms]);

  // ── Fetch leaderboard whenever classroom changes ───────────────────────────
  useEffect(() => {
    if (!selectedClassroom) return;
    fetchLeaderboard(selectedClassroom);
  }, [selectedClassroom]);

  const fetchLeaderboard = async (classroom) => {
    const sectionId = classroom?.section?._id;
    if (!sectionId) {
      setLeaderboardError('No section found for this classroom.');
      return;
    }

    setLeaderboardLoading(true);
    setLeaderboardError(null);
    setLeaderboard([]);

    try {
      const res = await gameAnalyticsService.getSectionLeaderboard(sectionId);
      if (res.success) {
        setLeaderboard(res.data || []);
      } else {
        setLeaderboardError('Failed to load leaderboard.');
      }
    } catch (err) {
      setLeaderboardError(err.message || 'Failed to load leaderboard.');
    } finally {
      setLeaderboardLoading(false);
    }
  };

  // ── Pull to refresh ───────────────────────────────────────────────────────
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchClassrooms();
    if (selectedClassroom) await fetchLeaderboard(selectedClassroom);
    setRefreshing(false);
  }, [selectedClassroom]);

  // ── Renders ───────────────────────────────────────────────────────────────

  if (classroomsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (classrooms.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <MaterialCommunityIcons name="trophy-outline" size={56} color={Colors.outlineVariant} />
          <Text style={styles.emptyTitle}>No Classrooms</Text>
          <Text style={styles.emptyDesc}>
            Join a classroom first to see leaderboard rankings.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {/* ── Hero Header ─────────────────────────────────────────────── */}
        <View style={styles.hero}>
          <View style={styles.heroIconWrap}>
            <MaterialCommunityIcons name="trophy" size={32} color={Colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Leaderboard</Text>
          <Text style={styles.heroDesc}>
            See how you rank against your classmates.
          </Text>
        </View>

        {/* ── Classroom Tabs ───────────────────────────────────────────── */}
        {classrooms.length > 1 && (
          <View style={styles.chipRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
              {classrooms.map((item) => (
                <ClassroomChip
                  key={item._id}
                  item={item}
                  isActive={selectedClassroom?._id === item._id}
                  onPress={() => setSelectedClassroom(item)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Selected classroom label ─────────────────────────────────── */}
        {selectedClassroom && (
          <View style={styles.sectionLabel}>
            <Feather name="layers" size={14} color={Colors.onSurfaceVariant} />
            <Text style={styles.sectionLabelText}>
              {selectedClassroom.name}
              {selectedClassroom.section?.name ? `  ·  ${selectedClassroom.section.name}` : ''}
            </Text>
          </View>
        )}

        {/* ── Leaderboard content ──────────────────────────────────────── */}
        {leaderboardLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading rankings…</Text>
          </View>
        ) : leaderboardError ? (
          <View style={styles.errorBox}>
            <MaterialCommunityIcons name="alert-circle-outline" size={40} color={Colors.error} />
            <Text style={styles.errorTitle}>No Rankings Yet</Text>
            <Text style={styles.errorDesc}>{leaderboardError}</Text>
          </View>
        ) : leaderboard.length === 0 ? (
          <View style={styles.errorBox}>
            <MaterialCommunityIcons name="trophy-outline" size={48} color={Colors.outlineVariant} />
            <Text style={styles.errorTitle}>No Data Yet</Text>
            <Text style={styles.errorDesc}>
              Students haven't played any lessons yet. Complete a lesson game to appear here!
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {leaderboard.map((entry, index) => (
              <LeaderboardRow key={entry.student?._id ?? index} entry={entry} index={index} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },

  // Hero
  hero: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  heroIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: Colors.outlineVariant,
  },
  heroTitle: {
    fontFamily: 'Lexend-Black',
    fontSize: 28,
    color: Colors.onSurface,
    marginBottom: 6,
  },
  heroDesc: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },

  // Chips
  chipRow: {
    marginBottom: 16,
  },
  chipScroll: {
    gap: 10,
    paddingBottom: 4,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLow,
  },
  chipActive: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.primary,
  },
  chipText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  chipTextActive: {
    color: Colors.primary,
  },

  // Section label
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionLabelText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },

  // List
  listContainer: {
    gap: 10,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    borderLeftWidth: 5,
    borderLeftColor: Colors.outlineVariant,
    gap: 12,
  },
  rowTop3: {
    borderWidth: 2,
    borderBottomWidth: 4,
  },

  // Rank
  rankBox: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalEmoji: {
    fontSize: 22,
  },
  rankNumber: {
    fontFamily: 'Lexend-Bold',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },

  // Avatar
  avatarBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerHigh,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },

  // Name block
  nameBlock: {
    flex: 1,
  },
  username: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 15,
    color: Colors.onSurface,
    marginBottom: 2,
  },
  subStats: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },

  // Score
  scoreBox: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontFamily: 'Lexend-Black',
    fontSize: 20,
    color: Colors.secondary,
  },
  scoreLabel: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // States
  centered: {
    flex: 1,
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  emptyTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 20,
    color: Colors.onSurface,
    marginTop: 16,
  },
  emptyDesc: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginTop: 8,
  },
  errorBox: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    marginTop: 8,
    gap: 10,
  },
  errorTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 18,
    color: Colors.onSurface,
  },
  errorDesc: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
