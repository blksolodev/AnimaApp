// Anima - Anime Library Service
// Firebase service for tracking user's anime watch status

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { getFirebaseDb, COLLECTIONS } from './FirebaseConfig';
import { WatchlistEntry, WatchStatus, AnimeMedia } from '../types';

// Firebase document structure for anime library entry
interface AnimeLibraryDoc {
  userId: string;
  animeId: number;
  animeData: {
    title: string;
    titleEnglish: string | null;
    coverImage: string;
    bannerImage: string | null;
    episodes: number | null;
    format: string;
    status: string;
    genres: string[];
    averageScore: number | null;
  };
  watchStatus: WatchStatus;
  progress: number;
  score: number | null;
  startedAt: Timestamp | null;
  completedAt: Timestamp | null;
  notes: string | null;
  updatedAt: Timestamp;
  createdAt: Timestamp;
}

// Convert Firestore doc to WatchlistEntry
const docToWatchlistEntry = (doc: AnimeLibraryDoc): WatchlistEntry => {
  return {
    animeId: doc.animeId,
    anime: {
      id: doc.animeId,
      title: {
        romaji: doc.animeData.title,
        english: doc.animeData.titleEnglish,
        native: null,
      },
      coverImage: {
        extraLarge: doc.animeData.coverImage,
        large: doc.animeData.coverImage,
        medium: doc.animeData.coverImage,
        color: null,
      },
      bannerImage: doc.animeData.bannerImage,
      description: null,
      episodes: doc.animeData.episodes,
      duration: null,
      status: doc.animeData.status as any,
      season: null,
      seasonYear: null,
      format: doc.animeData.format as any,
      genres: doc.animeData.genres,
      averageScore: doc.animeData.averageScore,
      popularity: 0,
      trending: 0,
      studios: { nodes: [] },
      nextAiringEpisode: null,
    },
    status: doc.watchStatus,
    progress: doc.progress,
    score: doc.score,
    startedAt: doc.startedAt?.toDate() ?? null,
    completedAt: doc.completedAt?.toDate() ?? null,
    notes: doc.notes,
  };
};

// Get document ID for a user's anime entry
const getDocId = (userId: string, animeId: number): string => {
  return `${userId}_${animeId}`;
};

// Add or update anime to user's library
export const addToLibrary = async (
  userId: string,
  anime: AnimeMedia,
  status: WatchStatus = 'PLANNING'
): Promise<WatchlistEntry> => {
  const db = getFirebaseDb();
  const docId = getDocId(userId, anime.id);
  const docRef = doc(db, COLLECTIONS.ANIME_LIBRARY, docId);

  const title = anime.title.english || anime.title.romaji || anime.title.native || 'Unknown';

  const now = Timestamp.now();
  const libraryDoc: AnimeLibraryDoc = {
    userId,
    animeId: anime.id,
    animeData: {
      title: anime.title.romaji,
      titleEnglish: anime.title.english,
      coverImage: anime.coverImage.large || anime.coverImage.medium,
      bannerImage: anime.bannerImage,
      episodes: anime.episodes,
      format: anime.format,
      status: anime.status,
      genres: anime.genres,
      averageScore: anime.averageScore,
    },
    watchStatus: status,
    progress: 0,
    score: null,
    startedAt: status === 'WATCHING' ? now : null,
    completedAt: null,
    notes: null,
    updatedAt: now,
    createdAt: now,
  };

  await setDoc(docRef, libraryDoc);
  return docToWatchlistEntry(libraryDoc);
};

// Update watch status
export const updateWatchStatus = async (
  userId: string,
  animeId: number,
  status: WatchStatus
): Promise<void> => {
  const db = getFirebaseDb();
  const docId = getDocId(userId, animeId);
  const docRef = doc(db, COLLECTIONS.ANIME_LIBRARY, docId);

  const updates: Partial<AnimeLibraryDoc> = {
    watchStatus: status,
    updatedAt: Timestamp.now(),
  };

  // Auto-set dates based on status
  if (status === 'WATCHING') {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as AnimeLibraryDoc;
      if (!data.startedAt) {
        updates.startedAt = Timestamp.now();
      }
    }
  } else if (status === 'COMPLETED') {
    updates.completedAt = Timestamp.now();
  }

  await updateDoc(docRef, updates);
};

// Update progress (episode count)
export const updateProgress = async (
  userId: string,
  animeId: number,
  progress: number
): Promise<void> => {
  const db = getFirebaseDb();
  const docId = getDocId(userId, animeId);
  const docRef = doc(db, COLLECTIONS.ANIME_LIBRARY, docId);

  // Get current entry to check total episodes
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error('Anime not found in library');
  }

  const data = docSnap.data() as AnimeLibraryDoc;
  const updates: Partial<AnimeLibraryDoc> = {
    progress,
    updatedAt: Timestamp.now(),
  };

  // Auto-complete if progress matches total episodes
  if (data.animeData.episodes && progress >= data.animeData.episodes) {
    updates.watchStatus = 'COMPLETED';
    updates.completedAt = Timestamp.now();
    updates.progress = data.animeData.episodes;
  } else if (progress > 0 && data.watchStatus === 'PLANNING') {
    // Auto-start if progress is made while still planning
    updates.watchStatus = 'WATCHING';
    if (!data.startedAt) {
      updates.startedAt = Timestamp.now();
    }
  }

  await updateDoc(docRef, updates);
};

// Update score
export const updateScore = async (
  userId: string,
  animeId: number,
  score: number | null
): Promise<void> => {
  const db = getFirebaseDb();
  const docId = getDocId(userId, animeId);
  const docRef = doc(db, COLLECTIONS.ANIME_LIBRARY, docId);

  await updateDoc(docRef, {
    score,
    updatedAt: Timestamp.now(),
  });
};

// Update notes
export const updateNotes = async (
  userId: string,
  animeId: number,
  notes: string | null
): Promise<void> => {
  const db = getFirebaseDb();
  const docId = getDocId(userId, animeId);
  const docRef = doc(db, COLLECTIONS.ANIME_LIBRARY, docId);

  await updateDoc(docRef, {
    notes,
    updatedAt: Timestamp.now(),
  });
};

// Remove from library
export const removeFromLibrary = async (
  userId: string,
  animeId: number
): Promise<void> => {
  const db = getFirebaseDb();
  const docId = getDocId(userId, animeId);
  const docRef = doc(db, COLLECTIONS.ANIME_LIBRARY, docId);

  await deleteDoc(docRef);
};

// Get single anime entry from library
export const getLibraryEntry = async (
  userId: string,
  animeId: number
): Promise<WatchlistEntry | null> => {
  const db = getFirebaseDb();
  const docId = getDocId(userId, animeId);
  const docRef = doc(db, COLLECTIONS.ANIME_LIBRARY, docId);

  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    return null;
  }

  return docToWatchlistEntry(docSnap.data() as AnimeLibraryDoc);
};

// Get user's entire library
export const getUserLibrary = async (
  userId: string
): Promise<WatchlistEntry[]> => {
  const db = getFirebaseDb();
  const q = query(
    collection(db, COLLECTIONS.ANIME_LIBRARY),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => docToWatchlistEntry(doc.data() as AnimeLibraryDoc));
};

// Get library entries by status
export const getLibraryByStatus = async (
  userId: string,
  status: WatchStatus
): Promise<WatchlistEntry[]> => {
  const db = getFirebaseDb();
  const q = query(
    collection(db, COLLECTIONS.ANIME_LIBRARY),
    where('userId', '==', userId),
    where('watchStatus', '==', status),
    orderBy('updatedAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => docToWatchlistEntry(doc.data() as AnimeLibraryDoc));
};

// Check if user has watched an anime (for post validation)
export const hasWatched = async (
  userId: string,
  animeId: number
): Promise<boolean> => {
  const entry = await getLibraryEntry(userId, animeId);
  if (!entry) return false;

  // Consider 'WATCHING' with progress > 0 or 'COMPLETED' as watched
  return (
    entry.status === 'COMPLETED' ||
    (entry.status === 'WATCHING' && entry.progress > 0)
  );
};

// Check if user can post about an anime (watched at least 1 episode)
export const canPostAboutAnime = async (
  userId: string,
  animeId: number
): Promise<{ canPost: boolean; reason?: string }> => {
  const entry = await getLibraryEntry(userId, animeId);

  if (!entry) {
    return {
      canPost: false,
      reason: 'Add this anime to your library to post about it',
    };
  }

  if (entry.status === 'PLANNING') {
    return {
      canPost: false,
      reason: 'Start watching this anime to post about it',
    };
  }

  if (entry.status === 'WATCHING' && entry.progress === 0) {
    return {
      canPost: false,
      reason: 'Watch at least 1 episode to post about it',
    };
  }

  return { canPost: true };
};

// Get library stats for profile
export const getLibraryStats = async (
  userId: string
): Promise<{
  total: number;
  watching: number;
  completed: number;
  paused: number;
  dropped: number;
  planning: number;
  episodesWatched: number;
  averageScore: number | null;
}> => {
  const library = await getUserLibrary(userId);

  const stats = {
    total: library.length,
    watching: 0,
    completed: 0,
    paused: 0,
    dropped: 0,
    planning: 0,
    episodesWatched: 0,
    averageScore: null as number | null,
  };

  let totalScore = 0;
  let scoredCount = 0;

  for (const entry of library) {
    stats.episodesWatched += entry.progress;

    if (entry.score !== null) {
      totalScore += entry.score;
      scoredCount++;
    }

    switch (entry.status) {
      case 'WATCHING':
        stats.watching++;
        break;
      case 'COMPLETED':
        stats.completed++;
        break;
      case 'PAUSED':
        stats.paused++;
        break;
      case 'DROPPED':
        stats.dropped++;
        break;
      case 'PLANNING':
        stats.planning++;
        break;
    }
  }

  if (scoredCount > 0) {
    stats.averageScore = Math.round((totalScore / scoredCount) * 10) / 10;
  }

  return stats;
};
