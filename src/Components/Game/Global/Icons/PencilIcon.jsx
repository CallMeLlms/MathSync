import Svg, { Rect, Polygon } from 'react-native-svg';

export default function PencilIcon({ width = 48, height = 48 }) {
  return (
    <Svg viewBox="0 0 48 48" width={width} height={height}>
      <Rect x="17" y="2" width="14" height="7" rx="2" fill="#F48FB1" />
      <Rect x="17" y="9" width="14" height="4" fill="#B0BEC5" />
      <Rect x="17" y="13" width="14" height="21" fill="#FFF176" />
      <Polygon points="17,34 31,34 24,44" fill="#D7B899" />
      <Polygon points="21,40 27,40 24,44" fill="#455A64" />
    </Svg>
  );
}
