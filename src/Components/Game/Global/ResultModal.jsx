import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue,
  withTiming,
  interpolate
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import SequenceVisualizer from '@/Components/Game/Global/Visualizers/SequenceVisualizer';
import FractionShapeVisual from '@/Components/Game/Global/Visualizers/FractionShapeVisual';
import StaticClockFace from '@/Components/Game/Global/StaticClockFace';
import AssetDisplay from '@/Components/Game/Global/AssetDisplay';
import speechManager from '@/utils/speechManager';

/**
 * ResultModal
 * Detailed feedback modal for all game modes.
 * Focuses on pedagogical explanation and visual answer review.
 */
export default function ResultModal({
  isVisible,
  isCorrect,
  problem,
  userAnswer,
  resultMeta,
  onContinue,
  theme
}) {
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);
  const pressTranslation = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      opacity.value = withSpring(1);
    } else {
      scale.value = 0.85;
      opacity.value = 0;
    }
  }, [isVisible, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }]
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: pressTranslation.value }],
      borderBottomWidth: interpolate(
        pressTranslation.value,
        [0, 4],
        [6, 2]
      )
    };
  });

  const emoji = isCorrect ? '🎉' : '💪';
  const statusTitle = isCorrect ? 'Great job!' : 'Let us proceed to the next question';
  const statusColor = isCorrect ? Colors.success : Colors.error;

  useEffect(() => {
    if (isVisible) {
      speechManager.speakFeedback(statusTitle, isCorrect);
    }
  }, [isVisible, isCorrect, statusTitle]);

  if (!isVisible) return null;

  const metadata = problem?.metadata || {};

  const isAssetId = (val) => typeof val === 'string' && (val.includes('_') || val.startsWith('icon_') || val.startsWith('emoji:'));
  const isFractionShapeItem = (item) => (
    item
    && typeof item === 'object'
    && item.shape
    && item.fraction
  );
  const isClockSetterItem = (item) => (
    item
    && typeof item === 'object'
    && item.hour !== undefined
    && item.minute !== undefined
    && item.timeText
  );

  const renderClockSetterFeedback = (items, label) => {
    const safeItems = (Array.isArray(items) ? items : [items]).filter(isClockSetterItem);

    return (
      <View style={styles.reviewBlock}>
        <Text style={[styles.reviewLabel, { fontFamily: theme.fontFamily.body }]}>{label}:</Text>
        <View style={styles.clockSetterList}>
          {safeItems.map((item, index) => (
            <View key={`${item.timeText}-${index}`} style={styles.clockSetterCard}>
              <StaticClockFace
                hour={item.hour}
                minute={item.minute}
                size={112}
              />
              <View style={styles.clockSetterTextGroup}>
                <Text style={[styles.clockSetterTime, { fontFamily: theme.fontFamily.accent }]}>
                  {item.timeText}
                </Text>
                {!!item.helperText && (
                  <Text style={[styles.clockSetterHelper, { fontFamily: theme.fontFamily.body }]}>
                    {item.helperText}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderFractionShapeFeedback = (items, label) => {
    const safeItems = (Array.isArray(items) ? items : [items]).filter(isFractionShapeItem);

    return (
      <View style={styles.reviewBlock}>
        <Text style={[styles.reviewLabel, { fontFamily: theme.fontFamily.body }]}>{label}:</Text>
        <View style={styles.fractionShapeList}>
          {safeItems.map((item, index) => (
            <View key={`${item.shape}-${item.fraction}-${index}`} style={styles.fractionShapeCard}>
              <FractionShapeVisual
                shape={item.shape}
                fraction={item.fraction}
                size={104}
                style={styles.fractionShapeVisual}
              />
              <View style={styles.fractionShapeTextGroup}>
                <Text style={[styles.fractionShapeFraction, { fontFamily: theme.fontFamily.accent }]}>
                  {item.fraction}
                </Text>
                {!!item.answer && (
                  <Text style={[styles.fractionShapeAnswer, { fontFamily: theme.fontFamily.body }]}>
                    {item.answer}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderComparePileAssets = (item) => {
    const count = Number(item?.count) || 0;

    if (item?.tensAsset && item?.onesAsset) {
      const tens = Math.floor(count / 10);
      const ones = count % 10;
      return (
        <>
          {Array.from({ length: tens }).map((_, index) => (
            <AssetDisplay
              key={`ten-${index}`}
              assetId={item.tensAsset}
              style={styles.comparePileAssetTen}
              emojiSize={22}
            />
          ))}
          {Array.from({ length: ones }).map((_, index) => (
            <AssetDisplay
              key={`one-${index}`}
              assetId={item.onesAsset}
              style={styles.comparePileAsset}
              emojiSize={20}
            />
          ))}
        </>
      );
    }

    return Array.from({ length: Math.min(count, 10) }).map((_, index) => (
      <AssetDisplay
        key={`asset-${index}`}
        assetId={item?.assetId}
        style={styles.comparePileAsset}
        emojiSize={20}
      />
    ));
  };

  const renderComparePickerFeedback = (items, label) => {
    const safeItems = (Array.isArray(items) ? items : [items]).filter(Boolean);

    return (
      <View style={styles.reviewBlock}>
        <Text style={[styles.reviewLabel, { fontFamily: theme.fontFamily.body }]}>{label}:</Text>
        <View style={styles.comparePileRow}>
          {safeItems.map((item, index) => (
            <View key={item?.key || index} style={styles.comparePileCard}>
              <View style={styles.comparePileHeader}>
                <Text style={[styles.comparePileLabel, { fontFamily: theme.fontFamily.body }]}>
                  {item?.label || 'Pile'}
                </Text>
                <Text style={[styles.comparePileCount, { fontFamily: theme.fontFamily.accent }]}>
                  {item?.count}
                </Text>
              </View>
              <View style={styles.comparePileGrid}>
                {renderComparePileAssets(item)}
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Decide which visualizer to use based on topic
  const renderVisualizer = (items, label, isCorrectValue) => {
    // Normalize items to array of strings
    const safeItems = (Array.isArray(items) ? items : [items]).filter(Boolean);
    const hasAssets = safeItems.some(isAssetId);
    const shouldRenderSequence = resultMeta?.displayMode === 'sequence'
      || metadata.type === 'ordering-numbers'
      || metadata.type === 'ordering-decimals';

    if (resultMeta?.displayMode === 'clock-setter' && safeItems.some(isClockSetterItem)) {
      return renderClockSetterFeedback(safeItems, label);
    }

    if (resultMeta?.displayMode === 'fraction-shape' && safeItems.some(isFractionShapeItem)) {
      return renderFractionShapeFeedback(safeItems, label);
    }

    if (resultMeta?.displayMode === 'compare-picker') {
      return renderComparePickerFeedback(safeItems, label);
    }

    if (shouldRenderSequence) {
      return (
        <View style={styles.reviewBlock}>
          <Text style={[styles.reviewLabel, { fontFamily: theme.fontFamily.body }]}>{label}:</Text>
          <SequenceVisualizer
            items={safeItems}
            isCorrect={isCorrectValue}
            theme={theme}
          />
        </View>
      );
    }

    if (hasAssets) {
      return (
        <View style={styles.reviewBlock}>
          <Text style={[styles.reviewLabel, { fontFamily: theme.fontFamily.body }]}>{label}:</Text>
          <View style={styles.assetRow}>
            {safeItems.map((item, idx) => {
              const strItem = String(item).trim();
              if (isAssetId(strItem)) {
                return (
                  <View key={idx} style={styles.assetWrapper}>
                    <AssetDisplay assetId={strItem} style={styles.feedbackAsset} />
                  </View>
                );
              }
              return (
                <View key={idx} style={styles.textWrapper}>
                  <Text style={[styles.reviewText, { fontFamily: theme.fontFamily.accent, fontSize: 16 }]}>
                    {strItem}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      );
    }
    // Fallback for simple text answers
    return (
      <View style={styles.reviewBlock}>
        <Text style={[styles.reviewLabel, { fontFamily: theme.fontFamily.body }]}>{label}:</Text>
        <Text style={[styles.reviewText, { fontFamily: theme.fontFamily.accent }]}>
          {safeItems.join('\n')}
        </Text>
      </View>
    );
  };

  const getUserAnswerArray = () => {
    if (Array.isArray(resultMeta?.userAnswerItems)) return resultMeta.userAnswerItems;
    if (!userAnswer) return [];
    if (Array.isArray(userAnswer)) return userAnswer;
    if (typeof userAnswer === 'string') return userAnswer.split(', ');
    return [String(userAnswer)];
  };

  const getCorrectAnswerArray = () => {
    if (Array.isArray(resultMeta?.correctAnswerItems)) return resultMeta.correctAnswerItems;

    // 1. ShapeHuntEngine
    if (problem?.items && Array.isArray(problem.items)) {
      const targets = problem.items.filter(i => i.isTarget).map(i => i.assetId);
      if (targets.length > 0) return targets;
    }
    
    // 2. ShapeTracerEngine
    if (problem?.type === 'SHAPETRACER') {
      return ['80% to 100% Traced'];
    }
    
    // 3. GeoboardEngine
    if (problem?.type === 'GEOBOARD') {
      const shape = problem?.shape?.toLowerCase();
      if (shape === 'triangle') return ['shape_triangle', 'Triangle'];
      if (shape === 'square') return ['shape_square', 'Square'];
      if (shape === 'rectangle') return ['shape_rectangle', 'Rectangle'];
      return [problem?.shape || ''];
    }

    // 4. Default / Existing Logic
    if (metadata.correctOrder) return metadata.correctOrder;
    
    if (problem?.answer !== undefined) {
      if ((problem?.type === 'PICKER' || problem?.type === 'VISUAL_PICKER') && problem?.assetId) {
        if (problem.answer === problem.assetId) return [problem.answer];
        return [problem.assetId, problem.answer];
      }
      return [problem.answer];
    }
    
    if (problem?.target !== undefined) return [problem.target];
    if (problem?.pairs) return ['Match the pairs'];
    return ['']; // Safest fallback
  };

  return (
    <View style={[StyleSheet.absoluteFillObject, styles.overlay]}>
        <Animated.View style={[styles.card, animatedStyle, { borderColor: statusColor }]}>
          
          {/* Hero Section */}
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={[styles.title, { fontFamily: theme.fontFamily.title, color: statusColor }]}>
            {statusTitle}
          </Text>

          {/* Main Visual Review Section */}
          <View style={styles.contentContainer}>
            <View style={styles.reviewContainer}>
              <ScrollView
                style={styles.reviewScroll}
                contentContainerStyle={styles.reviewScrollContent}
                showsVerticalScrollIndicator
                keyboardShouldPersistTaps="handled"
              >
                {/* Correct Answer Display */}
                {renderVisualizer(getCorrectAnswerArray(), isCorrect ? 'Answer' : 'Correct answer', true)}
                
                {/* User Answer Display (if wrong) */}
                {!isCorrect && getUserAnswerArray().length > 0 && (
                  renderVisualizer(getUserAnswerArray(), 'Your Answer', false)
                )}
              </ScrollView>
            </View>
          </View>

          {/* Footer Action */}
          <Pressable 
            onPressIn={() => {
              pressTranslation.value = withTiming(4, { duration: 100 });
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            onPressOut={() => {
              pressTranslation.value = withTiming(0, { duration: 100 });
            }}
            onPress={onContinue}
            style={styles.buttonWrapper}
          >
            <Animated.View style={[
              styles.continueButton, 
              buttonAnimatedStyle,
              { backgroundColor: statusColor, borderColor: 'rgba(0,0,0,0.1)' }
            ]}>
              <Text style={[styles.continueText, { fontFamily: theme.fontFamily.accent }]}>Continue</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
            </Animated.View>
          </Pressable>
         
        </Animated.View>
      </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 100,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '88%',
    backgroundColor: Colors.surface,
    borderRadius: 32,
    borderWidth: 2,
    borderBottomWidth: 8,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 28,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 34,
  },
  contentContainer: {
    width: '100%',
    flexShrink: 1,
    minHeight: 0,
    marginBottom: 32,
  },
  reviewContainer: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.05)',
    padding: 20,
    width: '100%',
    flexShrink: 1,
    minHeight: 0,
  },
  reviewScroll: {
    width: '100%',
    flexShrink: 1,
  },
  reviewScrollContent: {
    gap: 20,
  },
  reviewBlock: {
    alignItems: 'center',
  },
  reviewLabel: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    opacity: 0.7,
  },
  reviewText: {
    fontSize: 20,
    color: Colors.onSurfaceVariant,
    lineHeight: 28,
    textAlign: 'center',
  },
  assetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 4,
  },
  assetWrapper: {
    width: 72,
    height: 72,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrapper: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 72,
  },
  feedbackAsset: {
    width: '100%',
    height: '100%',
  },
  clockSetterList: {
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  clockSetterCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 10,
  },
  clockSetterTextGroup: {
    alignItems: 'center',
    gap: 2,
  },
  clockSetterTime: {
    fontSize: 24,
    color: Colors.onSurface,
    lineHeight: 30,
  },
  clockSetterHelper: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    lineHeight: 20,
    textAlign: 'center',
  },
  fractionShapeList: {
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  fractionShapeCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 10,
  },
  fractionShapeVisual: {
    marginBottom: 2,
  },
  fractionShapeTextGroup: {
    alignItems: 'center',
    gap: 2,
  },
  fractionShapeFraction: {
    fontSize: 22,
    color: Colors.onSurface,
    lineHeight: 28,
  },
  fractionShapeAnswer: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    lineHeight: 20,
    textAlign: 'center',
  },
  comparePileRow: {
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  comparePileCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  comparePileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  comparePileLabel: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  comparePileCount: {
    fontSize: 22,
    color: Colors.onSurface,
  },
  comparePileGrid: {
    minHeight: 44,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  comparePileAsset: {
    width: 28,
    height: 28,
  },
  comparePileAssetTen: {
    width: 36,
    height: 42,
  },
  buttonWrapper: {
    width: '100%',
  },
  continueButton: {
    width: '100%',
    height: 64,
    borderRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  continueText: {
    color: '#FFF',
    fontSize: 20,
    letterSpacing: 1,
  }
});
