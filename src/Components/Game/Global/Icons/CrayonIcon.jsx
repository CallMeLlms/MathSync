import Svg, { Rect, Polygon } from 'react-native-svg';

export default function CrayonIcon({ width = 48, height = 48 }) {
  return (
    <Svg viewBox="0 0 48 48" width={width} height={height}>
      <Rect x="16" y="2" width="16" height="5" rx="2" fill="#BF360C" />
      <Rect x="16" y="7" width="16" height="26" fill="#FF7043" />
      <Rect x="16" y="18" width="16" height="9" fill="#FFFFFF" opacity="0.5" />
      <Polygon points="16,33 32,33 24,45" fill="#FF7043" />
    </Svg>
  );
}
