import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView } from 'react-native';
import Colors from '@/constants/colors';
import useUserStore from '@/stores/user-stores/useUserStore';

export default function Settings() {
  const profile = useUserStore((state) => state.profile);

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'E';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.profileCard}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarLetter}>{getInitial(profile?.name)}</Text>
            </View>
            <View>
              <Text style={styles.profileName}>{profile?.name || 'Explorer'}</Text>
              <Text style={styles.profileLevel}>Level {profile?.level || 1}</Text>
            </View>
          </View>
        </View>



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
    padding: 24,
    gap: 32,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontFamily: 'Lexend-Medium',
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    marginLeft: 4,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHigh, // Tonal layering, no shadow
    padding: 16,
    borderRadius: 20,
    gap: 16,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontFamily: 'Lexend-Bold',
    fontSize: 24,
    color: Colors.onPrimary,
  },
  profileName: {
    fontFamily: 'Lexend-Bold',
    fontSize: 18,
    color: Colors.onSurface,
  },
  profileLevel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
});
