import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';
import { MaterialIcons } from '@expo/vector-icons';

const achievementData = [
  {
    id: 1,
    title: 'Seed Growth',
    progress: 80,
    icon: 'local-florist',
    iconBg: Colors.primaryContainer,
    iconColor: Colors.primary,
    trackColor: Colors.tertiary,
  },
  {
    id: 2,
    title: 'Bug Safari',
    progress: 45,
    icon: 'bug-report',
    iconBg: Colors.secondaryContainer,
    iconColor: Colors.secondary,
    trackColor: Colors.secondary,
  },
];

export default function AchievementSection() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Learning Achievement</Text>
      </View>

      <View style={styles.grid}>
        {achievementData.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
                <MaterialIcons name={item.icon} size={24} color={item.iconColor} />
              </View>
              <Text style={[styles.percentage, { color: item.iconColor }]}>{item.progress}%</Text>
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${item.progress}%`, backgroundColor: item.trackColor }]} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Lexend-Bold',
    fontSize: 22,
    color: Colors.onSurface,
  },
  link: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    color: Colors.secondary,
  },
  grid: {
    flexDirection: 'row',
    gap: 16,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.onPrimary,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(35, 26, 13, 0.05)',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconBox: {
    padding: 8,
    borderRadius: 12,
  },
  percentage: {
    fontFamily: 'Lexend-Black',
    fontSize: 18,
  },
  cardTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 16,
    color: Colors.onSurface,
    marginBottom: 12,
  },
  progressBar: {
    height: 12,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 6,
    overflow: 'hidden',
    padding: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});
