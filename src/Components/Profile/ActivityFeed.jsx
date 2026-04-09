import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';
import { MaterialIcons } from '@expo/vector-icons';

const activityData = [
  {
    id: 1,
    title: 'Earned Flower Master Badge',
    time: '2 hours ago',
    points: '+50',
    icon: 'auto-awesome',
    iconBg: Colors.tertiaryContainer,
    iconColor: Colors.tertiary,
  },
  {
    id: 2,
    title: 'Labeled the Sunflower',
    time: 'Yesterday',
    points: '+10',
    icon: 'emoji-nature',
    iconBg: Colors.primaryContainer,
    iconColor: Colors.primary,
  },
  {
    id: 3,
    title: 'Completed Quarter 1',
    time: '3 days ago',
    points: '+100',
    icon: 'task-alt',
    iconBg: Colors.secondaryContainer,
    iconColor: Colors.secondary,
  },
];

export default function ActivityFeed() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Activity</Text>
      <View style={styles.list}>
        {activityData.map((item) => (
          <View key={item.id} style={styles.itemPill}>
            <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
              <MaterialIcons name={item.icon} size={20} color={item.iconColor} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemTime}>{item.time}</Text>
            </View>
            <View style={styles.pointsBox}>
              <Text style={[styles.pointsText, { color: item.iconColor }]}>{item.points}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 32,
    marginHorizontal: 20,
    marginTop: 20,
  },
  title: {
    fontFamily: 'Lexend-Bold',
    fontSize: 22,
    color: Colors.onSurface,
    marginBottom: 20,
  },
  list: {
    gap: 12,
  },
  itemPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    padding: 12,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(35, 26, 13, 0.05)',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  itemTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    color: Colors.onSurface,
  },
  itemTime: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  pointsBox: {
    paddingHorizontal: 12,
  },
  pointsText: {
    fontFamily: 'Lexend-Black',
    fontSize: 16,
  },
});
