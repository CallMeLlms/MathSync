import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import useUserStore from '@/stores/user-stores/useUserStore';
import AuthService from '@/services/authService';

export default function Settings() {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const resetStore = useUserStore((state) => state.resetStore);

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out?",
      "You will be returned to the login screen and local progress will be cleared for your privacy.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await AuthService.signOut();
            resetStore();
            router.replace('/(auth)/SignIn');
          }
        }
      ]
    );
  };

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

        {/* Danger Zone Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <TouchableOpacity 
            style={styles.signOutCard} 
            activeOpacity={0.7} 
            onPress={handleSignOut}
          >
            <View style={styles.iconContainer}>
              <Feather name="log-out" size={24} color={Colors.error} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.signOutTitle}>Sign Out</Text>
              <Text style={styles.signOutSubtitle}>Clear device data & return to login</Text>
            </View>
          </TouchableOpacity>
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
  signOutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(186, 26, 26, 0.08)', // Light transparent error color
    padding: 16,
    borderRadius: 20,
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextContainer: {
    flex: 1,
  },
  signOutTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 18,
    color: Colors.error,
  },
  signOutSubtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: Colors.error,
    opacity: 0.8,
    marginTop: 2,
  },
});
