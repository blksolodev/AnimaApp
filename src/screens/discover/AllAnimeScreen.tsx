// Anima - All Anime Screen
// Browse all trending anime with infinite scroll

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { getTrendingAnime, searchAnime } from '../../services/AniListService';
import { AnimeMedia } from '../../types';
import { SearchStackParamList } from '../../navigation/AppNavigator';
import { COLORS, LAYOUT, TYPOGRAPHY, SPACING } from '../../theme/designSystem';

type AllAnimeNavigationProp = StackNavigationProp<SearchStackParamList, 'AllAnime'>;
type AllAnimeRouteProp = RouteProp<SearchStackParamList, 'AllAnime'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - SPACING[4] * 3) / 2;

// Anime Card Component
const AnimeCard: React.FC<{
  anime: AnimeMedia;
  onPress: () => void;
}> = ({ anime, onPress }) => {
  const title = anime.title.english || anime.title.romaji || 'Unknown';
  const coverImage = anime.coverImage?.large || anime.coverImage?.medium;
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;

  return (
    <Pressable onPress={onPress} style={styles.animeCard}>
      <Image
        source={{ uri: coverImage }}
        style={styles.animeImage}
        contentFit="cover"
        transition={200}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.9)']}
        style={styles.animeGradient}
      >
        <View style={styles.animeInfo}>
          <Text style={styles.animeTitle} numberOfLines={2}>{title}</Text>
          <View style={styles.metaRow}>
            {score && (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={10} color={COLORS.text.primary} />
                <Text style={styles.ratingText}>{score}</Text>
              </View>
            )}
            {anime.episodes && (
              <Text style={styles.episodeText}>{anime.episodes} eps</Text>
            )}
          </View>
          {anime.genres && anime.genres.length > 0 && (
            <Text style={styles.genreText} numberOfLines={1}>
              {anime.genres.slice(0, 2).join(' • ')}
            </Text>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
};

export const AllAnimeScreen: React.FC = () => {
  const navigation = useNavigation<AllAnimeNavigationProp>();
  const route = useRoute<AllAnimeRouteProp>();
  const insets = useSafeAreaInsets();

  const { category, title: screenTitle } = route.params || {};

  const [anime, setAnime] = useState<AnimeMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch anime data
  const fetchAnime = useCallback(async (pageNum: number, refresh = false) => {
    if (pageNum === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      let result;
      if (category) {
        // Search by category/genre
        result = await searchAnime(category, pageNum, 20);
      } else {
        // Get trending anime
        result = await getTrendingAnime(pageNum, 20);
      }

      const newAnime = result.anime;

      if (refresh || pageNum === 1) {
        setAnime(newAnime);
      } else {
        setAnime((prev) => [...prev, ...newAnime]);
      }

      setHasMore(result.hasNextPage);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch anime:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setRefreshing(false);
    }
  }, [category]);

  // Initial fetch
  useEffect(() => {
    fetchAnime(1);
  }, [fetchAnime]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAnime(1, true);
  }, [fetchAnime]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading) {
      fetchAnime(page + 1);
    }
  }, [isLoadingMore, hasMore, isLoading, page, fetchAnime]);

  // Handle anime press
  const handleAnimePress = useCallback((item: AnimeMedia) => {
    navigation.navigate('AnimeDetail', { animeId: item.id });
  }, [navigation]);

  // Render footer
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.accent.primary} />
      </View>
    );
  };

  // Render empty state
  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyState}>
        <Ionicons name="film-outline" size={64} color={COLORS.text.tertiary} />
        <Text style={styles.emptyTitle}>No anime found</Text>
        <Text style={styles.emptyText}>
          {category ? `No ${category} anime available` : 'Check back later for trending anime'}
        </Text>
      </View>
    );
  };

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
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {screenTitle || (category ? `${category} Anime` : 'Trending Anime')}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent.primary} />
          <Text style={styles.loadingText}>Loading anime...</Text>
        </View>
      ) : (
        <FlatList
          data={anime}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <AnimeCard anime={item} onPress={() => handleAnimePress(item)} />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + SPACING[6] },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.accent.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[4],
    paddingBottom: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glass.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginHorizontal: SPACING[3],
  },
  headerSpacer: {
    width: 40,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    marginTop: SPACING[3],
  },

  // List
  listContent: {
    paddingHorizontal: SPACING[4],
    paddingTop: SPACING[4],
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: SPACING[4],
  },

  // Anime Card
  animeCard: {
    width: CARD_WIDTH,
    aspectRatio: 0.65,
    borderRadius: LAYOUT.radius.xl,
    overflow: 'hidden',
    backgroundColor: COLORS.background.tertiary,
  },
  animeImage: {
    width: '100%',
    height: '100%',
  },
  animeGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: SPACING[3],
  },
  animeInfo: {
    gap: SPACING[1],
  },
  animeTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    marginTop: SPACING[1],
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent.primary,
    paddingHorizontal: SPACING[2],
    paddingVertical: 2,
    borderRadius: LAYOUT.radius.sm,
    gap: 2,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  episodeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
  },
  genreText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.tertiary,
    marginTop: 2,
  },

  // Footer
  footerLoader: {
    paddingVertical: SPACING[6],
    alignItems: 'center',
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[16],
    paddingHorizontal: SPACING[6],
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginTop: SPACING[4],
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING[2],
  },
});

export default AllAnimeScreen;
