// Anima - HomeScreen v2.0
// Redesigned feed with glassmorphic UI
// Twitter/X + Crunchyroll hybrid experience

import React, { useEffect, useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
  StatusBar,
  Platform,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import {
  ContentCard,
  FloatingComposeButton,
  Avatar,
  GlassButton,
  useGuestPrompt,
} from '../../components/glass-ui';
import { useFeedStore, useUserStore } from '../../store';
import { Quest } from '../../types';
import { HomeStackParamList } from '../../navigation/AppNavigator';
import { COLORS, LAYOUT, TYPOGRAPHY, SPACING, EFFECTS } from '../../theme/designSystem';

type HomeNavigationProp = StackNavigationProp<HomeStackParamList, 'Feed'>;

// Header component with glass effect
const GlassHeader: React.FC<{
  scrollY: Animated.Value;
  onAiringPress: () => void;
  userAvatar: string | null;
}> = ({ scrollY, onAiringPress, userAvatar }) => {
  const insets = useSafeAreaInsets();
  const isBlurSupported = Platform.OS === 'ios';

  // Animate header opacity based on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.header,
        { paddingTop: insets.top + SPACING[2] },
      ]}
    >
      {/* Glass Background */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { opacity: headerOpacity },
        ]}
      >
        {isBlurSupported ? (
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFillObject} />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: COLORS.glass.overlay }]} />
        )}
      </Animated.View>

      {/* Header Content */}
      <View style={styles.headerContent}>
        {/* Logo/Title */}
        <View style={styles.logoSection}>
          <Text style={styles.logoText}>anima</Text>
          <View style={styles.logoDot} />
        </View>

        {/* Actions */}
        <View style={styles.headerActions}>
          {/* Airing Today Button */}
          <Pressable onPress={onAiringPress} style={styles.airingButton}>
            <View style={styles.liveIndicator} />
            <Text style={styles.airingText}>LIVE</Text>
          </Pressable>

          {/* User Avatar */}
          <Avatar
            imageUrl={userAvatar}
            size="sm"
            ring
            ringColor={COLORS.accent.primary}
          />
        </View>
      </View>

      {/* Bottom Border */}
      <Animated.View
        style={[
          styles.headerBorder,
          { opacity: headerOpacity },
        ]}
      />
    </Animated.View>
  );
};

// Story/Status Rail (like Instagram stories but for anime updates)
const StoryRail: React.FC = () => {
  const stories = [
    { id: '1', imageUrl: null, label: 'Your Story', isOwn: true },
    { id: '2', imageUrl: 'https://picsum.photos/100', label: 'Attack on Titan' },
    { id: '3', imageUrl: 'https://picsum.photos/101', label: 'Demon Slayer' },
    { id: '4', imageUrl: 'https://picsum.photos/102', label: 'Jujutsu Kaisen' },
    { id: '5', imageUrl: 'https://picsum.photos/103', label: 'My Hero' },
  ];

  return (
    <View style={styles.storyRail}>
      <FlatList
        horizontal
        data={stories}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storyContent}
        renderItem={({ item }) => (
          <Pressable style={styles.storyItem}>
            <View style={[styles.storyRing, item.isOwn && styles.storyRingOwn]}>
              <Avatar
                imageUrl={item.imageUrl}
                size="lg"
                ring={!item.isOwn}
                ringColor={COLORS.accent.secondary}
              />
              {item.isOwn && (
                <View style={styles.addStoryButton}>
                  <View style={styles.addIcon} />
                </View>
              )}
            </View>
            <Text style={styles.storyLabel} numberOfLines={1}>
              {item.label}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
};

// Category Tabs
const CategoryTabs: React.FC<{
  activeTab: string;
  onTabChange: (tab: string) => void;
}> = ({ activeTab, onTabChange }) => {
  const tabs = ['For You', 'Following', 'Trending', 'New'];

  return (
    <View style={styles.tabsContainer}>
      {tabs.map((tab) => (
        <Pressable
          key={tab}
          onPress={() => onTabChange(tab)}
          style={[
            styles.tab,
            activeTab === tab && styles.tabActive,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab && styles.tabTextActive,
            ]}
          >
            {tab}
          </Text>
          {activeTab === tab && <View style={styles.tabIndicator} />}
        </Pressable>
      ))}
    </View>
  );
};

export const HomeScreenV2: React.FC = () => {
  const navigation = useNavigation<HomeNavigationProp>();
  const insets = useSafeAreaInsets();
  const { user, isGuest } = useUserStore();
  const {
    quests,
    isLoading,
    isRefreshing,
    hasMore,
    error,
    fetchQuests,
    loadMore,
    likeQuest,
    unlikeQuest,
    repostQuest,
  } = useFeedStore();

  const [activeTab, setActiveTab] = useState('For You');
  const scrollY = useRef(new Animated.Value(0)).current;

  // Guest mode prompt
  const { checkGuest, GuestPromptComponent } = useGuestPrompt();

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    fetchQuests();
  }, []);

  const handleRefresh = useCallback(() => {
    fetchQuests(true);
  }, [fetchQuests]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      loadMore();
    }
  }, [hasMore, isLoading, loadMore]);

  const handleLike = useCallback(
    (questId: string, isLiked: boolean) => {
      checkGuest(() => {
        if (!user) return;
        if (isLiked) {
          unlikeQuest(questId, user.id);
        } else {
          likeQuest(questId, user.id, {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            powerLevel: user.powerLevel || 1,
            auraColor: user.auraColor,
          });
        }
      }, { title: 'Like Posts', message: 'Create an account to like posts and show your appreciation.' });
    },
    [user, likeQuest, unlikeQuest, checkGuest]
  );

  const handleComment = useCallback(() => {
    checkGuest(() => {
      // TODO: Implement comment
    }, { title: 'Join the Conversation', message: 'Create an account to comment and discuss with other anime fans.' });
  }, [checkGuest]);

  const handleShare = useCallback(() => {
    checkGuest(() => {
      // TODO: Implement share
    }, { title: 'Share Content', message: 'Create an account to share posts with your followers.' });
  }, [checkGuest]);

  const handleCompose = useCallback(() => {
    checkGuest(() => {
      // TODO: Implement compose
    }, { title: 'Create a Post', message: 'Create an account to share your thoughts with the community.' });
  }, [checkGuest]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  const renderHeader = () => (
    <View>
      {/* Story Rail */}
      <StoryRail />

      {/* Category Tabs */}
      <CategoryTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Divider */}
      <View style={styles.divider} />
    </View>
  );

  const renderQuest = useCallback(
    ({ item }: { item: Quest }) => (
      <ContentCard
        id={item.id}
        author={{
          id: item.author.id,
          username: item.author.username,
          displayName: item.author.displayName,
          avatarUrl: item.author.avatarUrl,
          isPremium: item.author.powerLevel >= 20,
          verified: item.author.powerLevel >= 50,
        }}
        content={item.content}
        createdAt={item.createdAt}
        media={item.mediaAttachment ? [{
          type: 'image' as const,
          url: item.mediaAttachment.url,
          aspectRatio: 16 / 9,
        }] : undefined}
        animeTag={item.animeReference ? {
          id: item.animeReference.id,
          title: item.animeReference.title,
          coverImage: item.animeReference.coverImage,
          episode: item.animeReference.episode,
        } : undefined}
        likes={item.likes}
        comments={item.replies}
        shares={item.reposts}
        isLiked={item.isLiked}
        onPress={() => {}}
        onLike={() => handleLike(item.id, item.isLiked)}
        onComment={handleComment}
        onShare={handleShare}
      />
    ),
    [handleLike, handleComment, handleShare]
  );

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>Your feed is empty</Text>
          <Text style={styles.emptyText}>
            Follow some creators or explore trending content to get started.
          </Text>
          <GlassButton
            title="Explore"
            onPress={() => navigation.navigate('Search' as any)}
            variant="primary"
            style={styles.emptyButton}
          />
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!hasMore) return null;

    return (
      <View style={styles.footer}>
        <View style={styles.loadingIndicator}>
          <View style={styles.loadingDot} />
          <View style={[styles.loadingDot, styles.loadingDotDelay]} />
          <View style={[styles.loadingDot, styles.loadingDotDelay2]} />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background Gradient */}
      <LinearGradient
        colors={[COLORS.background.secondary, COLORS.background.primary]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <GlassHeader
        scrollY={scrollY}
        onAiringPress={() => navigation.navigate('AiringToday')}
        userAvatar={user?.avatarUrl || null}
      />

      {/* Feed */}
      <Animated.FlatList
        data={quests}
        keyExtractor={(item) => item.id}
        renderItem={renderQuest}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + LAYOUT.heights.header },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.accent.primary}
            progressViewOffset={insets.top + LAYOUT.heights.header}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      {/* Floating Compose Button - Hidden for guests */}
      {!isGuest && <FloatingComposeButton onPress={handleCompose} />}

      {/* Guest Prompt Modal */}
      {GuestPromptComponent}
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
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[4],
    paddingBottom: SPACING[3],
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    letterSpacing: TYPOGRAPHY.letterSpacing.tight,
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent.primary,
    marginLeft: 2,
    marginBottom: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  },
  airingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glass.medium,
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: LAYOUT.radius.full,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.semantic.live,
    marginRight: SPACING[2],
  },
  airingText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    letterSpacing: TYPOGRAPHY.letterSpacing.wider,
  },
  headerBorder: {
    height: 1,
    backgroundColor: COLORS.glass.border,
  },

  // Story Rail
  storyRail: {
    paddingVertical: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glass.border,
  },
  storyContent: {
    paddingHorizontal: SPACING[4],
    gap: SPACING[4],
  },
  storyItem: {
    alignItems: 'center',
    width: 72,
  },
  storyRing: {
    position: 'relative',
  },
  storyRingOwn: {
    opacity: 0.7,
  },
  addStoryButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.background.primary,
  },
  addIcon: {
    width: 12,
    height: 12,
  },
  storyLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginTop: SPACING[2],
    textAlign: 'center',
  },

  // Category Tabs
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING[4],
    gap: SPACING[6],
  },
  tab: {
    paddingVertical: SPACING[3],
    position: 'relative',
  },
  tabActive: {},
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
    left: 0,
    right: 0,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.accent.primary,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.glass.border,
  },

  // List
  listContent: {
    paddingBottom: LAYOUT.heights.tabBar + SPACING[6],
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[16],
    paddingHorizontal: SPACING[6],
  },
  emptyCard: {
    alignItems: 'center',
    maxWidth: 280,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.background.tertiary,
    marginBottom: SPACING[4],
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING[2],
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING[6],
  },
  emptyButton: {
    minWidth: 120,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING[6],
  },
  loadingIndicator: {
    flexDirection: 'row',
    gap: SPACING[2],
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent.primary,
    opacity: 0.3,
  },
  loadingDotDelay: {
    opacity: 0.6,
  },
  loadingDotDelay2: {
    opacity: 1,
  },
});

export default HomeScreenV2;
