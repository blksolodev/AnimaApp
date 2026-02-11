// Anima - HomeScreen
// Main quest feed with QuestCards

import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { PixelCard, PixelButton, ScanlineOverlayCSS } from '../../components/pixel-ui';
import { QuestCard } from '../../components/social';
import { useFeedStore, useUserStore } from '../../store';
import { Quest } from '../../types';
import { HomeStackParamList } from '../../navigation/AppNavigator';
import { COLORS, FONTS, FONT_SIZES, SPACING, COMPONENT_SIZES, SPRITE_FRAME } from '../../theme';

type HomeNavigationProp = StackNavigationProp<HomeStackParamList, 'Feed'>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNavigationProp>();
  const insets = useSafeAreaInsets();
  const { user } = useUserStore();
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

  const [animatedIndex, setAnimatedIndex] = useState(-1);

  useEffect(() => {
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
      if (!user) return;
      if (isLiked) {
        unlikeQuest(questId, user.id);
      } else {
        likeQuest(questId, user.id);
      }
    },
    [user, likeQuest, unlikeQuest]
  );

  const handleRepost = useCallback(
    (questId: string) => {
      if (!user) return;
      repostQuest(questId, user.id);
    },
    [user, repostQuest]
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>QUEST_LOG</Text>
      <Pressable
        style={styles.airingButton}
        onPress={() => navigation.navigate('AiringToday')}
      >
        <Text style={styles.airingButtonText}>TODAY</Text>
        <View style={styles.airingDot} />
      </Pressable>
    </View>
  );

  const renderQuest = useCallback(
    ({ item, index }: { item: Quest; index: number }) => (
      <QuestCard
        quest={item}
        animate={index === animatedIndex}
        onPress={() => {
          // Navigate to quest detail
        }}
        onLike={() => handleLike(item.id, item.isLiked)}
        onRepost={() => handleRepost(item.id)}
        onReply={() => {
          // Open reply modal
        }}
        onShare={() => {
          // Share quest
        }}
        onAuthorPress={() => {
          // Navigate to author profile
        }}
        onAnimePress={() => {
          // Navigate to anime detail
        }}
      />
    ),
    [animatedIndex, handleLike, handleRepost]
  );

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <PixelCard variant="dialog" style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>NO QUESTS FOUND</Text>
          <Text style={styles.emptyText}>
            The quest log is empty. Be the first adventurer to post!
          </Text>
          <PixelButton
            title="POST QUEST"
            onPress={() => {
              // Open create quest modal
            }}
            variant="primary"
            style={styles.emptyButton}
          />
        </PixelCard>
      </View>
    );
  };

  const renderFooter = () => {
    if (!hasMore) return null;

    return (
      <View style={styles.footer}>
        <ActivityIndicator color={COLORS.levelUpLime} />
        <Text style={styles.footerText}>LOADING MORE QUESTS...</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Scanline overlay */}
      <ScanlineOverlayCSS opacity={0.03} enabled={true} />

      {/* Header */}
      {renderHeader()}

      {/* Feed */}
      <FlatList
        data={quests}
        keyExtractor={(item) => item.id}
        renderItem={renderQuest}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.levelUpLime}
            colors={[COLORS.levelUpLime]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB for new quest */}
      <Pressable style={styles.fab}>
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.midnightGrape,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  airingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.deepPurple,
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderWidth: 2,
    borderColor: COLORS.levelUpLime,
  },
  airingButtonText: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.xs,
    color: COLORS.levelUpLime,
  },
  airingDot: {
    width: 8,
    height: 8,
    backgroundColor: COLORS.criticalHitCrimson,
    marginLeft: SPACING[2],
  },
  listContent: {
    paddingHorizontal: SPACING[4],
    paddingTop: SPACING[3],
    paddingBottom: COMPONENT_SIZES.tabBarHeight + SPACING[6],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING[12],
  },
  emptyCard: {
    maxWidth: 280,
    alignItems: 'center',
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
    marginBottom: SPACING[4],
  },
  emptyButton: {
    marginTop: SPACING[2],
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING[4],
  },
  footerText: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.xs,
    color: COLORS.mediumGray,
    marginTop: SPACING[2],
  },
  fab: {
    position: 'absolute',
    right: SPACING[4],
    bottom: COMPONENT_SIZES.tabBarHeight + SPACING[4],
    width: 56,
    height: 56,
    backgroundColor: COLORS.levelUpLime,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  fabIcon: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES['2xl'],
    color: COLORS.midnightGrape,
    marginTop: -2,
  },
});

export default HomeScreen;
