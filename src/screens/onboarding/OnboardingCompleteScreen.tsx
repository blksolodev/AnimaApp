// Anima - Onboarding Complete Screen
// Celebration screen after completing onboarding

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useOnboardingStore, ANIME_GENRES } from '../../store/useOnboardingStore';
import { useUserStore } from '../../store';
import { COLORS, LAYOUT, TYPOGRAPHY, SPACING } from '../../theme/designSystem';

type OnboardingNavProp = StackNavigationProp<any>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Confetti particle component
const ConfettiParticle: React.FC<{
  delay: number;
  color: string;
  startX: number;
}> = ({ delay, color, startX }) => {
  const translateY = useRef(new Animated.Value(-50)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const duration = 2000 + Math.random() * 1000;
    const xOffset = (Math.random() - 0.5) * 100;

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 400,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: xOffset,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: Math.random() * 360,
          duration,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.confettiParticle,
        {
          left: startX,
          backgroundColor: color,
          opacity,
          transform: [
            { translateY },
            { translateX },
            {
              rotate: rotate.interpolate({
                inputRange: [0, 360],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        },
      ]}
    />
  );
};

export const OnboardingCompleteScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingNavProp>();
  const insets = useSafeAreaInsets();
  const { completeOnboarding, data } = useOnboardingStore();
  const { user } = useUserStore();

  // Animations
  const badgeScale = useRef(new Animated.Value(0)).current;
  const badgeRotate = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Badge entrance animation
    Animated.sequence([
      Animated.parallel([
        Animated.spring(badgeScale, {
          toValue: 1,
          tension: 50,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(badgeRotate, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(titleTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleEnterApp = async () => {
    await completeOnboarding();

    // Reset navigation to main app
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      })
    );
  };

  // Generate confetti particles
  const confettiColors = [
    COLORS.accent.primary,
    COLORS.accent.secondary,
    '#F4D03F',
    '#9B59B6',
    '#3498DB',
  ];
  const confettiParticles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    delay: Math.random() * 1000,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    startX: Math.random() * SCREEN_WIDTH,
  }));

  // Get selected genre names
  const selectedGenreNames = data.selectedGenres
    .map((id) => ANIME_GENRES.find((g) => g.id === id)?.name)
    .filter(Boolean)
    .slice(0, 3);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Confetti */}
      {confettiParticles.map((particle) => (
        <ConfettiParticle
          key={particle.id}
          delay={particle.delay}
          color={particle.color}
          startX={particle.startX}
        />
      ))}

      {/* Decorative Circles */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      <View style={[styles.content, { paddingTop: insets.top + SPACING[8] }]}>
        {/* Progress Complete */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <Text style={styles.progressText}>Complete!</Text>
        </View>

        {/* Badge Animation */}
        <Animated.View
          style={[
            styles.badgeContainer,
            {
              transform: [
                { scale: badgeScale },
                {
                  rotate: badgeRotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['-10deg', '0deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[COLORS.accent.primary, '#FF8A50']}
            style={styles.badgeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="checkmark" size={48} color={COLORS.text.primary} />
          </LinearGradient>
          <View style={styles.badgeRing} />
        </Animated.View>

        {/* Title */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
            },
          ]}
        >
          <Text style={styles.title}>You're All Set!</Text>
          <Text style={styles.subtitle}>
            Welcome to the community, {user?.displayName || data.displayName}
          </Text>
        </Animated.View>

        {/* Summary Cards */}
        <Animated.View style={[styles.summaryContainer, { opacity: contentOpacity }]}>
          {/* Profile Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardHeader}>
              <Ionicons name="person" size={20} color={COLORS.accent.primary} />
              <Text style={styles.summaryCardTitle}>Your Profile</Text>
            </View>
            <View style={styles.profilePreview}>
              {data.avatarUrl ? (
                <Image
                  source={{ uri: data.avatarUrl }}
                  style={styles.profileAvatar}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.profileAvatarPlaceholder}>
                  <Ionicons name="person" size={24} color={COLORS.text.tertiary} />
                </View>
              )}
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {user?.displayName || data.displayName}
                </Text>
                <Text style={styles.profileUsername}>
                  @{user?.username || data.username}
                </Text>
              </View>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={COLORS.accent.success}
              />
            </View>
          </View>

          {/* Genres Card */}
          {selectedGenreNames.length > 0 && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryCardHeader}>
                <Ionicons name="heart" size={20} color={COLORS.accent.primary} />
                <Text style={styles.summaryCardTitle}>Your Interests</Text>
              </View>
              <Text style={styles.genreList}>
                {selectedGenreNames.join(', ')}
                {data.selectedGenres.length > 3 &&
                  ` +${data.selectedGenres.length - 3} more`}
              </Text>
            </View>
          )}

          {/* What's Next Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardHeader}>
              <Ionicons name="rocket" size={20} color={COLORS.accent.primary} />
              <Text style={styles.summaryCardTitle}>What's Next</Text>
            </View>
            <View style={styles.nextSteps}>
              <View style={styles.nextStep}>
                <View style={styles.nextStepDot} />
                <Text style={styles.nextStepText}>
                  Browse trending anime
                </Text>
              </View>
              <View style={styles.nextStep}>
                <View style={styles.nextStepDot} />
                <Text style={styles.nextStepText}>
                  Add shows to your library
                </Text>
              </View>
              <View style={styles.nextStep}>
                <View style={styles.nextStepDot} />
                <Text style={styles.nextStepText}>
                  Connect with other fans
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Action */}
      <Animated.View
        style={[
          styles.bottomContainer,
          { paddingBottom: insets.bottom + SPACING[6], opacity: contentOpacity },
        ]}
      >
        <Pressable style={styles.enterButton} onPress={handleEnterApp}>
          <LinearGradient
            colors={[COLORS.accent.primary, '#FF8A50']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.enterButtonText}>Start Exploring</Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.text.primary} />
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.accent.primary,
    opacity: 0.1,
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: 200,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.accent.secondary,
    opacity: 0.08,
  },
  confettiParticle: {
    position: 'absolute',
    top: 0,
    width: 10,
    height: 10,
    borderRadius: 2,
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
    backgroundColor: COLORS.accent.success,
    borderRadius: 2,
  },
  progressText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.accent.success,
    fontWeight: TYPOGRAPHY.weights.medium,
  },

  // Badge
  badgeContainer: {
    alignSelf: 'center',
    marginBottom: SPACING[6],
    position: 'relative',
  },
  badgeGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRing: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 58,
    borderWidth: 3,
    borderColor: COLORS.accent.primary,
    opacity: 0.3,
  },

  // Title
  titleContainer: {
    alignItems: 'center',
    marginBottom: SPACING[8],
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
    textAlign: 'center',
  },

  // Summary
  summaryContainer: {
    gap: SPACING[3],
  },
  summaryCard: {
    backgroundColor: COLORS.glass.light,
    borderRadius: LAYOUT.radius.xl,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[3],
    gap: SPACING[2],
  },
  summaryCardTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },

  // Profile Preview
  profilePreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  profileAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: SPACING[3],
  },
  profileName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  profileUsername: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
  },

  // Genres
  genreList: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
  },

  // Next Steps
  nextSteps: {
    gap: SPACING[2],
  },
  nextStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  nextStepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent.primary,
  },
  nextStepText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },

  // Bottom
  bottomContainer: {
    paddingHorizontal: SPACING[6],
  },
  enterButton: {
    borderRadius: LAYOUT.radius.xl,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[4],
    gap: SPACING[2],
  },
  enterButtonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
});

export default OnboardingCompleteScreen;
