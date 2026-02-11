// Anima - Notifications Screen v2.0
// Glassmorphic notifications experience with real Firebase data

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Avatar, GlassCard, useGuestPrompt } from '../../components/glass-ui';
import { useNotificationStore, useUserStore } from '../../store';
import { COLORS, LAYOUT, TYPOGRAPHY, SPACING } from '../../theme/designSystem';

// Notification Types
type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'repost' | 'episode_release' | 'new_season' | 'anime_airing';
type FilterType = 'all' | 'mentions' | 'follows' | 'episodes';

interface NotificationUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

interface Notification {
  id: string;
  type: NotificationType;
  user?: NotificationUser;
  content?: string;
  postPreview?: string;
  animeName?: string;
  animeImage?: string;
  episode?: number;
  season?: number;
  timestamp: Date;
  isRead: boolean;
}

// Notification Icon
const NotificationIcon: React.FC<{ type: NotificationType }> = ({ type }) => {
  const getIconConfig = (): { name: keyof typeof Ionicons.glyphMap; color: string } => {
    switch (type) {
      case 'like':
        return { name: 'heart', color: COLORS.accent.like };
      case 'comment':
        return { name: 'chatbubble', color: COLORS.accent.tertiary };
      case 'follow':
        return { name: 'person-add', color: COLORS.accent.secondary };
      case 'mention':
        return { name: 'at', color: COLORS.accent.primary };
      case 'repost':
        return { name: 'repeat', color: COLORS.accent.success };
      case 'episode_release':
        return { name: 'play-circle', color: COLORS.accent.warning };
      case 'new_season':
        return { name: 'star', color: COLORS.accent.primary };
      case 'anime_airing':
        return { name: 'tv', color: COLORS.semantic.live };
      default:
        return { name: 'notifications', color: COLORS.text.tertiary };
    }
  };

  const { name, color } = getIconConfig();

  return (
    <View style={[styles.notificationIcon, { backgroundColor: color }]}>
      <Ionicons name={name} size={10} color={COLORS.text.primary} />
    </View>
  );
};

// Notification Item
const NotificationItem: React.FC<{
  notification: Notification;
  onPress: () => void;
}> = ({ notification, onPress }) => {
  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  const getNotificationText = () => {
    switch (notification.type) {
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'follow':
        return 'started following you';
      case 'mention':
        return 'mentioned you';
      case 'repost':
        return 'reposted your post';
      case 'episode_release':
        return `Episode ${notification.episode} of ${notification.animeName} is now available!`;
      case 'new_season':
        return `Season ${notification.season} of ${notification.animeName} has been announced!`;
      case 'anime_airing':
        return `${notification.animeName} is airing now!`;
      default:
        return '';
    }
  };

  const isAnimeNotification = ['episode_release', 'new_season', 'anime_airing'].includes(notification.type);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.notificationItem,
        !notification.isRead && styles.notificationItemUnread,
      ]}
    >
      {/* Unread Indicator */}
      {!notification.isRead && <View style={styles.unreadDot} />}

      {/* Avatar with Icon */}
      <View style={styles.avatarContainer}>
        {isAnimeNotification && notification.animeImage ? (
          <View style={styles.animeImageContainer}>
            <Image
              source={{ uri: notification.animeImage }}
              style={styles.animeImage}
              contentFit="cover"
            />
          </View>
        ) : (
          <Avatar
            imageUrl={notification.user?.avatarUrl}
            size="md"
          />
        )}
        <View style={styles.iconBadge}>
          <NotificationIcon type={notification.type} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.notificationContent}>
        <Text style={styles.notificationText}>
          {notification.user && (
            <Text style={styles.displayName}>{notification.user.displayName} </Text>
          )}
          {getNotificationText()}
        </Text>

        {notification.content && (
          <Text style={styles.notificationPreview} numberOfLines={2}>
            {notification.content}
          </Text>
        )}

        {notification.postPreview && (
          <Text style={styles.notificationPreview} numberOfLines={1}>
            "{notification.postPreview}"
          </Text>
        )}

        <Text style={styles.timestamp}>{formatTime(notification.timestamp)}</Text>
      </View>
    </Pressable>
  );
};

// Filter Tabs
const FilterTabs: React.FC<{
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}> = ({ activeFilter, onFilterChange }) => {
  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'mentions', label: 'Mentions' },
    { key: 'follows', label: 'Follows' },
    { key: 'episodes', label: 'Episodes' },
  ];

  return (
    <View style={styles.filterTabs}>
      {filters.map((filter) => (
        <Pressable
          key={filter.key}
          onPress={() => onFilterChange(filter.key)}
          style={[
            styles.filterTab,
            activeFilter === filter.key && styles.filterTabActive,
          ]}
        >
          <Text
            style={[
              styles.filterTabText,
              activeFilter === filter.key && styles.filterTabTextActive,
            ]}
          >
            {filter.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

// Guest Notifications Screen
const GuestNotificationsScreen: React.FC = () => {
  const { checkGuest, GuestPromptComponent } = useGuestPrompt();

  return (
    <View style={styles.guestContainer}>
      <View style={styles.guestCard}>
        <Ionicons name="notifications-outline" size={64} color={COLORS.text.tertiary} />
        <Text style={styles.guestTitle}>Stay Updated</Text>
        <Text style={styles.guestText}>
          Sign in to receive notifications about likes, comments, new episodes, and more.
        </Text>
        <Pressable
          style={styles.guestButton}
          onPress={() => checkGuest(() => {}, {
            title: 'Get Notifications',
            message: 'Create an account to receive personalized notifications.'
          })}
        >
          <Text style={styles.guestButtonText}>Sign In</Text>
        </Pressable>
      </View>
      {GuestPromptComponent}
    </View>
  );
};

export const NotificationsScreenV2: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user, isGuest, isAuthenticated } = useUserStore();
  const {
    filteredNotifications,
    currentFilter,
    unreadCount,
    isLoading,
    isRefreshing,
    error,
    fetchNotifications,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    filterNotifications,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotificationStore();

  // Fetch notifications on mount
  useEffect(() => {
    if (user?.id && isAuthenticated) {
      fetchNotifications(user.id);
      subscribeToNotifications(user.id);

      return () => {
        unsubscribeFromNotifications();
      };
    }
  }, [user?.id, isAuthenticated]);

  const handleRefresh = useCallback(() => {
    if (user?.id) {
      refreshNotifications(user.id);
    }
  }, [user?.id, refreshNotifications]);

  const handleFilterChange = useCallback((filter: FilterType) => {
    filterNotifications(filter);
  }, [filterNotifications]);

  const handleNotificationPress = useCallback((notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    // TODO: Navigate based on notification type
  }, [markAsRead]);

  const handleMarkAllAsRead = useCallback(() => {
    if (user?.id) {
      markAllAsRead(user.id);
    }
  }, [user?.id, markAllAsRead]);

  // Show guest screen if not authenticated
  if (isGuest || !isAuthenticated) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={[COLORS.background.secondary, COLORS.background.primary]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={[styles.header, { paddingTop: insets.top + SPACING[2] }]}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>
        </View>
        <GuestNotificationsScreen />
      </View>
    );
  }

  const renderNotification = useCallback(
    ({ item }: { item: Notification }) => (
      <NotificationItem
        notification={item}
        onPress={() => handleNotificationPress(item)}
      />
    ),
    [handleNotificationPress]
  );

  const renderHeader = () => (
    <View>
      {/* Mark all as read */}
      {unreadCount > 0 && (
        <Pressable style={styles.markAllRead} onPress={handleMarkAllAsRead}>
          <Text style={styles.markAllReadText}>Mark all as read</Text>
        </Pressable>
      )}
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent.primary} />
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="notifications-off-outline" size={64} color={COLORS.text.tertiary} />
        <Text style={styles.emptyTitle}>No notifications yet</Text>
        <Text style={styles.emptyText}>
          {currentFilter === 'all'
            ? "When someone interacts with your content, you'll see it here."
            : `No ${currentFilter} notifications yet.`}
        </Text>
      </View>
    );
  };

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
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <FilterTabs
          activeFilter={currentFilter}
          onFilterChange={handleFilterChange}
        />
      </View>

      {/* Error State */}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={16} color={COLORS.accent.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.accent.primary}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: LAYOUT.heights.tabBar + SPACING[6] },
          filteredNotifications.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      />
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
    paddingHorizontal: SPACING[4],
    paddingBottom: SPACING[2],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glass.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  unreadBadge: {
    backgroundColor: COLORS.accent.primary,
    paddingHorizontal: SPACING[2],
    paddingVertical: 2,
    borderRadius: LAYOUT.radius.full,
    marginLeft: SPACING[3],
  },
  unreadBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },

  // Filters
  filterTabs: {
    flexDirection: 'row',
    gap: SPACING[2],
  },
  filterTab: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[2],
    borderRadius: LAYOUT.radius.full,
    backgroundColor: COLORS.glass.light,
  },
  filterTabActive: {
    backgroundColor: COLORS.accent.primary,
  },
  filterTabText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.secondary,
  },
  filterTabTextActive: {
    color: COLORS.text.primary,
  },

  // List
  listContent: {
    paddingTop: SPACING[2],
  },
  listContentEmpty: {
    flex: 1,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[16],
  },

  // Error
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.accent.error}20`,
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    gap: SPACING[2],
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.accent.error,
    flex: 1,
  },

  // Mark All Read
  markAllRead: {
    padding: SPACING[4],
    alignItems: 'flex-end',
  },
  markAllReadText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.accent.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },

  // Notification Item
  notificationItem: {
    flexDirection: 'row',
    padding: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glass.border,
    position: 'relative',
  },
  notificationItemUnread: {
    backgroundColor: COLORS.glass.light,
  },
  unreadDot: {
    position: 'absolute',
    left: SPACING[2],
    top: '50%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent.primary,
    marginTop: -4,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING[3],
  },
  animeImageContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    overflow: 'hidden',
  },
  animeImage: {
    width: '100%',
    height: '100%',
  },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    lineHeight: TYPOGRAPHY.sizes.base * TYPOGRAPHY.lineHeights.normal,
  },
  displayName: {
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  notificationPreview: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
    marginTop: SPACING[1],
  },
  timestamp: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.tertiary,
    marginTop: SPACING[2],
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[16],
    paddingHorizontal: SPACING[6],
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginTop: SPACING[4],
    marginBottom: SPACING[2],
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },

  // Guest Screen
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING[6],
  },
  guestCard: {
    alignItems: 'center',
    maxWidth: 300,
  },
  guestTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginTop: SPACING[4],
    marginBottom: SPACING[2],
  },
  guestText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING[6],
  },
  guestButton: {
    backgroundColor: COLORS.accent.primary,
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[3],
    borderRadius: LAYOUT.radius.lg,
  },
  guestButtonText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
});

export default NotificationsScreenV2;
