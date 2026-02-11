// Anima - Anime Type Definitions
// Types for AniList API and internal anime data

export interface AnimeTitle {
  romaji: string;
  english: string | null;
  native: string | null;
}

export interface AnimeCoverImage {
  extraLarge: string;
  large: string;
  medium: string;
  color: string | null;
}

export interface AnimeMedia {
  id: number;
  title: AnimeTitle;
  coverImage: AnimeCoverImage;
  bannerImage: string | null;
  description: string | null;
  episodes: number | null;
  duration: number | null;
  status: AnimeStatus;
  season: AnimeSeason | null;
  seasonYear: number | null;
  format: AnimeFormat;
  genres: string[];
  averageScore: number | null;
  popularity: number;
  trending: number;
  studios: {
    nodes: Studio[];
  };
  nextAiringEpisode: NextAiringEpisode | null;
}

export interface Studio {
  id: number;
  name: string;
  isAnimationStudio: boolean;
}

export interface NextAiringEpisode {
  id: number;
  episode: number;
  airingAt: number; // Unix timestamp
  timeUntilAiring: number; // Seconds until airing
}

export interface AiringSchedule {
  id: number;
  airingAt: number;
  timeUntilAiring: number;
  episode: number;
  mediaId: number;
  media: AnimeMedia;
}

export type AnimeStatus =
  | 'FINISHED'
  | 'RELEASING'
  | 'NOT_YET_RELEASED'
  | 'CANCELLED'
  | 'HIATUS';

export type AnimeSeason = 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';

export type AnimeFormat =
  | 'TV'
  | 'TV_SHORT'
  | 'MOVIE'
  | 'SPECIAL'
  | 'OVA'
  | 'ONA'
  | 'MUSIC'
  | 'MANGA'
  | 'NOVEL'
  | 'ONE_SHOT';

export interface StreamingLink {
  service: StreamingService;
  url: string;
  available: boolean;
}

export type StreamingService =
  | 'crunchyroll'
  | 'netflix'
  | 'funimation'
  | 'hulu'
  | 'prime'
  | 'hidive';

export interface WatchlistEntry {
  animeId: number;
  anime: AnimeMedia;
  status: WatchStatus;
  progress: number;
  score: number | null;
  startedAt: Date | null;
  completedAt: Date | null;
  notes: string | null;
}

export type WatchStatus =
  | 'WATCHING'
  | 'COMPLETED'
  | 'PAUSED'
  | 'DROPPED'
  | 'PLANNING';

// Simplified anime data for cards/lists
export interface AnimeCardData {
  id: number;
  title: string;
  coverImage: string;
  episode?: number;
  airingAt?: number;
  streamingLinks?: StreamingLink[];
}
