// Anima - QuestCard Component v2.0
// Modern glassmorphic feed card

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { Avatar } from '../glass-ui';
import { Quest, AnimeReference } from '../../types';
import { COLORS, LAYOUT, TYPOGRAPHY, SPACING } from '../../theme/designSystem';

export interface QuestCardProps {
  quest: Quest;
  onPress?: () => void;
  onLike?: () => void;
  onRepost?: () => void;
  onReply?: () => void;
  onShare?: () => void;
  onAuthorPress?: () => void;
  onAnimePress?: () => void;
  showActions?: boolean;
}

// Format timestamp
const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Format large numbers
const formatCount = (count: number): string => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

// Action Button Component
interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon?: keyof typeof Ionicons.glyphMap;
  count: number;
  isActive: boolean;
  activeColor: string;
  onPress: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  activeIcon,
  count,
  isActive,
  activeColor,
  onPress,
}) => {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.actionButton,
        pressed && styles.actionButtonPressed,
      ]}
    >
      <Ionicons
        name={isActive && activeIcon ? activeIcon : icon}
        size={20}
        color={isActive ? activeColor : COLORS.text.tertiary}
      />
      {count > 0 && (
        <Text
          style={[
            styles.actionCount,
            { color: isActive ? activeColor : COLORS.text.tertiary },
          ]}
        >
          {formatCount(count)}
        </Text>
      )}
    </Pressable>
  );
};

// Anime Reference Tag
interface AnimeTagProps {
  anime: AnimeReference;
  onPress?: () => void;
}

const AnimeTag: React.FC<AnimeTagProps> = ({ anime, onPress }) => (
  <Pressable onPress={onPress} style={styles.animeTag}>
    <Image
      source={{ uri: anime.coverImage }}
      style={styles.animeTagImage}
      contentFit="cover"
      transition={200}
    />
    <View style={styles.animeTagInfo}>
      <Text style={styles.animeTagTitle} numberOfLines={1}>
        {anime.title}
      </Text>
      {anime.episode && (
        <Text style={styles.animeTagEpisode}>Episode {anime.episode}</Text>
      )}
    </View>
    <Ionicons name="chevron-forward" size={16} color={COLORS.text.tertiary} />
  </Pressable>
);

export const QuestCard: React.FC<QuestCardProps> = ({
  quest,
  onPress,
  onLike,
  onRepost,
  onReply,
  onShare,
  onAuthorPress,
  onAnimePress,
  showActions = true,
}) => {
  const [liked, setLiked] = useState(quest.isLiked);
  const [likesCount, setLikesCount] = useState(quest.likes);
  const [reposted, setReposted] = useState(quest.isReposted);
  const [repostsCount, setRepostsCount] = useState(quest.reposts);

  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount(prev => newLiked ? prev + 1 : prev - 1);
    onLike?.();
  };

  const handleRepost = () => {
    const newReposted = !reposted;
    setReposted(newReposted);
    setRepostsCount(prev => newReposted ? prev + 1 : prev - 1);
    onRepost?.();
  };

  return (
    <Pressable onPress={onPress}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onAuthorPress}>
            <Avatar
              imageUrl={quest.author.avatarUrl}
              size="md"
              ring={quest.author.powerLevel >= 20}
              ringColor={COLORS.accent.primary}
            />
          </Pressable>

          <View style={styles.authorInfo}>
            <View style={styles.nameRow}>
              <Pressable onPress={onAuthorPress}>
                <Text style={styles.displayName}>{quest.author.displayName}</Text>
              </Pressable>
              {quest.author.powerLevel >= 50 && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={COLORS.accent.primary}
                  style={styles.verifiedIcon}
                />
              )}
              {quest.isHotTake && (
                <View style={styles.hotTakeBadge}>
                  <Ionicons name="flame" size={12} color={COLORS.text.primary} />
                  <Text style={styles.hotTakeText}>Hot</Text>
                </View>
              )}
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.username}>@{quest.author.username}</Text>
              <Text style={styles.separator}>·</Text>
              <Text style={styles.timestamp}>{formatTimestamp(quest.createdAt)}</Text>
            </View>
          </View>

          <Pressable style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.text.tertiary} />
          </Pressable>
        </View>

        {/* Content */}
        <Text style={styles.content}>{quest.content}</Text>

        {/* Anime Reference */}
        {quest.animeReference && (
          <AnimeTag anime={quest.animeReference} onPress={onAnimePress} />
        )}

        {/* Media Attachment */}
        {quest.mediaAttachment && (
          <View style={styles.mediaContainer}>
            <Image
              source={{ uri: quest.mediaAttachment.url }}
              style={styles.mediaImage}
              contentFit="cover"
              transition={200}
            />
          </View>
        )}

        {/* Action Bar */}
        {showActions && (
          <View style={styles.actionBar}>
            <ActionButton
              icon="chatbubble-outline"
              count={quest.replies}
              isActive={false}
              activeColor={COLORS.accent.tertiary}
              onPress={() => onReply?.()}
            />
            <ActionButton
              icon="repeat-outline"
              count={repostsCount}
              isActive={reposted}
              activeColor={COLORS.accent.success}
              onPress={handleRepost}
            />
            <ActionButton
              icon="heart-outline"
              activeIcon="heart"
              count={likesCount}
              isActive={liked}
              activeColor={COLORS.accent.like}
              onPress={handleLike}
            />
            <ActionButton
              icon="share-outline"
              count={0}
              isActive={false}
              activeColor={COLORS.accent.primary}
              onPress={() => onShare?.()}
            />
          </View>
        )}
      </View>
    </Pressable>
  );
};

// Compact QuestCard variant
export const QuestCardCompact: React.FC<QuestCardProps> = ({
  quest,
  onPress,
}) => {
  return (
    <Pressable onPress={onPress} style={styles.compactCard}>
      <Avatar
        imageUrl={quest.author.avatarUrl}
        size="sm"
      />
      <View style={styles.compactContent}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactAuthor}>@{quest.author.username}</Text>
          <Text style={styles.compactTimestamp}>
            · {formatTimestamp(quest.createdAt)}
          </Text>
        </View>
        <Text style={styles.compactText} numberOfLines={2}>
          {quest.content}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glass.border,
    padding: SPACING[4],
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING[3],
  },
  authorInfo: {
    flex: 1,
    marginLeft: SPACING[3],
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  displayName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  verifiedIcon: {
    marginLeft: SPACING[1],
  },
  hotTakeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent.error,
    paddingHorizontal: SPACING[2],
    paddingVertical: 2,
    borderRadius: LAYOUT.radius.sm,
    marginLeft: SPACING[2],
  },
  hotTakeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginLeft: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  username: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
  },
  separator: {
    color: COLORS.text.tertiary,
    marginHorizontal: SPACING[1],
  },
  timestamp: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
  },
  moreButton: {
    padding: SPACING[1],
  },

  // Content
  content: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary,
    lineHeight: 22,
    marginBottom: SPACING[3],
  },

  // Anime Tag
  animeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glass.light,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    borderRadius: LAYOUT.radius.lg,
    padding: SPACING[2],
    marginBottom: SPACING[3],
  },
  animeTagImage: {
    width: 40,
    height: 56,
    borderRadius: LAYOUT.radius.sm,
  },
  animeTagInfo: {
    flex: 1,
    marginLeft: SPACING[3],
  },
  animeTagTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  animeTagEpisode: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.accent.tertiary,
    marginTop: 2,
  },

  // Media
  mediaContainer: {
    borderRadius: LAYOUT.radius.xl,
    overflow: 'hidden',
    marginBottom: SPACING[3],
  },
  mediaImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: COLORS.background.tertiary,
  },

  // Action Bar
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING[2],
    maxWidth: 320,
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
  actionCount: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginLeft: SPACING[1],
  },

  // Compact variant
  compactCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glass.border,
    padding: SPACING[3],
  },
  compactContent: {
    flex: 1,
    marginLeft: SPACING[3],
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactAuthor: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.secondary,
  },
  compactTimestamp: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
  },
  compactText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary,
    marginTop: 2,
    lineHeight: 20,
  },
});

export default QuestCard;
