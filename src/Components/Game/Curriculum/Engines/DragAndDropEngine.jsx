/**
 * DragDropEngine — Grade 1 Drag-and-Drop Game Engine
 *
 * Children drag items from a shuffled grid into a target basket,
 * then tap "Check Answer" to confirm. Uses Gesture Handler
 * (Gesture.Pan) + Reanimated 3.x for 60 FPS UI-thread animations.
 *
 * MATATAG-aligned: Uses speechManager for audio instructions.
 * Shadow-Free Design System compliant.
 *
 * Props Contract: { data, onResult } (standard Orchestrator API)
 *
 * Required Assets (future):
 *   - g1_q1_shape_triangle, g1_q1_shape_square, g1_q1_shape_rectangle
 *   - g1_q2_manipulative_tens_block, g1_q2_manipulative_ones_block
 *   - g1_q4_money_peso_1, g1_q4_money_peso_5, g1_q4_money_peso_10
 */

import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  ZoomIn,
  ZoomOut,
  FadeIn,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import speechManager from '@/utils/speechManager';
import AssetDisplay from '@/Components/Game/Global/AssetDisplay';

const getSharedColors = () => [
  { bg: Colors.primary, border: Colors.onPrimaryContainer, text: Colors.onPrimary },
  { bg: Colors.secondary, border: Colors.onSecondaryContainer, text: Colors.onSecondary },
  { bg: Colors.tertiary, border: Colors.onTertiaryContainer, text: Colors.onTertiary },
  { bg: Colors.onPrimaryContainer, border: Colors.primary, text: Colors.onPrimary },
];

const hapticLight = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

// ─── DroppedItemDisplay: renders the item inside the basket ───
const DroppedItemDisplay = ({ value, data, isWrong, isCorrect, onRemove, disabled, screenHeight, baseStyles }) => {
  const bg = isWrong ? Colors.errorContainer : isCorrect ? Colors.successContainer : Colors.primaryContainer;
  const borderColor = isWrong ? Colors.error : isCorrect ? Colors.success : Colors.primary;
  const textColor = isWrong ? Colors.onErrorContainer : isCorrect ? Colors.onSuccessContainer : Colors.onPrimaryContainer;

  const removeScale = useSharedValue(1);
  const removeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: removeScale.value }],
  }));

  const tap = Gesture.Tap()
    .onBegin(() => {
      removeScale.value = withSpring(0.9, { damping: 8, stiffness: 400 });
    })
    .onEnd(() => {
      runOnJS(onRemove)();
    })
    .onFinalize(() => {
      removeScale.value = withSpring(1, { damping: 10, stiffness: 300 });
    })
    .enabled(!disabled);

  return (
    <Animated.View entering={ZoomIn.springify()}>
      <GestureDetector gesture={tap}>
        <Animated.View
          style={[baseStyles.droppedItem, { backgroundColor: bg, borderColor }, removeStyle]}
        >
          {data?.assetId && (
            <AssetDisplay
              assetId={data.assetId}
              style={{ width: screenHeight * 0.045, height: screenHeight * 0.045 }}
            />
          )}
          <Text style={[baseStyles.droppedText, { color: textColor, fontSize: screenHeight * 0.032 }]}>{String(value)}</Text>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};

// ─── DraggableItem: a single draggable choice ───
const DraggableItem = ({
  value,
  data,
  colorTheme,
  dropZoneLayout,
  gridLayout,
  onDropInZone,
  disabled,
  screenHeight,
  itemSize,
  baseStyles,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const scale = useSharedValue(1);
  const itemLayout = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const isInsideDropZone = useCallback((tx, ty) => {
    const dz = dropZoneLayout.current;
    const gl = gridLayout.current;
    const il = itemLayout.current;
    if (!dz || dz.width === 0) return false;
    const centerX = gl.x + il.x + il.width / 2 + tx;
    const centerY = gl.y + il.y + il.height / 2 + ty;
    return (
      centerX >= dz.x &&
      centerX <= dz.x + dz.width &&
      centerY >= dz.y &&
      centerY <= dz.y + dz.height
    );
  }, [dropZoneLayout, gridLayout]);

  const handleRelease = useCallback(
    (tx, ty) => {
      if (isInsideDropZone(tx, ty)) {
        onDropInZone(value);
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    },
    [value, onDropInZone, isInsideDropZone]
  );

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
      scale.value = withSpring(1.12, { damping: 12, stiffness: 200 });
      runOnJS(hapticLight)();
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY;
    })
    .onEnd(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
      runOnJS(handleRelease)(translateX.value, translateY.value);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View
      onLayout={(e) => {
        const { x, y, width, height } = e.nativeEvent.layout;
        itemLayout.current = { x, y, width, height };
      }}
    >
      <Animated.View entering={ZoomIn.springify()}>
        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              baseStyles.draggableItem,
              {
                width: itemSize,
                height: itemSize * 0.7,
                backgroundColor: colorTheme.bg,
                borderColor: colorTheme.border,
                opacity: disabled ? 0.5 : 1,
              },
              animatedStyle,
            ]}
          >
            {data?.assetId && (
              <AssetDisplay
                assetId={data.assetId}
                style={{ width: screenHeight * 0.045, height: screenHeight * 0.045 }}
              />
            )}
            <Text style={[baseStyles.itemText, { color: colorTheme.text, fontSize: screenHeight * 0.026 }]}>
              {String(value)}
            </Text>
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    </View>
  );
};

// ─── DragDropEngine: main engine component ───
const DragDropEngine = ({ data, onResult }) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const styles = useMemo(() => getDynamicStyles(screenWidth, screenHeight), [screenWidth, screenHeight]);
  const itemSize = (screenWidth - 80) / 2;
  const itemColors = useMemo(() => getSharedColors(), []);

  const { dragItems = [], answer, question: instructionText } = data;

  const shuffled = useMemo(
    () => [...dragItems].sort(() => Math.random() - 0.5),
    [dragItems]
  );

  const [droppedItem, setDroppedItem] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [isWrong, setIsWrong] = useState(false);

  const dropZoneLayout = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const gridLayout = useRef({ x: 0, y: 0 });

  // Reset engine state when `data` changes (next question from Orchestrator)
  useEffect(() => {
    setDroppedItem(null);
    setAnswered(false);
    setIsWrong(false);
  }, [data]);

  // Auto-speak on question load via speechManager
  useEffect(() => {
    if (instructionText) {
      const timer = setTimeout(() => speechManager.speakInstruction(instructionText), 500);
      return () => clearTimeout(timer);
    }
    return () => speechManager.stop();
  }, [instructionText]);

  const handleDropInZone = useCallback(
    (value) => {
      if (answered || droppedItem !== null) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsWrong(false);
      setDroppedItem(value);
    },
    [answered, droppedItem]
  );

  const handleRemoveFromBasket = useCallback(() => {
    if (answered) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsWrong(false);
    setDroppedItem(null);
  }, [answered]);

  const handleCheckAnswer = useCallback(() => {
    if (!droppedItem || answered) return;

    if (droppedItem === answer) {
      setAnswered(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      speechManager.speakFeedback('Correct! Well done!', true);
      setTimeout(() => onResult(true, [String(droppedItem)]), 600);
    } else {
      setIsWrong(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      speechManager.speakFeedback('Not quite! Try again.', false);
      onResult(false, [String(droppedItem)]);
      setTimeout(() => {
        setDroppedItem(null);
        setIsWrong(false);
      }, 1000);
    }
  }, [droppedItem, answered, answer, onResult]);

  // Dynamic instruction text
  const getInstruction = () => {
    if (answered) return '✅ Correct!';
    if (isWrong) return 'Not quite — try again!';
    if (droppedItem !== null) return 'Tap Check when ready.';
    return instructionText || 'Drag the correct answer into the basket.';
  };

  // Check Answer gesture tap
  const checkTap = Gesture.Tap()
    .onEnd(() => runOnJS(handleCheckAnswer)())
    .enabled(droppedItem !== null && !answered);

  // Speak instruction tap
  const speakTap = Gesture.Tap()
    .onEnd(() => runOnJS(() => speechManager.speakInstruction(instructionText))());

  return (
    <View style={styles.container}>
      {/* Instruction Hint (Tappable for re-play) */}
      <GestureDetector gesture={speakTap}>
        <Animated.View entering={FadeIn.delay(100)} style={styles.hintContainer}>
          <Ionicons name="volume-medium" size={20} color={Colors.onSurfaceVariant} />
          <Text style={styles.hintText}>
            {getInstruction()}
          </Text>
        </Animated.View>
      </GestureDetector>

      {/* Drop Zone (Basket) */}
      <View
        onLayout={(e) => {
          const { x, y, width, height } = e.nativeEvent.layout;
          dropZoneLayout.current = { x, y, width, height };
        }}
        style={[
          styles.dropZone,
          answered && droppedItem === answer && styles.dropZoneCorrect,
          isWrong && styles.dropZoneWrong,
        ]}
      >
        {droppedItem !== null ? (
          <DroppedItemDisplay
            value={droppedItem}
            data={data}
            isWrong={isWrong}
            isCorrect={answered && droppedItem === answer}
            onRemove={handleRemoveFromBasket}
            disabled={answered || isWrong}
            screenHeight={screenHeight}
            baseStyles={baseStyles}
          />
        ) : (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={baseStyles.emptyDropZone}
          >
            <Ionicons name="basket" size={48} color={Colors.primary} />
            <Text style={styles.dropZoneHint}>Drop here!</Text>
          </Animated.View>
        )}
      </View>

      {/* Draggable Items Grid */}
      <View
        style={[baseStyles.grid, { minHeight: itemSize * 0.7 + 20 }]}
        onLayout={(e) => {
          const { x, y } = e.nativeEvent.layout;
          gridLayout.current = { x, y };
        }}
      >
        {shuffled.map((value, i) => {
          if (value === droppedItem) return null;
          return (
            <DraggableItem
              key={`drag-${value}`}
              value={value}
              data={data}
              colorTheme={itemColors[i % itemColors.length]}
              dropZoneLayout={dropZoneLayout}
              gridLayout={gridLayout}
              onDropInZone={handleDropInZone}
              disabled={answered || droppedItem !== null}
              screenHeight={screenHeight}
              itemSize={itemSize}
              baseStyles={baseStyles}
            />
          );
        })}
      </View>

      {/* Check Answer Button */}
      <View style={baseStyles.footer}>
        {droppedItem !== null && !answered && (
          <GestureDetector gesture={checkTap}>
            <Animated.View entering={ZoomIn.springify()} exiting={ZoomOut} style={baseStyles.checkButton}>
              <Ionicons name="checkmark-circle" size={22} color={Colors.onPrimary} />
              <Text style={styles.checkButtonText}>Check Answer</Text>
            </Animated.View>
          </GestureDetector>
        )}
      </View>
    </View>
  );
};

// Base styles that don't depend on dynamic dimensions
const baseStyles = StyleSheet.create({
  droppedItem: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 44,
    minWidth: 44,
  },
  droppedText: {
    fontFamily: 'Lexend-Black',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 8,
  },
  draggableItem: {
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    flexDirection: 'row',
    gap: 8,
    minHeight: 44,
    minWidth: 44,
  },
  itemText: {
    fontFamily: 'Lexend-Black',
  },
  emptyDropZone: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  footer: {
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 20,
    minHeight: 44,
    minWidth: 44,
    gap: 8,
  },
});

// Dynamic styles generated based on width and height
const getDynamicStyles = (screenWidth, screenHeight) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    gap: 16,
    paddingVertical: 10,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  hintText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: screenHeight * 0.016,
    color: Colors.onSurfaceVariant,
    flex: 1,
  },
  dropZone: {
    width: '100%',
    minHeight: screenHeight * 0.18,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  dropZoneCorrect: {
    borderColor: Colors.success,
    backgroundColor: Colors.tertiaryContainer,
    borderStyle: 'solid',
  },
  dropZoneWrong: {
    borderColor: Colors.error,
    backgroundColor: Colors.secondaryContainer,
  },
  dropZoneHint: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: screenHeight * 0.018,
    color: Colors.primary,
  },
  checkButtonText: {
    fontFamily: 'Lexend-Bold',
    color: Colors.onPrimary,
    fontSize: screenHeight * 0.019,
  },
});

export default DragDropEngine;
