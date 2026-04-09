import React from 'react';
import { StyleSheet } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { AntDesign, Feather } from '@expo/vector-icons';
import CustomDrawerContent from '@/Components/Navigation/CustomDrawerContent';
import Colors from '@/constants/colors';

const DrawerLayout = () => {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: Colors.surfaceContainerLow,
        },
        headerTitleStyle: {
          fontFamily: 'Lexend-Bold',
          fontSize: 18,
          color: Colors.onSurface,
        },
        headerTintColor: Colors.primary,
        drawerStyle: {
          backgroundColor: Colors.surface,
          width: 300,
        },
        drawerActiveTintColor: Colors.primary,
        drawerInactiveTintColor: Colors.onSurfaceVariant,
        drawerLabelStyle: {
          fontFamily: 'PlusJakartaSans-Bold',
          fontSize: 16,
        },
      }}
    >
      <Drawer.Screen
        name="Home"
        options={{
          title: "Home",
          drawerIcon: ({ color, size }) => (
            <AntDesign name="home" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Grades"
        options={{
          title: "Grades",
          drawerIcon: ({ color, size }) => (
            <Feather name="book-open" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Profile"
        options={{
          title: "Profile",
          drawerIcon: ({ color, size }) => (
            <AntDesign name="user" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Settings"
        options={{
          title: "Settings",
          drawerIcon: ({ color, size }) => (
            <AntDesign name="setting" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Calendar"
        options={{
          title: "Calendar",
          drawerIcon: ({ color, size }) => (
            <Feather name="calendar" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
};

export default DrawerLayout;
