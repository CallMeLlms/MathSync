import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert, RefreshControl, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@constants/Colors';
import classroomService from '../../src/services/classroom.service';

export default function Home() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // We don't have the user name locally mapped easily here, but we can hardcode fallback 
  const studentName = "Explorer";

  const fetchClassrooms = async () => {
    try {
      const res = await classroomService.getMyClassrooms();
      if (res.success) {
        setClassrooms(res.data);
      }
    } catch (error) {
      console.log('Error fetching classrooms', error);
      Alert.alert('Error', 'Could not load your classrooms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchClassrooms();
    setRefreshing(false);
  }, []);

  const handleJoinClassroom = async () => {
    if (!joinCode.trim()) {
      Alert.alert('Validation Error', 'Please enter a join code.');
      return;
    }
    setJoining(true);
    try {
      await classroomService.joinClassroom(joinCode);
      setJoinCode('');
      fetchClassrooms(); // Refresh list after joining
      Alert.alert('Success', 'Joined classroom successfully!');
    } catch (error) {
      Alert.alert('Join Failed', error.message || 'Invalid join code.');
    } finally {
      setJoining(false);
    }
  };

  // Helper arrays for rotating card colors
  const cardThemes = [
    { bg: '#d9e2ff', text: '#00429b', icon: 'palette' },       // Secondary-ish tint
    { bg: '#ffdad6', text: '#93000a', icon: 'calculate' },     // Error/Red-ish tint
    { bg: '#69ff87', text: '#00531e', icon: 'science' },       // Tertiary/Green-ish tint
    { bg: '#ffdbcb', text: '#7a3000', icon: 'menu-book' }      // Primary/Orange tint
  ];

  const renderClassroomItem = ({ item, index }) => {
    const sectionId = item.section?._id;
    const classCode = item.section?.classCode || 'NO-CD';
    const sectionName = item.section?.name || 'NO-NAME';
    const theme = cardThemes[index % cardThemes.length];

    return (
      <TouchableOpacity
        key={item._id || index}
        style={styles.classCard}
        activeOpacity={0.8}
        onPress={() => router.push(`/classroom/${item._id}?sectionId=${sectionId}`)}
      >
        {/* Top Image / Banner Block */}
        <View style={[styles.cardBanner, { backgroundColor: theme.bg }]}>
          <View style={styles.badgeContainer}>
            <Text style={[styles.badgeText, { color: theme.text }]}>{classCode}</Text>
          </View>
          <MaterialIcons name={theme.icon} size={64} color={theme.text} style={{ opacity: 0.15, position: 'absolute', right: -10, bottom: -10 }} />
        </View>

        {/* Content Block */}
        <View style={styles.cardContent}>
          <Text style={styles.className} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.classSubtitle}>{sectionName}</Text>

          <View style={styles.cardFooter}>
            {/* Avatars mockup container */}
            <View style={styles.avatarGroup}>
              <View style={[styles.avatarCircle, { backgroundColor: Colors.primaryContainer, zIndex: 3 }]}><Feather name="user" size={12} color={Colors.primary} /></View>
              <View style={[styles.avatarCircle, { backgroundColor: '#d9e2ff', zIndex: 2 }]}><Feather name="user" size={12} color="#00429b" /></View>
              <View style={[styles.avatarCircle, { backgroundColor: '#69ff87', zIndex: 1 }]}><Feather name="user" size={12} color="#00531e" /></View>
            </View>

            <MaterialIcons name={theme.icon} size={28} color={theme.text} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {/* Welcome Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Hello, <Text style={{ color: Colors.primary }}>{studentName}!</Text></Text>
          <Text style={styles.heroTitleSub}>Ready to explore?</Text>
          <Text style={styles.heroDesc}>Your garden of knowledge is waiting. Which classroom will you visit today?</Text>

          <View style={styles.joinInputContainer}>
            <View style={styles.joinInputBox}>
              <Feather name="search" size={20} color={Colors.onSurfaceVariant} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.joinInput}
                placeholder="Enter Class Code"
                value={joinCode}
                onChangeText={setJoinCode}
                autoCapitalize="characters"
                placeholderTextColor={Colors.onSurfaceVariant}
              />
            </View>
            <TouchableOpacity
              style={styles.joinButton}
              onPress={handleJoinClassroom}
              disabled={joining}
            >
              {joining ? <ActivityIndicator size="small" color="#FFF" /> : <Feather name="plus" size={24} color="#FFF" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Classroom Grid */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>My Classrooms</Text>
          <View style={styles.dotsRow}>
            <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
            <View style={[styles.dot, { backgroundColor: Colors.secondary }]} />
            <View style={[styles.dot, { backgroundColor: Colors.tertiary }]} />
          </View>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : classrooms.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={48} color={Colors.onSurfaceVariant} />
            <Text style={styles.emptyText}>You haven't joined any classrooms yet.</Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {classrooms.map((item, index) => renderClassroomItem({ item, index }))}
          </View>
        )}

        {/* Progress Bloom Section */}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface, // Background is #fff8f3
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100, // accommodate bottom nav if needed
  },
  heroSection: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest, // Replaced shadow with tonal border
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  heroTitle: {
    fontFamily: 'Lexend-Black',
    fontSize: 28,
    color: Colors.onSurface,
  },
  heroTitleSub: {
    fontFamily: 'Lexend-Black',
    fontSize: 28,
    color: Colors.onSurface,
    marginBottom: 12,
  },
  heroDesc: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    marginBottom: 24,
    lineHeight: 24,
  },
  joinInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 10,
  },
  joinInputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  joinInput: {
    flex: 1,
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    color: Colors.onSurface,
  },
  joinButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 24,
    color: Colors.onSurface,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  gridContainer: {
    gap: 20,
    marginBottom: 32,
  },
  classCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.surfaceContainerLow, // Soft tonal layer instead of shadow
    overflow: 'hidden',
  },
  cardBanner: {
    height: 120,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  badgeContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  badgeText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
  },
  cardContent: {
    padding: 20,
  },
  className: {
    fontFamily: 'Lexend-Bold',
    fontSize: 20,
    color: Colors.onSurface,
    marginBottom: 4,
  },
  classSubtitle: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHighest,
  },
  avatarGroup: {
    flexDirection: 'row',
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ffffff',
    marginLeft: -8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    marginTop: 12,
  },

});
