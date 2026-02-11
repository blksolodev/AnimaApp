// Anima - Profile Screen v2.0
// Glassmorphic profile experience with immersive header

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Avatar,
  GlassButton,
  GlassCard,
  ContentCard,
  GuestPrompt,
} from '../../components/glass-ui';
import { useUserStore } from '../../store';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { COLORS, LAYOUT, TYPOGRAPHY, SPACING, EFFECTS } from '../../theme/designSystem';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = 280;
const HEADER_MIN_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

// Mock user data
const MOCK_USER = {
  id: '1',
  username: 'anime_protagonist',
  displayName: 'Anime Protagonist',
  bio: 'Living my best isekai life. Currently watching: Everything.',
  avatarUrl: 'https://picsum.photos/200?random=99',
  bannerUrl: 'https://picsum.photos/800/400?random=98',
  followers: 12400,
  following: 420,
  posts: 89,
  isPremium: true,
  joinedDate: new Date('2023-01-15'),
  favoriteAnime: ['Attack on Titan', 'Demon Slayer', 'Jujutsu Kaisen'],
};

// Mock posts
const MOCK_POSTS = [
  {
    id: '1',
    content: 'Just finished Attack on Titan. My emotions are destroyed. 😭',
    likes: 234,
    comments: 45,
    shares: 12,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '2',
    content: 'Hot take: Demon Slayer animation is peak. No other studio comes close.',
    likes: 567,
    comments: 89,
    shares: 34,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
];

// Stats Component
const StatItem: React.FC<{
  label: string;
  value: number;
  onPress?: () => void;
}> = ({ label, value, onPress }) => {
  const formatValue = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Pressable onPress={onPress} style={styles.statItem}>
      <Text style={styles.statValue}>{formatValue(value)}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Pressable>
  );
};

// Tab Selector
const TabSelector: React.FC<{
  activeTab: string;
  onTabChange: (tab: string) => void;
}> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'posts', label: 'Posts' },
    { id: 'replies', label: 'Replies' },
    { id: 'media', label: 'Media' },
    { id: 'likes', label: 'Likes' },
  ];

  return (
    <View style={styles.tabSelector}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.id}
          onPress={() => onTabChange(tab.id)}
          style={styles.tab}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab.id && styles.tabTextActive,
            ]}
          >
            {tab.label}
          </Text>
          {activeTab === tab.id && <View style={styles.tabIndicator} />}
        </Pressable>
      ))}
    </View>
  );
};

// Anime Tag
const AnimeTag: React.FC<{ name: string }> = ({ name }) => (
  <View style={styles.animeTag}>
    <Text style={styles.animeTagText}>{name}</Text>
  </View>
);

// Guest Profile Screen
const GuestProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { exitGuestMode } = useUserStore();

  const handleSignUp = () => {
    exitGuestMode();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Auth' as never }],
      })
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[COLORS.background.secondary, COLORS.background.primary]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.guestContainer, { paddingTop: insets.top + SPACING[8] }]}>
        {/* Icon */}
        <View style={styles.guestIconContainer}>
          <View style={styles.guestIconCircle}>
            <View style={styles.guestIconPerson} />
            <View style={styles.guestIconBody} />
          </View>
        </View>

        {/* Text */}
        <Text style={styles.guestTitle}>Your Profile</Text>
        <Text style={styles.guestSubtitle}>
          Create an account to build your anime profile, track your watch history, and connect with fans.
        </Text>

        {/* Features */}
        <GlassCard variant="light" style={styles.guestFeatures}>
          <View style={styles.guestFeatureRow}>
            <View style={styles.guestFeatureIcon} />
            <Text style={styles.guestFeatureText}>Track your anime watch list</Text>
          </View>
          <View style={styles.guestFeatureRow}>
            <View style={styles.guestFeatureIcon} />
            <Text style={styles.guestFeatureText}>Share your thoughts and hot takes</Text>
          </View>
          <View style={styles.guestFeatureRow}>
            <View style={styles.guestFeatureIcon} />
            <Text style={styles.guestFeatureText}>Follow friends and creators</Text>
          </View>
          <View style={styles.guestFeatureRow}>
            <View style={styles.guestFeatureIcon} />
            <Text style={styles.guestFeatureText}>Level up and earn badges</Text>
          </View>
        </GlassCard>

        {/* CTA */}
        <GlassButton
          title="Create Account"
          onPress={handleSignUp}
          variant="primary"
          size="large"
          fullWidth
          style={styles.guestCTA}
        />

        <Pressable onPress={handleSignUp}>
          <Text style={styles.guestSignIn}>Already have an account? Sign In</Text>
        </Pressable>
      </View>
    </View>
  );
};

export const ProfileScreenV2: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user: currentUser, isGuest } = useUserStore();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState('posts');

  // Show guest profile screen if user is a guest
  if (isGuest) {
    return <GuestProfileScreen />;
  }

  const user = currentUser || MOCK_USER;
  const isOwnProfile = true; // currentUser?.id === user.id

  // Animated header effects
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const avatarScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.6],
    extrapolate: 'clamp',
  });

  const avatarTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 30],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_DISTANCE - 20, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Animated Header */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        {/* Banner Image */}
        <Animated.View style={[styles.bannerContainer, { opacity: headerOpacity }]}>
          <Image
            source={{ uri: user.bannerUrl || MOCK_USER.bannerUrl }}
            style={styles.bannerImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={['transparent', COLORS.background.primary]}
            style={styles.bannerGradient}
          />
        </Animated.View>

        {/* Collapsed Header (shows on scroll) */}
        <Animated.View
          style={[
            styles.collapsedHeader,
            { paddingTop: insets.top, opacity: titleOpacity },
          ]}
        >
          {Platform.OS === 'ios' ? (
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFillObject} />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: COLORS.glass.overlay }]} />
          )}
          <Text style={styles.collapsedTitle}>{user.displayName || MOCK_USER.displayName}</Text>
        </Animated.View>

        {/* Top Actions */}
        <View style={[styles.headerActions, { top: insets.top + SPACING[2] }]}>
          {isOwnProfile ? (
            <GlassButton
              title="Settings"
              onPress={() => {}}
              variant="glass"
              size="small"
            />
          ) : (
            <GlassButton
              title="Back"
              onPress={() => {}}
              variant="glass"
              size="small"
            />
          )}
        </View>
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: HEADER_MAX_HEIGHT - 60 },
        ]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info Card */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <Animated.View
            style={[
              styles.avatarWrapper,
              {
                transform: [
                  { scale: avatarScale },
                  { translateY: avatarTranslateY },
                ],
              },
            ]}
          >
            <Avatar
              imageUrl={user.avatarUrl || MOCK_USER.avatarUrl}
              size="2xl"
              ring={user.isPremium || MOCK_USER.isPremium}
              ringColor={COLORS.accent.primary}
            />
            {(user.isPremium || MOCK_USER.isPremium) && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>PRO</Text>
              </View>
            )}
          </Animated.View>

          {/* Name & Handle */}
          <View style={styles.nameSection}>
            <Text style={styles.displayName}>{user.displayName || MOCK_USER.displayName}</Text>
            <Text style={styles.username}>@{user.username || MOCK_USER.username}</Text>
          </View>

          {/* Bio */}
          <Text style={styles.bio}>{user.bio || MOCK_USER.bio}</Text>

          {/* Favorite Anime */}
          <View style={styles.favoriteAnime}>
            {(MOCK_USER.favoriteAnime).map((anime, index) => (
              <AnimeTag key={index} name={anime} />
            ))}
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <StatItem label="Posts" value={MOCK_USER.posts} />
            <View style={styles.statDivider} />
            <StatItem label="Followers" value={MOCK_USER.followers} onPress={() => {}} />
            <View style={styles.statDivider} />
            <StatItem label="Following" value={MOCK_USER.following} onPress={() => {}} />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {isOwnProfile ? (
              <GlassButton
                title="Edit Profile"
                onPress={() => {}}
                variant="secondary"
                fullWidth
              />
            ) : (
              <>
                <GlassButton
                  title="Follow"
                  onPress={() => {}}
                  variant="primary"
                  style={styles.followButton}
                />
                <GlassButton
                  title="Message"
                  onPress={() => {}}
                  variant="glass"
                  style={styles.messageButton}
                />
              </>
            )}
          </View>
        </View>

        {/* Tab Selector */}
        <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Posts */}
        <View style={styles.postsContainer}>
          {MOCK_POSTS.map((post) => (
            <ContentCard
              key={post.id}
              id={post.id}
              author={{
                id: user.id || MOCK_USER.id,
                username: user.username || MOCK_USER.username,
                displayName: user.displayName || MOCK_USER.displayName,
                avatarUrl: user.avatarUrl || MOCK_USER.avatarUrl,
                isPremium: MOCK_USER.isPremium,
              }}
              content={post.content}
              createdAt={post.createdAt}
              likes={post.likes}
              comments={post.comments}
              shares={post.shares}
            />
          ))}
        </View>

        {/* Bottom Padding */}
        <View style={{ height: LAYOUT.heights.tabBar + SPACING[6] }} />
      </Animated.ScrollView>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
  },
  bannerContainer: {
    ...StyleSheet.absoluteFillObject,
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
    height: '60%',
  },
  collapsedHeader: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  collapsedTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  headerActions: {
    position: 'absolute',
    right: SPACING[4],
    zIndex: 10,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING[6],
  },

  // Profile Card
  profileCard: {
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: SPACING[4],
    paddingTop: SPACING[8],
    paddingBottom: SPACING[4],
  },
  avatarWrapper: {
    position: 'absolute',
    top: -50,
    left: SPACING[4],
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    backgroundColor: COLORS.accent.primary,
    paddingHorizontal: SPACING[2],
    paddingVertical: 2,
    borderRadius: LAYOUT.radius.sm,
    borderWidth: 2,
    borderColor: COLORS.background.primary,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  nameSection: {
    marginTop: SPACING[10],
    marginBottom: SPACING[2],
  },
  displayName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  username: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.tertiary,
    marginTop: 2,
  },
  bio: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    lineHeight: TYPOGRAPHY.sizes.base * TYPOGRAPHY.lineHeights.normal,
    marginBottom: SPACING[3],
  },

  // Favorite Anime
  favoriteAnime: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[2],
    marginBottom: SPACING[4],
  },
  animeTag: {
    backgroundColor: COLORS.glass.light,
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[1],
    borderRadius: LAYOUT.radius.full,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  animeTagText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.accent.tertiary,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.glass.border,
  },

  // Actions
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING[3],
  },
  followButton: {
    flex: 1,
  },
  messageButton: {
    flex: 1,
  },

  // Tabs
  tabSelector: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glass.border,
    backgroundColor: COLORS.background.primary,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING[4],
    position: 'relative',
  },
  tabText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.tertiary,
  },
  tabTextActive: {
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.accent.primary,
  },

  // Posts
  postsContainer: {
    backgroundColor: COLORS.background.primary,
  },

  // Guest Profile
  guestContainer: {
    flex: 1,
    paddingHorizontal: SPACING[6],
    alignItems: 'center',
  },
  guestIconContainer: {
    marginBottom: SPACING[6],
  },
  guestIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.glass.medium,
    borderWidth: 3,
    borderColor: COLORS.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestIconPerson: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.accent.primary,
    marginBottom: -12,
  },
  guestIconBody: {
    width: 60,
    height: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: COLORS.accent.primary,
  },
  guestTitle: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING[2],
  },
  guestSubtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING[6],
  },
  guestFeatures: {
    width: '100%',
    padding: SPACING[5],
    marginBottom: SPACING[6],
  },
  guestFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  guestFeatureIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accent.success,
    marginRight: SPACING[4],
  },
  guestFeatureText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary,
  },
  guestCTA: {
    marginBottom: SPACING[4],
  },
  guestSignIn: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.accent.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});

export default ProfileScreenV2;
