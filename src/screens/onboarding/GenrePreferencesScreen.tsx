// Anima - Genre Preferences Screen
// Select anime genre preferences during onboarding

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useOnboardingStore, ANIME_GENRES } from '../../store/useOnboardingStore';
import { useUserStore } from '../../store';
import { COLORS, LAYOUT, TYPOGRAPHY, SPACING } from '../../theme/designSystem';

type OnboardingNavProp = StackNavigationProp<any>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Genre chip component with animation
const GenreChip: React.FC<{
  genre: typeof ANIME_GENRES[0];
  isSelected: boolean;
  onPress: () => void;
  delay: number;
}> = ({ genre, isSelected, onPress, delay }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View
      style={[
        styles.genreChipContainer,
        { transform: [{ scale: scaleAnim }, { scale: bounceAnim }] },
      ]}
    >
      <Pressable
        onPress={handlePress}
        style={[
          styles.genreChip,
          isSelected && styles.genreChipSelected,
          { borderColor: isSelected ? genre.color : COLORS.glass.border },
        ]}
      >
        <LinearGradient
          colors={
            isSelected
              ? [`${genre.color}40`, `${genre.color}20`]
              : ['transparent', 'transparent']
          }
          style={styles.genreChipGradient}
        >
          <View
            style={[
              styles.genreIconContainer,
              { backgroundColor: `${genre.color}30` },
            ]}
          >
            <Ionicons
              name={genre.icon as any}
              size={20}
              color={genre.color}
            />
          </View>
          <Text
            style={[
              styles.genreChipText,
              isSelected && { color: COLORS.text.primary },
            ]}
          >
            {genre.name}
          </Text>
          {isSelected && (
            <View style={[styles.selectedCheck, { backgroundColor: genre.color }]}>
              <Ionicons name="checkmark" size={12} color={COLORS.text.primary} />
            </View>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

export const GenrePreferencesScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingNavProp>();
  const insets = useSafeAreaInsets();
  const { updateData, nextStep, data } = useOnboardingStore();
  const { user, updateProfile } = useUserStore();

  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    data.selectedGenres || []
  );

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const toggleGenre = (genreId: string) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genreId)) {
        return prev.filter((id) => id !== genreId);
      }
      if (prev.length >= 5) {
        return prev; // Max 5 genres
      }
      return [...prev, genreId];
    });
  };

  const handleContinue = async () => {
    updateData({ selectedGenres });

    // Save preferences to user profile
    if (user?.id) {
      try {
        await updateProfile({
          settings: {
            ...user.settings,
            // Could add genre preferences to settings
          },
        } as any);
      } catch (error) {
        console.error('Failed to save preferences:', error);
      }
    }

    nextStep();
    navigation.navigate('OnboardingComplete');
  };

  const handleSkip = () => {
    nextStep();
    navigation.navigate('OnboardingComplete');
  };

  const minSelected = selectedGenres.length >= 3;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={[COLORS.background.secondary, COLORS.background.primary]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, paddingTop: insets.top + SPACING[4] },
        ]}
      >
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '75%' }]} />
          </View>
          <Text style={styles.progressText}>Step 3 of 4</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>What do you like?</Text>
          <Text style={styles.subtitle}>
            Select 3-5 genres to personalize your experience
          </Text>
        </View>

        {/* Selection Count */}
        <View style={styles.selectionInfo}>
          <Text style={styles.selectionCount}>
            {selectedGenres.length}/5 selected
          </Text>
          {!minSelected && (
            <Text style={styles.selectionHint}>
              Select at least 3 genres
            </Text>
          )}
        </View>

        {/* Genre Grid */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.genreGrid}
        >
          {ANIME_GENRES.map((genre, index) => (
            <GenreChip
              key={genre.id}
              genre={genre}
              isSelected={selectedGenres.includes(genre.id)}
              onPress={() => toggleGenre(genre.id)}
              delay={index * 50}
            />
          ))}
        </ScrollView>

        {/* Selected Preview */}
        {selectedGenres.length > 0 && (
          <View style={styles.selectedPreview}>
            <Text style={styles.selectedPreviewLabel}>Your picks:</Text>
            <View style={styles.selectedPreviewChips}>
              {selectedGenres.map((genreId) => {
                const genre = ANIME_GENRES.find((g) => g.id === genreId);
                if (!genre) return null;
                return (
                  <View
                    key={genreId}
                    style={[
                      styles.selectedPreviewChip,
                      { backgroundColor: `${genre.color}30` },
                    ]}
                  >
                    <Text
                      style={[styles.selectedPreviewChipText, { color: genre.color }]}
                    >
                      {genre.name}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </Animated.View>

      {/* Bottom Actions */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + SPACING[4] }]}>
        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </Pressable>

        <Pressable
          style={[
            styles.continueButton,
            !minSelected && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!minSelected}
        >
          <LinearGradient
            colors={
              minSelected
                ? [COLORS.accent.primary, '#FF8A50']
                : [COLORS.glass.light, COLORS.glass.light]
            }
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text
              style={[
                styles.continueButtonText,
                !minSelected && styles.continueButtonTextDisabled,
              ]}
            >
              Continue
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={minSelected ? COLORS.text.primary : COLORS.text.tertiary}
            />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING[6],
  },

  // Progress
  progressContainer: {
    marginBottom: SPACING[6],
  },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.glass.light,
    borderRadius: 2,
    marginBottom: SPACING[2],
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
  },

  // Header
  header: {
    marginBottom: SPACING[4],
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING[2],
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
  },

  // Selection Info
  selectionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  selectionCount: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.accent.primary,
  },
  selectionHint: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
  },

  // Genre Grid
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[3],
    paddingBottom: 200,
  },
  genreChipContainer: {},
  genreChip: {
    borderRadius: LAYOUT.radius.xl,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  genreChipSelected: {},
  genreChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[4],
    gap: SPACING[2],
  },
  genreIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genreChipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.secondary,
  },
  selectedCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING[1],
  },

  // Selected Preview
  selectedPreview: {
    position: 'absolute',
    bottom: 160,
    left: SPACING[6],
    right: SPACING[6],
    backgroundColor: COLORS.glass.light,
    borderRadius: LAYOUT.radius.xl,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  selectedPreviewLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.tertiary,
    marginBottom: SPACING[2],
  },
  selectedPreviewChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[2],
  },
  selectedPreviewChip: {
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[1],
    borderRadius: LAYOUT.radius.full,
  },
  selectedPreviewChipText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },

  // Bottom
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: SPACING[6],
    paddingTop: SPACING[4],
    borderTopWidth: 1,
    borderTopColor: COLORS.glass.border,
  },
  skipButton: {
    paddingVertical: SPACING[3],
    alignItems: 'center',
    marginBottom: SPACING[3],
  },
  skipButtonText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
  },
  continueButton: {
    borderRadius: LAYOUT.radius.xl,
    overflow: 'hidden',
  },
  continueButtonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[4],
    gap: SPACING[2],
  },
  continueButtonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  continueButtonTextDisabled: {
    color: COLORS.text.tertiary,
  },
});

export default GenrePreferencesScreen;
