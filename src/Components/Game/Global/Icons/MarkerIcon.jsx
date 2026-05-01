import Svg, { Rect } from 'react-native-svg';

export default function MarkerIcon({ width = 48, height = 48 }) {
  return (
    <Svg viewBox="0 0 48 48" width={width} height={height}>
      <Rect x="14" y="2" width="20" height="10" rx="4" fill="#D32F2F" />
      <Rect x="14" y="12" width="20" height="24" rx="3" fill="#EF5350" />
      <Rect x="18" y="36" width="12" height="5" rx="2" fill="#B71C1C" />
      <Rect x="19" y="41" width="10" height="4" rx="1" fill="#37474F" />
    </Svg>
  );
}
