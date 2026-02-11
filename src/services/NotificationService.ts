// Anima - Notification Service
// Firebase operations for notifications

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  writeBatch,
  onSnapshot,
  Unsubscribe,
  Timestamp,
} from 'firebase/firestore';
import { getFirebaseDb, COLLECTIONS } from './FirebaseConfig';

// Notification Types
export type NotificationType =
  | 'like'
  | 'comment'
  | 'follow'
  | 'mention'
  | 'repost'
  | 'episode_release'
  | 'new_season'
  | 'anime_airing';

export interface NotificationUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface AppNotification {
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

interface FirestoreNotification {
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
  createdAt: Timestamp;
  isRead: boolean;
}

// Convert Firestore doc to AppNotification
const docToNotification = (id: string, data: FirestoreNotification): AppNotification => ({
  id,
  type: data.type,
  recipientId: data.recipientId,
  user: data.user,
  content: data.content,
  postId: data.postId,
  postPreview: data.postPreview,
  animeId: data.animeId,
  animeName: data.animeName,
  animeImage: data.animeImage,
  episode: data.episode,
  season: data.season,
  timestamp: data.createdAt?.toDate() || new Date(),
  isRead: data.isRead || false,
});

// Fetch notifications for a user
export const getUserNotifications = async (
  userId: string,
  pageSize: number = 50
): Promise<AppNotification[]> => {
  const db = getFirebaseDb();
  const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);

  const q = query(
    notificationsRef,
    where('recipientId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) =>
    docToNotification(doc.id, doc.data() as FirestoreNotification)
  );
};

// Subscribe to real-time notifications
export const subscribeToNotifications = (
  userId: string,
  onUpdate: (notifications: AppNotification[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const db = getFirebaseDb();
  const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);

  const q = query(
    notificationsRef,
    where('recipientId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const notifications = snapshot.docs.map((doc) =>
        docToNotification(doc.id, doc.data() as FirestoreNotification)
      );
      onUpdate(notifications);
    },
    (error) => {
      console.error('Notification subscription error:', error);
      onError?.(error);
    }
  );
};

// Create a notification
export const createNotification = async (
  notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>
): Promise<string> => {
  const db = getFirebaseDb();
  const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);

  const docRef = await addDoc(notificationsRef, {
    ...notification,
    createdAt: serverTimestamp(),
    isRead: false,
  });

  return docRef.id;
};

// Create like notification
export const createLikeNotification = async (
  recipientId: string,
  user: NotificationUser,
  postId: string,
  postPreview: string
): Promise<string> => {
  // Don't notify yourself
  if (recipientId === user.id) return '';

  return createNotification({
    type: 'like',
    recipientId,
    user,
    postId,
    postPreview: postPreview.substring(0, 100),
  });
};

// Create comment notification
export const createCommentNotification = async (
  recipientId: string,
  user: NotificationUser,
  postId: string,
  comment: string
): Promise<string> => {
  if (recipientId === user.id) return '';

  return createNotification({
    type: 'comment',
    recipientId,
    user,
    postId,
    content: comment.substring(0, 100),
  });
};

// Create follow notification
export const createFollowNotification = async (
  recipientId: string,
  user: NotificationUser
): Promise<string> => {
  if (recipientId === user.id) return '';

  return createNotification({
    type: 'follow',
    recipientId,
    user,
  });
};

// Create mention notification
export const createMentionNotification = async (
  recipientId: string,
  user: NotificationUser,
  postId: string,
  content: string
): Promise<string> => {
  if (recipientId === user.id) return '';

  return createNotification({
    type: 'mention',
    recipientId,
    user,
    postId,
    content: content.substring(0, 100),
  });
};

// Create repost notification
export const createRepostNotification = async (
  recipientId: string,
  user: NotificationUser,
  postId: string
): Promise<string> => {
  if (recipientId === user.id) return '';

  return createNotification({
    type: 'repost',
    recipientId,
    user,
    postId,
  });
};

// Create anime episode release notification
export const createEpisodeNotification = async (
  recipientId: string,
  animeId: number,
  animeName: string,
  animeImage: string,
  episode: number
): Promise<string> => {
  return createNotification({
    type: 'episode_release',
    recipientId,
    animeId,
    animeName,
    animeImage,
    episode,
  });
};

// Create new season notification
export const createNewSeasonNotification = async (
  recipientId: string,
  animeId: number,
  animeName: string,
  animeImage: string,
  season: number
): Promise<string> => {
  return createNotification({
    type: 'new_season',
    recipientId,
    animeId,
    animeName,
    animeImage,
    season,
  });
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  const db = getFirebaseDb();
  const notificationRef = doc(db, COLLECTIONS.NOTIFICATIONS, notificationId);
  await updateDoc(notificationRef, { isRead: true });
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  const db = getFirebaseDb();
  const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);

  const q = query(
    notificationsRef,
    where('recipientId', '==', userId),
    where('isRead', '==', false)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) return;

  const batch = writeBatch(db);
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { isRead: true });
  });

  await batch.commit();
};

// Get unread notification count
export const getUnreadCount = async (userId: string): Promise<number> => {
  const db = getFirebaseDb();
  const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);

  const q = query(
    notificationsRef,
    where('recipientId', '==', userId),
    where('isRead', '==', false)
  );

  const snapshot = await getDocs(q);
  return snapshot.size;
};

// Filter notifications by type
export const getNotificationsByType = async (
  userId: string,
  types: NotificationType[],
  pageSize: number = 50
): Promise<AppNotification[]> => {
  const db = getFirebaseDb();
  const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);

  const q = query(
    notificationsRef,
    where('recipientId', '==', userId),
    where('type', 'in', types),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) =>
    docToNotification(doc.id, doc.data() as FirestoreNotification)
  );
};
