// Anima - Compose Screen
// Create posts with anime tagging (requires watching the anime)

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  FlatList,
  Dimensions,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import {
  GlassCard,
  GlassButton,
  GlassModal,
  Avatar,
} from '../../components/glass-ui';
import { useUserStore, useAnimeLibraryStore } from '../../store';
import { searchAnime } from '../../services/AniListService';
import { WatchlistEntry, AnimeMedia, AnimeReference } from '../../types';
import { COLORS, LAYOUT, TYPOGRAPHY, SPACING } from '../../theme/designSystem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_CHARS = 280;

// Anime Search Result Item
const AnimeSearchItem: React.FC<{
  anime: AnimeMedia;
  isWatched: boolean;
  onSelect: () => void;
}> = ({ anime, isWatched, onSelect }) => {
  const title = anime.title.english || anime.title.romaji || 'Unknown';

  return (
    <Pressable
      onPress={onSelect}
      style={[styles.searchItem, !isWatched && styles.searchItemDisabled]}
      disabled={!isWatched}
    >
      <Image
        source={{ uri: anime.coverImage.medium }}
        style={styles.searchItemImage}
        contentFit="cover"
      />
      <View style={styles.searchItemInfo}>
        <Text style={styles.searchItemTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.searchItemMeta}>
          {anime.format} {anime.episodes ? `• ${anime.episodes} eps` : ''}
        </Text>
        {!isWatched && (
          <View style={styles.watchRequiredBadge}>
            <Ionicons name="lock-closed" size={10} color={COLORS.accent.warning} />
            <Text style={styles.watchRequiredText}>Watch to post</Text>
          </View>
        )}
      </View>
      {isWatched && (
        <View style={styles.watchedBadge}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.accent.success} />
        </View>
      )}
    </Pressable>
  );
};

// Library Anime Item (for quick select)
const LibraryAnimeItem: React.FC<{
  entry: WatchlistEntry;
  onSelect: () => void;
}> = ({ entry, onSelect }) => {
  const title = entry.anime.title.english || entry.anime.title.romaji || 'Unknown';

  return (
    <Pressable onPress={onSelect} style={styles.libraryItem}>
      <Image
        source={{ uri: entry.anime.coverImage.medium }}
        style={styles.libraryItemImage}
        contentFit="cover"
      />
      <Text style={styles.libraryItemTitle} numberOfLines={1}>
        {title}
      </Text>
    </Pressable>
  );
};

// Selected Anime Tag
const SelectedAnimeTag: React.FC<{
  anime: AnimeReference;
  onRemove: () => void;
}> = ({ anime, onRemove }) => (
  <View style={styles.selectedAnimeTag}>
    <Image source={{ uri: anime.coverImage }} style={styles.selectedAnimeImage} contentFit="cover" />
    <View style={styles.selectedAnimeInfo}>
      <Text style={styles.selectedAnimeTitle} numberOfLines={1}>
        {anime.title}
      </Text>
      {anime.episode && (
        <Text style={styles.selectedAnimeEpisode}>Episode {anime.episode}</Text>
      )}
    </View>
    <Pressable onPress={onRemove} style={styles.removeAnimeButton}>
      <Ionicons name="close-circle" size={20} color={COLORS.text.tertiary} />
    </Pressable>
  </View>
);

export const ComposeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const textInputRef = useRef<TextInput>(null);

  const { user } = useUserStore();
  const { library, isInLibrary, getEntry } = useAnimeLibraryStore();

  const [content, setContent] = useState('');
  const [selectedAnime, setSelectedAnime] = useState<AnimeReference | null>(null);
  const [showAnimePicker, setShowAnimePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AnimeMedia[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // Get watched anime from library
  const watchedAnime = library.filter(
    (entry) =>
      entry.status === 'WATCHING' ||
      entry.status === 'COMPLETED' ||
      (entry.status === 'PAUSED' && entry.progress > 0)
  );

  // Character count
  const remainingChars = MAX_CHARS - content.length;
  const isOverLimit = remainingChars < 0;
  const isNearLimit = remainingChars <= 20 && remainingChars >= 0;

  // Search anime
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchAnime(query, 1, 10);
      setSearchResults(result.anime);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Select anime from search or library
  const handleSelectAnime = (anime: AnimeMedia) => {
    const entry = getEntry(anime.id);
    const canPost = entry && (
      entry.status === 'COMPLETED' ||
      (entry.status === 'WATCHING' && entry.progress > 0) ||
      (entry.status === 'PAUSED' && entry.progress > 0)
    );

    if (!canPost) {
      Alert.alert(
        'Watch First',
        'You need to watch at least 1 episode before posting about this anime. Add it to your library and track your progress!',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Go to Library',
            onPress: () => {
              setShowAnimePicker(false);
              navigation.navigate('Library');
            },
          },
        ]
      );
      return;
    }

    const title = anime.title.english || anime.title.romaji || 'Unknown';
    setSelectedAnime({
      animeId: anime.id,
      title,
      coverImage: anime.coverImage.medium,
      episode: entry.progress,
    });
    setShowAnimePicker(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Select from library
  const handleSelectFromLibrary = (entry: WatchlistEntry) => {
    const title = entry.anime.title.english || entry.anime.title.romaji || 'Unknown';
    setSelectedAnime({
      animeId: entry.animeId,
      title,
      coverImage: entry.anime.coverImage.medium,
      episode: entry.progress,
    });
    setShowAnimePicker(false);
  };

  // Remove selected anime
  const handleRemoveAnime = () => {
    setSelectedAnime(null);
  };

  // Post
  const handlePost = async () => {
    if (!content.trim() || isOverLimit) return;

    setIsPosting(true);
    try {
      // In a real app, this would call a Firebase function to create the post
      // For now, we'll just simulate the post creation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert('Success', 'Your post has been created!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  // Check if post can be submitted
  const canPost = content.trim().length > 0 && !isOverLimit && !isPosting;

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
        <Pressable onPress={() => navigation.goBack()} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <GlassButton
          title={isPosting ? 'Posting...' : 'Post'}
          onPress={handlePost}
          variant="primary"
          size="small"
          disabled={!canPost}
          loading={isPosting}
          style={styles.postButton}
        />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Compose Area */}
          <View style={styles.composeArea}>
            <Avatar imageUrl={user?.avatarUrl} size="md" />
            <View style={styles.inputContainer}>
              <TextInput
                ref={textInputRef}
                style={styles.textInput}
                placeholder="Share your anime thoughts..."
                placeholderTextColor={COLORS.text.tertiary}
                multiline
                value={content}
                onChangeText={setContent}
                maxLength={MAX_CHARS + 50} // Allow over-typing to show warning
                autoFocus
              />
            </View>
          </View>

          {/* Selected Anime Tag */}
          {selectedAnime && (
            <SelectedAnimeTag anime={selectedAnime} onRemove={handleRemoveAnime} />
          )}

          {/* Character Count */}
          <View style={styles.charCountContainer}>
            <Text
              style={[
                styles.charCount,
                isNearLimit && styles.charCountWarning,
                isOverLimit && styles.charCountError,
              ]}
            >
              {remainingChars}
            </Text>
          </View>
        </ScrollView>

        {/* Bottom Toolbar */}
        <View style={[styles.toolbar, { paddingBottom: insets.bottom + SPACING[2] }]}>
          <Pressable onPress={() => setShowAnimePicker(true)} style={styles.toolbarButton}>
            <Ionicons
              name={selectedAnime ? 'tv' : 'tv-outline'}
              size={24}
              color={selectedAnime ? COLORS.accent.primary : COLORS.text.tertiary}
            />
            <Text style={styles.toolbarLabel}>Tag Anime</Text>
          </Pressable>

          <Pressable style={styles.toolbarButton}>
            <Ionicons name="image-outline" size={24} color={COLORS.text.tertiary} />
            <Text style={styles.toolbarLabel}>Media</Text>
          </Pressable>

          <Pressable style={styles.toolbarButton}>
            <Ionicons name="happy-outline" size={24} color={COLORS.text.tertiary} />
            <Text style={styles.toolbarLabel}>GIF</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* Anime Picker Modal */}
      <GlassModal
        visible={showAnimePicker}
        onClose={() => {
          setShowAnimePicker(false);
          setSearchQuery('');
          setSearchResults([]);
        }}
        title="Tag Anime"
        fullHeight
      >
        <View style={styles.animePickerContent}>
          {/* Search Bar */}
          <View style={styles.pickerSearchContainer}>
            <Ionicons name="search" size={20} color={COLORS.text.tertiary} />
            <TextInput
              style={styles.pickerSearchInput}
              placeholder="Search for an anime..."
              placeholderTextColor={COLORS.text.tertiary}
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={20} color={COLORS.text.tertiary} />
              </Pressable>
            )}
          </View>

          {/* Quick Select from Library */}
          {searchQuery.length === 0 && watchedAnime.length > 0 && (
            <View style={styles.quickSelectSection}>
              <Text style={styles.quickSelectTitle}>Your Watched Anime</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickSelectList}
              >
                {watchedAnime.slice(0, 10).map((entry) => (
                  <LibraryAnimeItem
                    key={entry.animeId}
                    entry={entry}
                    onSelect={() => handleSelectFromLibrary(entry)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Search Results */}
          {searchQuery.length > 0 && (
            <View style={styles.searchResultsSection}>
              {isSearching ? (
                <ActivityIndicator color={COLORS.accent.primary} style={styles.loader} />
              ) : searchResults.length > 0 ? (
                <FlatList
                  data={searchResults}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <AnimeSearchItem
                      anime={item}
                      isWatched={
                        isInLibrary(item.id) &&
                        (getEntry(item.id)?.status === 'COMPLETED' ||
                          (getEntry(item.id)?.progress || 0) > 0)
                      }
                      onSelect={() => handleSelectAnime(item)}
                    />
                  )}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <Text style={styles.noResultsText}>No anime found</Text>
              )}
            </View>
          )}

          {/* Empty Library State */}
          {searchQuery.length === 0 && watchedAnime.length === 0 && (
            <View style={styles.emptyLibrary}>
              <Ionicons name="library-outline" size={48} color={COLORS.text.tertiary} />
              <Text style={styles.emptyLibraryTitle}>No Watched Anime</Text>
              <Text style={styles.emptyLibraryText}>
                Start tracking anime in your library to tag them in posts!
              </Text>
              <GlassButton
                title="Go to Library"
                onPress={() => {
                  setShowAnimePicker(false);
                  navigation.navigate('Library');
                }}
                variant="primary"
                style={styles.goToLibraryButton}
              />
            </View>
          )}
        </View>
      </GlassModal>
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
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[4],
    paddingBottom: SPACING[3],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glass.border,
  },
  cancelButton: {
    padding: SPACING[2],
  },
  cancelText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
  },
  postButton: {
    minWidth: 80,
  },

  // Compose
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING[4],
  },
  composeArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  inputContainer: {
    flex: 1,
    marginLeft: SPACING[3],
  },
  textInput: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.text.primary,
    lineHeight: 26,
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // Selected Anime
  selectedAnimeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glass.light,
    borderRadius: LAYOUT.radius.lg,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    padding: SPACING[3],
    marginTop: SPACING[4],
  },
  selectedAnimeImage: {
    width: 48,
    height: 64,
    borderRadius: LAYOUT.radius.sm,
  },
  selectedAnimeInfo: {
    flex: 1,
    marginLeft: SPACING[3],
  },
  selectedAnimeTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  selectedAnimeEpisode: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.accent.tertiary,
    marginTop: 2,
  },
  removeAnimeButton: {
    padding: SPACING[2],
  },

  // Character Count
  charCountContainer: {
    alignItems: 'flex-end',
    marginTop: SPACING[4],
  },
  charCount: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
  },
  charCountWarning: {
    color: COLORS.accent.warning,
  },
  charCountError: {
    color: COLORS.accent.error,
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  // Toolbar
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[4],
    paddingTop: SPACING[3],
    borderTopWidth: 1,
    borderTopColor: COLORS.glass.border,
    backgroundColor: COLORS.background.secondary,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING[2],
    paddingHorizontal: SPACING[3],
    marginRight: SPACING[2],
  },
  toolbarLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
    marginLeft: SPACING[2],
  },

  // Anime Picker Modal
  animePickerContent: {
    flex: 1,
    paddingTop: SPACING[4],
  },
  pickerSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.tertiary,
    borderRadius: LAYOUT.radius.lg,
    paddingHorizontal: SPACING[4],
    marginHorizontal: SPACING[4],
    marginBottom: SPACING[4],
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  pickerSearchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary,
    marginLeft: SPACING[3],
  },

  // Quick Select
  quickSelectSection: {
    marginBottom: SPACING[4],
  },
  quickSelectTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.secondary,
    paddingHorizontal: SPACING[4],
    marginBottom: SPACING[3],
  },
  quickSelectList: {
    paddingHorizontal: SPACING[4],
    gap: SPACING[3],
  },
  libraryItem: {
    width: 80,
    alignItems: 'center',
  },
  libraryItemImage: {
    width: 80,
    height: 110,
    borderRadius: LAYOUT.radius.lg,
    marginBottom: SPACING[2],
  },
  libraryItemTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },

  // Search Results
  searchResultsSection: {
    flex: 1,
    paddingHorizontal: SPACING[4],
  },
  loader: {
    marginTop: SPACING[6],
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING[3],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glass.border,
  },
  searchItemDisabled: {
    opacity: 0.5,
  },
  searchItemImage: {
    width: 50,
    height: 70,
    borderRadius: LAYOUT.radius.sm,
  },
  searchItemInfo: {
    flex: 1,
    marginLeft: SPACING[3],
  },
  searchItemTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
  },
  searchItemMeta: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
    marginTop: 2,
  },
  watchRequiredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING[1],
    gap: 4,
  },
  watchRequiredText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.accent.warning,
  },
  watchedBadge: {
    marginLeft: SPACING[2],
  },
  noResultsText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    marginTop: SPACING[6],
  },

  // Empty Library
  emptyLibrary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING[6],
  },
  emptyLibraryTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginTop: SPACING[4],
  },
  emptyLibraryText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    marginTop: SPACING[2],
    lineHeight: 22,
  },
  goToLibraryButton: {
    marginTop: SPACING[6],
    paddingHorizontal: SPACING[6],
  },
});

export default ComposeScreen;
