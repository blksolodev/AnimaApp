// Anima - Feed Store
// State management for quest feed and social posts

import { create } from 'zustand';
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  increment,
  serverTimestamp,
  DocumentSnapshot,
} from 'firebase/firestore';
import { getFirebaseDb, COLLECTIONS } from '../services/FirebaseConfig';
import { Quest, QuestAuthor, AnimeReference, MediaAttachment } from '../types';

// Lazy load notification service
const getNotificationService = () => import('../services/NotificationService');

interface FeedState {
  quests: Quest[];
  isLoading: boolean;
  isRefreshing: boolean;
  hasMore: boolean;
  lastDoc: DocumentSnapshot | null;
  error: string | null;

  // Actions
  fetchQuests: (refresh?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  createQuest: (
    content: string,
    author: QuestAuthor,
    options?: {
      animeReference?: AnimeReference;
      mediaAttachment?: MediaAttachment;
      isHotTake?: boolean;
    }
  ) => Promise<string>;
  likeQuest: (questId: string, userId: string, user?: QuestAuthor) => Promise<void>;
  unlikeQuest: (questId: string, userId: string) => Promise<void>;
  repostQuest: (questId: string, userId: string, user?: QuestAuthor) => Promise<void>;
  clearFeed: () => void;
}

const PAGE_SIZE = 20;

export const useFeedStore = create<FeedState>((set, get) => ({
  quests: [],
  isLoading: false,
  isRefreshing: false,
  hasMore: true,
  lastDoc: null,
  error: null,

  fetchQuests: async (refresh = false) => {
    const db = getFirebaseDb();

    if (refresh) {
      set({ isRefreshing: true });
    } else {
      set({ isLoading: true });
    }

    try {
      const questsRef = collection(db, COLLECTIONS.QUESTS);
      const q = query(
        questsRef,
        orderBy('createdAt', 'desc'),
        limit(PAGE_SIZE)
      );

      const snapshot = await getDocs(q);
      const quests: Quest[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          authorId: data.authorId,
          author: data.author,
          content: data.content,
          mediaAttachment: data.mediaAttachment,
          animeReference: data.animeReference,
          likes: data.likes || 0,
          reposts: data.reposts || 0,
          replies: data.replies || 0,
          isLiked: false, // Will be updated based on user
          isReposted: false,
          createdAt: data.createdAt?.toDate() || new Date(),
          isHotTake: data.isHotTake || false,
          parentId: data.parentId,
        };
      });

      const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

      set({
        quests,
        lastDoc,
        hasMore: snapshot.docs.length === PAGE_SIZE,
        isLoading: false,
        isRefreshing: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        isRefreshing: false,
        error: error.message || 'Failed to fetch quests',
      });
    }
  },

  loadMore: async () => {
    const { lastDoc, hasMore, isLoading } = get();
    if (!hasMore || isLoading || !lastDoc) return;

    const db = getFirebaseDb();
    set({ isLoading: true });

    try {
      const questsRef = collection(db, COLLECTIONS.QUESTS);
      const q = query(
        questsRef,
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );

      const snapshot = await getDocs(q);
      const newQuests: Quest[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          authorId: data.authorId,
          author: data.author,
          content: data.content,
          mediaAttachment: data.mediaAttachment,
          animeReference: data.animeReference,
          likes: data.likes || 0,
          reposts: data.reposts || 0,
          replies: data.replies || 0,
          isLiked: false,
          isReposted: false,
          createdAt: data.createdAt?.toDate() || new Date(),
          isHotTake: data.isHotTake || false,
          parentId: data.parentId,
        };
      });

      const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

      set((state) => ({
        quests: [...state.quests, ...newQuests],
        lastDoc: newLastDoc,
        hasMore: snapshot.docs.length === PAGE_SIZE,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to load more quests',
      });
    }
  },

  createQuest: async (content, author, options = {}) => {
    const db = getFirebaseDb();

    const questData = {
      authorId: author.id,
      author: {
        id: author.id,
        username: author.username,
        displayName: author.displayName,
        avatarUrl: author.avatarUrl,
        powerLevel: author.powerLevel,
        auraColor: author.auraColor,
      },
      content,
      mediaAttachment: options.mediaAttachment || null,
      animeReference: options.animeReference || null,
      likes: 0,
      reposts: 0,
      replies: 0,
      isHotTake: options.isHotTake || false,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.QUESTS), questData);

    // Add to local state immediately
    const newQuest: Quest = {
      id: docRef.id,
      ...questData,
      isLiked: false,
      isReposted: false,
      createdAt: new Date(),
    };

    set((state) => ({
      quests: [newQuest, ...state.quests],
    }));

    return docRef.id;
  },

  likeQuest: async (questId, userId, user) => {
    const db = getFirebaseDb();
    const { quests } = get();
    const quest = quests.find((q) => q.id === questId);

    // Update local state optimistically
    set((state) => ({
      quests: state.quests.map((q) =>
        q.id === questId
          ? { ...q, isLiked: true, likes: q.likes + 1 }
          : q
      ),
    }));

    try {
      const questRef = doc(db, COLLECTIONS.QUESTS, questId);
      await updateDoc(questRef, {
        likes: increment(1),
      });

      // Store like in user's subcollection
      const likesRef = collection(db, COLLECTIONS.USERS, userId, 'likes');
      await addDoc(likesRef, {
        questId,
        createdAt: serverTimestamp(),
      });

      // Create notification for post author
      if (quest && user && quest.authorId !== userId) {
        try {
          const { createLikeNotification } = await getNotificationService();
          await createLikeNotification(
            quest.authorId,
            {
              id: user.id,
              username: user.username,
              displayName: user.displayName,
              avatarUrl: user.avatarUrl || null,
            },
            questId,
            quest.content
          );
        } catch (notifError) {
          console.error('Failed to create like notification:', notifError);
        }
      }
    } catch (error) {
      // Revert on error
      set((state) => ({
        quests: state.quests.map((q) =>
          q.id === questId
            ? { ...q, isLiked: false, likes: q.likes - 1 }
            : q
        ),
      }));
    }
  },

  unlikeQuest: async (questId, userId) => {
    const db = getFirebaseDb();

    set((state) => ({
      quests: state.quests.map((q) =>
        q.id === questId
          ? { ...q, isLiked: false, likes: Math.max(0, q.likes - 1) }
          : q
      ),
    }));

    try {
      const questRef = doc(db, COLLECTIONS.QUESTS, questId);
      await updateDoc(questRef, {
        likes: increment(-1),
      });
    } catch (error) {
      set((state) => ({
        quests: state.quests.map((q) =>
          q.id === questId
            ? { ...q, isLiked: true, likes: q.likes + 1 }
            : q
        ),
      }));
    }
  },

  repostQuest: async (questId, userId, user) => {
    const db = getFirebaseDb();
    const { quests } = get();
    const quest = quests.find((q) => q.id === questId);

    set((state) => ({
      quests: state.quests.map((q) =>
        q.id === questId
          ? { ...q, isReposted: true, reposts: q.reposts + 1 }
          : q
      ),
    }));

    try {
      const questRef = doc(db, COLLECTIONS.QUESTS, questId);
      await updateDoc(questRef, {
        reposts: increment(1),
      });

      // Create notification for post author
      if (quest && user && quest.authorId !== userId) {
        try {
          const { createRepostNotification } = await getNotificationService();
          await createRepostNotification(
            quest.authorId,
            {
              id: user.id,
              username: user.username,
              displayName: user.displayName,
              avatarUrl: user.avatarUrl || null,
            },
            questId
          );
        } catch (notifError) {
          console.error('Failed to create repost notification:', notifError);
        }
      }
    } catch (error) {
      set((state) => ({
        quests: state.quests.map((q) =>
          q.id === questId
            ? { ...q, isReposted: false, reposts: q.reposts - 1 }
            : q
        ),
      }));
    }
  },

  clearFeed: () => {
    set({
      quests: [],
      lastDoc: null,
      hasMore: true,
      error: null,
    });
  },
}));
