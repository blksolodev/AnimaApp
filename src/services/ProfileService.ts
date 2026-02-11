// Anima - Profile Service
// Handle profile-related Firebase queries

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  increment,
  serverTimestamp,
  DocumentSnapshot,
  startAfter,
} from 'firebase/firestore';
import { getFirebaseDb, COLLECTIONS } from './FirebaseConfig';
import { Quest, User, UserStats } from '../types';

const PAGE_SIZE = 20;

// Fetch user's posts
export const fetchUserPosts = async (
  userId: string,
  lastDoc?: DocumentSnapshot
): Promise<{ posts: Quest[]; lastDoc: DocumentSnapshot | null; hasMore: boolean }> => {
  const db = getFirebaseDb();
  const questsRef = collection(db, COLLECTIONS.QUESTS);

  let q = query(
    questsRef,
    where('authorId', '==', userId),
    where('parentId', '==', null), // Only top-level posts, not replies
    orderBy('createdAt', 'desc'),
    limit(PAGE_SIZE)
  );

  if (lastDoc) {
    q = query(
      questsRef,
      where('authorId', '==', userId),
      where('parentId', '==', null),
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(PAGE_SIZE)
    );
  }

  try {
    const snapshot = await getDocs(q);
    const posts: Quest[] = snapshot.docs.map((doc) => {
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

    return {
      posts,
      lastDoc: newLastDoc,
      hasMore: snapshot.docs.length === PAGE_SIZE,
    };
  } catch (error: any) {
    console.error('Failed to fetch user posts:', error);
    // Return empty on permission errors
    if (error?.code === 'permission-denied') {
      return { posts: [], lastDoc: null, hasMore: false };
    }
    throw error;
  }
};

// Fetch user's replies
export const fetchUserReplies = async (
  userId: string,
  lastDoc?: DocumentSnapshot
): Promise<{ replies: Quest[]; lastDoc: DocumentSnapshot | null; hasMore: boolean }> => {
  const db = getFirebaseDb();
  const questsRef = collection(db, COLLECTIONS.QUESTS);

  let q = query(
    questsRef,
    where('authorId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(PAGE_SIZE)
  );

  if (lastDoc) {
    q = query(
      questsRef,
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(PAGE_SIZE)
    );
  }

  try {
    const snapshot = await getDocs(q);
    // Filter for replies only (those with parentId)
    const replies: Quest[] = snapshot.docs
      .map((doc) => {
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
      })
      .filter((post) => post.parentId);

    const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

    return {
      replies,
      lastDoc: newLastDoc,
      hasMore: snapshot.docs.length === PAGE_SIZE,
    };
  } catch (error: any) {
    console.error('Failed to fetch user replies:', error);
    if (error?.code === 'permission-denied') {
      return { replies: [], lastDoc: null, hasMore: false };
    }
    throw error;
  }
};

// Fetch user's posts with media
export const fetchUserMediaPosts = async (
  userId: string,
  lastDoc?: DocumentSnapshot
): Promise<{ posts: Quest[]; lastDoc: DocumentSnapshot | null; hasMore: boolean }> => {
  const db = getFirebaseDb();
  const questsRef = collection(db, COLLECTIONS.QUESTS);

  let q = query(
    questsRef,
    where('authorId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(PAGE_SIZE * 2) // Fetch more since we'll filter
  );

  if (lastDoc) {
    q = query(
      questsRef,
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(PAGE_SIZE * 2)
    );
  }

  try {
    const snapshot = await getDocs(q);
    // Filter for posts with media only
    const posts: Quest[] = snapshot.docs
      .map((doc) => {
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
      })
      .filter((post) => post.mediaAttachment);

    const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

    return {
      posts,
      lastDoc: newLastDoc,
      hasMore: snapshot.docs.length === PAGE_SIZE * 2,
    };
  } catch (error: any) {
    console.error('Failed to fetch user media posts:', error);
    if (error?.code === 'permission-denied') {
      return { posts: [], lastDoc: null, hasMore: false };
    }
    throw error;
  }
};

// Fetch user's liked posts
export const fetchUserLikes = async (
  userId: string,
  lastDoc?: DocumentSnapshot
): Promise<{ posts: Quest[]; lastDoc: DocumentSnapshot | null; hasMore: boolean }> => {
  const db = getFirebaseDb();

  try {
    // First get the liked quest IDs from user's likes subcollection
    const likesRef = collection(db, COLLECTIONS.USERS, userId, 'likes');
    let likesQuery = query(
      likesRef,
      orderBy('createdAt', 'desc'),
      limit(PAGE_SIZE)
    );

    if (lastDoc) {
      likesQuery = query(
        likesRef,
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );
    }

    const likesSnapshot = await getDocs(likesQuery);
    const newLastDoc = likesSnapshot.docs[likesSnapshot.docs.length - 1] || null;

    if (likesSnapshot.empty) {
      return { posts: [], lastDoc: null, hasMore: false };
    }

    // Fetch the actual quests
    const questIds = likesSnapshot.docs.map((doc) => doc.data().questId);
    const posts: Quest[] = [];

    for (const questId of questIds) {
      try {
        const questDoc = await getDoc(doc(db, COLLECTIONS.QUESTS, questId));
        if (questDoc.exists()) {
          const data = questDoc.data();
          posts.push({
            id: questDoc.id,
            authorId: data.authorId,
            author: data.author,
            content: data.content,
            mediaAttachment: data.mediaAttachment,
            animeReference: data.animeReference,
            likes: data.likes || 0,
            reposts: data.reposts || 0,
            replies: data.replies || 0,
            isLiked: true,
            isReposted: false,
            createdAt: data.createdAt?.toDate() || new Date(),
            isHotTake: data.isHotTake || false,
            parentId: data.parentId,
          });
        }
      } catch (err) {
        // Quest may have been deleted, skip it
        console.warn(`Could not fetch quest ${questId}:`, err);
      }
    }

    return {
      posts,
      lastDoc: newLastDoc,
      hasMore: likesSnapshot.docs.length === PAGE_SIZE,
    };
  } catch (error: any) {
    console.error('Failed to fetch user likes:', error);
    if (error?.code === 'permission-denied') {
      return { posts: [], lastDoc: null, hasMore: false };
    }
    throw error;
  }
};

// Follow a user
export const followUser = async (
  followerId: string,
  followingId: string
): Promise<void> => {
  const db = getFirebaseDb();

  // Add to follower's following list
  await addDoc(collection(db, COLLECTIONS.USERS, followerId, 'following'), {
    userId: followingId,
    createdAt: serverTimestamp(),
  });

  // Add to followed user's followers list
  await addDoc(collection(db, COLLECTIONS.USERS, followingId, 'followers'), {
    userId: followerId,
    createdAt: serverTimestamp(),
  });

  // Update stats
  await updateDoc(doc(db, COLLECTIONS.USERS, followerId), {
    'stats.followingCount': increment(1),
  });
  await updateDoc(doc(db, COLLECTIONS.USERS, followingId), {
    'stats.followersCount': increment(1),
  });
};

// Unfollow a user
export const unfollowUser = async (
  followerId: string,
  followingId: string
): Promise<void> => {
  const db = getFirebaseDb();

  // Find and remove from follower's following list
  const followingRef = collection(db, COLLECTIONS.USERS, followerId, 'following');
  const followingQuery = query(followingRef, where('userId', '==', followingId));
  const followingSnapshot = await getDocs(followingQuery);

  for (const doc of followingSnapshot.docs) {
    await deleteDoc(doc.ref);
  }

  // Find and remove from followed user's followers list
  const followersRef = collection(db, COLLECTIONS.USERS, followingId, 'followers');
  const followersQuery = query(followersRef, where('userId', '==', followerId));
  const followersSnapshot = await getDocs(followersQuery);

  for (const doc of followersSnapshot.docs) {
    await deleteDoc(doc.ref);
  }

  // Update stats
  await updateDoc(doc(db, COLLECTIONS.USERS, followerId), {
    'stats.followingCount': increment(-1),
  });
  await updateDoc(doc(db, COLLECTIONS.USERS, followingId), {
    'stats.followersCount': increment(-1),
  });
};

// Check if user is following another user
export const isFollowing = async (
  followerId: string,
  followingId: string
): Promise<boolean> => {
  const db = getFirebaseDb();

  try {
    const followingRef = collection(db, COLLECTIONS.USERS, followerId, 'following');
    const q = query(followingRef, where('userId', '==', followingId));
    const snapshot = await getDocs(q);

    return !snapshot.empty;
  } catch (error) {
    console.error('Failed to check following status:', error);
    return false;
  }
};

// Get followers list
export const getFollowers = async (
  userId: string,
  lastDoc?: DocumentSnapshot
): Promise<{ users: User[]; lastDoc: DocumentSnapshot | null; hasMore: boolean }> => {
  const db = getFirebaseDb();

  try {
    const followersRef = collection(db, COLLECTIONS.USERS, userId, 'followers');
    let q = query(followersRef, orderBy('createdAt', 'desc'), limit(PAGE_SIZE));

    if (lastDoc) {
      q = query(followersRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(PAGE_SIZE));
    }

    const snapshot = await getDocs(q);
    const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

    const users: User[] = [];
    for (const followerDoc of snapshot.docs) {
      const followerId = followerDoc.data().userId;
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, followerId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        users.push({
          id: followerId,
          username: data.username,
          displayName: data.displayName,
          avatarUrl: data.avatarUrl,
          bannerUrl: data.bannerUrl,
          bio: data.bio,
          powerLevel: data.powerLevel,
          xp: data.xp,
          joinedAt: data.joinedAt?.toDate() || new Date(),
          badges: data.badges || [],
          pledgedCharacter: data.pledgedCharacter,
          stats: data.stats,
          settings: data.settings,
        });
      }
    }

    return {
      users,
      lastDoc: newLastDoc,
      hasMore: snapshot.docs.length === PAGE_SIZE,
    };
  } catch (error: any) {
    console.error('Failed to get followers:', error);
    if (error?.code === 'permission-denied') {
      return { users: [], lastDoc: null, hasMore: false };
    }
    throw error;
  }
};

// Get following list
export const getFollowing = async (
  userId: string,
  lastDoc?: DocumentSnapshot
): Promise<{ users: User[]; lastDoc: DocumentSnapshot | null; hasMore: boolean }> => {
  const db = getFirebaseDb();

  try {
    const followingRef = collection(db, COLLECTIONS.USERS, userId, 'following');
    let q = query(followingRef, orderBy('createdAt', 'desc'), limit(PAGE_SIZE));

    if (lastDoc) {
      q = query(followingRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(PAGE_SIZE));
    }

    const snapshot = await getDocs(q);
    const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

    const users: User[] = [];
    for (const followingDoc of snapshot.docs) {
      const followingId = followingDoc.data().userId;
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, followingId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        users.push({
          id: followingId,
          username: data.username,
          displayName: data.displayName,
          avatarUrl: data.avatarUrl,
          bannerUrl: data.bannerUrl,
          bio: data.bio,
          powerLevel: data.powerLevel,
          xp: data.xp,
          joinedAt: data.joinedAt?.toDate() || new Date(),
          badges: data.badges || [],
          pledgedCharacter: data.pledgedCharacter,
          stats: data.stats,
          settings: data.settings,
        });
      }
    }

    return {
      users,
      lastDoc: newLastDoc,
      hasMore: snapshot.docs.length === PAGE_SIZE,
    };
  } catch (error: any) {
    console.error('Failed to get following:', error);
    if (error?.code === 'permission-denied') {
      return { users: [], lastDoc: null, hasMore: false };
    }
    throw error;
  }
};

// Update user's favorite anime
export const updateFavoriteAnime = async (
  userId: string,
  favoriteAnime: string[]
): Promise<void> => {
  const db = getFirebaseDb();
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    favoriteAnime,
  });
};

// Get user's favorite anime from their library
export const getUserFavoriteAnime = async (userId: string): Promise<string[]> => {
  const db = getFirebaseDb();

  try {
    // First check if user has explicit favorites
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      if (data.favoriteAnime && data.favoriteAnime.length > 0) {
        return data.favoriteAnime;
      }
    }

    // Otherwise, get from their library (highest rated)
    const libraryRef = collection(db, COLLECTIONS.ANIME_LIBRARY);
    const q = query(
      libraryRef,
      where('userId', '==', userId),
      where('status', '==', 'completed'),
      orderBy('rating', 'desc'),
      limit(3)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data().animeTitle);
  } catch (error) {
    console.error('Failed to get favorite anime:', error);
    return [];
  }
};

// Update user stats (posts count)
export const incrementPostsCount = async (userId: string): Promise<void> => {
  const db = getFirebaseDb();
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    'stats.postsCount': increment(1),
  });
};

// Decrement posts count (when deleting a post)
export const decrementPostsCount = async (userId: string): Promise<void> => {
  const db = getFirebaseDb();
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    'stats.postsCount': increment(-1),
  });
};
