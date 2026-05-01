import Svg, { Rect, Polygon } from 'react-native-svg';

export default function PenIcon({ width = 48, height = 48 }) {
  return (
    <Svg viewBox="0 0 48 48" width={width} height={height}>
      <Rect x="20" y="2" width="8" height="10" rx="3" fill="#1565C0" />
      <Rect x="20" y="12" width="8" height="21" fill="#42A5F5" />
      <Rect x="20" y="28" width="8" height="5" fill="#1565C0" />
      <Polygon points="20,33 28,33 24,43" fill="#90A4AE" />
      <Polygon points="22,39 26,39 24,43" fill="#37474F" />
    </Svg>
  );
}
