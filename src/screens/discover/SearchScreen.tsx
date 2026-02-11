// Anima - SearchScreen
// Discover anime and content with Aura Search

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import debounce from 'lodash/debounce';

import { PixelCard, PixelIcon, ScanlineOverlayCSS } from '../../components/pixel-ui';
import { searchAnime, getTrendingAnime } from '../../services';
import { AnimeMedia } from '../../types';
import { COLORS, FONTS, FONT_SIZES, SPACING, COMPONENT_SIZES } from '../../theme';

// Aura mood suggestions
const AURA_SUGGESTIONS = [
  'A rainy afternoon',
  'Epic fight scenes',
  'Wholesome and cozy',
  'Mind-bending thriller',
  'Action-packed adventure',
  'Emotional and deep',
];

interface AnimeResultCardProps {
  anime: AnimeMedia;
  onPress: () => void;
}

const AnimeResultCard: React.FC<AnimeResultCardProps> = ({ anime, onPress }) => {
  const title = anime.title.english || anime.title.romaji || 'Unknown';

  return (
    <Pressable onPress={onPress}>
      <PixelCard
        variant="quest"
        backgroundColor={COLORS.deepPurple}
        style={styles.resultCard}
      >
        <View style={styles.resultContent}>
          <Image
            source={{ uri: anime.coverImage.large || anime.coverImage.medium }}
            style={styles.resultImage}
            contentFit="cover"
          />
          <View style={styles.resultInfo}>
            <Text style={styles.resultTitle} numberOfLines={2}>
              {title}
            </Text>
            <View style={styles.resultMeta}>
              <Text style={styles.resultFormat}>{anime.format}</Text>
              {anime.episodes && (
                <Text style={styles.resultEpisodes}>{anime.episodes} EPS</Text>
              )}
            </View>
            <View style={styles.resultGenres}>
              {anime.genres.slice(0, 3).map((genre) => (
                <View key={genre} style={styles.genreTag}>
                  <Text style={styles.genreText}>{genre}</Text>
                </View>
              ))}
            </View>
            {anime.averageScore && (
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreLabel}>SCORE</Text>
                <Text style={styles.scoreValue}>{anime.averageScore}%</Text>
              </View>
            )}
          </View>
        </View>
      </PixelCard>
    </Pressable>
  );
};

export const SearchScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AnimeMedia[]>([]);
  const [trending, setTrending] = useState<AnimeMedia[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuraSuggestions, setShowAuraSuggestions] = useState(true);

  // Load trending on mount
  React.useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    try {
      const { anime } = await getTrendingAnime(1, 10);
      setTrending(anime);
    } catch (error) {
      console.error('Failed to load trending:', error);
    }
  };

  // Debounced search
  const performSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setShowAuraSuggestions(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setShowAuraSuggestions(false);

      try {
        const { anime } = await searchAnime(searchQuery, 1, 20);
        setResults(anime);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const handleQueryChange = (text: string) => {
    setQuery(text);
    performSearch(text);
  };

  const handleAuraSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    performSearch(suggestion);
  };

  const handleAnimePress = (anime: AnimeMedia) => {
    // Navigate to anime detail
  };

  const renderAuraSuggestions = () => (
    <View style={styles.auraContainer}>
      <Text style={styles.auraTitle}>AURA SEARCH</Text>
      <Text style={styles.auraDescription}>
        Describe how you want to feel, and we'll find the perfect anime.
      </Text>
      <View style={styles.auraSuggestions}>
        {AURA_SUGGESTIONS.map((suggestion) => (
          <Pressable
            key={suggestion}
            style={styles.auraSuggestionButton}
            onPress={() => handleAuraSuggestion(suggestion)}
          >
            <Text style={styles.auraSuggestionText}>{suggestion}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const renderTrending = () => (
    <View style={styles.trendingContainer}>
      <Text style={styles.sectionTitle}>TRENDING QUESTS</Text>
      {trending.map((anime) => (
        <AnimeResultCard
          key={anime.id}
          anime={anime}
          onPress={() => handleAnimePress(anime)}
        />
      ))}
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    if (!query.trim()) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>NO QUESTS FOUND</Text>
        <Text style={styles.emptyText}>
          Try a different search or use Aura Search to find anime by mood.
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScanlineOverlayCSS opacity={0.03} enabled={true} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SEARCH</Text>
      </View>

      {/* Search input */}
      <View style={styles.searchContainer}>
        <PixelIcon name="search" size={20} color={COLORS.mediumGray} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={handleQueryChange}
          placeholder="Search anime or describe a mood..."
          placeholderTextColor={COLORS.mediumGray}
        />
        {query.length > 0 && (
          <Pressable
            onPress={() => {
              setQuery('');
              setResults([]);
              setShowAuraSuggestions(true);
            }}
          >
            <Text style={styles.clearButton}>X</Text>
          </Pressable>
        )}
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.levelUpLime} />
          <Text style={styles.loadingText}>SEARCHING...</Text>
        </View>
      ) : (
        <FlatList
          data={results.length > 0 ? results : []}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <AnimeResultCard anime={item} onPress={() => handleAnimePress(item)} />
          )}
          ListHeaderComponent={showAuraSuggestions ? renderAuraSuggestions : null}
          ListEmptyComponent={query.trim() ? renderEmpty : renderTrending}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.midnightGrape,
  },
  header: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    borderBottomWidth: 4,
    borderBottomColor: COLORS.deepPurple,
  },
  headerTitle: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING[4],
    marginVertical: SPACING[3],
    backgroundColor: COLORS.deepPurple,
    borderWidth: 2,
    borderColor: COLORS.borderMid,
    paddingHorizontal: SPACING[3],
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[2],
  },
  clearButton: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.md,
    color: COLORS.mediumGray,
    padding: SPACING[2],
  },
  listContent: {
    paddingHorizontal: SPACING[4],
    paddingBottom: COMPONENT_SIZES.tabBarHeight + SPACING[6],
  },
  auraContainer: {
    paddingVertical: SPACING[4],
  },
  auraTitle: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.lg,
    color: COLORS.manaBlue,
    marginBottom: SPACING[2],
  },
  auraDescription: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.lightGray,
    marginBottom: SPACING[4],
  },
  auraSuggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[2],
  },
  auraSuggestionButton: {
    backgroundColor: COLORS.deepPurple,
    borderWidth: 2,
    borderColor: COLORS.manaBlue,
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    marginBottom: SPACING[2],
    marginRight: SPACING[2],
  },
  auraSuggestionText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.manaBlue,
  },
  trendingContainer: {
    paddingTop: SPACING[4],
  },
  sectionTitle: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.md,
    color: COLORS.goldCoin,
    marginBottom: SPACING[3],
  },
  resultCard: {
    marginBottom: SPACING[3],
  },
  resultContent: {
    flexDirection: 'row',
  },
  resultImage: {
    width: 70,
    height: 100,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  resultInfo: {
    flex: 1,
    marginLeft: SPACING[3],
  },
  resultTitle: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    marginBottom: SPACING[2],
  },
  resultMeta: {
    flexDirection: 'row',
    marginBottom: SPACING[2],
  },
  resultFormat: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.xs,
    color: COLORS.manaBlue,
    marginRight: SPACING[2],
  },
  resultEpisodes: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.xs,
    color: COLORS.mediumGray,
  },
  resultGenres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING[2],
  },
  genreTag: {
    backgroundColor: COLORS.shadowBlack,
    paddingHorizontal: SPACING[2],
    paddingVertical: 2,
    marginRight: SPACING[1],
    marginBottom: SPACING[1],
  },
  genreText: {
    fontFamily: FONTS.header,
    fontSize: 8,
    color: COLORS.lightGray,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreLabel: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.xs,
    color: COLORS.mediumGray,
    marginRight: SPACING[2],
  },
  scoreValue: {
    fontFamily: FONTS.numeric,
    fontSize: FONT_SIZES.lg,
    color: COLORS.levelUpLime,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.sm,
    color: COLORS.mediumGray,
    marginTop: SPACING[3],
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING[12],
  },
  emptyTitle: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.md,
    color: COLORS.goldCoin,
    marginBottom: SPACING[3],
  },
  emptyText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.lightGray,
    textAlign: 'center',
  },
});

export default SearchScreen;
