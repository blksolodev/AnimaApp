// Anima - Anime Library Screen
// MyAnimeList-style tracking with glassmorphic design

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ScrollView,
  Dimensions,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { GlassCard, GlassButton, GuestPrompt, useGuestPrompt } from '../../components/glass-ui';
import { useUserStore, useAnimeLibraryStore } from '../../store';
import { WatchlistEntry, WatchStatus } from '../../types';
import { COLORS, LAYOUT, TYPOGRAPHY, SPACING } from '../../theme/designSystem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Status filter options
const STATUS_FILTERS: { key: WatchStatus | 'ALL'; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'ALL', label: 'All', icon: 'albums-outline' },
  { key: 'WATCHING', label: 'Watching', icon: 'play-circle-outline' },
  { key: 'COMPLETED', label: 'Completed', icon: 'checkmark-circle-outline' },
  { key: 'PLANNING', label: 'Plan to Watch', icon: 'time-outline' },
  { key: 'PAUSED', label: 'On Hold', icon: 'pause-circle-outline' },
  { key: 'DROPPED', label: 'Dropped', icon: 'close-circle-outline' },
];

// Stats Card Component
const StatsCard: React.FC<{
  stats: {
    total: number;
    watching: number;
    completed: number;
    episodesWatched: number;
    averageScore: number | null;
  } | null;
}> = ({ stats }) => {
  if (!stats) return null;

  return (
    <GlassCard variant="light" style={styles.statsCard}>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.watching}</Text>
          <Text style={styles.statLabel}>Watching</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.episodesWatched}</Text>
          <Text style={styles.statLabel}>Episodes</Text>
        </View>
      </View>
      {stats.averageScore && (
        <View style={styles.avgScoreContainer}>
          <Ionicons name="star" size={14} color={COLORS.accent.warning} />
          <Text style={styles.avgScoreText}>
            Average Score: {stats.averageScore.toFixed(1)}
          </Text>
        </View>
      )}
    </GlassCard>
  );
};

// Filter Chip Component
const FilterChip: React.FC<{
  filter: typeof STATUS_FILTERS[0];
  isActive: boolean;
  onPress: () => void;
  count?: number;
}> = ({ filter, isActive, onPress, count }) => (
  <Pressable
    onPress={onPress}
    style={[styles.filterChip, isActive && styles.filterChipActive]}
  >
    <Ionicons
      name={filter.icon}
      size={16}
      color={isActive ? COLORS.accent.primary : COLORS.text.tertiary}
    />
    <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
      {filter.label}
    </Text>
    {count !== undefined && count > 0 && (
      <View style={[styles.filterBadge, isActive && styles.filterBadgeActive]}>
        <Text style={[styles.filterBadgeText, isActive && styles.filterBadgeTextActive]}>
          {count}
        </Text>
      </View>
    )}
  </Pressable>
);

// Anime Library Card
const LibraryCard: React.FC<{
  entry: WatchlistEntry;
  onPress: () => void;
  onProgressPress: () => void;
}> = ({ entry, onPress, onProgressPress }) => {
  const title = entry.anime.title.english || entry.anime.title.romaji || 'Unknown';
  const progress = entry.progress;
  const total = entry.anime.episodes;
  const progressPercent = total ? (progress / total) * 100 : 0;

  const getStatusColor = (status: WatchStatus): string => {
    switch (status) {
      case 'WATCHING': return COLORS.accent.tertiary;
      case 'COMPLETED': return COLORS.accent.success;
      case 'PLANNING': return COLORS.accent.secondary;
      case 'PAUSED': return COLORS.accent.warning;
      case 'DROPPED': return COLORS.accent.error;
      default: return COLORS.text.tertiary;
    }
  };

  return (
    <Pressable onPress={onPress} style={styles.libraryCard}>
      {/* Cover Image */}
      <Image
        source={{ uri: entry.anime.coverImage.large }}
        style={styles.cardCover}
        contentFit="cover"
        transition={200}
      />

      {/* Info Section */}
      <View style={styles.cardInfo}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {title}
          </Text>
          {entry.score && (
            <View style={styles.scoreBadge}>
              <Ionicons name="star" size={12} color={COLORS.accent.warning} />
              <Text style={styles.scoreText}>{entry.score}</Text>
            </View>
          )}
        </View>

        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(entry.status)}20` }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(entry.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(entry.status) }]}>
            {entry.status.charAt(0) + entry.status.slice(1).toLowerCase()}
          </Text>
        </View>

        {/* Progress */}
        <Pressable onPress={onProgressPress} style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {progress} / {total ?? '?'} episodes
          </Text>
        </Pressable>

        {/* Genres */}
        <View style={styles.genreContainer}>
          {entry.anime.genres.slice(0, 3).map((genre, index) => (
            <View key={index} style={styles.genreTag}>
              <Text style={styles.genreText}>{genre}</Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
};

// Empty State
const EmptyState: React.FC<{
  filter: WatchStatus | 'ALL';
  onAddPress: () => void;
}> = ({ filter, onAddPress }) => (
  <View style={styles.emptyState}>
    <Ionicons name="library-outline" size={64} color={COLORS.text.tertiary} />
    <Text style={styles.emptyTitle}>
      {filter === 'ALL' ? 'Your library is empty' : `No ${filter.toLowerCase()} anime`}
    </Text>
    <Text style={styles.emptySubtitle}>
      {filter === 'ALL'
        ? 'Start tracking your anime journey!'
        : `You haven't ${filter === 'WATCHING' ? 'started' : filter === 'COMPLETED' ? 'finished' : 'added'} any anime yet.`}
    </Text>
    <GlassButton
      title="Browse Anime"
      onPress={onAddPress}
      variant="primary"
      leftIcon={<Ionicons name="search" size={18} color={COLORS.text.primary} />}
      style={styles.emptyButton}
    />
  </View>
);

// Guest Library Screen
const GuestLibraryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { exitGuestMode } = useUserStore();

  return (
    <View style={styles.guestContainer}>
      <LinearGradient
        colors={[COLORS.background.secondary, COLORS.background.primary]}
        style={StyleSheet.absoluteFillObject}
      />
      <Ionicons name="library" size={80} color={COLORS.accent.primary} />
      <Text style={styles.guestTitle}>Track Your Anime</Text>
      <Text style={styles.guestSubtitle}>
        Create an account to build your anime library, track progress, and share your favorites!
      </Text>
      <GlassButton
        title="Sign Up"
        onPress={() => {
          exitGuestMode();
          navigation.navigate('Auth');
        }}
        variant="primary"
        style={styles.guestButton}
      />
      <GlassButton
        title="Log In"
        onPress={() => {
          exitGuestMode();
          navigation.navigate('Auth');
        }}
        variant="glass"
        style={styles.guestButton}
      />
    </View>
  );
};

export const AnimeLibraryScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, isGuest } = useUserStore();
  const {
    filteredLibrary,
    currentFilter,
    stats,
    isLoading,
    fetchLibrary,
    fetchStats,
    filterByStatus,
  } = useAnimeLibraryStore();

  const [refreshing, setRefreshing] = useState(false);

  // Fetch library on mount
  useEffect(() => {
    if (user?.id) {
      fetchLibrary(user.id);
      fetchStats(user.id);
    }
  }, [user?.id]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    if (!user?.id) return;
    setRefreshing(true);
    await Promise.all([fetchLibrary(user.id), fetchStats(user.id)]);
    setRefreshing(false);
  }, [user?.id]);

  // Get count for each status
  const getStatusCount = (status: WatchStatus | 'ALL'): number => {
    if (status === 'ALL') return stats?.total ?? 0;
    switch (status) {
      case 'WATCHING': return stats?.watching ?? 0;
      case 'COMPLETED': return stats?.completed ?? 0;
      case 'PAUSED': return stats?.paused ?? 0;
      case 'DROPPED': return stats?.dropped ?? 0;
      case 'PLANNING': return stats?.planning ?? 0;
      default: return 0;
    }
  };

  // Show guest screen if not logged in
  if (isGuest || !user) {
    return <GuestLibraryScreen />;
  }

  const handleAnimePress = (entry: WatchlistEntry) => {
    navigation.navigate('AnimeDetail', { animeId: entry.animeId });
  };

  const handleProgressPress = (entry: WatchlistEntry) => {
    // Navigate to episode progress editor
    navigation.navigate('AnimeDetail', { animeId: entry.animeId, openProgress: true });
  };

  const handleBrowsePress = () => {
    navigation.navigate('Search');
  };

  const renderItem = ({ item }: { item: WatchlistEntry }) => (
    <LibraryCard
      entry={item}
      onPress={() => handleAnimePress(item)}
      onProgressPress={() => handleProgressPress(item)}
    />
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background */}
      <LinearGradient
        colors={[COLORS.background.secondary, COLORS.background.primary]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING[2] }]}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>My Library</Text>
          <Pressable onPress={handleBrowsePress} style={styles.addButton}>
            <Ionicons name="add" size={24} color={COLORS.text.primary} />
          </Pressable>
        </View>
      </View>

      {/* Stats Card */}
      <View style={styles.statsContainer}>
        <StatsCard stats={stats} />
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
        style={styles.filterScroll}
      >
        {STATUS_FILTERS.map((filter) => (
          <FilterChip
            key={filter.key}
            filter={filter}
            isActive={currentFilter === filter.key}
            onPress={() => filterByStatus(filter.key)}
            count={getStatusCount(filter.key)}
          />
        ))}
      </ScrollView>

      {/* Library List */}
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent.primary} />
        </View>
      ) : filteredLibrary.length === 0 ? (
        <EmptyState filter={currentFilter} onAddPress={handleBrowsePress} />
      ) : (
        <FlatList
          data={filteredLibrary}
          renderItem={renderItem}
          keyExtractor={(item) => item.animeId.toString()}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: LAYOUT.heights.tabBar + SPACING[6] },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.accent.primary}
            />
          }
        />
      )}
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
    paddingHorizontal: SPACING[4],
    paddingBottom: SPACING[3],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Stats
  statsContainer: {
    paddingHorizontal: SPACING[4],
    marginBottom: SPACING[3],
  },
  statsCard: {
    padding: SPACING[4],
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.tertiary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.glass.border,
  },
  avgScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING[3],
    paddingTop: SPACING[3],
    borderTopWidth: 1,
    borderTopColor: COLORS.glass.border,
  },
  avgScoreText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING[1],
  },

  // Filters
  filterScroll: {
    maxHeight: 48,
    marginBottom: SPACING[3],
  },
  filterContainer: {
    paddingHorizontal: SPACING[4],
    gap: SPACING[2],
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[2],
    borderRadius: LAYOUT.radius.full,
    backgroundColor: COLORS.background.tertiary,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    gap: SPACING[2],
  },
  filterChipActive: {
    backgroundColor: `${COLORS.accent.primary}20`,
    borderColor: COLORS.accent.primary,
  },
  filterLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  filterLabelActive: {
    color: COLORS.accent.primary,
  },
  filterBadge: {
    backgroundColor: COLORS.glass.medium,
    paddingHorizontal: SPACING[2],
    paddingVertical: 2,
    borderRadius: LAYOUT.radius.sm,
  },
  filterBadgeActive: {
    backgroundColor: `${COLORS.accent.primary}30`,
  },
  filterBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.tertiary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  filterBadgeTextActive: {
    color: COLORS.accent.primary,
  },

  // List
  listContent: {
    paddingHorizontal: SPACING[4],
    paddingTop: SPACING[2],
  },

  // Library Card
  libraryCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.secondary,
    borderRadius: LAYOUT.radius.xl,
    marginBottom: SPACING[3],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  cardCover: {
    width: 100,
    height: 140,
  },
  cardInfo: {
    flex: 1,
    padding: SPACING[3],
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginRight: SPACING[2],
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.accent.warning}20`,
    paddingHorizontal: SPACING[2],
    paddingVertical: 2,
    borderRadius: LAYOUT.radius.sm,
    gap: 2,
  },
  scoreText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.accent.warning,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING[2],
    paddingVertical: 4,
    borderRadius: LAYOUT.radius.sm,
    gap: SPACING[1],
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  progressSection: {
    marginTop: SPACING[1],
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.glass.medium,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.tertiary,
    marginTop: 4,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[1],
    marginTop: SPACING[1],
  },
  genreTag: {
    backgroundColor: COLORS.glass.light,
    paddingHorizontal: SPACING[2],
    paddingVertical: 2,
    borderRadius: LAYOUT.radius.sm,
  },
  genreText: {
    fontSize: 10,
    color: COLORS.text.tertiary,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING[6],
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginTop: SPACING[4],
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    marginTop: SPACING[2],
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: SPACING[6],
    paddingHorizontal: SPACING[6],
  },

  // Guest
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING[6],
  },
  guestTitle: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginTop: SPACING[6],
  },
  guestSubtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING[3],
    lineHeight: 24,
  },
  guestButton: {
    marginTop: SPACING[4],
    width: 200,
  },
});

export default AnimeLibraryScreen;
