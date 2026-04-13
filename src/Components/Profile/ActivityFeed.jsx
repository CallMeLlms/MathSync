import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Colors from '@/constants/colors';
import { MaterialIcons } from '@expo/vector-icons';
import useUserStore from '@/stores/user-stores/useUserStore';

function formatRelativeTime(timestampUtc) {
  const t = new Date(timestampUtc).getTime();
  if (Number.isNaN(t)) return 'Just now';

  const deltaMs = Date.now() - t;
  const deltaSec = Math.max(0, Math.floor(deltaMs / 1000));

  if (deltaSec < 60) return 'Just now';

  const deltaMin = Math.floor(deltaSec / 60);
  if (deltaMin < 60) return `${deltaMin}m ago`;

  const deltaHr = Math.floor(deltaMin / 60);
  if (deltaHr < 24) return `${deltaHr}h ago`;

  const deltaDay = Math.floor(deltaHr / 24);
  if (deltaDay === 1) return 'Yesterday';
  if (deltaDay < 7) return `${deltaDay}d ago`;

  return new Date(t).toLocaleDateString();
}

export default function ActivityFeed() {
  const recentActivity = useUserStore((s) => s.recentActivity) ?? [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Activity</Text>
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {recentActivity.map((item) => (
          <View key={item.id} style={styles.itemPill}>
            <View style={styles.iconCircle}>
              {item.iconType === 'emoji' ? (
                <Text style={styles.emojiIcon}>{item.iconValue}</Text>
              ) : (
                <MaterialIcons name={item.iconValue} size={20} color={Colors.primary} />
              )}
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle} numberOfLines={2}>
                {item.description}
              </Text>
              <Text style={styles.itemTime}>{formatRelativeTime(item.timestampUtc)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 24,
    marginHorizontal: 20,
    marginTop: 20,
  },
  title: {
    fontFamily: 'Lexend-Bold',
    fontSize: 20,
    color: Colors.onSurface,
    marginBottom: 14,
  },
  list: {
    maxHeight: 240,
  },
  listContent: {
    gap: 8,
    paddingBottom: 2,
  },
  itemPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    padding: 10,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryContainer,
  },
  emojiIcon: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    color: Colors.onSurface,
  },
  itemInfo: {
    flex: 1,
    paddingHorizontal: 10,
  },
  itemTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 13,
    color: Colors.onSurface,
  },
  itemTime: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 9,
    color: Colors.onSurfaceVariant,
    marginTop: 1,
  },
});
