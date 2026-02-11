// Anima - ContentCard Component v2.0
// Feed card combining Twitter post style with Crunchyroll media presentation

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from './Avatar';
import { COLORS, LAYOUT, TYPOGRAPHY, SPACING } from '../../theme/designSystem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface ContentAuthor {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  verified?: boolean;
  isPremium?: boolean;
}

export interface AnimeTag {
  id: number;
  title: string;
  coverImage?: string;
  episode?: number;
}

export interface MediaAttachment {
  type: 'image' | 'video' | 'gif';
  url: string;
  aspectRatio?: number;
  thumbnail?: string;
}

export interface ContentCardProps {
  id: string;
  author: ContentAuthor;
  content: string;
  createdAt: Date;
  media?: MediaAttachment[];
  animeTag?: AnimeTag;
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  onPress?: () => void;
  onAuthorPress?: () => void;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onMediaPress?: (index: number) => void;
  onAnimePress?: () => void;
  style?: ViewStyle;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  id,
  author,
  content,
  createdAt,
  media,
  animeTag,
  likes,
  comments,
  shares,
  isLiked = false,
  isBookmarked = false,
  onPress,
  onAuthorPress,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onMediaPress,
  onAnimePress,
  style,
}) => {
  const [liked, setLiked] = useState(isLiked);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
    onLike?.();
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    onBookmark?.();
  };

  const formatTimeAgo = (date: Date): string => {
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

  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <Pressable onPress={onPress} style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onAuthorPress} style={styles.authorSection}>
          <Avatar
            imageUrl={author.avatarUrl}
            size="md"
            status={author.isPremium ? 'online' : 'none'}
            ring={author.isPremium}
            ringColor={COLORS.accent.primary}
          />
          <View style={styles.authorInfo}>
            <View style={styles.authorNameRow}>
              <Text style={styles.displayName} numberOfLines={1}>
                {author.displayName}
              </Text>
              {author.verified && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={COLORS.accent.primary}
                  style={styles.verifiedIcon}
                />
              )}
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.username}>@{author.username}</Text>
              <Text style={styles.separator}>·</Text>
              <Text style={styles.timestamp}>{formatTimeAgo(createdAt)}</Text>
            </View>
          </View>
        </Pressable>

        {/* More Options Button */}
        <Pressable style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.text.tertiary} />
        </Pressable>
      </View>

      {/* Content */}
      <Text style={styles.content}>{content}</Text>

      {/* Anime Tag */}
      {animeTag && (
        <Pressable onPress={onAnimePress} style={styles.animeTag}>
          {animeTag.coverImage && (
            <Image
              source={{ uri: animeTag.coverImage }}
              style={styles.animeTagImage}
              contentFit="cover"
            />
          )}
          <View style={styles.animeTagInfo}>
            <Text style={styles.animeTagTitle} numberOfLines={1}>
              {animeTag.title}
            </Text>
            {animeTag.episode && (
              <Text style={styles.animeTagEpisode}>Episode {animeTag.episode}</Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.text.tertiary} />
        </Pressable>
      )}

      {/* Media */}
      {media && media.length > 0 && (
        <View style={styles.mediaContainer}>
          {media.length === 1 ? (
            <Pressable onPress={() => onMediaPress?.(0)}>
              <Image
                source={{ uri: media[0].url }}
                style={[
                  styles.singleMedia,
                  { aspectRatio: media[0].aspectRatio || 16 / 9 },
                ]}
                contentFit="cover"
                transition={200}
              />
              {media[0].type === 'video' && (
                <View style={styles.playOverlay}>
                  <View style={styles.playButton}>
                    <Ionicons name="play" size={28} color={COLORS.text.primary} />
                  </View>
                </View>
              )}
            </Pressable>
          ) : (
            <View style={styles.mediaGrid}>
              {media.slice(0, 4).map((item, index) => (
                <Pressable
                  key={index}
                  onPress={() => onMediaPress?.(index)}
                  style={[
                    styles.gridItem,
                    media.length === 2 && styles.gridItemHalf,
                    media.length === 3 && index === 0 && styles.gridItemLarge,
                    media.length >= 4 && styles.gridItemQuarter,
                  ]}
                >
                  <Image
                    source={{ uri: item.url }}
                    style={styles.gridImage}
                    contentFit="cover"
                  />
                  {index === 3 && media.length > 4 && (
                    <View style={styles.moreOverlay}>
                      <Text style={styles.moreText}>+{media.length - 4}</Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Action Bar */}
      <View style={styles.actionBar}>
        {/* Comment */}
        <Pressable onPress={onComment} style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color={COLORS.text.tertiary} />
          {comments > 0 && (
            <Text style={styles.actionCount}>{formatCount(comments)}</Text>
          )}
        </Pressable>

        {/* Share/Repost */}
        <Pressable onPress={onShare} style={styles.actionButton}>
          <Ionicons name="repeat-outline" size={20} color={COLORS.text.tertiary} />
          {shares > 0 && (
            <Text style={styles.actionCount}>{formatCount(shares)}</Text>
          )}
        </Pressable>

        {/* Like */}
        <Pressable onPress={handleLike} style={styles.actionButton}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={20}
            color={liked ? COLORS.accent.like : COLORS.text.tertiary}
          />
          {likeCount > 0 && (
            <Text
              style={[
                styles.actionCount,
                liked && { color: COLORS.accent.like },
              ]}
            >
              {formatCount(likeCount)}
            </Text>
          )}
        </Pressable>

        {/* Bookmark */}
        <Pressable onPress={handleBookmark} style={styles.actionButton}>
          <Ionicons
            name={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={bookmarked ? COLORS.accent.primary : COLORS.text.tertiary}
          />
        </Pressable>

        {/* Share External */}
        <Pressable onPress={onShare} style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color={COLORS.text.tertiary} />
        </Pressable>
      </View>
    </Pressable>
  );
};

// Compact variant for lists/previews
export const ContentCardCompact: React.FC<Omit<ContentCardProps, 'media'>> = (props) => {
  return (
    <Pressable onPress={props.onPress} style={styles.compactContainer}>
      <Avatar imageUrl={props.author.avatarUrl} size="sm" />
      <View style={styles.compactContent}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactAuthor}>@{props.author.username}</Text>
          {props.author.verified && (
            <Ionicons
              name="checkmark-circle"
              size={12}
              color={COLORS.accent.primary}
              style={{ marginLeft: 4 }}
            />
          )}
        </View>
        <Text style={styles.compactText} numberOfLines={2}>
          {props.content}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glass.border,
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING[3],
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorInfo: {
    marginLeft: SPACING[3],
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  displayName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    maxWidth: 160,
  },
  verifiedIcon: {
    marginLeft: SPACING[1],
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
    fontSize: TYPOGRAPHY.sizes.sm,
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
  content: {
    fontSize: TYPOGRAPHY.sizes.base,
    lineHeight: TYPOGRAPHY.sizes.base * TYPOGRAPHY.lineHeights.normal,
    color: COLORS.text.primary,
    marginBottom: SPACING[3],
  },
  animeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glass.light,
    borderRadius: LAYOUT.radius.lg,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    padding: SPACING[2],
    marginBottom: SPACING[3],
  },
  animeTagImage: {
    width: 40,
    height: 56,
    borderRadius: LAYOUT.radius.sm,
  },
  animeTagInfo: {
    marginLeft: SPACING[3],
    flex: 1,
  },
  animeTagTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
  },
  animeTagEpisode: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.accent.tertiary,
    marginTop: 2,
  },
  mediaContainer: {
    borderRadius: LAYOUT.radius.xl,
    overflow: 'hidden',
    marginBottom: SPACING[3],
  },
  singleMedia: {
    width: '100%',
    borderRadius: LAYOUT.radius.xl,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  gridItem: {
    overflow: 'hidden',
  },
  gridItemHalf: {
    width: '49.5%',
    aspectRatio: 1,
  },
  gridItemLarge: {
    width: '66%',
    aspectRatio: 1,
  },
  gridItemQuarter: {
    width: '49.5%',
    aspectRatio: 1,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING[2],
    paddingRight: SPACING[4],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING[2],
    paddingHorizontal: SPACING[2],
    borderRadius: LAYOUT.radius.full,
  },
  actionCount: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
    marginLeft: SPACING[1],
  },
  // Compact variant
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.background.secondary,
    padding: SPACING[3],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glass.border,
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
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.tertiary,
  },
  compactText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.primary,
    marginTop: 2,
    lineHeight: 18,
  },
});

export default ContentCard;
