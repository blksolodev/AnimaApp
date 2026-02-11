// Anima - NotificationsScreen
// Quest updates and social notifications

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PixelCard, PixelAvatar, PixelIcon, ScanlineOverlayCSS } from '../../components/pixel-ui';
import { Notification, NotificationType } from '../../types';
import { COLORS, FONTS, FONT_SIZES, SPACING, COMPONENT_SIZES } from '../../theme';

// Demo notifications
const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'new_episode',
    message: 'Episode 4 of Oshi no Ko just appeared! 42 party members are watching.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
    relatedAnime: {
      animeId: 1,
      title: 'Oshi no Ko',
      coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx150672-2WWJVXIAOG11.png',
    },
  },
  {
    id: '2',
    type: 'like',
    message: 'liked your quest about anime',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    relatedUser: {
      id: '123',
      username: 'otaku_master',
      displayName: 'Otaku Master',
      avatarUrl: null,
      powerLevel: 42,
      auraColor: '#F4D03F',
    },
  },
  {
    id: '3',
    type: 'level_up',
    message: 'You reached Level 10! New title unlocked: "Adventurer"',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '4',
    type: 'badge_earned',
    message: 'Badge earned: "First Quest" - Posted your first quest!',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
];

interface NotificationCardProps {
  notification: Notification;
  onPress: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
}) => {
  const getIcon = (): { name: any; color: string } => {
    switch (notification.type) {
      case 'new_episode':
        return { name: 'play', color: COLORS.criticalHitCrimson };
      case 'like':
        return { name: 'heartFilled', color: COLORS.criticalHitCrimson };
      case 'reply':
        return { name: 'reply', color: COLORS.manaBlue };
      case 'repost':
        return { name: 'repost', color: COLORS.manaBlue };
      case 'follow':
        return { name: 'profile', color: COLORS.levelUpLime };
      case 'level_up':
        return { name: 'sword', color: COLORS.goldCoin };
      case 'badge_earned':
        return { name: 'shield', color: COLORS.expPurple };
      default:
        return { name: 'bell', color: COLORS.white };
    }
  };

  const formatTime = (date: Date): string => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'NOW';
    if (minutes < 60) return `${minutes}M AGO`;
    if (hours < 24) return `${hours}H AGO`;
    return `${days}D AGO`;
  };

  const icon = getIcon();

  return (
    <Pressable onPress={onPress}>
      <PixelCard
        variant="notification"
        backgroundColor={notification.read ? COLORS.deepPurple : COLORS.shadowBlack}
        borderColor={notification.read ? COLORS.borderDark : COLORS.levelUpLime}
        style={styles.notificationCard}
      >
        <View style={styles.notificationContent}>
          {/* Icon or Avatar */}
          <View style={styles.notificationIcon}>
            {notification.relatedUser ? (
              <PixelAvatar
                imageUrl={notification.relatedUser.avatarUrl}
                size="small"
                powerLevel={notification.relatedUser.powerLevel}
              />
            ) : (
              <View style={[styles.iconContainer, { backgroundColor: icon.color }]}>
                <PixelIcon name={icon.name} size={16} color={COLORS.midnightGrape} />
              </View>
            )}
          </View>

          {/* Message */}
          <View style={styles.messageContainer}>
            {notification.relatedUser && (
              <Text style={styles.username}>
                @{notification.relatedUser.username}
              </Text>
            )}
            <Text style={styles.message} numberOfLines={2}>
              {notification.message}
            </Text>
            <Text style={styles.time}>{formatTime(notification.createdAt)}</Text>
          </View>

          {/* Unread indicator */}
          {!notification.read && <View style={styles.unreadDot} />}
        </View>
      </PixelCard>
    </Pressable>
  );
};

export const NotificationsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );
    // Navigate to related content
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>ALERTS</Text>
      <Pressable onPress={markAllRead}>
        <Text style={styles.markAllRead}>MARK ALL READ</Text>
      </Pressable>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <PixelIcon name="bell" size={48} color={COLORS.mediumGray} />
      <Text style={styles.emptyTitle}>NO NEW ALERTS</Text>
      <Text style={styles.emptyText}>
        When something happens, you'll see it here!
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScanlineOverlayCSS opacity={0.03} enabled={true} />

      {renderHeader()}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            onPress={() => handleNotificationPress(item)}
          />
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  markAllRead: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.xs,
    color: COLORS.manaBlue,
  },
  listContent: {
    paddingHorizontal: SPACING[4],
    paddingTop: SPACING[3],
    paddingBottom: COMPONENT_SIZES.tabBarHeight + SPACING[6],
  },
  notificationCard: {
    marginBottom: SPACING[2],
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIcon: {
    marginRight: SPACING[3],
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  messageContainer: {
    flex: 1,
  },
  username: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.xs,
    color: COLORS.manaBlue,
    marginBottom: 2,
  },
  message: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    marginBottom: 4,
  },
  time: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.xs,
    color: COLORS.mediumGray,
  },
  unreadDot: {
    width: 8,
    height: 8,
    backgroundColor: COLORS.levelUpLime,
    marginLeft: SPACING[2],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING[12],
  },
  emptyTitle: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.md,
    color: COLORS.goldCoin,
    marginTop: SPACING[4],
    marginBottom: SPACING[2],
  },
  emptyText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.lightGray,
    textAlign: 'center',
  },
});

export default NotificationsScreen;
