// Anima - ActionBar Component v2.0
// Modern social action buttons with smooth animations

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, LAYOUT } from '../../theme/designSystem';

export interface ActionBarProps {
  likes: number;
  reposts: number;
  replies: number;
  isLiked: boolean;
  isReposted: boolean;
  onLike: () => void;
  onRepost: () => void;
  onReply: () => void;
  onShare: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
  compact?: boolean;
}

interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon?: keyof typeof Ionicons.glyphMap;
  count?: number;
  isActive: boolean;
  activeColor: string;
  onPress: () => void;
  size?: number;
}

// Format large numbers
const formatCount = (count: number): string => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  if (count === 0) return '';
  return count.toString();
};

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  activeIcon,
  count,
  isActive,
  activeColor,
  onPress,
  size = 20,
}) => {
  const [pressed, setPressed] = useState(false);
  const [animating, setAnimating] = useState(false);

  const handlePress = () => {
    setAnimating(true);
    setTimeout(() => setAnimating(false), 200);
    onPress();
  };

  const iconColor = isActive ? activeColor : COLORS.text.tertiary;

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.actionButton,
        pressed && styles.actionButtonPressed,
        animating && { transform: [{ scale: 1.1 }] },
      ]}
    >
      <Ionicons
        name={isActive && activeIcon ? activeIcon : icon}
        size={size}
        color={iconColor}
      />
      {count !== undefined && count > 0 && (
        <Text style={[styles.count, { color: iconColor }]}>
          {formatCount(count)}
        </Text>
      )}
    </Pressable>
  );
};

export const ActionBar: React.FC<ActionBarProps> = ({
  likes,
  reposts,
  replies,
  isLiked,
  isReposted,
  onLike,
  onRepost,
  onReply,
  onShare,
  onBookmark,
  isBookmarked = false,
  compact = false,
}) => {
  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Reply */}
      <ActionButton
        icon="chatbubble-outline"
        count={replies}
        isActive={false}
        activeColor={COLORS.accent.tertiary}
        onPress={onReply}
      />

      {/* Repost */}
      <ActionButton
        icon="repeat-outline"
        count={reposts}
        isActive={isReposted}
        activeColor={COLORS.accent.success}
        onPress={onRepost}
      />

      {/* Like */}
      <ActionButton
        icon="heart-outline"
        activeIcon="heart"
        count={likes}
        isActive={isLiked}
        activeColor={COLORS.accent.like}
        onPress={onLike}
      />

      {/* Share */}
      <ActionButton
        icon="share-outline"
        isActive={false}
        activeColor={COLORS.accent.primary}
        onPress={onShare}
      />

      {/* Bookmark (optional) */}
      {onBookmark && (
        <ActionButton
          icon="bookmark-outline"
          activeIcon="bookmark"
          isActive={isBookmarked}
          activeColor={COLORS.accent.primary}
          onPress={onBookmark}
        />
      )}
    </View>
  );
};

// Minimal Action Bar for compact views
export const ActionBarMinimal: React.FC<{
  likes: number;
  comments: number;
  isLiked: boolean;
  onLike: () => void;
  onComment: () => void;
}> = ({ likes, comments, isLiked, onLike, onComment }) => {
  return (
    <View style={styles.minimalContainer}>
      <ActionButton
        icon="heart-outline"
        activeIcon="heart"
        count={likes}
        isActive={isLiked}
        activeColor={COLORS.accent.like}
        onPress={onLike}
        size={18}
      />
      <ActionButton
        icon="chatbubble-outline"
        count={comments}
        isActive={false}
        activeColor={COLORS.accent.tertiary}
        onPress={onComment}
        size={18}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING[2],
    maxWidth: 320,
  },
  containerCompact: {
    maxWidth: 240,
    gap: SPACING[2],
  },
  minimalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[4],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING[2],
    paddingHorizontal: SPACING[3],
    borderRadius: LAYOUT.radius.full,
  },
  actionButtonPressed: {
    backgroundColor: COLORS.glass.light,
  },
  count: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginLeft: SPACING[1],
  },
});

export default ActionBar;
