// Anima - Search/Discover Screen v2.0
// Glassmorphic search and discovery experience with real data

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  ScrollView,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  GlassCard,
  Avatar,
  GlassButton,
  ContentCard,
} from '../../components/glass-ui';
import { useFeedStore, useUserStore } from '../../store';
import { getTrendingAnime, searchAnime } from '../../services/AniListService';
import { AnimeMedia, Quest } from '../../types';
import { SearchStackParamList } from '../../navigation/AppNavigator';
import { COLORS, LAYOUT, TYPOGRAPHY, SPACING } from '../../theme/designSystem';

type SearchNavigationProp = StackNavigationProp<SearchStackParamList, 'Discover'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - SPACING[4] * 3) / 2;

// Categories
const CATEGORIES = [
  { id: 'action', name: 'Action', icon: 'flash', color: '#EF4444' },
  { id: 'romance', name: 'Romance', icon: 'heart', color: '#EC4899' },
  { id: 'comedy', name: 'Comedy', icon: 'happy', color: '#F59E0B' },
  { id: 'fantasy', name: 'Fantasy', icon: 'sparkles', color: '#8B5CF6' },
  { id: 'scifi', name: 'Sci-Fi', icon: 'planet', color: '#06B6D4' },
  { id: 'horror', name: 'Horror', icon: 'skull', color: '#6B7280' },
];

// Search Bar Component
const GlassSearchBar: React.FC<{
  value: string;
  onChangeText: (text: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  isFocused: boolean;
  onSubmit: () => void;
}> = ({ value, onChangeText, onFocus, onBlur, isFocused, onSubmit }) => {
  return (
    <View style={[styles.searchContainer, isFocused && styles.searchContainerFocused]}>
      <Ionicons
        name="search"
        size={20}
        color={COLORS.text.tertiary}
        style={styles.searchIcon}
      />

      <TextInput
        style={styles.searchInput}
        placeholder="Search anime, users, or topics..."
        placeholderTextColor={COLORS.text.tertiary}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
      />

      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} style={styles.clearButton}>
          <Ionicons name="close-circle" size={20} color={COLORS.text.tertiary} />
        </Pressable>
      )}
    </View>
  );
};

// Category Chip
const CategoryChip: React.FC<{
  category: typeof CATEGORIES[0];
  onPress: () => void;
}> = ({ category, onPress }) => (
  <Pressable onPress={onPress} style={styles.categoryChip}>
    <LinearGradient
      colors={[`${category.color}30`, `${category.color}10`]}
      style={styles.categoryGradient}
    >
      <Ionicons name={category.icon as any} size={18} color={category.color} />
      <Text style={styles.categoryName}>{category.name}</Text>
    </LinearGradient>
  </Pressable>
);

// Anime Card
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
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.animeGradient}
      >
        <View style={styles.animeInfo}>
          <Text style={styles.animeTitle} numberOfLines={2}>{title}</Text>
          {score && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={10} color={COLORS.text.primary} />
              <Text style={styles.ratingText}>{score}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
};

// Search Results
const SearchResults: React.FC<{
  results: AnimeMedia[];
  isLoading: boolean;
  onAnimePress: (anime: AnimeMedia) => void;
}> = ({ results, isLoading, onAnimePress }) => {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent.primary} />
        <Text style={styles.loadingText}>Searching...</Text>
      </View>
    );
  }

  if (results.length === 0) {
    return (
      <View style={styles.emptyResults}>
        <Ionicons name="search-outline" size={48} color={COLORS.text.tertiary} />
        <Text style={styles.emptyTitle}>No results found</Text>
        <Text style={styles.emptyText}>Try a different search term</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={results}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      columnWrapperStyle={styles.animeRow}
      renderItem={({ item }) => (
        <AnimeCard anime={item} onPress={() => onAnimePress(item)} />
      )}
      contentContainerStyle={styles.searchResultsContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

export const SearchScreenV2: React.FC = () => {
  const navigation = useNavigation<SearchNavigationProp>();
  const insets = useSafeAreaInsets();
  const { user } = useUserStore();
  const { quests } = useFeedStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<AnimeMedia[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Trending anime state
  const [trendingAnime, setTrendingAnime] = useState<AnimeMedia[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);

  // Fetch trending anime on mount
  useEffect(() => {
    fetchTrendingAnime();
  }, []);

  const fetchTrendingAnime = async () => {
    try {
      setIsLoadingTrending(true);
      const { anime } = await getTrendingAnime(1, 6);
      setTrendingAnime(anime);
    } catch (error) {
      console.error('Failed to fetch trending anime:', error);
    } finally {
      setIsLoadingTrending(false);
    }
  };

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      const { anime } = await searchAnime(searchQuery, 1, 20);
      setSearchResults(anime);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleAnimePress = useCallback((anime: AnimeMedia) => {
    navigation.navigate('AnimeDetail', { animeId: anime.id });
  }, [navigation]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setShowSearchResults(false);
    setSearchResults([]);
  }, []);

  // Get recent/trending posts from the feed
  const trendingPosts = quests.slice(0, 5);

  // Generate trending topics from posts
  const getTrendingTopics = () => {
    const tagCounts: { [key: string]: number } = {};

    quests.forEach((quest) => {
      if (quest.animeReference?.title) {
        const tag = `#${quest.animeReference.title.replace(/\s+/g, '')}`;
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    });

    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([tag, count], index) => ({
        id: index.toString(),
        tag,
        posts: count > 1000 ? `${(count / 1000).toFixed(1)}K` : count.toString(),
      }));
  };

  const trendingTopics = getTrendingTopics();

  // Show search results if searching
  if (showSearchResults) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={[COLORS.background.secondary, COLORS.background.primary]}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={[styles.header, { paddingTop: insets.top + SPACING[2] }]}>
          <View style={styles.searchHeader}>
            <Pressable onPress={handleClearSearch} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
            </Pressable>
            <View style={styles.searchBarWrapper}>
              <GlassSearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                isFocused={isSearchFocused}
                onSubmit={handleSearch}
              />
            </View>
          </View>
        </View>

        <SearchResults
          results={searchResults}
          isLoading={isSearching}
          onAnimePress={handleAnimePress}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background */}
      <LinearGradient
        colors={[COLORS.background.secondary, COLORS.background.primary]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header with Search */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING[2] }]}>
        <Text style={styles.headerTitle}>Explore</Text>
        <GlassSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          isFocused={isSearchFocused}
          onSubmit={handleSearch}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: LAYOUT.heights.tabBar + SPACING[6] },
        ]}
      >
        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {CATEGORIES.map((category) => (
              <CategoryChip
                key={category.id}
                category={category}
                onPress={() => {
                  setSearchQuery(category.name);
                  handleSearch();
                }}
              />
            ))}
          </ScrollView>
        </View>

        {/* Trending Anime */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleWithPadding}>Trending Now</Text>
            <Pressable onPress={() => navigation.navigate('AllAnime', { title: 'Trending Anime' })}>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </View>
          {isLoadingTrending ? (
            <View style={styles.loadingTrending}>
              <ActivityIndicator size="small" color={COLORS.accent.primary} />
            </View>
          ) : (
            <View style={styles.animeGrid}>
              {trendingAnime.map((anime) => (
                <AnimeCard
                  key={anime.id}
                  anime={anime}
                  onPress={() => handleAnimePress(anime)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Trending Topics */}
        {trendingTopics.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending Topics</Text>
            <GlassCard variant="light" style={styles.trendingCard}>
              {trendingTopics.map((topic, index) => (
                <Pressable
                  key={topic.id}
                  style={[
                    styles.trendingItem,
                    index === trendingTopics.length - 1 && styles.trendingItemLast,
                  ]}
                  onPress={() => {
                    setSearchQuery(topic.tag);
                    handleSearch();
                  }}
                >
                  <Text style={styles.trendingIndex}>{index + 1}</Text>
                  <View style={styles.trendingInfo}>
                    <Text style={styles.trendingTag}>{topic.tag}</Text>
                    <Text style={styles.trendingPosts}>{topic.posts} posts</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.text.tertiary} />
                </Pressable>
              ))}
            </GlassCard>
          </View>
        )}

        {/* Recent Posts */}
        {trendingPosts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitleWithPadding}>Recent Posts</Text>
            </View>
            {trendingPosts.map((post) => (
              <ContentCard
                key={post.id}
                id={post.id}
                author={{
                  id: post.author.id,
                  username: post.author.username,
                  displayName: post.author.displayName,
                  avatarUrl: post.author.avatarUrl,
                  isPremium: post.author.powerLevel >= 20,
                  verified: post.author.powerLevel >= 50,
                }}
                content={post.content}
                createdAt={post.createdAt}
                animeTag={post.animeReference ? {
                  id: post.animeReference.id,
                  title: post.animeReference.title,
                  coverImage: post.animeReference.coverImage,
                  episode: post.animeReference.episode,
                } : undefined}
                likes={post.likes}
                comments={post.replies}
                shares={post.reposts}
                isLiked={post.isLiked}
                onPress={() => {}}
                onLike={() => {}}
                onComment={() => {}}
                onShare={() => {}}
              />
            ))}
          </View>
        )}

        {/* Empty State */}
        {trendingPosts.length === 0 && trendingTopics.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="compass-outline" size={64} color={COLORS.text.tertiary} />
            <Text style={styles.emptyTitle}>Discover Content</Text>
            <Text style={styles.emptyText}>
              Search for anime, explore categories, or check back later for trending content.
            </Text>
          </View>
        )}
      </ScrollView>
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
    paddingBottom: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glass.border,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING[4],
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  },
  backButton: {
    padding: SPACING[2],
  },
  searchBarWrapper: {
    flex: 1,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.tertiary,
    borderRadius: LAYOUT.radius.lg,
    paddingHorizontal: SPACING[4],
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  searchContainerFocused: {
    borderColor: COLORS.accent.primary,
    backgroundColor: COLORS.background.elevated,
  },
  searchIcon: {
    marginRight: SPACING[3],
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary,
  },
  clearButton: {
    padding: SPACING[1],
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[16],
  },
  loadingText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    marginTop: SPACING[3],
  },
  loadingTrending: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty
  emptyResults: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[16],
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[16],
    paddingHorizontal: SPACING[6],
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: SPACING[4],
  },

  // Section
  section: {
    marginBottom: SPACING[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[4],
    marginBottom: SPACING[4],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    paddingHorizontal: SPACING[4],
    marginBottom: SPACING[3],
  },
  sectionTitleWithPadding: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  seeAllText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.accent.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },

  // Categories
  categoriesContainer: {
    paddingHorizontal: SPACING[4],
    gap: SPACING[3],
  },
  categoryChip: {
    borderRadius: LAYOUT.radius.xl,
    overflow: 'hidden',
  },
  categoryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    borderRadius: LAYOUT.radius.xl,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    gap: SPACING[2],
  },
  categoryName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
  },

  // Anime Grid
  animeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING[4],
    gap: SPACING[3],
  },
  animeRow: {
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[4],
    marginBottom: SPACING[3],
  },
  animeCard: {
    width: CARD_WIDTH,
    aspectRatio: 0.7,
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
    height: '50%',
    justifyContent: 'flex-end',
    padding: SPACING[3],
  },
  animeInfo: {
    gap: SPACING[2],
  },
  animeTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent.primary,
    paddingHorizontal: SPACING[2],
    paddingVertical: 2,
    borderRadius: LAYOUT.radius.sm,
    alignSelf: 'flex-start',
    gap: 2,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },

  // Search Results
  searchResultsContent: {
    paddingHorizontal: SPACING[4],
    paddingTop: SPACING[4],
    paddingBottom: LAYOUT.heights.tabBar + SPACING[6],
  },

  // Trending
  trendingCard: {
    marginHorizontal: SPACING[4],
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING[3],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glass.border,
  },
  trendingItemLast: {
    borderBottomWidth: 0,
  },
  trendingIndex: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.tertiary,
    width: 30,
  },
  trendingInfo: {
    flex: 1,
  },
  trendingTag: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  trendingPosts: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
    marginTop: 2,
  },
});

export default SearchScreenV2;
