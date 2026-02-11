// Anima - Avatar Component
// Modern avatar with status indicators and glow effects

import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, LAYOUT, EFFECTS } from '../../theme/designSystem';

export interface AvatarProps {
  imageUrl: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  status?: 'online' | 'offline' | 'live' | 'none';
  badge?: React.ReactNode;
  ring?: boolean;
  ringColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  imageUrl,
  size = 'md',
  status = 'none',
  badge,
  ring = false,
  ringColor,
  onPress,
  style,
}) => {
  const getSizeValue = (): number => {
    const sizes = LAYOUT.heights.avatar;
    return sizes[size];
  };

  const getStatusColor = (): string => {
    switch (status) {
      case 'online': return COLORS.semantic.online;
      case 'live': return COLORS.semantic.live;
      case 'offline': return COLORS.semantic.offline;
      default: return 'transparent';
    }
  };

  const sizeValue = getSizeValue();
  const statusSize = Math.max(sizeValue * 0.25, 10);
  const ringWidth = ring ? 3 : 0;
  const actualRingColor = ringColor || COLORS.accent.primary;

  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      style={[
        styles.container,
        { width: sizeValue + ringWidth * 2, height: sizeValue + ringWidth * 2 },
        style,
      ]}
    >
      {/* Ring/Gradient Border */}
      {ring && (
        <LinearGradient
          colors={[actualRingColor, COLORS.accent.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.ring,
            {
              width: sizeValue + ringWidth * 2,
              height: sizeValue + ringWidth * 2,
              borderRadius: (sizeValue + ringWidth * 2) / 2,
            },
          ]}
        />
      )}

      {/* Avatar Container */}
      <View
        style={[
          styles.avatarContainer,
          {
            width: sizeValue,
            height: sizeValue,
            borderRadius: sizeValue / 2,
          },
        ]}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={[
              styles.image,
              {
                width: sizeValue,
                height: sizeValue,
                borderRadius: sizeValue / 2,
              },
            ]}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              {
                width: sizeValue,
                height: sizeValue,
                borderRadius: sizeValue / 2,
              },
            ]}
          >
            {/* Default avatar icon */}
            <View style={[styles.placeholderIcon, { width: sizeValue * 0.4, height: sizeValue * 0.4 }]} />
          </View>
        )}
      </View>

      {/* Status Indicator */}
      {status !== 'none' && (
        <View
          style={[
            styles.statusIndicator,
            {
              width: statusSize,
              height: statusSize,
              borderRadius: statusSize / 2,
              backgroundColor: getStatusColor(),
              borderWidth: 2,
              borderColor: COLORS.background.primary,
            },
            status === 'live' && styles.liveGlow,
          ]}
        />
      )}

      {/* Custom Badge */}
      {badge && (
        <View style={styles.badgeContainer}>
          {badge}
        </View>
      )}
    </Container>
  );
};

// Avatar Group for stacked avatars
export const AvatarGroup: React.FC<{
  avatars: Array<{ imageUrl: string | null; id: string }>;
  max?: number;
  size?: AvatarProps['size'];
  onPress?: () => void;
}> = ({
  avatars,
  max = 4,
  size = 'sm',
  onPress,
}) => {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;
  const sizeValue = LAYOUT.heights.avatar[size];
  const overlap = sizeValue * 0.3;

  return (
    <Pressable onPress={onPress} style={styles.groupContainer}>
      {visible.map((avatar, index) => (
        <View
          key={avatar.id}
          style={[
            styles.groupAvatar,
            { marginLeft: index === 0 ? 0 : -overlap, zIndex: visible.length - index },
          ]}
        >
          <Avatar
            imageUrl={avatar.imageUrl}
            size={size}
            style={{
              borderWidth: 2,
              borderColor: COLORS.background.primary,
            }}
          />
        </View>
      ))}
      {remaining > 0 && (
        <View
          style={[
            styles.remainingBadge,
            {
              marginLeft: -overlap,
              width: sizeValue,
              height: sizeValue,
              borderRadius: sizeValue / 2,
            },
          ]}
        >
          <View style={styles.remainingText}>
            {/* +N text would go here */}
          </View>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    padding: 3,
  },
  avatarContainer: {
    overflow: 'hidden',
    backgroundColor: COLORS.background.secondary,
  },
  image: {
    // Image styles applied inline
  },
  placeholder: {
    backgroundColor: COLORS.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    backgroundColor: COLORS.text.tertiary,
    borderRadius: 100,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  liveGlow: {
    ...EFFECTS.shadows.glow(COLORS.semantic.live),
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  groupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupAvatar: {
    // Individual avatar in group
  },
  remainingBadge: {
    backgroundColor: COLORS.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.background.primary,
  },
  remainingText: {
    // +N text styles
  },
});

export default Avatar;
