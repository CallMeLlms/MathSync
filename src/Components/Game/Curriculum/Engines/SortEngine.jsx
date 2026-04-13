/**
 * SortEngine — Curriculum Drag-Sorting Engine
 *
 * Highly interactive drag-and-drop sorting engine. Supports two modes:
 *   - mode: "order"  → drag tiles into ordered positional slots
 *   - mode: "bucket" → drag tiles into labeled category buckets
 *
 * Props contract: { data, onResult }
 *
 * data shape:
 *   {
 *     id: string,
 *     type: "SORT",
 *     mode: "order" | "bucket",
 *     instruction: string,
 *     tiles: [{ id, label }],
 *     slots?: [{ id, acceptsTileId }],            // mode: "order"
 *     buckets?: [{ id, label, acceptsTileIds: []}] // mode: "bucket"
 *   }
 */

import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  ZoomIn,
  FadeIn,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import speechManager from '@/utils/speechManager';

const TILE_COLORS = [
  { bg: Colors.primary, border: Colors.onPrimaryContainer, text: Colors.onPrimary },
  { bg: Colors.secondary, border: Colors.onSecondaryContainer, text: Colors.onSecondary },
  { bg: Colors.tertiary, border: Colors.onTertiaryContainer, text: Colors.onTertiary },
  { bg: Colors.onPrimaryContainer, border: Colors.primary, text: Colors.onPrimary },
  { bg: Colors.onSecondaryContainer, border: Colors.secondary, text: Colors.onSecondary },
];

const hapticSelect = () => Haptics.selectionAsync();
const hapticLight = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// ─── DropTarget: a slot or bucket that accepts tiles ───
const DropTarget = ({ label, placedTile, isWrong, isCorrect, onTap, disabled, targetStyles, tileColor, variant }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const tap = Gesture.Tap()
    .enabled(!disabled && !!placedTile)
    .onBegin(() => {
      scale.value = withSpring(0.92, { damping: 8, stiffness: 400 });
    })
    .onEnd(() => {
      runOnJS(onTap)();
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    });

  const bgColor = isCorrect
    ? Colors.successContainer
    : isWrong
      ? Colors.errorContainer
      : placedTile
        ? Colors.primaryContainer
        : Colors.surfaceContainerLowest;

  const borderColor = isCorrect
    ? Colors.success
    : isWrong
      ? Colors.error
      : placedTile
        ? Colors.primary
        : Colors.outlineVariant;

  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        style={[
          variant === 'bucket' ? targetStyles.bucket : targetStyles.slot,
          { backgroundColor: bgColor, borderColor, borderStyle: placedTile ? 'solid' : 'dashed' },
          animatedStyle,
        ]}
      >
        {label && (
          <Text style={[targetStyles.targetLabel, placedTile && { color: Colors.onPrimaryContainer }]}>
            {label}
          </Text>
        )}
        {placedTile ? (
          <Animated.View
            entering={ZoomIn.springify()}
            style={[
              targetStyles.placedTile,
              { backgroundColor: tileColor?.bg || Colors.primary, borderColor: tileColor?.border || Colors.primary },
            ]}
          >
            <Text style={[targetStyles.placedTileText, { color: tileColor?.text || Colors.onPrimary }]}>
              {placedTile.label}
            </Text>
          </Animated.View>
        ) : (
          <Text style={targetStyles.emptyHint}>Drop</Text>
        )}
      </Animated.View>
    </GestureDetector>
  );
};

// ─── DraggableTile: a tile in the tray ───
const DraggableTile = ({ tile, colorTheme, onDropOnTarget, targetsLayoutRef, trayLayoutRef, disabled, tileStyles, onShake, shakeSignal }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(0);
  const shake = useSharedValue(0);
  const itemLayout = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // Trigger shake when signal changes
  useEffect(() => {
    if (shakeSignal > 0) {
      shake.value = withSequence(
        withTiming(-8, { duration: 60 }),
        withTiming(8, { duration: 60 }),
        withTiming(-6, { duration: 60 }),
        withTiming(6, { duration: 60 }),
        withTiming(0, { duration: 60 })
      );
    }
  }, [shakeSignal]);

  const findTargetHit = useCallback((absX, absY) => {
    const targets = targetsLayoutRef.current || [];
    for (const t of targets) {
      if (!t.layout) continue;
      const { x, y, width, height } = t.layout;
      if (absX >= x && absX <= x + width && absY >= y && absY <= y + height) {
        return t.id;
      }
    }
    return null;
  }, [targetsLayoutRef]);

  const handleRelease = useCallback(
    (tx, ty) => {
      const tray = trayLayoutRef.current;
      const il = itemLayout.current;
      if (!tray || !il) {
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
        return;
      }
      const centerX = tray.x + il.x + il.width / 2 + tx;
      const centerY = tray.y + il.y + il.height / 2 + ty;
      const targetId = findTargetHit(centerX, centerY);
      if (targetId) {
        onDropOnTarget(tile.id, targetId);
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    },
    [tile.id, onDropOnTarget, findTargetHit]
  );

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
      scale.value = withSpring(1.08, { damping: 12, stiffness: 200 });
      zIndex.value = 10;
      runOnJS(hapticSelect)();
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY;
    })
    .onEnd(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
      zIndex.value = 0;
      runOnJS(handleRelease)(translateX.value, translateY.value);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value + shake.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    zIndex: zIndex.value,
    elevation: zIndex.value,
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
              tileStyles.tile,
              {
                backgroundColor: colorTheme.bg,
                borderColor: colorTheme.border,
                opacity: disabled ? 0.4 : 1,
              },
              animatedStyle,
            ]}
          >
            <Text style={[tileStyles.tileText, { color: colorTheme.text }]}>
              {tile.label}
            </Text>
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    </View>
  );
};

// ─── SortEngine ───
const SortEngine = ({ data, onResult }) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const dynamicStyles = useMemo(() => getDynamicStyles(screenWidth, screenHeight), [screenWidth, screenHeight]);

  const { tiles = [], slots = [], buckets = [], mode = 'order', instruction } = data;
  const targets = mode === 'bucket' ? buckets : slots;

  const shuffledTiles = useMemo(
    () => [...tiles].sort(() => Math.random() - 0.5),
    [tiles]
  );

  // Map: targetId → tile object placed there
  const [placements, setPlacements] = useState({});
  const [answered, setAnswered] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [shakeSignal, setShakeSignal] = useState(0);

  // Layout refs (absolute-screen bounds populated via onLayout)
  const targetsLayoutRef = useRef(targets.map(t => ({ id: t.id, layout: null })));
  const trayLayoutRef = useRef(null);

  // Reset when question changes
  useEffect(() => {
    setPlacements({});
    setAnswered(false);
    setIsWrong(false);
    setShakeSignal(0);
    targetsLayoutRef.current = targets.map(t => ({ id: t.id, layout: null }));
  }, [data]);

  // Re-speak instruction on mount (Orchestrator also speaks, but this is a safety net after remount)
  useEffect(() => {
    if (instruction) {
      const timer = setTimeout(() => speechManager.speakInstruction(instruction), 400);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [instruction]);

  const handleDropOnTarget = useCallback((tileId, targetId) => {
    if (answered) return;
    hapticLight();

    setPlacements(prev => {
      const next = { ...prev };
      // For order mode, each slot holds one tile. Unplace prev tile in that slot.
      // For bucket mode, each bucket can hold multiple tiles.
      if (mode === 'order') {
        // Remove this tile from any prior slot
        Object.keys(next).forEach(k => {
          if (next[k]?.id === tileId) delete next[k];
        });
        // If slot already occupied, reject (send tile back)
        if (next[targetId]) {
          // swap: send occupant back to tray — easiest = just reject drop
          return prev;
        }
        next[targetId] = tiles.find(t => t.id === tileId);
      } else {
        // bucket mode: arrays per bucket
        // Remove tile from any prior bucket
        Object.keys(next).forEach(k => {
          next[k] = (next[k] || []).filter(t => t.id !== tileId);
        });
        const tile = tiles.find(t => t.id === tileId);
        next[targetId] = [...(next[targetId] || []), tile];
      }
      return next;
    });
  }, [answered, mode, tiles]);

  const handleUnplace = useCallback((targetId) => {
    if (answered) return;
    hapticLight();
    setIsWrong(false);
    setPlacements(prev => {
      const next = { ...prev };
      if (mode === 'order') {
        delete next[targetId];
      } else {
        // bucket: pop last placed
        next[targetId] = [];
      }
      return next;
    });
  }, [answered, mode]);

  // Track how many tiles are placed
  const placedTileIds = useMemo(() => {
    const ids = [];
    if (mode === 'order') {
      Object.values(placements).forEach(t => t && ids.push(t.id));
    } else {
      Object.values(placements).forEach(arr => (arr || []).forEach(t => ids.push(t.id)));
    }
    return ids;
  }, [placements, mode]);

  const allPlaced = placedTileIds.length === tiles.length;

  const handleCheck = useCallback(() => {
    if (!allPlaced || answered) return;

    let correct = true;
    const userAnswerItems = [];

    if (mode === 'order') {
      for (const slot of slots) {
        const placed = placements[slot.id];
        userAnswerItems.push(placed?.label ?? '—');
        if (!placed || placed.id !== slot.acceptsTileId) {
          correct = false;
        }
      }
    } else {
      for (const bucket of buckets) {
        const placedList = placements[bucket.id] || [];
        for (const tile of placedList) {
          userAnswerItems.push(`${bucket.id}:${tile.label}`);
          if (!bucket.acceptsTileIds.includes(tile.id)) {
            correct = false;
          }
        }
      }
    }

    if (correct) {
      setAnswered(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      speechManager.speakFeedback('Great sorting!', true);
      setTimeout(() => onResult(true, userAnswerItems), 600);
    } else {
      setIsWrong(true);
      setShakeSignal(s => s + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      speechManager.speakFeedback('Not quite! Try adjusting the tiles.', false);
      onResult(false, userAnswerItems);
      setTimeout(() => setIsWrong(false), 1200);
    }
  }, [allPlaced, answered, mode, slots, buckets, placements, onResult]);

  const checkGesture = Gesture.Tap()
    .enabled(allPlaced && !answered)
    .onEnd(() => runOnJS(handleCheck)());

  // Color assignment per tile by original index (stable across shuffles)
  const tileColorById = useMemo(() => {
    const map = {};
    tiles.forEach((t, i) => {
      map[t.id] = TILE_COLORS[i % TILE_COLORS.length];
    });
    return map;
  }, [tiles]);

  // Render one drop target
  const renderTarget = (target, idx) => {
    const variant = mode === 'bucket' ? 'bucket' : 'slot';
    const isCorrectTarget = answered;
    const isWrongTarget = isWrong;

    if (mode === 'order') {
      const placed = placements[target.id] || null;
      const label = `${idx + 1}`;
      return (
        <View
          key={target.id}
          onLayout={(e) => {
            e.target.measureInWindow?.((x, y, width, height) => {
              const list = targetsLayoutRef.current.slice();
              const entry = list.find(l => l.id === target.id);
              if (entry) entry.layout = { x, y, width, height };
              targetsLayoutRef.current = list;
            });
          }}
        >
          <DropTarget
            label={label}
            placedTile={placed}
            isCorrect={isCorrectTarget && placed}
            isWrong={isWrongTarget && placed}
            onTap={() => handleUnplace(target.id)}
            disabled={answered}
            targetStyles={dynamicStyles}
            tileColor={placed ? tileColorById[placed.id] : null}
            variant={variant}
          />
        </View>
      );
    }

    // bucket mode
    const placedList = placements[target.id] || [];
    return (
      <View
        key={target.id}
        onLayout={(e) => {
          e.target.measureInWindow?.((x, y, width, height) => {
            const list = targetsLayoutRef.current.slice();
            const entry = list.find(l => l.id === target.id);
            if (entry) entry.layout = { x, y, width, height };
            targetsLayoutRef.current = list;
          });
        }}
        style={dynamicStyles.bucketWrapper}
      >
        <Text style={dynamicStyles.bucketTitle}>{target.label}</Text>
        <View style={dynamicStyles.bucketInner}>
          {placedList.length === 0 ? (
            <Text style={dynamicStyles.emptyBucketHint}>Drop here</Text>
          ) : (
            placedList.map((t) => (
              <Animated.View
                key={t.id}
                entering={ZoomIn.springify()}
                style={[
                  dynamicStyles.bucketTile,
                  {
                    backgroundColor: tileColorById[t.id]?.bg || Colors.primary,
                    borderColor: tileColorById[t.id]?.border || Colors.primary,
                  },
                ]}
              >
                <Text style={[dynamicStyles.bucketTileText, { color: tileColorById[t.id]?.text || Colors.onPrimary }]}>
                  {t.label}
                </Text>
              </Animated.View>
            ))
          )}
        </View>
        {placedList.length > 0 && !answered && (
          <GestureDetector
            gesture={Gesture.Tap().onEnd(() => runOnJS(handleUnplace)(target.id))}
          >
            <View style={dynamicStyles.clearBucketButton}>
              <Ionicons name="refresh" size={16} color={Colors.onSurfaceVariant} />
              <Text style={dynamicStyles.clearBucketText}>Clear</Text>
            </View>
          </GestureDetector>
        )}
      </View>
    );
  };

  const hint = answered
    ? 'Correct! Well sorted!'
    : isWrong
      ? 'Not quite — adjust the tiles.'
      : allPlaced
        ? 'Ready! Tap Check Answer.'
        : instruction || (mode === 'order' ? 'Drag tiles into the slots in order.' : 'Drag tiles into the right bucket.');

  return (
    <View style={dynamicStyles.container}>
      {/* Hint */}
      <Animated.View entering={FadeIn.delay(100)} style={dynamicStyles.hintContainer}>
        <Ionicons name="volume-medium" size={20} color={Colors.onSurfaceVariant} />
        <Text style={dynamicStyles.hintText}>{hint}</Text>
      </Animated.View>

      {/* Targets */}
      <View style={mode === 'bucket' ? dynamicStyles.bucketsRow : dynamicStyles.slotsRow}>
        {targets.map(renderTarget)}
      </View>

      {/* Tile Tray */}
      <View
        style={dynamicStyles.tray}
        onLayout={(e) => {
          e.target.measureInWindow?.((x, y, width, height) => {
            trayLayoutRef.current = { x, y, width, height };
          });
        }}
      >
        {shuffledTiles.map((tile) => {
          const isPlaced = placedTileIds.includes(tile.id);
          if (isPlaced) return null;
          return (
            <DraggableTile
              key={tile.id}
              tile={tile}
              colorTheme={tileColorById[tile.id]}
              onDropOnTarget={handleDropOnTarget}
              targetsLayoutRef={targetsLayoutRef}
              trayLayoutRef={trayLayoutRef}
              disabled={answered}
              tileStyles={dynamicStyles}
              shakeSignal={shakeSignal}
            />
          );
        })}
      </View>

      {/* Check Button */}
      <View style={dynamicStyles.footer}>
        {allPlaced && !answered && (
          <GestureDetector gesture={checkGesture}>
            <Animated.View entering={ZoomIn.springify()} style={dynamicStyles.checkButton}>
              <Ionicons name="checkmark-circle" size={22} color={Colors.onPrimary} />
              <Text style={dynamicStyles.checkButtonText}>Check Answer</Text>
            </Animated.View>
          </GestureDetector>
        )}
      </View>
    </View>
  );
};

const getDynamicStyles = (screenWidth, screenHeight) => {
  const slotSize = Math.min((screenWidth - 80) / 5, screenHeight * 0.11);
  return StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 14,
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
    slotsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap',
    },
    bucketsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'flex-start',
      gap: 12,
      flexWrap: 'wrap',
    },
    slot: {
      width: slotSize,
      height: slotSize,
      minWidth: 44,
      minHeight: 44,
      borderRadius: 18,
      borderWidth: 3,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 4,
    },
    bucket: {
      minWidth: 120,
      minHeight: 120,
      borderRadius: 18,
      borderWidth: 3,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 8,
    },
    bucketWrapper: {
      alignItems: 'center',
      gap: 6,
      minWidth: (screenWidth - 60) / 2,
    },
    bucketTitle: {
      fontFamily: 'Lexend-Bold',
      fontSize: screenHeight * 0.02,
      color: Colors.onSurface,
    },
    bucketInner: {
      minHeight: screenHeight * 0.14,
      width: '100%',
      borderWidth: 3,
      borderStyle: 'dashed',
      borderColor: Colors.primary,
      backgroundColor: Colors.surfaceContainerLowest,
      borderRadius: 18,
      padding: 8,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bucketTile: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 2,
      minWidth: 44,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bucketTileText: {
      fontFamily: 'Lexend-Black',
      fontSize: screenHeight * 0.02,
    },
    emptyBucketHint: {
      fontFamily: 'PlusJakartaSans-SemiBold',
      fontSize: screenHeight * 0.015,
      color: Colors.outlineVariant,
    },
    clearBucketButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 6,
      minHeight: 44,
      minWidth: 44,
      borderRadius: 12,
      backgroundColor: Colors.surfaceContainerLow,
    },
    clearBucketText: {
      fontFamily: 'PlusJakartaSans-SemiBold',
      fontSize: screenHeight * 0.014,
      color: Colors.onSurfaceVariant,
    },
    targetLabel: {
      fontFamily: 'Lexend-Bold',
      fontSize: screenHeight * 0.016,
      color: Colors.onSurfaceVariant,
      marginBottom: 2,
    },
    placedTile: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      borderWidth: 2,
      minWidth: 44,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    placedTileText: {
      fontFamily: 'Lexend-Black',
      fontSize: screenHeight * 0.022,
    },
    emptyHint: {
      fontFamily: 'PlusJakartaSans-SemiBold',
      fontSize: screenHeight * 0.013,
      color: Colors.outlineVariant,
    },
    tray: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 10,
      padding: 14,
      backgroundColor: Colors.surfaceContainerLow,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: Colors.outlineVariant,
      minHeight: screenHeight * 0.12,
    },
    tile: {
      paddingHorizontal: 18,
      paddingVertical: 14,
      borderRadius: 16,
      borderWidth: 3,
      minWidth: 56,
      minHeight: 56,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tileText: {
      fontFamily: 'Lexend-Black',
      fontSize: screenHeight * 0.026,
    },
    footer: {
      minHeight: 60,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 4,
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
    checkButtonText: {
      fontFamily: 'Lexend-Bold',
      color: Colors.onPrimary,
      fontSize: screenHeight * 0.019,
    },
  });
};

export default SortEngine;
