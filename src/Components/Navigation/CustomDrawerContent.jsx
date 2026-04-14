import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { AntDesign, Feather } from '@expo/vector-icons';
import Colors from '@/constants/colors';

/**
 * CustomDrawerContent — The Tactile Discovery Garden Aesthetic
 * Implements a warm, paper-like navigation experience with soft shifts and bold typography.
 */
const CustomDrawerContent = (props) => {
  const router = useRouter();
  const { state, navigation } = props;

  // Find index of the currently active route
  const activeIndex = state.index;
  const activeRouteName = state.routeNames[activeIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* Brand Header Section */}
      <View style={styles.header}>
        <View style={styles.brandIcon}>
          <Text style={styles.brandLetter}>M</Text>
        </View>
        <View>
          <Text style={styles.brandTitle}>MathSync</Text>
          <Text style={styles.brandTagline}>Discovery Journal</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Navigation Items */}
        <View style={styles.navSection}>
          {state.routes.filter(route => route.name !== 'Calendar').map((route, index) => {
            const isFocused = state.index === index;
            const { options } = props.descriptors[route.key];
            const label = options.title !== undefined ? options.title : route.name;

            const getIcon = (color, size) => {
              if (options.drawerIcon) {
                return options.drawerIcon({ color, size });
              }
              return null;
            };

            return (
              <TouchableOpacity
                key={route.key}
                activeOpacity={0.7}
                onPress={() => navigation.navigate(route.name)}
                style={[
                  styles.navItem,
                  isFocused && styles.navItemActive
                ]}
              >
                <View style={[styles.iconWrapper, isFocused && styles.iconWrapperActive]}>
                  {getIcon(isFocused ? Colors.onPrimary : Colors.onSurfaceVariant, 22)}
                </View>
                <Text style={[
                  styles.navLabel,
                  isFocused && styles.navLabelActive
                ]}>
                  {label}
                </Text>
                {isFocused && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer / Logout Section */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => router.replace('/(auth)/SignIn')}
          >
            <Feather name="log-out" size={20} color={Colors.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface, // Warm Paper Base
  },
  header: {
    padding: 32,
    paddingTop: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerLow,
  },
  brandIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLetter: {
    fontFamily: 'Lexend-Black',
    fontSize: 24,
    color: '#ffffff',
  },
  brandTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 20,
    color: Colors.onSurface,
  },
  brandTagline: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: -2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  navSection: {
    gap: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    gap: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  navItemActive: {
    backgroundColor: Colors.surfaceContainerHigh, // Subtle shift instead of bold color
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconWrapperActive: {
    backgroundColor: Colors.primary,
  },
  navLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    color: Colors.onSurfaceVariant,
  },
  navLabelActive: {
    fontFamily: 'PlusJakartaSans-Bold',
    color: Colors.onSurface,
  },
  activeIndicator: {
    position: 'absolute',
    right: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    opacity: 0.1,
  },
  footer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerLow,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
  },
  logoutText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    color: Colors.error,
  },
});

export default CustomDrawerContent;
