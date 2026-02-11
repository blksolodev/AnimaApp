// Anima - Anime Library Store
// State management for user's anime tracking

import { create } from 'zustand';
import { WatchlistEntry, WatchStatus, AnimeMedia } from '../types';

// Lazy load services to avoid initialization issues
const getServices = () => import('../services/AnimeLibraryService');

interface LibraryStats {
  total: number;
  watching: number;
  completed: number;
  paused: number;
  dropped: number;
  planning: number;
  episodesWatched: number;
  averageScore: number | null;
}

interface AnimeLibraryState {
  library: WatchlistEntry[];
  filteredLibrary: WatchlistEntry[];
  currentFilter: WatchStatus | 'ALL';
  stats: LibraryStats | null;
  isLoading: boolean;
  error: string | null;

  // Lookup cache for quick access
  libraryMap: Map<number, WatchlistEntry>;

  // Actions
  fetchLibrary: (userId: string) => Promise<void>;
  fetchStats: (userId: string) => Promise<void>;
  filterByStatus: (status: WatchStatus | 'ALL') => void;

  addAnime: (userId: string, anime: AnimeMedia, status?: WatchStatus) => Promise<WatchlistEntry>;
  updateStatus: (userId: string, animeId: number, status: WatchStatus) => Promise<void>;
  updateEpisodeProgress: (userId: string, animeId: number, progress: number) => Promise<void>;
  updateAnimeScore: (userId: string, animeId: number, score: number | null) => Promise<void>;
  updateAnimeNotes: (userId: string, animeId: number, notes: string | null) => Promise<void>;
  removeAnime: (userId: string, animeId: number) => Promise<void>;

  getEntry: (animeId: number) => WatchlistEntry | undefined;
  isInLibrary: (animeId: number) => boolean;
  checkCanPost: (userId: string, animeId: number) => Promise<{ canPost: boolean; reason?: string }>;

  clearLibrary: () => void;
  clearError: () => void;
}

export const useAnimeLibraryStore = create<AnimeLibraryState>((set, get) => ({
  library: [],
  filteredLibrary: [],
  currentFilter: 'ALL',
  stats: null,
  isLoading: false,
  error: null,
  libraryMap: new Map(),

  fetchLibrary: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { getUserLibrary } = await getServices();
      const library = await getUserLibrary(userId);
      const libraryMap = new Map<number, WatchlistEntry>();
      library.forEach((entry) => libraryMap.set(entry.animeId, entry));

      const { currentFilter } = get();
      const filteredLibrary = currentFilter === 'ALL'
        ? library
        : library.filter((entry) => entry.status === currentFilter);

      set({
        library,
        filteredLibrary,
        libraryMap,
        isLoading: false,
      });
    } catch (error: any) {
      // Handle permission errors gracefully - show empty library
      const isPermissionError = error?.code === 'permission-denied' ||
        error?.message?.includes('permission') ||
        error?.message?.includes('Missing or insufficient');

      if (isPermissionError) {
        console.warn('Library permission error - showing empty library:', error.message);
        set({
          library: [],
          filteredLibrary: [],
          libraryMap: new Map(),
          isLoading: false,
          error: null, // Don't show error for permission issues on empty library
        });
      } else {
        set({
          error: error.message || 'Failed to fetch library',
          isLoading: false,
        });
      }
    }
  },

  fetchStats: async (userId: string) => {
    try {
      const { getLibraryStats } = await getServices();
      const stats = await getLibraryStats(userId);
      set({ stats });
    } catch (error: any) {
      // Handle permission errors gracefully - show default stats
      const isPermissionError = error?.code === 'permission-denied' ||
        error?.message?.includes('permission') ||
        error?.message?.includes('Missing or insufficient');

      if (isPermissionError) {
        console.warn('Stats permission error - using default stats:', error.message);
        set({
          stats: {
            total: 0,
            watching: 0,
            completed: 0,
            paused: 0,
            dropped: 0,
            planning: 0,
            episodesWatched: 0,
            averageScore: null,
          },
        });
      } else {
        console.error('Failed to fetch stats:', error);
      }
    }
  },

  filterByStatus: (status: WatchStatus | 'ALL') => {
    const { library } = get();
    const filteredLibrary = status === 'ALL'
      ? library
      : library.filter((entry) => entry.status === status);

    set({ currentFilter: status, filteredLibrary });
  },

  addAnime: async (userId: string, anime: AnimeMedia, status: WatchStatus = 'PLANNING') => {
    set({ isLoading: true, error: null });
    try {
      const { addToLibrary } = await getServices();
      const entry = await addToLibrary(userId, anime, status);
      const { library, libraryMap, currentFilter } = get();

      const newLibrary = [entry, ...library];
      libraryMap.set(entry.animeId, entry);

      const newFiltered = currentFilter === 'ALL'
        ? newLibrary
        : newLibrary.filter((e) => e.status === currentFilter);

      set({
        library: newLibrary,
        filteredLibrary: newFiltered,
        libraryMap: new Map(libraryMap),
        isLoading: false,
      });

      return entry;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to add anime',
        isLoading: false,
      });
      throw error;
    }
  },

  updateStatus: async (userId: string, animeId: number, status: WatchStatus) => {
    try {
      const { updateWatchStatus } = await getServices();
      await updateWatchStatus(userId, animeId, status);

      const { library, libraryMap, currentFilter } = get();
      const updatedLibrary = library.map((entry) =>
        entry.animeId === animeId
          ? {
              ...entry,
              status,
              startedAt: status === 'WATCHING' && !entry.startedAt ? new Date() : entry.startedAt,
              completedAt: status === 'COMPLETED' ? new Date() : entry.completedAt,
            }
          : entry
      );

      const updatedEntry = updatedLibrary.find((e) => e.animeId === animeId);
      if (updatedEntry) {
        libraryMap.set(animeId, updatedEntry);
      }

      const newFiltered = currentFilter === 'ALL'
        ? updatedLibrary
        : updatedLibrary.filter((e) => e.status === currentFilter);

      set({
        library: updatedLibrary,
        filteredLibrary: newFiltered,
        libraryMap: new Map(libraryMap),
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to update status' });
      throw error;
    }
  },

  updateEpisodeProgress: async (userId: string, animeId: number, progress: number) => {
    try {
      const { updateProgress } = await getServices();
      await updateProgress(userId, animeId, progress);

      const { library, libraryMap, currentFilter } = get();
      const entry = libraryMap.get(animeId);

      let newStatus = entry?.status;
      // Auto-complete if progress matches total episodes
      if (entry?.anime.episodes && progress >= entry.anime.episodes) {
        newStatus = 'COMPLETED';
      } else if (progress > 0 && entry?.status === 'PLANNING') {
        newStatus = 'WATCHING';
      }

      const updatedLibrary = library.map((e) =>
        e.animeId === animeId
          ? {
              ...e,
              progress,
              status: newStatus || e.status,
              startedAt: newStatus === 'WATCHING' && !e.startedAt ? new Date() : e.startedAt,
              completedAt: newStatus === 'COMPLETED' ? new Date() : e.completedAt,
            }
          : e
      );

      const updatedEntry = updatedLibrary.find((e) => e.animeId === animeId);
      if (updatedEntry) {
        libraryMap.set(animeId, updatedEntry);
      }

      const newFiltered = currentFilter === 'ALL'
        ? updatedLibrary
        : updatedLibrary.filter((e) => e.status === currentFilter);

      set({
        library: updatedLibrary,
        filteredLibrary: newFiltered,
        libraryMap: new Map(libraryMap),
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to update progress' });
      throw error;
    }
  },

  updateAnimeScore: async (userId: string, animeId: number, score: number | null) => {
    try {
      const { updateScore } = await getServices();
      await updateScore(userId, animeId, score);

      const { library, libraryMap, currentFilter } = get();
      const updatedLibrary = library.map((entry) =>
        entry.animeId === animeId ? { ...entry, score } : entry
      );

      const updatedEntry = updatedLibrary.find((e) => e.animeId === animeId);
      if (updatedEntry) {
        libraryMap.set(animeId, updatedEntry);
      }

      set({
        library: updatedLibrary,
        filteredLibrary: currentFilter === 'ALL'
          ? updatedLibrary
          : updatedLibrary.filter((e) => e.status === currentFilter),
        libraryMap: new Map(libraryMap),
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to update score' });
      throw error;
    }
  },

  updateAnimeNotes: async (userId: string, animeId: number, notes: string | null) => {
    try {
      const { updateNotes } = await getServices();
      await updateNotes(userId, animeId, notes);

      const { library, libraryMap, currentFilter } = get();
      const updatedLibrary = library.map((entry) =>
        entry.animeId === animeId ? { ...entry, notes } : entry
      );

      const updatedEntry = updatedLibrary.find((e) => e.animeId === animeId);
      if (updatedEntry) {
        libraryMap.set(animeId, updatedEntry);
      }

      set({
        library: updatedLibrary,
        filteredLibrary: currentFilter === 'ALL'
          ? updatedLibrary
          : updatedLibrary.filter((e) => e.status === currentFilter),
        libraryMap: new Map(libraryMap),
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to update notes' });
      throw error;
    }
  },

  removeAnime: async (userId: string, animeId: number) => {
    try {
      const { removeFromLibrary } = await getServices();
      await removeFromLibrary(userId, animeId);

      const { library, libraryMap, currentFilter } = get();
      const updatedLibrary = library.filter((entry) => entry.animeId !== animeId);
      libraryMap.delete(animeId);

      set({
        library: updatedLibrary,
        filteredLibrary: currentFilter === 'ALL'
          ? updatedLibrary
          : updatedLibrary.filter((e) => e.status === currentFilter),
        libraryMap: new Map(libraryMap),
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to remove anime' });
      throw error;
    }
  },

  getEntry: (animeId: number) => {
    return get().libraryMap.get(animeId);
  },

  isInLibrary: (animeId: number) => {
    return get().libraryMap.has(animeId);
  },

  checkCanPost: async (userId: string, animeId: number) => {
    const { canPostAboutAnime } = await getServices();
    return canPostAboutAnime(userId, animeId);
  },

  clearLibrary: () => {
    set({
      library: [],
      filteredLibrary: [],
      libraryMap: new Map(),
      stats: null,
      currentFilter: 'ALL',
    });
  },

  clearError: () => set({ error: null }),
}));
