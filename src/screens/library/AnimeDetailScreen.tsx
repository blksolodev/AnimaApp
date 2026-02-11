// Anima - Anime Detail Screen
// View anime details and manage tracking status

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import {
  GlassCard,
  GlassButton,
  GlassModal,
  GuestPrompt,
  useGuestPrompt,
} from '../../components/glass-ui';
import { useUserStore, useAnimeLibraryStore } from '../../store';
import { getAnimeDetails, getStreamingLinks } from '../../services/AniListService';
import { AnimeMedia, WatchStatus, StreamingLink } from '../../types';
import { COLORS, LAYOUT, TYPOGRAPHY, SPACING, EFFECTS } from '../../theme/designSystem';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type AnimeDetailRouteProp = RouteProp<{
  AnimeDetail: { animeId: number; openProgress?: boolean };
}, 'AnimeDetail'>;

// Status options for picker
const STATUS_OPTIONS: { status: WatchStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { status: 'WATCHING', label: 'Watching', icon: 'play-circle' },
  { status: 'COMPLETED', label: 'Completed', icon: 'checkmark-circle' },
  { status: 'PLANNING', label: 'Plan to Watch', icon: 'time' },
  { status: 'PAUSED', label: 'On Hold', icon: 'pause-circle' },
  { status: 'DROPPED', label: 'Dropped', icon: 'close-circle' },
];

// Streaming Service Icons
const STREAMING_ICONS: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  crunchyroll: { icon: 'play', color: '#F47521' },
  netflix: { icon: 'play', color: '#E50914' },
  funimation: { icon: 'play', color: '#5B0BB5' },
  hulu: { icon: 'play', color: '#1CE783' },
  prime: { icon: 'play', color: '#00A8E1' },
  hidive: { icon: 'play', color: '#00BAFF' },
};

// Score Picker Component
const ScorePicker: React.FC<{
  score: number | null;
  onSelect: (score: number | null) => void;
}> = ({ score, onSelect }) => {
  const scores = [null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <View style={styles.scoreContainer}>
      <Text style={styles.sectionLabel}>Your Score</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scoreList}>
        {scores.map((s) => (
          <Pressable
            key={s ?? 'none'}
            onPress={() => onSelect(s)}
            style={[styles.scoreItem, score === s && styles.scoreItemActive]}
          >
            <Text style={[styles.scoreText, score === s && styles.scoreTextActive]}>
              {s ?? '-'}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

// Episode Progress Picker
const ProgressPicker: React.FC<{
  current: number;
  total: number | null;
  onUpdate: (progress: number) => void;
}> = ({ current, total, onUpdate }) => {
  const maxEpisodes = total || 999;

  const increment = () => {
    if (current < maxEpisodes) {
      onUpdate(current + 1);
    }
  };

  const decrement = () => {
    if (current > 0) {
      onUpdate(current - 1);
    }
  };

  return (
    <View style={styles.progressPickerContainer}>
      <Text style={styles.sectionLabel}>Episode Progress</Text>
      <View style={styles.progressPicker}>
        <Pressable onPress={decrement} style={styles.progressButton}>
          <Ionicons name="remove" size={24} color={COLORS.text.primary} />
        </Pressable>
        <View style={styles.progressDisplay}>
          <Text style={styles.progressValue}>{current}</Text>
          <Text style={styles.progressTotal}>/ {total ?? '?'}</Text>
        </View>
        <Pressable onPress={increment} style={styles.progressButton}>
          <Ionicons name="add" size={24} color={COLORS.text.primary} />
        </Pressable>
      </View>
    </View>
  );
};

// Streaming Link Component
const StreamingLinkItem: React.FC<{
  link: StreamingLink;
  onPress: () => void;
}> = ({ link, onPress }) => {
  const config = STREAMING_ICONS[link.service] || { icon: 'link', color: COLORS.accent.primary };
  const serviceName = link.service.charAt(0).toUpperCase() + link.service.slice(1);

  return (
    <Pressable onPress={onPress} style={styles.streamingLink}>
      <View style={[styles.streamingIcon, { backgroundColor: `${config.color}20` }]}>
        <Ionicons name={config.icon} size={18} color={config.color} />
      </View>
      <Text style={styles.streamingName}>{serviceName}</Text>
      <Ionicons name="open-outline" size={16} color={COLORS.text.tertiary} />
    </Pressable>
  );
};

export const AnimeDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<AnimeDetailRouteProp>();
  const { animeId, openProgress } = route.params;

  const { user, isGuest } = useUserStore();
  const {
    addAnime,
    updateStatus,
    updateEpisodeProgress,
    updateAnimeScore,
    removeAnime,
    getEntry,
    isInLibrary,
  } = useAnimeLibraryStore();

  const { showPrompt, promptVisible, hidePrompt, PromptComponent } = useGuestPrompt();

  const [anime, setAnime] = useState<AnimeMedia | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const libraryEntry = anime ? getEntry(anime.id) : undefined;
  const inLibrary = anime ? isInLibrary(anime.id) : false;

  // Fetch anime details
  useEffect(() => {
    const fetchAnime = async () => {
      try {
        setIsLoading(true);
        const details = await getAnimeDetails(animeId);
        setAnime(details);
      } catch (error) {
        console.error('Failed to fetch anime details:', error);
        Alert.alert('Error', 'Failed to load anime details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnime();
  }, [animeId]);

  // Handle add to library
  const handleAddToLibrary = async (status: WatchStatus = 'PLANNING') => {
    if (isGuest) {
      showPrompt('Add anime to your library');
      return;
    }

    if (!user?.id || !anime) return;

    try {
      await addAnime(user.id, anime, status);
      setShowStatusModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add anime to library');
    }
  };

  // Handle status change
  const handleStatusChange = async (status: WatchStatus) => {
    if (isGuest) {
      showPrompt('Track your anime progress');
      return;
    }

    if (!user?.id || !anime) return;

    try {
      if (inLibrary) {
        await updateStatus(user.id, anime.id, status);
      } else {
        await addAnime(user.id, anime, status);
      }
      setShowStatusModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  // Handle progress update
  const handleProgressUpdate = async (progress: number) => {
    if (isGuest) {
      showPrompt('Track your anime progress');
      return;
    }

    if (!user?.id || !anime) return;

    try {
      if (inLibrary) {
        await updateEpisodeProgress(user.id, anime.id, progress);
      } else {
        // Add to library first with WATCHING status
        await addAnime(user.id, anime, 'WATCHING');
        await updateEpisodeProgress(user.id, anime.id, progress);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update progress');
    }
  };

  // Handle score update
  const handleScoreUpdate = async (score: number | null) => {
    if (isGuest) {
      showPrompt('Rate this anime');
      return;
    }

    if (!user?.id || !anime || !inLibrary) return;

    try {
      await updateAnimeScore(user.id, anime.id, score);
    } catch (error) {
      Alert.alert('Error', 'Failed to update score');
    }
  };

  // Handle remove from library
  const handleRemoveFromLibrary = async () => {
    if (!user?.id || !anime) return;

    Alert.alert(
      'Remove from Library',
      'Are you sure you want to remove this anime from your library?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeAnime(user.id, anime.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove anime');
            }
          },
        },
      ]
    );
  };

  // Handle streaming link press
  const handleStreamingPress = (link: StreamingLink) => {
    // In a real app, you'd use Linking.openURL(link.url)
    Alert.alert('Open Link', `Opening ${link.service}...`);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent.primary} />
      </View>
    );
  }

  if (!anime) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={COLORS.accent.error} />
        <Text style={styles.errorText}>Failed to load anime</Text>
        <GlassButton title="Go Back" onPress={() => navigation.goBack()} variant="glass" />
      </View>
    );
  }

  const title = anime.title.english || anime.title.romaji || 'Unknown';
  const streamingLinks = getStreamingLinks(title);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent />

      {/* Banner Image */}
      <View style={styles.bannerContainer}>
        <Image
          source={{ uri: anime.bannerImage || anime.coverImage.extraLarge }}
          style={styles.bannerImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={['transparent', COLORS.background.primary]}
          style={styles.bannerGradient}
        />

        {/* Back Button */}
        <Pressable
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { top: insets.top + SPACING[2] }]}
        >
          <BlurView intensity={60} tint="dark" style={styles.backButtonBlur}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </BlurView>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + SPACING[6] }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          {/* Cover Image */}
          <Image
            source={{ uri: anime.coverImage.large }}
            style={styles.coverImage}
            contentFit="cover"
          />

          {/* Title & Info */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{title}</Text>
            {anime.title.english && anime.title.romaji !== anime.title.english && (
              <Text style={styles.alternateTitle}>{anime.title.romaji}</Text>
            )}

            {/* Rating & Format */}
            <View style={styles.metaRow}>
              {anime.averageScore && (
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={14} color={COLORS.accent.warning} />
                  <Text style={styles.ratingText}>{(anime.averageScore / 10).toFixed(1)}</Text>
                </View>
              )}
              <View style={styles.formatBadge}>
                <Text style={styles.formatText}>{anime.format}</Text>
              </View>
              {anime.episodes && (
                <Text style={styles.episodesText}>{anime.episodes} eps</Text>
              )}
            </View>

            {/* Studio */}
            {anime.studios.nodes.length > 0 && (
              <Text style={styles.studioText}>
                {anime.studios.nodes.find((s) => s.isAnimationStudio)?.name ||
                  anime.studios.nodes[0].name}
              </Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {inLibrary ? (
            <>
              <GlassButton
                title={libraryEntry?.status || 'In Library'}
                onPress={() => setShowStatusModal(true)}
                variant="primary"
                leftIcon={<Ionicons name="checkmark" size={18} color={COLORS.text.primary} />}
                style={styles.mainActionButton}
              />
              <Pressable onPress={handleRemoveFromLibrary} style={styles.removeButton}>
                <Ionicons name="trash-outline" size={20} color={COLORS.accent.error} />
              </Pressable>
            </>
          ) : (
            <GlassButton
              title="Add to Library"
              onPress={() => setShowStatusModal(true)}
              variant="primary"
              leftIcon={<Ionicons name="add" size={18} color={COLORS.text.primary} />}
              style={styles.fullButton}
            />
          )}
        </View>

        {/* Progress & Score (if in library) */}
        {inLibrary && (
          <GlassCard variant="light" style={styles.trackingCard}>
            <ProgressPicker
              current={libraryEntry?.progress || 0}
              total={anime.episodes}
              onUpdate={handleProgressUpdate}
            />
            <ScorePicker
              score={libraryEntry?.score ?? null}
              onSelect={handleScoreUpdate}
            />
          </GlassCard>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Synopsis</Text>
          <Text style={styles.description}>
            {anime.description?.replace(/<[^>]*>/g, '') || 'No description available.'}
          </Text>
        </View>

        {/* Genres */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Genres</Text>
          <View style={styles.genreContainer}>
            {anime.genres.map((genre, index) => (
              <View key={index} style={styles.genreTag}>
                <Text style={styles.genreText}>{genre}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Streaming Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Where to Watch</Text>
          <GlassCard variant="light" style={styles.streamingCard}>
            {streamingLinks.map((link, index) => (
              <StreamingLinkItem
                key={link.service}
                link={link}
                onPress={() => handleStreamingPress(link)}
              />
            ))}
          </GlassCard>
        </View>

        {/* Info Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information</Text>
          <GlassCard variant="light" style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>{anime.status}</Text>
            </View>
            {anime.season && anime.seasonYear && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Season</Text>
                <Text style={styles.infoValue}>
                  {anime.season} {anime.seasonYear}
                </Text>
              </View>
            )}
            {anime.duration && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Episode Duration</Text>
                <Text style={styles.infoValue}>{anime.duration} min</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Popularity</Text>
              <Text style={styles.infoValue}>#{anime.popularity.toLocaleString()}</Text>
            </View>
          </GlassCard>
        </View>
      </ScrollView>

      {/* Status Selection Modal */}
      <GlassModal
        visible={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={inLibrary ? 'Update Status' : 'Add to Library'}
      >
        <View style={styles.statusModalContent}>
          {STATUS_OPTIONS.map((option) => (
            <Pressable
              key={option.status}
              onPress={() => handleStatusChange(option.status)}
              style={[
                styles.statusOption,
                libraryEntry?.status === option.status && styles.statusOptionActive,
              ]}
            >
              <Ionicons
                name={option.icon}
                size={24}
                color={
                  libraryEntry?.status === option.status
                    ? COLORS.accent.primary
                    : COLORS.text.tertiary
                }
              />
              <Text
                style={[
                  styles.statusOptionText,
                  libraryEntry?.status === option.status && styles.statusOptionTextActive,
                ]}
              >
                {option.label}
              </Text>
              {libraryEntry?.status === option.status && (
                <Ionicons name="checkmark" size={20} color={COLORS.accent.primary} />
              )}
            </Pressable>
          ))}
        </View>
      </GlassModal>

      {/* Guest Prompt */}
      <PromptComponent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },

  // Loading & Error
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background.primary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: SPACING[6],
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.text.secondary,
    marginVertical: SPACING[4],
  },

  // Banner
  bannerContainer: {
    height: 200,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  backButton: {
    position: 'absolute',
    left: SPACING[4],
    zIndex: 10,
  },
  backButtonBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  // Scroll
  scrollView: {
    flex: 1,
    marginTop: -40,
  },
  scrollContent: {
    paddingTop: 0,
  },

  // Header
  headerSection: {
    flexDirection: 'row',
    paddingHorizontal: SPACING[4],
    marginBottom: SPACING[4],
  },
  coverImage: {
    width: 120,
    height: 180,
    borderRadius: LAYOUT.radius.xl,
    ...EFFECTS.shadows.lg,
  },
  titleSection: {
    flex: 1,
    marginLeft: SPACING[4],
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  alternateTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING[2],
    marginTop: SPACING[3],
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.accent.warning}20`,
    paddingHorizontal: SPACING[2],
    paddingVertical: 4,
    borderRadius: LAYOUT.radius.sm,
    gap: 4,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.accent.warning,
  },
  formatBadge: {
    backgroundColor: COLORS.glass.medium,
    paddingHorizontal: SPACING[2],
    paddingVertical: 4,
    borderRadius: LAYOUT.radius.sm,
  },
  formatText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  episodesText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
  },
  studioText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.accent.secondary,
    marginTop: SPACING[2],
  },

  // Actions
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: SPACING[4],
    marginBottom: SPACING[4],
    gap: SPACING[3],
  },
  mainActionButton: {
    flex: 1,
  },
  fullButton: {
    flex: 1,
  },
  removeButton: {
    width: 48,
    height: 48,
    borderRadius: LAYOUT.radius.lg,
    backgroundColor: `${COLORS.accent.error}20`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.accent.error,
  },

  // Tracking Card
  trackingCard: {
    marginHorizontal: SPACING[4],
    marginBottom: SPACING[4],
    padding: SPACING[4],
  },

  // Progress Picker
  progressPickerContainer: {
    marginBottom: SPACING[4],
  },
  sectionLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
    marginBottom: SPACING[2],
  },
  progressPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING[4],
  },
  progressButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  progressDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    minWidth: 80,
    justifyContent: 'center',
  },
  progressValue: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  progressTotal: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.tertiary,
    marginLeft: 4,
  },

  // Score
  scoreContainer: {},
  scoreList: {
    gap: SPACING[2],
  },
  scoreItem: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  scoreItemActive: {
    backgroundColor: COLORS.accent.primary,
    borderColor: COLORS.accent.primary,
  },
  scoreText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.tertiary,
  },
  scoreTextActive: {
    color: COLORS.text.primary,
  },

  // Sections
  section: {
    paddingHorizontal: SPACING[4],
    marginBottom: SPACING[5],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING[3],
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    lineHeight: 24,
  },

  // Genres
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[2],
  },
  genreTag: {
    backgroundColor: COLORS.glass.light,
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: LAYOUT.radius.full,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  genreText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },

  // Streaming
  streamingCard: {
    padding: 0,
    overflow: 'hidden',
  },
  streamingLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glass.border,
  },
  streamingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING[3],
  },
  streamingName: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },

  // Info Grid
  infoCard: {
    padding: 0,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glass.border,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },

  // Status Modal
  statusModalContent: {
    paddingVertical: SPACING[2],
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING[4],
    paddingHorizontal: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glass.border,
    gap: SPACING[3],
  },
  statusOptionActive: {
    backgroundColor: `${COLORS.accent.primary}10`,
  },
  statusOptionText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
  },
  statusOptionTextActive: {
    color: COLORS.accent.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});

export default AnimeDetailScreen;
