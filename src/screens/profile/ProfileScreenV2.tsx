// Anima - Profile Screen v2.0
// Glassmorphic profile experience with real Firebase data

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  Avatar,
  GlassButton,
  GlassCard,
  ContentCard,
} from '../../components/glass-ui';
import { useUserStore } from '../../store';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { COLORS, LAYOUT, TYPOGRAPHY, SPACING } from '../../theme/designSystem';
import {
  fetchUserPosts,
  fetchUserReplies,
  fetchUserMediaPosts,
  fetchUserLikes,
  getUserFavoriteAnime,
} from '../../services/ProfileService';
import { Quest } from '../../types';
import { DocumentSnapshot } from 'firebase/firestore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = 280;
const HEADER_MIN_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

// Default avatar and banner
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=8B5CF6&color=fff&size=200';
const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80';

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

// Empty State
const EmptyState: React.FC<{ message: string; icon?: string }> = ({ message, icon = 'document-text-outline' }) => (
  <View style={styles.emptyState}>
    <Ionicons name={icon as any} size={48} color={COLORS.text.tertiary} />
    <Text style={styles.emptyText}>{message}</Text>
  </View>
);

// Loading State
const LoadingState: React.FC = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={COLORS.accent.primary} />
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
        <View style={styles.guestIconContainer}>
          <View style={styles.guestIconCircle}>
            <View style={styles.guestIconPerson} />
            <View style={styles.guestIconBody} />
          </View>
        </View>

        <Text style={styles.guestTitle}>Your Profile</Text>
        <Text style={styles.guestSubtitle}>
          Create an account to build your anime profile, track your watch history, and connect with fans.
        </Text>

        <GlassCard variant="light" style={styles.guestFeatures}>
          <View style={styles.guestFeatureRow}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.accent.success} />
            <Text style={styles.guestFeatureText}>Track your anime watch list</Text>
          </View>
          <View style={styles.guestFeatureRow}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.accent.success} />
            <Text style={styles.guestFeatureText}>Share your thoughts and hot takes</Text>
          </View>
          <View style={styles.guestFeatureRow}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.accent.success} />
            <Text style={styles.guestFeatureText}>Follow friends and creators</Text>
          </View>
          <View style={styles.guestFeatureRow}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.accent.success} />
            <Text style={styles.guestFeatureText}>Level up and earn badges</Text>
          </View>
        </GlassCard>

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
  const navigation = useNavigation();
  const { user, isGuest, logout } = useUserStore();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState('posts');
  const [refreshing, setRefreshing] = useState(false);

  // Posts state
  const [posts, setPosts] = useState<Quest[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsLastDoc, setPostsLastDoc] = useState<DocumentSnapshot | null>(null);
  const [postsHasMore, setPostsHasMore] = useState(true);

  // Replies state
  const [replies, setReplies] = useState<Quest[]>([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [repliesLastDoc, setRepliesLastDoc] = useState<DocumentSnapshot | null>(null);

  // Media posts state
  const [mediaPosts, setMediaPosts] = useState<Quest[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaLastDoc, setMediaLastDoc] = useState<DocumentSnapshot | null>(null);

  // Likes state
  const [likes, setLikes] = useState<Quest[]>([]);
  const [likesLoading, setLikesLoading] = useState(false);
  const [likesLastDoc, setLikesLastDoc] = useState<DocumentSnapshot | null>(null);

  // Favorite anime
  const [favoriteAnime, setFavoriteAnime] = useState<string[]>([]);

  // Show guest profile screen if user is a guest
  if (isGuest) {
    return <GuestProfileScreen />;
  }

  // If no user, show loading
  if (!user) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={[COLORS.background.secondary, COLORS.background.primary]}
          style={StyleSheet.absoluteFillObject}
        />
        <LoadingState />
      </View>
    );
  }

  // Fetch user posts
  const loadPosts = useCallback(async (refresh = false) => {
    if (!user) return;

    if (refresh) {
      setPostsLoading(true);
    }

    try {
      const result = await fetchUserPosts(
        user.id,
        refresh ? undefined : postsLastDoc || undefined
      );

      if (refresh) {
        setPosts(result.posts);
      } else {
        setPosts((prev) => [...prev, ...result.posts]);
      }
      setPostsLastDoc(result.lastDoc);
      setPostsHasMore(result.hasMore);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setPostsLoading(false);
    }
  }, [user, postsLastDoc]);

  // Fetch replies
  const loadReplies = useCallback(async (refresh = false) => {
    if (!user) return;

    setRepliesLoading(true);

    try {
      const result = await fetchUserReplies(
        user.id,
        refresh ? undefined : repliesLastDoc || undefined
      );

      if (refresh) {
        setReplies(result.replies);
      } else {
        setReplies((prev) => [...prev, ...result.replies]);
      }
      setRepliesLastDoc(result.lastDoc);
    } catch (error) {
      console.error('Failed to load replies:', error);
    } finally {
      setRepliesLoading(false);
    }
  }, [user, repliesLastDoc]);

  // Fetch media posts
  const loadMediaPosts = useCallback(async (refresh = false) => {
    if (!user) return;

    setMediaLoading(true);

    try {
      const result = await fetchUserMediaPosts(
        user.id,
        refresh ? undefined : mediaLastDoc || undefined
      );

      if (refresh) {
        setMediaPosts(result.posts);
      } else {
        setMediaPosts((prev) => [...prev, ...result.posts]);
      }
      setMediaLastDoc(result.lastDoc);
    } catch (error) {
      console.error('Failed to load media posts:', error);
    } finally {
      setMediaLoading(false);
    }
  }, [user, mediaLastDoc]);

  // Fetch likes
  const loadLikes = useCallback(async (refresh = false) => {
    if (!user) return;

    setLikesLoading(true);

    try {
      const result = await fetchUserLikes(
        user.id,
        refresh ? undefined : likesLastDoc || undefined
      );

      if (refresh) {
        setLikes(result.posts);
      } else {
        setLikes((prev) => [...prev, ...result.posts]);
      }
      setLikesLastDoc(result.lastDoc);
    } catch (error) {
      console.error('Failed to load likes:', error);
    } finally {
      setLikesLoading(false);
    }
  }, [user, likesLastDoc]);

  // Fetch favorite anime
  const loadFavoriteAnime = useCallback(async () => {
    if (!user) return;

    try {
      const anime = await getUserFavoriteAnime(user.id);
      setFavoriteAnime(anime);
    } catch (error) {
      console.error('Failed to load favorite anime:', error);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    if (user) {
      loadPosts(true);
      loadFavoriteAnime();
    }
  }, [user?.id]);

  // Load data when tab changes
  useEffect(() => {
    if (!user) return;

    switch (activeTab) {
      case 'posts':
        if (posts.length === 0) loadPosts(true);
        break;
      case 'replies':
        if (replies.length === 0) loadReplies(true);
        break;
      case 'media':
        if (mediaPosts.length === 0) loadMediaPosts(true);
        break;
      case 'likes':
        if (likes.length === 0) loadLikes(true);
        break;
    }
  }, [activeTab, user?.id]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    switch (activeTab) {
      case 'posts':
        await loadPosts(true);
        break;
      case 'replies':
        await loadReplies(true);
        break;
      case 'media':
        await loadMediaPosts(true);
        break;
      case 'likes':
        await loadLikes(true);
        break;
    }

    setRefreshing(false);
  }, [activeTab, loadPosts, loadReplies, loadMediaPosts, loadLikes]);

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Auth' as never }],
      })
    );
  };

  const isOwnProfile = true;

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

  // Get current tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        if (postsLoading && posts.length === 0) {
          return <LoadingState />;
        }
        if (posts.length === 0) {
          return <EmptyState message="No posts yet" icon="chatbubble-outline" />;
        }
        return posts.map((post) => (
          <ContentCard
            key={post.id}
            id={post.id}
            author={{
              id: user.id,
              username: user.username,
              displayName: user.displayName,
              avatarUrl: user.avatarUrl,
              isPremium: user.powerLevel >= 20,
            }}
            content={post.content}
            createdAt={post.createdAt}
            likes={post.likes}
            comments={post.replies}
            shares={post.reposts}
            mediaAttachment={post.mediaAttachment}
          />
        ));

      case 'replies':
        if (repliesLoading && replies.length === 0) {
          return <LoadingState />;
        }
        if (replies.length === 0) {
          return <EmptyState message="No replies yet" icon="chatbubbles-outline" />;
        }
        return replies.map((reply) => (
          <ContentCard
            key={reply.id}
            id={reply.id}
            author={{
              id: user.id,
              username: user.username,
              displayName: user.displayName,
              avatarUrl: user.avatarUrl,
              isPremium: user.powerLevel >= 20,
            }}
            content={reply.content}
            createdAt={reply.createdAt}
            likes={reply.likes}
            comments={reply.replies}
            shares={reply.reposts}
          />
        ));

      case 'media':
        if (mediaLoading && mediaPosts.length === 0) {
          return <LoadingState />;
        }
        if (mediaPosts.length === 0) {
          return <EmptyState message="No media posts yet" icon="images-outline" />;
        }
        return mediaPosts.map((post) => (
          <ContentCard
            key={post.id}
            id={post.id}
            author={{
              id: user.id,
              username: user.username,
              displayName: user.displayName,
              avatarUrl: user.avatarUrl,
              isPremium: user.powerLevel >= 20,
            }}
            content={post.content}
            createdAt={post.createdAt}
            likes={post.likes}
            comments={post.replies}
            shares={post.reposts}
            mediaAttachment={post.mediaAttachment}
          />
        ));

      case 'likes':
        if (likesLoading && likes.length === 0) {
          return <LoadingState />;
        }
        if (likes.length === 0) {
          return <EmptyState message="No liked posts yet" icon="heart-outline" />;
        }
        return likes.map((post) => (
          <ContentCard
            key={post.id}
            id={post.id}
            author={{
              id: post.author.id,
              username: post.author.username,
              displayName: post.author.displayName,
              avatarUrl: post.author.avatarUrl,
              isPremium: post.author.powerLevel >= 20,
            }}
            content={post.content}
            createdAt={post.createdAt}
            likes={post.likes}
            comments={post.replies}
            shares={post.reposts}
            mediaAttachment={post.mediaAttachment}
          />
        ));

      default:
        return null;
    }
  };

  // Calculate isPremium based on power level
  const isPremium = user.powerLevel >= 20;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Animated Header */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        {/* Banner Image */}
        <Animated.View style={[styles.bannerContainer, { opacity: headerOpacity }]}>
          <Image
            source={{ uri: user.bannerUrl || DEFAULT_BANNER }}
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
          <Text style={styles.collapsedTitle}>{user.displayName}</Text>
        </Animated.View>

        {/* Top Actions */}
        <View style={[styles.headerActions, { top: insets.top + SPACING[2] }]}>
          {isOwnProfile ? (
            <GlassButton
              title="Settings"
              onPress={handleLogout}
              variant="glass"
              size="small"
            />
          ) : (
            <GlassButton
              title="Back"
              onPress={() => navigation.goBack()}
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.accent.primary}
            progressViewOffset={HEADER_MAX_HEIGHT}
          />
        }
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
              imageUrl={user.avatarUrl || DEFAULT_AVATAR}
              size="2xl"
              ring={isPremium}
              ringColor={COLORS.accent.primary}
            />
            {isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>PRO</Text>
              </View>
            )}
          </Animated.View>

          {/* Name & Handle */}
          <View style={styles.nameSection}>
            <Text style={styles.displayName}>{user.displayName}</Text>
            <Text style={styles.username}>@{user.username}</Text>
          </View>

          {/* Bio */}
          {user.bio && (
            <Text style={styles.bio}>{user.bio}</Text>
          )}

          {/* Power Level */}
          <View style={styles.powerLevelContainer}>
            <Ionicons name="flash" size={16} color={COLORS.accent.primary} />
            <Text style={styles.powerLevelText}>Power Level: {user.powerLevel}</Text>
            <Text style={styles.xpText}>{user.xp.toLocaleString()} XP</Text>
          </View>

          {/* Favorite Anime */}
          {favoriteAnime.length > 0 && (
            <View style={styles.favoriteAnime}>
              {favoriteAnime.map((anime, index) => (
                <AnimeTag key={index} name={anime} />
              ))}
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            <StatItem
              label="Posts"
              value={user.stats?.postsCount || 0}
            />
            <View style={styles.statDivider} />
            <StatItem
              label="Followers"
              value={user.stats?.followersCount || 0}
              onPress={() => {}}
            />
            <View style={styles.statDivider} />
            <StatItem
              label="Following"
              value={user.stats?.followingCount || 0}
              onPress={() => {}}
            />
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

        {/* Tab Content */}
        <View style={styles.postsContainer}>
          {renderTabContent()}
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

  // Power Level
  powerLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    marginBottom: SPACING[3],
  },
  powerLevelText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.accent.primary,
  },
  xpText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
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
    minHeight: 200,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[12],
    paddingHorizontal: SPACING[6],
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.tertiary,
    marginTop: SPACING[3],
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[12],
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
    gap: SPACING[4],
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
