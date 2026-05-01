import PencilIcon from '@/Components/Game/Global/Icons/PencilIcon';
import CrayonIcon  from '@/Components/Game/Global/Icons/CrayonIcon';
import PenIcon     from '@/Components/Game/Global/Icons/PenIcon';
import MarkerIcon  from '@/Components/Game/Global/Icons/MarkerIcon';
import RulerIcon   from '@/Components/Game/Global/Icons/RulerIcon';

const IconRegistry = {
  'icon_pencil': PencilIcon,
  'icon_pen':    PenIcon,
  'icon_crayon': CrayonIcon,
  'icon_marker': MarkerIcon,
  'icon_ruler':  RulerIcon,
};

export function getIcon(id) {
  return IconRegistry[id] ?? null;
}
