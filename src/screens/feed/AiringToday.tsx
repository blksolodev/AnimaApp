// Anima - AiringToday Screen v2.0
// Real-time anime airing schedule with glassmorphic design

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Linking,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { GlassCard } from '../../components/glass-ui';
import { getAiringSchedule, formatTimeUntilAiring, getStreamingLinks } from '../../services';
import { AiringSchedule, StreamingService } from '../../types';
import { HomeStackParamList } from '../../navigation/AppNavigator';
import { COLORS, LAYOUT, TYPOGRAPHY, SPACING, EFFECTS } from '../../theme/designSystem';

type AiringNavigationProp = StackNavigationProp<HomeStackParamList, 'AiringToday'>;

// Streaming service config
const STREAMING_CONFIG: Record<StreamingService, { name: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  crunchyroll: { name: 'CR', color: '#F47521', icon: 'play-circle' },
  netflix: { name: 'NF', color: '#E50914', icon: 'play' },
  funimation: { name: 'FN', color: '#5B0BB5', icon: 'tv' },
  hulu: { name: 'HU', color: '#1CE783', icon: 'videocam' },
  prime: { name: 'PR', color: '#00A8E1', icon: 'logo-amazon' },
  hidive: { name: 'HD', color: '#00BAFF', icon: 'play-circle-outline' },
};

interface AiringCardProps {
  schedule: AiringSchedule;
  onGuildPress: () => void;
  onAnimePress: () => void;
}

const AiringCard: React.FC<AiringCardProps> = ({ schedule, onGuildPress, onAnimePress }) => {
  const [timeLeft, setTimeLeft] = useState(schedule.timeUntilAiring);
  const isAired = timeLeft <= 0;

  // Countdown timer
  useEffect(() => {
    if (isAired) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isAired]);

  const title =
    schedule.media.title.english ||
    schedule.media.title.romaji ||
    schedule.media.title.native ||
    'Unknown';

  const streamingLinks = getStreamingLinks(title);

  const handlePortalPress = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Failed to open link:', error);
    }
  };

  return (
    <Pressable onPress={onAnimePress}>
      <View style={styles.airingCard}>
        {/* Glass Background */}
        {Platform.OS === 'ios' ? (
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: COLORS.glass.medium }]} />
        )}

        {/* Content */}
        <View style={styles.cardContent}>
          {/* Cover Image */}
          <View style={styles.coverContainer}>
            <Image
              source={{ uri: schedule.media.coverImage.large }}
              style={styles.coverImage}
              contentFit="cover"
              transition={200}
            />
            {/* Status Badge */}
            <View style={[styles.statusBadge, isAired && styles.statusBadgeLive]}>
              {isAired && <View style={styles.liveDot} />}
              <Text style={styles.statusText}>{isAired ? 'LIVE' : 'SOON'}</Text>
            </View>
          </View>

          {/* Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>

            {/* Episode */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Episode</Text>
                <Text style={styles.episodeNumber}>{schedule.episode}</Text>
              </View>

              {/* Time */}
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>{isAired ? 'Status' : 'Airing in'}</Text>
                {isAired ? (
                  <Text style={styles.liveText}>Now Airing</Text>
                ) : (
                  <Text style={styles.timeValue}>{formatTimeUntilAiring(timeLeft)}</Text>
                )}
              </View>
            </View>

            {/* Streaming Links */}
            <View style={styles.streamingContainer}>
              <Text style={styles.streamingLabel}>Watch on</Text>
              <View style={styles.streamingRow}>
                {streamingLinks.slice(0, 4).map((link) => {
                  const config = STREAMING_CONFIG[link.service];
                  return (
                    <Pressable
                      key={link.service}
                      style={[styles.streamingButton, { borderColor: config.color }]}
                      onPress={() => handlePortalPress(link.url)}
                    >
                      <Text style={[styles.streamingText, { color: config.color }]}>
                        {config.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Guild Chat Button */}
            {isAired && (
              <Pressable style={styles.guildButton} onPress={onGuildPress}>
                <Ionicons name="chatbubbles" size={16} color={COLORS.text.primary} />
                <Text style={styles.guildButtonText}>Join Discussion</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export const AiringTodayScreen: React.FC = () => {
  const navigation = useNavigation<AiringNavigationProp>();
  const insets = useSafeAreaInsets();

  const [schedules, setSchedules] = useState<AiringSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchSchedules = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
      setPage(1);
    } else if (!refresh && page === 1) {
      setIsLoading(true);
    }

    try {
      const { schedules: newSchedules, hasNextPage } = await getAiringSchedule(
        refresh ? 1 : page,
        20
      );

      if (refresh || page === 1) {
        setSchedules(newSchedules);
      } else {
        setSchedules((prev) => [...prev, ...newSchedules]);
      }

      setHasMore(hasNextPage);
    } catch (error) {
      console.error('Failed to fetch airing schedule:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [page]);

  const handleRefresh = useCallback(() => {
    fetchSchedules(true);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading && !isRefreshing) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, isLoading, isRefreshing]);

  const handleGuildPress = (schedule: AiringSchedule) => {
    const title =
      schedule.media.title.english ||
      schedule.media.title.romaji ||
      'Unknown';

    navigation.navigate('GuildChat', {
      roomId: `${schedule.mediaId}_ep${schedule.episode}`,
      animeName: title,
      episode: schedule.episode,
    });
  };

  const handleAnimePress = (schedule: AiringSchedule) => {
    // Navigate to anime detail - would need to add to navigation params
    // For now, just a placeholder
  };

  const renderSchedule = useCallback(
    ({ item }: { item: AiringSchedule }) => (
      <AiringCard
        schedule={item}
        onGuildPress={() => handleGuildPress(item)}
        onAnimePress={() => handleAnimePress(item)}
      />
    ),
    []
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent.primary} />
          <Text style={styles.loadingText}>Loading schedule...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={64} color={COLORS.text.tertiary} />
        <Text style={styles.emptyTitle}>No Episodes Today</Text>
        <Text style={styles.emptyText}>
          No anime episodes are airing right now. Check back later!
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!hasMore || schedules.length === 0) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.accent.primary} />
      </View>
    );
  };

  // Count live episodes
  const liveCount = schedules.filter((s) => s.timeUntilAiring <= 0).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background Gradient */}
      <LinearGradient
        colors={[COLORS.background.secondary, COLORS.background.primary]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING[2] }]}>
        {/* Glass Background for Header */}
        {Platform.OS === 'ios' ? (
          <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFillObject} />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: COLORS.glass.overlay }]} />
        )}

        <View style={styles.headerContent}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text.primary} />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Airing Today</Text>
            {liveCount > 0 && (
              <View style={styles.liveCountBadge}>
                <View style={styles.liveIndicator} />
                <Text style={styles.liveCountText}>{liveCount} Live</Text>
              </View>
            )}
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* Bottom Border */}
        <View style={styles.headerBorder} />
      </View>

      {/* Schedule List */}
      <FlatList
        data={schedules}
        keyExtractor={(item) => `${item.mediaId}_${item.episode}`}
        renderItem={renderSchedule}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={[
          styles.listContent,
          schedules.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.accent.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },

  // Header
  header: {
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[4],
    paddingBottom: SPACING[3],
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: LAYOUT.radius.lg,
    backgroundColor: COLORS.glass.light,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  liveCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING[1],
    paddingHorizontal: SPACING[2],
    paddingVertical: 2,
    borderRadius: LAYOUT.radius.full,
    backgroundColor: `${COLORS.semantic.live}20`,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.semantic.live,
    marginRight: SPACING[1],
  },
  liveCountText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.semantic.live,
  },
  headerSpacer: {
    width: 40,
  },
  headerBorder: {
    height: 1,
    backgroundColor: COLORS.glass.border,
  },

  // List
  listContent: {
    padding: SPACING[4],
    paddingBottom: LAYOUT.heights.tabBar + SPACING[6],
  },
  listContentEmpty: {
    flex: 1,
  },

  // Airing Card
  airingCard: {
    borderRadius: LAYOUT.radius.xl,
    overflow: 'hidden',
    marginBottom: SPACING[4],
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  cardContent: {
    flexDirection: 'row',
    padding: SPACING[3],
  },
  coverContainer: {
    position: 'relative',
  },
  coverImage: {
    width: 100,
    height: 140,
    borderRadius: LAYOUT.radius.lg,
  },
  statusBadge: {
    position: 'absolute',
    top: SPACING[2],
    left: SPACING[2],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent.warning,
    paddingHorizontal: SPACING[2],
    paddingVertical: 2,
    borderRadius: LAYOUT.radius.sm,
  },
  statusBadgeLive: {
    backgroundColor: COLORS.semantic.live,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.text.primary,
    marginRight: 4,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  infoContainer: {
    flex: 1,
    marginLeft: SPACING[3],
    justifyContent: 'space-between',
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING[2],
  },
  metaRow: {
    flexDirection: 'row',
    gap: SPACING[4],
    marginBottom: SPACING[3],
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.tertiary,
    marginBottom: 2,
  },
  episodeNumber: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.accent.primary,
  },
  timeValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.accent.secondary,
  },
  liveText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.semantic.live,
  },

  // Streaming
  streamingContainer: {
    marginBottom: SPACING[2],
  },
  streamingLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.tertiary,
    marginBottom: SPACING[2],
  },
  streamingRow: {
    flexDirection: 'row',
    gap: SPACING[2],
  },
  streamingButton: {
    borderWidth: 1.5,
    borderRadius: LAYOUT.radius.md,
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[1],
    backgroundColor: COLORS.glass.light,
  },
  streamingText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  // Guild Button
  guildButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent.primary,
    paddingVertical: SPACING[2],
    borderRadius: LAYOUT.radius.lg,
    gap: SPACING[2],
  },
  guildButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING[16],
  },
  loadingText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    marginTop: SPACING[3],
  },
  footerLoader: {
    paddingVertical: SPACING[4],
    alignItems: 'center',
  },

  // Empty
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING[16],
    paddingHorizontal: SPACING[6],
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginTop: SPACING[4],
    marginBottom: SPACING[2],
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});

export default AiringTodayScreen;
