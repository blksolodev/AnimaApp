// Anima - Welcome Screen
// First screen of onboarding - introduces the app

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useOnboardingStore } from '../../store/useOnboardingStore';
import { useUserStore } from '../../store';
import { COLORS, LAYOUT, TYPOGRAPHY, SPACING } from '../../theme/designSystem';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type OnboardingNavProp = StackNavigationProp<any>;

// Feature highlight component
const FeatureCard: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  delay: number;
}> = ({ icon, title, description, delay }) => {
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.featureCard,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      <View style={styles.featureIconContainer}>
        <Ionicons name={icon} size={24} color={COLORS.accent.primary} />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </Animated.View>
  );
};

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingNavProp>();
  const insets = useSafeAreaInsets();
  const { nextStep } = useOnboardingStore();
  const { enterGuestMode } = useUserStore();

  // Animations
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo animation
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // Title animation
      Animated.parallel([
        Animated.spring(titleTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // Button animation
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    nextStep();
    navigation.navigate('CreateAccount');
  };

  const handleGuestMode = () => {
    enterGuestMode();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background Gradient */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      {/* Content */}
      <View style={[styles.content, { paddingTop: insets.top + SPACING[8] }]}>
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>🎌</Text>
          </View>
          <Text style={styles.logoText}>anima</Text>
          <View style={styles.logoDot} />
        </Animated.View>

        {/* Title and Tagline */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
            },
          ]}
        >
          <Text style={styles.title}>Your Anime Journey</Text>
          <Text style={styles.subtitle}>Starts Here</Text>
          <Text style={styles.tagline}>
            Track, share, and connect with anime fans worldwide
          </Text>
        </Animated.View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <FeatureCard
            icon="library"
            title="Track Your Library"
            description="Keep track of what you're watching and planning to watch"
            delay={800}
          />
          <FeatureCard
            icon="people"
            title="Join the Community"
            description="Share your thoughts and discover new anime"
            delay={1000}
          />
          <FeatureCard
            icon="notifications"
            title="Never Miss an Episode"
            description="Get notified when new episodes air"
            delay={1200}
          />
        </View>
      </View>

      {/* Bottom Actions */}
      <Animated.View
        style={[
          styles.bottomContainer,
          {
            opacity: buttonOpacity,
            paddingBottom: insets.bottom + SPACING[6],
          },
        ]}
      >
        {/* Get Started Button */}
        <Pressable style={styles.primaryButton} onPress={handleGetStarted}>
          <LinearGradient
            colors={[COLORS.accent.primary, '#FF8A50']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.text.primary} />
          </LinearGradient>
        </Pressable>

        {/* Guest Mode */}
        <Pressable style={styles.guestButton} onPress={handleGuestMode}>
          <Text style={styles.guestButtonText}>Continue as Guest</Text>
        </Pressable>

        {/* Terms */}
        <Text style={styles.termsText}>
          By continuing, you agree to our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
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
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.accent.primary,
    opacity: 0.1,
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: 100,
    left: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: COLORS.accent.secondary,
    opacity: 0.08,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING[6],
  },

  // Logo
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING[8],
  },
  logoIcon: {
    marginRight: SPACING[2],
  },
  logoEmoji: {
    fontSize: 32,
  },
  logoText: {
    fontSize: 40,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    letterSpacing: -1,
  },
  logoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent.primary,
    marginLeft: 2,
    marginBottom: 20,
  },

  // Title
  titleContainer: {
    alignItems: 'center',
    marginBottom: SPACING[8],
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.accent.primary,
    textAlign: 'center',
    marginBottom: SPACING[3],
  },
  tagline: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
  },

  // Features
  featuresContainer: {
    gap: SPACING[3],
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glass.light,
    borderRadius: LAYOUT.radius.xl,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.accent.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING[3],
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },

  // Bottom
  bottomContainer: {
    paddingHorizontal: SPACING[6],
  },
  primaryButton: {
    borderRadius: LAYOUT.radius.xl,
    overflow: 'hidden',
    marginBottom: SPACING[3],
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[4],
    gap: SPACING[2],
  },
  primaryButtonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  guestButton: {
    paddingVertical: SPACING[3],
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  guestButtonText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.secondary,
  },
  termsText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.accent.primary,
  },
});

export default WelcomeScreen;
