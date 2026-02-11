// Anima - Chat Service
// Real-time guild chat with Firebase Firestore

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { getFirebaseDb, COLLECTIONS } from './FirebaseConfig';
import { GuildMessage, GuildEpisodeRoom, QuestAuthor } from '../types';

// Get or create episode chat room
export const getEpisodeRoom = async (
  animeId: number,
  animeName: string,
  episodeNumber: number,
  airingTime: number
): Promise<GuildEpisodeRoom> => {
  const db = getFirebaseDb();
  const roomId = `${animeId}_ep${episodeNumber}`;

  const roomRef = doc(db, COLLECTIONS.GUILD_CHATS, roomId);
  const roomDoc = await getDoc(roomRef);

  if (roomDoc.exists()) {
    const data = roomDoc.data();
    return {
      guildId: roomId,
      episodeNumber,
      animeId,
      animeName,
      airingTime: data.airingTime,
      isAired: Date.now() / 1000 >= data.airingTime,
      messageCount: data.messageCount || 0,
      participants: data.participants || 0,
    };
  }

  // Create new room
  const { setDoc } = await import('firebase/firestore');
  await setDoc(roomRef, {
    animeId,
    animeName,
    episodeNumber,
    airingTime,
    messageCount: 0,
    participants: 0,
    createdAt: serverTimestamp(),
  });

  return {
    guildId: roomId,
    episodeNumber,
    animeId,
    animeName,
    airingTime,
    isAired: Date.now() / 1000 >= airingTime,
    messageCount: 0,
    participants: 0,
  };
};

// Send message to episode chat
export const sendMessage = async (
  roomId: string,
  authorId: string,
  author: QuestAuthor,
  content: string,
  spoilerVerified: boolean = false
): Promise<string> => {
  const db = getFirebaseDb();

  // Check if episode has aired (for spoiler protection)
  const roomRef = doc(db, COLLECTIONS.GUILD_CHATS, roomId);
  const roomDoc = await getDoc(roomRef);

  if (!roomDoc.exists()) {
    throw new Error('Chat room not found');
  }

  const roomData = roomDoc.data();
  const isAired = Date.now() / 1000 >= roomData.airingTime;

  if (!isAired && !spoilerVerified) {
    throw new Error('Cannot send messages before episode airs');
  }

  // Add message
  const messagesRef = collection(db, COLLECTIONS.GUILD_CHATS, roomId, 'messages');
  const messageDoc = await addDoc(messagesRef, {
    authorId,
    author: {
      id: author.id,
      username: author.username,
      displayName: author.displayName,
      avatarUrl: author.avatarUrl,
      powerLevel: author.powerLevel,
      auraColor: author.auraColor,
    },
    content,
    timestamp: serverTimestamp(),
    spoilerVerified,
    reactions: [],
  });

  // Update room message count
  await updateDoc(roomRef, {
    messageCount: increment(1),
  });

  return messageDoc.id;
};

// Subscribe to messages in real-time
export const subscribeToMessages = (
  roomId: string,
  callback: (messages: GuildMessage[]) => void,
  messageLimit: number = 50
): (() => void) => {
  const db = getFirebaseDb();
  const messagesRef = collection(db, COLLECTIONS.GUILD_CHATS, roomId, 'messages');

  const q = query(
    messagesRef,
    orderBy('timestamp', 'desc'),
    limit(messageLimit)
  );

  return onSnapshot(q, (snapshot) => {
    const messages: GuildMessage[] = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          roomId,
          authorId: data.authorId,
          author: data.author,
          content: data.content,
          timestamp: data.timestamp?.toDate() || new Date(),
          spoilerVerified: data.spoilerVerified,
          reactions: data.reactions || [],
        };
      })
      .reverse(); // Reverse to show oldest first

    callback(messages);
  });
};

// Get recent messages (non-realtime)
export const getRecentMessages = async (
  roomId: string,
  messageLimit: number = 50
): Promise<GuildMessage[]> => {
  const db = getFirebaseDb();
  const messagesRef = collection(db, COLLECTIONS.GUILD_CHATS, roomId, 'messages');

  const q = query(
    messagesRef,
    orderBy('timestamp', 'desc'),
    limit(messageLimit)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        roomId,
        authorId: data.authorId,
        author: data.author,
        content: data.content,
        timestamp: data.timestamp?.toDate() || new Date(),
        spoilerVerified: data.spoilerVerified,
        reactions: data.reactions || [],
      };
    })
    .reverse();
};

// Add reaction to message
export const addReaction = async (
  roomId: string,
  messageId: string,
  emoji: string,
  userId: string
): Promise<void> => {
  const db = getFirebaseDb();
  const messageRef = doc(db, COLLECTIONS.GUILD_CHATS, roomId, 'messages', messageId);
  const messageDoc = await getDoc(messageRef);

  if (!messageDoc.exists()) {
    throw new Error('Message not found');
  }

  const data = messageDoc.data();
  const reactions = data.reactions || [];

  // Find existing reaction
  const existingIndex = reactions.findIndex((r: any) => r.emoji === emoji);

  if (existingIndex >= 0) {
    // Update existing reaction
    const existing = reactions[existingIndex];
    if (!existing.users.includes(userId)) {
      existing.count += 1;
      existing.users.push(userId);
    }
  } else {
    // Add new reaction
    reactions.push({
      emoji,
      count: 1,
      users: [userId],
    });
  }

  await updateDoc(messageRef, { reactions });
};

// Verify watching for spoiler access
export const verifySpoilerAccess = async (
  roomId: string,
  userId: string
): Promise<boolean> => {
  const db = getFirebaseDb();

  // Store verification in user's subcollection
  const verificationRef = doc(
    db,
    COLLECTIONS.USERS,
    userId,
    'spoiler_verifications',
    roomId
  );

  const { setDoc } = await import('firebase/firestore');
  await setDoc(verificationRef, {
    roomId,
    verifiedAt: serverTimestamp(),
  });

  return true;
};

// Check if user has verified for room
export const hasSpoilerAccess = async (
  roomId: string,
  userId: string
): Promise<boolean> => {
  const db = getFirebaseDb();

  const verificationRef = doc(
    db,
    COLLECTIONS.USERS,
    userId,
    'spoiler_verifications',
    roomId
  );

  const verificationDoc = await getDoc(verificationRef);
  return verificationDoc.exists();
};

// Get active guilds (rooms with recent activity)
export const getActiveGuilds = async (
  limitCount: number = 10
): Promise<GuildEpisodeRoom[]> => {
  const db = getFirebaseDb();
  const guildsRef = collection(db, COLLECTIONS.GUILD_CHATS);

  const now = Date.now() / 1000;
  const oneDayAgo = now - 24 * 60 * 60;

  const q = query(
    guildsRef,
    where('airingTime', '>=', oneDayAgo),
    orderBy('airingTime', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      guildId: doc.id,
      episodeNumber: data.episodeNumber,
      animeId: data.animeId,
      animeName: data.animeName,
      airingTime: data.airingTime,
      isAired: now >= data.airingTime,
      messageCount: data.messageCount || 0,
      participants: data.participants || 0,
    };
  });
};
