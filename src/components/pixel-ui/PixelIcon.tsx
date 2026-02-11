// Anima - PixelIcon Component
// 16x16 pixel sprite icons with animation support

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Rect, Path, G } from 'react-native-svg';
import { COLORS, COMPONENT_SIZES, SPRITE_FRAME } from '../../theme';

export type IconName =
  | 'home'
  | 'search'
  | 'bell'
  | 'profile'
  | 'heart'
  | 'heartFilled'
  | 'repost'
  | 'reply'
  | 'share'
  | 'play'
  | 'crit'
  | 'miss'
  | 'portal'
  | 'guild'
  | 'sword'
  | 'shield'
  | 'potion'
  | 'scroll'
  | 'settings';

export interface PixelIconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: ViewStyle;
  animated?: boolean;
}

// SVG pixel art icon paths (16x16 grid)
const ICON_PATHS: Record<IconName, string | React.ReactNode> = {
  // Home icon (house)
  home: 'M8,2 L2,8 L4,8 L4,14 L7,14 L7,10 L9,10 L9,14 L12,14 L12,8 L14,8 Z',

  // Search (magnifying glass)
  search: 'M6,2 Q2,2 2,6 Q2,10 6,10 Q8,10 9,9 L12,12 L14,10 L11,7 Q12,5 10,3 Q8,2 6,2 M6,4 Q8,4 8,6 Q8,8 6,8 Q4,8 4,6 Q4,4 6,4',

  // Bell (notifications)
  bell: 'M8,2 L8,3 Q4,4 4,8 L4,11 L2,11 L2,13 L14,13 L14,11 L12,11 L12,8 Q12,4 8,3 L8,2 M7,14 L9,14 Q9,15 8,15 Q7,15 7,14',

  // Profile (character)
  profile: 'M8,2 Q5,2 5,5 Q5,8 8,8 Q11,8 11,5 Q11,2 8,2 M4,10 Q2,10 2,14 L14,14 Q14,10 12,10 Q10,10 8,10 Q6,10 4,10',

  // Heart (empty)
  heart: 'M8,4 Q6,2 4,2 Q2,2 2,5 Q2,8 8,14 Q14,8 14,5 Q14,2 12,2 Q10,2 8,4 M4,4 Q3,4 3,5 Q3,7 8,12 Q13,7 13,5 Q13,4 12,4 Q10,4 8,6',

  // Heart (filled)
  heartFilled: 'M8,4 Q6,2 4,2 Q2,2 2,5 Q2,8 8,14 Q14,8 14,5 Q14,2 12,2 Q10,2 8,4',

  // Repost (circular arrows)
  repost: 'M4,4 L4,8 L2,8 L5,12 L8,8 L6,8 L6,4 L10,4 L10,8 L12,8 L12,4 L8,4 M12,12 L12,8 L14,8 L11,4 L8,8 L10,8 L10,12',

  // Reply (speech bubble)
  reply: 'M2,2 L14,2 L14,10 L6,10 L4,14 L4,10 L2,10 Z M4,4 L4,6 L12,6 L12,4 Z',

  // Share (arrow up)
  share: 'M8,2 L4,6 L6,6 L6,10 L10,10 L10,6 L12,6 Z M4,12 L4,14 L12,14 L12,12 Z',

  // Play (triangle)
  play: 'M4,2 L4,14 L14,8 Z',

  // Crit (checkmark/thumbs up)
  crit: 'M2,8 L6,12 L14,4 L12,2 L6,8 L4,6 Z',

  // Miss (X)
  miss: 'M2,4 L4,2 L8,6 L12,2 L14,4 L10,8 L14,12 L12,14 L8,10 L4,14 L2,12 L6,8 Z',

  // Portal (doorway)
  portal: 'M4,2 L4,14 L12,14 L12,2 Z M6,4 L6,12 L10,12 L10,4 Z M7,8 L9,8 L9,10 L7,10 Z',

  // Guild (people)
  guild: 'M4,4 Q3,4 3,5 Q3,6 4,6 Q5,6 5,5 Q5,4 4,4 M12,4 Q11,4 11,5 Q11,6 12,6 Q13,6 13,5 Q13,4 12,4 M8,2 Q6,2 6,4 Q6,6 8,6 Q10,6 10,4 Q10,2 8,2 M2,8 L6,8 L6,14 L2,14 Z M10,8 L14,8 L14,14 L10,14 Z M5,7 L11,7 L11,14 L5,14 Z',

  // Sword
  sword: 'M12,2 L14,4 L6,12 L4,14 L2,12 L4,10 L12,2 M4,12 L6,14 L2,14 Z',

  // Shield
  shield: 'M8,2 L2,4 L2,8 Q2,14 8,14 Q14,14 14,8 L14,4 Z M8,4 L12,6 L12,8 Q12,12 8,12 Q4,12 4,8 L4,6 Z',

  // Potion
  potion: 'M6,2 L10,2 L10,4 L12,6 L12,12 Q12,14 8,14 Q4,14 4,12 L4,6 L6,4 Z M7,6 L9,6 L11,8 L11,12 Q11,13 8,13 Q5,13 5,12 L5,8 Z',

  // Scroll (quest log)
  scroll: 'M2,4 L4,4 L4,2 L12,2 L12,4 L14,4 L14,12 L12,12 L12,14 L4,14 L4,12 L2,12 Z M5,4 L11,4 L11,12 L5,12 Z M6,5 L10,5 M6,7 L10,7 M6,9 L8,9',

  // Settings (gear)
  settings: 'M7,2 L9,2 L9,4 L11,5 L13,3 L14,5 L12,7 L13,9 L14,9 L14,11 L12,11 L11,13 L13,14 L11,15 L9,13 L7,13 L5,15 L3,14 L5,13 L4,11 L2,11 L2,9 L4,9 L3,7 L2,5 L4,4 L5,5 L7,4 Z M8,6 Q6,6 6,8 Q6,10 8,10 Q10,10 10,8 Q10,6 8,6',
};

export const PixelIcon: React.FC<PixelIconProps> = ({
  name,
  size = COMPONENT_SIZES.iconMedium,
  color = COLORS.white,
  style,
  animated = false,
}) => {
  const path = ICON_PATHS[name];
  const viewBox = '0 0 16 16';

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox={viewBox}>
        <Path d={path as string} fill={color} />
      </Svg>
    </View>
  );
};

// Pre-built icon components for common actions
export const HeartIcon: React.FC<{ filled?: boolean; color?: string; size?: number }> = ({
  filled = false,
  color = COLORS.criticalHitCrimson,
  size,
}) => <PixelIcon name={filled ? 'heartFilled' : 'heart'} color={color} size={size} />;

export const HomeIcon: React.FC<{ color?: string; size?: number }> = ({ color, size }) => (
  <PixelIcon name="home" color={color} size={size} />
);

export const SearchIcon: React.FC<{ color?: string; size?: number }> = ({ color, size }) => (
  <PixelIcon name="search" color={color} size={size} />
);

export const BellIcon: React.FC<{ color?: string; size?: number }> = ({ color, size }) => (
  <PixelIcon name="bell" color={color} size={size} />
);

export const ProfileIcon: React.FC<{ color?: string; size?: number }> = ({ color, size }) => (
  <PixelIcon name="profile" color={color} size={size} />
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PixelIcon;
