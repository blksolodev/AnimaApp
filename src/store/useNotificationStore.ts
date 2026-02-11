// Anima - Notification Store
// State management for notifications

import { create } from 'zustand';
import { Unsubscribe } from 'firebase/firestore';

// Lazy load services to avoid initialization issues
const getServices = () => import('../services/NotificationService');

// Re-export types
export type { AppNotification, NotificationType } from '../services/NotificationService';

type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'repost' | 'episode_release' | 'new_season' | 'anime_airing';

interface NotificationUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

interface AppNotification {
  id: string;
  type: NotificationType;
  recipientId: string;
  user?: NotificationUser;
  content?: string;
  postId?: string;
  postPreview?: string;
  animeId?: number;
  animeName?: string;
  animeImage?: string;
  episode?: number;
  season?: number;
  timestamp: Date;
  isRead: boolean;
}

type FilterType = 'all' | 'mentions' | 'follows' | 'episodes';

interface NotificationState {
  notifications: AppNotification[];
  filteredNotifications: AppNotification[];
  currentFilter: FilterType;
  unreadCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  unsubscribe: Unsubscribe | null;

  // Actions
  fetchNotifications: (userId: string) => Promise<void>;
  subscribeToNotifications: (userId: string) => void;
  unsubscribeFromNotifications: () => void;
  filterNotifications: (filter: FilterType) => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  refreshNotifications: (userId: string) => Promise<void>;
  clearNotifications: () => void;
}

const getFilterTypes = (filter: FilterType): NotificationType[] | null => {
  switch (filter) {
    case 'mentions':
      return ['mention'];
    case 'follows':
      return ['follow'];
    case 'episodes':
      return ['episode_release', 'new_season', 'anime_airing'];
    default:
      return null;
  }
};

const applyFilter = (notifications: AppNotification[], filter: FilterType): AppNotification[] => {
  if (filter === 'all') return notifications;

  const types = getFilterTypes(filter);
  if (!types) return notifications;

  return notifications.filter((n) => types.includes(n.type));
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  filteredNotifications: [],
  currentFilter: 'all',
  unreadCount: 0,
  isLoading: false,
  isRefreshing: false,
  error: null,
  unsubscribe: null,

  fetchNotifications: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { getUserNotifications } = await getServices();
      const notifications = await getUserNotifications(userId);
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      const { currentFilter } = get();

      set({
        notifications,
        filteredNotifications: applyFilter(notifications, currentFilter),
        unreadCount,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch notifications',
        isLoading: false,
      });
    }
  },

  subscribeToNotifications: (userId: string) => {
    // Unsubscribe from previous subscription
    const { unsubscribe: prevUnsubscribe } = get();
    if (prevUnsubscribe) {
      prevUnsubscribe();
    }

    // Use dynamic import for real-time subscription
    import('../services/NotificationService').then(({ subscribeToNotifications }) => {
      const unsubscribe = subscribeToNotifications(
        userId,
        (notifications) => {
          const unreadCount = notifications.filter((n) => !n.isRead).length;
          const { currentFilter } = get();

          set({
            notifications,
            filteredNotifications: applyFilter(notifications, currentFilter),
            unreadCount,
            isLoading: false,
            error: null,
          });
        },
        (error) => {
          set({ error: error.message });
        }
      );

      set({ unsubscribe });
    });
  },

  unsubscribeFromNotifications: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }
  },

  filterNotifications: (filter: FilterType) => {
    const { notifications } = get();
    set({
      currentFilter: filter,
      filteredNotifications: applyFilter(notifications, filter),
    });
  },

  markAsRead: async (notificationId: string) => {
    try {
      const { markNotificationAsRead } = await getServices();
      await markNotificationAsRead(notificationId);

      const { notifications, currentFilter, unreadCount } = get();
      const updatedNotifications = notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      );

      set({
        notifications: updatedNotifications,
        filteredNotifications: applyFilter(updatedNotifications, currentFilter),
        unreadCount: Math.max(0, unreadCount - 1),
      });
    } catch (error: any) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  markAllAsRead: async (userId: string) => {
    try {
      const { markAllNotificationsAsRead } = await getServices();
      await markAllNotificationsAsRead(userId);

      const { notifications, currentFilter } = get();
      const updatedNotifications = notifications.map((n) => ({ ...n, isRead: true }));

      set({
        notifications: updatedNotifications,
        filteredNotifications: applyFilter(updatedNotifications, currentFilter),
        unreadCount: 0,
      });
    } catch (error: any) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },

  refreshNotifications: async (userId: string) => {
    set({ isRefreshing: true });
    try {
      const { getUserNotifications } = await getServices();
      const notifications = await getUserNotifications(userId);
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      const { currentFilter } = get();

      set({
        notifications,
        filteredNotifications: applyFilter(notifications, currentFilter),
        unreadCount,
        isRefreshing: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to refresh notifications',
        isRefreshing: false,
      });
    }
  },

  clearNotifications: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
    }
    set({
      notifications: [],
      filteredNotifications: [],
      unreadCount: 0,
      currentFilter: 'all',
      unsubscribe: null,
      error: null,
    });
  },
}));
