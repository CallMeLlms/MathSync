import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Rect, Line, ClipPath, Defs } from 'react-native-svg';
import Colors from '@/constants/colors';

const DEFAULT_SIZE = 180;
const DEFAULT_STROKE_WIDTH = 3;

const FractionShapeVisual = ({
  shape = 'circle',
  fraction = '1/2',
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  shadeColor = Colors.primaryContainer,
  strokeColor = Colors.primary,
  style,
}) => {
  const normalizedShape = String(shape || 'circle').toLowerCase();
  const normalizedFraction = String(fraction || '1/2');
  const clipId = useMemo(
    () => `fraction-shape-${normalizedShape}-${normalizedFraction.replace('/', '-')}-${Math.random().toString(36).slice(2)}`,
    [normalizedShape, normalizedFraction]
  );

  const renderCircle = () => {
    const radius = size / 2;
    const center = radius;
    const innerRadius = radius - strokeWidth / 2;

    return (
      <Svg width={size} height={size}>
        <Defs>
          <ClipPath id={clipId}>
            <Circle cx={center} cy={center} r={innerRadius} />
          </ClipPath>
        </Defs>
        <Circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="transparent"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        {normalizedFraction === '1/4' ? (
          <Rect
            x={center}
            y={0}
            width={radius}
            height={radius}
            fill={shadeColor}
            clipPath={`url(#${clipId})`}
          />
        ) : (
          <Rect
            x={0}
            y={0}
            width={size}
            height={radius}
            fill={shadeColor}
            clipPath={`url(#${clipId})`}
          />
        )}
        <Line x1={0} y1={center} x2={size} y2={center} stroke={strokeColor} strokeWidth={strokeWidth} />
        {normalizedFraction === '1/4' && (
          <Line x1={center} y1={0} x2={center} y2={size} stroke={strokeColor} strokeWidth={strokeWidth} />
        )}
      </Svg>
    );
  };

  const renderSquare = () => {
    const innerSize = size - strokeWidth;

    return (
      <Svg width={size} height={size}>
        <Rect
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          width={innerSize}
          height={innerSize}
          fill="transparent"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        {normalizedFraction === '1/4' ? (
          <Rect
            x={strokeWidth / 2}
            y={strokeWidth / 2}
            width={innerSize / 2}
            height={innerSize / 2}
            fill={shadeColor}
          />
        ) : (
          <Rect
            x={strokeWidth / 2}
            y={strokeWidth / 2}
            width={innerSize / 2}
            height={innerSize}
            fill={shadeColor}
          />
        )}
        <Line x1={size / 2} y1={0} x2={size / 2} y2={size} stroke={strokeColor} strokeWidth={strokeWidth} />
        {normalizedFraction === '1/4' && (
          <Line x1={0} y1={size / 2} x2={size} y2={size / 2} stroke={strokeColor} strokeWidth={strokeWidth} />
        )}
      </Svg>
    );
  };

  const renderRectangle = () => {
    const height = size * 0.55;
    const innerWidth = size - strokeWidth;
    const innerHeight = height - strokeWidth;
    const segmentWidth = innerWidth / 4;

    return (
      <Svg width={size} height={height}>
        <Rect
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          width={innerWidth}
          height={innerHeight}
          fill="transparent"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        {normalizedFraction === '1/4' ? (
          <Rect
            x={strokeWidth / 2}
            y={strokeWidth / 2}
            width={segmentWidth}
            height={innerHeight}
            fill={shadeColor}
          />
        ) : (
          <Rect
            x={strokeWidth / 2}
            y={strokeWidth / 2}
            width={innerWidth / 2}
            height={innerHeight}
            fill={shadeColor}
          />
        )}
        {normalizedFraction === '1/4' ? (
          <>
            <Line x1={strokeWidth / 2 + segmentWidth} y1={0} x2={strokeWidth / 2 + segmentWidth} y2={height} stroke={strokeColor} strokeWidth={strokeWidth} />
            <Line x1={strokeWidth / 2 + segmentWidth * 2} y1={0} x2={strokeWidth / 2 + segmentWidth * 2} y2={height} stroke={strokeColor} strokeWidth={strokeWidth} />
            <Line x1={strokeWidth / 2 + segmentWidth * 3} y1={0} x2={strokeWidth / 2 + segmentWidth * 3} y2={height} stroke={strokeColor} strokeWidth={strokeWidth} />
          </>
        ) : (
          <Line x1={size / 2} y1={0} x2={size / 2} y2={height} stroke={strokeColor} strokeWidth={strokeWidth} />
        )}
      </Svg>
    );
  };

  const renderShape = () => {
    if (normalizedShape === 'square') return renderSquare();
    if (normalizedShape === 'rectangle') return renderRectangle();
    return renderCircle();
  };

  return (
    <View style={[styles.container, { width: size, minHeight: size }, style]}>
      {renderShape()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FractionShapeVisual;
