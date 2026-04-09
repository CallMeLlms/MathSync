import React from 'react';
import { View, StyleSheet } from 'react-native';
import StatCard from './StatCard';
import Colors from '@/constants/colors';

export default function StatSection() {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.row}>
        <StatCard 
          title="Problems Solved" 
          value="142" 
          iconName="check-circle" 
          color={Colors.tertiary} 
        />
        <StatCard 
          title="Accuracy" 
          value="85%" 
          iconName="target" 
          color={Colors.secondary} 
        />
      </View>
      <View style={styles.row}>
        <StatCard 
          title="Current Streak" 
          value="5 Days" 
          iconName="zap" 
          color={Colors.primary} 
        />
        <StatCard 
          title="Time Spent" 
          value="4.2 Hrs" 
          iconName="clock" 
          color={Colors.outlineVariant} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
