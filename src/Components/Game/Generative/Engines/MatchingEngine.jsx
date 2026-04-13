import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, useWindowDimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence, 
  withTiming, 
  interpolateColor,
  runOnJS
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { shuffleArray } from '@/utils/generators/core/mathHelpers';

/**
 * MatchCard
 * Handles the individual selection, scaling, and matched feedback states.
 */
const MatchCard = React.memo(({ card, isSelected, isMatched, disabled, onPress, theme, size }) => {
  const scale = useSharedValue(1);
  const selectionProgress = useSharedValue(0);

  useEffect(() => {
    if (isMatched) {
      scale.value = withSequence(
        withSpring(1.15, { damping: 6, stiffness: 350 }),
        withSpring(1, { damping: 12, stiffness: 200 })
      );
      selectionProgress.value = withTiming(1, { duration: 300 });
    } else if (isSelected) {
      scale.value = withSpring(1.05, { damping: 8, stiffness: 400 });
      selectionProgress.value = withTiming(0.5, { duration: 150 });
    } else {
      scale.value = withSpring(1, { damping: 10, stiffness: 300 });
      selectionProgress.value = withTiming(0, { duration: 150 });
    }
  }, [isSelected, isMatched]);

  const tap = Gesture.Tap()
    .enabled(!disabled && !isMatched && !isSelected)
    .onBegin(() => {
      scale.value = withSpring(0.95, { damping: 10, stiffness: 300 });
    })
    .onTouchesUp(() => {
      if (onPress) runOnJS(onPress)(card.id);
    })
    .onFinalize(() => {
      // Revert if not selected immediately
      if (!isSelected && !isMatched) {
        scale.value = withSpring(1, { damping: 10, stiffness: 300 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    // 0 = Idle, 0.5 = Selected, 1 = Matched
    const backgroundColor = interpolateColor(
      selectionProgress.value,
      [0, 0.5, 1],
      [Colors.surface, `${theme.primaryColor}20`, '#4CAF5020']
    );

    const borderColor = interpolateColor(
      selectionProgress.value,
      [0, 0.5, 1],
      [Colors.outlineVariant, theme.primaryColor, '#4CAF50']
    );

    return {
      transform: [{ scale: scale.value }],
      backgroundColor,
      borderColor,
    };
  });

  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        style={[
          styles.card,
          { width: size, height: size },
          animatedStyle,
          isMatched && { borderBottomWidth: 3, borderRightWidth: 3 }
        ]}
      >
        <Text
          style={[
            styles.cardText,
            { color: isMatched ? '#2E7D32' : (isSelected ? theme.primaryColor : Colors.onSurfaceVariant) },
            { fontSize: size * 0.22, fontFamily: theme.fontFamily.title }
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {card.content}
        </Text>
        {isMatched && (
          <View style={styles.matchedBadge}>
            <Text style={styles.matchedBadgeText}>✓</Text>
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
});

/**
 * MatchingEngine
 * Generic matching engine that takes an array of pairs from generator metadata
 * and orchestrates a local Grid selection game.
 */
export default function MatchingEngine({ problem, onAnswer, theme }) {
  const { width } = useWindowDimensions();
  
  const [cards, setCards] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialization: Break pairs into shuffled cards
  useEffect(() => {
    if (!problem?.metadata?.pairs) return;

    const newCards = [];
    problem.metadata.pairs.forEach((pair, index) => {
      // Question Card
      newCards.push({
        id: `q-${index}`,
        pairId: index,
        content: pair.question
      });
      // Answer Card
      newCards.push({
        id: `a-${index}`,
        pairId: index,
        content: pair.answer
      });
    });

    setCards(shuffleArray(newCards));
    setSelectedIds([]);
    setMatchedIds([]);
    setIsProcessing(false);
  }, [problem]);

  // Win condition: fire onAnswer once all cards are matched. Side effects belong here, not in state updaters.
  useEffect(() => {
    if (cards.length > 0 && matchedIds.length === cards.length) {
      const timeoutId = setTimeout(() => {
        onAnswer(true, `${cards.length / 2} Pairs Matched`);
      }, 800);
      return () => clearTimeout(timeoutId);
    }
  }, [matchedIds, cards, onAnswer]);

  const handleCardPress = useCallback((id) => {
    if (isProcessing || selectedIds.includes(id) || matchedIds.includes(id)) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setSelectedIds(prev => {
      const updated = [...prev, id];
      
      if (updated.length === 2) {
        setIsProcessing(true);
        const card1 = cards.find(c => c.id === updated[0]);
        const card2 = cards.find(c => c.id === updated[1]);

        if (card1.pairId === card2.pairId) {
          // Match! Side effects happen outside setMatchedIds updater (which must be pure).
          setTimeout(() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setMatchedIds(mPrev => [...mPrev, updated[0], updated[1]]);
            setSelectedIds([]);
            setIsProcessing(false);
          }, 300);
        } else {
          // Mismatch
          setTimeout(() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setSelectedIds([]);
            setIsProcessing(false);
          }, 600); // Give user enough time to realize it was a mismatch
        }
      }
      
      return updated;
    });

  }, [cards, selectedIds, matchedIds, isProcessing, onAnswer]);

  if (!cards.length || !problem?.metadata) return null;

  // Grid math
  const cardCount = cards.length;
  const isTablet = width > 768;
  const columns = isTablet ? 4 : (cardCount <= 8 ? 2 : 3);
  const paddingX = 48; // Total horizontal padding in container
  const gap = 12; // Gap between cards
  const availableWidth = width - paddingX - (gap * (columns - 1));
  const maxCardSize = Math.min(120, Math.floor(availableWidth / columns)); 

  return (
    <View style={styles.container}>
      {/* Dynamic Header */}
      <View style={styles.headerContainer}>
        <Text style={[styles.instructionText, { fontFamily: theme.fontFamily.title, color: theme.primaryColor }]}>
          {problem.metadata.displayQuestion || "Find the matching pairs!"}
        </Text>
        <View style={[styles.progressBadge, { backgroundColor: `${theme.primaryColor}15` }]}>
          <Text style={[styles.progressText, { fontFamily: theme.fontFamily.accent, color: theme.primaryColor }]}>
            {matchedIds.length / 2} / {cardCount / 2} Pairs
          </Text>
        </View>
      </View>

      {/* Matching Grid */}
      <View style={styles.gridContainer}>
        <View style={styles.gridBox}>
          {cards.map((card) => (
            <MatchCard
              key={card.id}
              card={card}
              size={maxCardSize}
              theme={theme}
              isSelected={selectedIds.includes(card.id)}
              isMatched={matchedIds.includes(card.id)}
              disabled={isProcessing}
              onPress={handleCardPress}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  instructionText: {
    fontSize: 22,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 12,
  },
  progressBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
  },
  progressText: {
    fontSize: 16,
  },
  gridContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    maxWidth: 600, // Hard limit for tablets
  },
  // Card Internal Styles
  card: {
    borderRadius: 16,
    borderWidth: 3,
    borderBottomWidth: 5,
    borderRightWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  cardText: {
    textAlign: 'center',
  },
  matchedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    elevation: 2,
  },
  matchedBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  }
});
