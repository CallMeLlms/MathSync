import Svg, { Rect, Line } from 'react-native-svg';

export default function RulerIcon({ width = 48, height = 48 }) {
  return (
    <Svg viewBox="0 0 48 48" width={width} height={height}>
      <Rect x="2" y="14" width="44" height="20" rx="2" fill="#FFF176" stroke="#F9A825" strokeWidth="1.5" />
      <Line x1="9"  y1="14" x2="9"  y2="26" stroke="#455A64" strokeWidth="1.5" />
      <Line x1="21" y1="14" x2="21" y2="26" stroke="#455A64" strokeWidth="1.5" />
      <Line x1="33" y1="14" x2="33" y2="26" stroke="#455A64" strokeWidth="1.5" />
      <Line x1="15" y1="14" x2="15" y2="21" stroke="#455A64" strokeWidth="1" />
      <Line x1="27" y1="14" x2="27" y2="21" stroke="#455A64" strokeWidth="1" />
      <Line x1="39" y1="14" x2="39" y2="21" stroke="#455A64" strokeWidth="1" />
    </Svg>
  );
}
