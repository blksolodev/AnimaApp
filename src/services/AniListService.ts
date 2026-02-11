// Anima - AniList GraphQL Service
// Fetch anime data from AniList API

import { request, gql } from 'graphql-request';
import {
  AnimeMedia,
  AiringSchedule,
  StreamingLink,
  StreamingService,
  AnimeCardData,
} from '../types';

const ANILIST_API = 'https://graphql.anilist.co';

// Cache for API responses
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache: Map<string, CacheEntry<any>> = new Map();
const CACHE_DURATION = {
  AIRING: 15 * 60 * 1000, // 15 minutes
  ANIME: 60 * 60 * 1000,  // 1 hour
  TRENDING: 30 * 60 * 1000, // 30 minutes
};

// Helper to check cache
const getFromCache = <T>(key: string, maxAge: number): T | null => {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < maxAge) {
    return entry.data as T;
  }
  return null;
};

const setCache = <T>(key: string, data: T): void => {
  cache.set(key, { data, timestamp: Date.now() });
};

// GraphQL Queries
const AIRING_SCHEDULE_QUERY = gql`
  query AiringSchedule($page: Int, $perPage: Int, $airingAtGreater: Int, $airingAtLesser: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        hasNextPage
        currentPage
      }
      airingSchedules(airingAt_greater: $airingAtGreater, airingAt_lesser: $airingAtLesser, sort: TIME) {
        id
        airingAt
        timeUntilAiring
        episode
        mediaId
        media {
          id
          title {
            romaji
            english
            native
          }
          coverImage {
            extraLarge
            large
            medium
            color
          }
          bannerImage
          description
          episodes
          duration
          status
          season
          seasonYear
          format
          genres
          averageScore
          popularity
          trending
          studios {
            nodes {
              id
              name
              isAnimationStudio
            }
          }
          nextAiringEpisode {
            id
            episode
            airingAt
            timeUntilAiring
          }
        }
      }
    }
  }
`;

const ANIME_DETAILS_QUERY = gql`
  query AnimeDetails($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      title {
        romaji
        english
        native
      }
      coverImage {
        extraLarge
        large
        medium
        color
      }
      bannerImage
      description
      episodes
      duration
      status
      season
      seasonYear
      format
      genres
      averageScore
      popularity
      trending
      studios {
        nodes {
          id
          name
          isAnimationStudio
        }
      }
      nextAiringEpisode {
        id
        episode
        airingAt
        timeUntilAiring
      }
      streamingEpisodes {
        title
        thumbnail
        url
        site
      }
      externalLinks {
        id
        url
        site
        type
      }
    }
  }
`;

const TRENDING_QUERY = gql`
  query Trending($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        hasNextPage
        currentPage
      }
      media(type: ANIME, sort: TRENDING_DESC) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          extraLarge
          large
          medium
          color
        }
        bannerImage
        description
        episodes
        status
        season
        seasonYear
        format
        genres
        averageScore
        popularity
        trending
        nextAiringEpisode {
          id
          episode
          airingAt
          timeUntilAiring
        }
      }
    }
  }
`;

const SEARCH_QUERY = gql`
  query Search($search: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        hasNextPage
        currentPage
      }
      media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          extraLarge
          large
          medium
          color
        }
        description
        episodes
        status
        format
        genres
        averageScore
        popularity
      }
    }
  }
`;

// Get today's airing schedule
export const getAiringSchedule = async (
  page: number = 1,
  perPage: number = 20
): Promise<{ schedules: AiringSchedule[]; hasNextPage: boolean }> => {
  const cacheKey = `airing_${page}_${perPage}`;
  const cached = getFromCache<{ schedules: AiringSchedule[]; hasNextPage: boolean }>(
    cacheKey,
    CACHE_DURATION.AIRING
  );

  if (cached) return cached;

  const now = Math.floor(Date.now() / 1000);
  const endOfDay = now + 24 * 60 * 60;

  const response = await request(ANILIST_API, AIRING_SCHEDULE_QUERY, {
    page,
    perPage,
    airingAtGreater: now,
    airingAtLesser: endOfDay,
  });

  const result = {
    schedules: response.Page.airingSchedules as AiringSchedule[],
    hasNextPage: response.Page.pageInfo.hasNextPage,
  };

  setCache(cacheKey, result);
  return result;
};

// Get anime details by ID
export const getAnimeDetails = async (id: number): Promise<AnimeMedia> => {
  const cacheKey = `anime_${id}`;
  const cached = getFromCache<AnimeMedia>(cacheKey, CACHE_DURATION.ANIME);

  if (cached) return cached;

  const response = await request(ANILIST_API, ANIME_DETAILS_QUERY, { id });
  const anime = response.Media as AnimeMedia;

  setCache(cacheKey, anime);
  return anime;
};

// Get trending anime
export const getTrendingAnime = async (
  page: number = 1,
  perPage: number = 20
): Promise<{ anime: AnimeMedia[]; hasNextPage: boolean }> => {
  const cacheKey = `trending_${page}_${perPage}`;
  const cached = getFromCache<{ anime: AnimeMedia[]; hasNextPage: boolean }>(
    cacheKey,
    CACHE_DURATION.TRENDING
  );

  if (cached) return cached;

  const response = await request(ANILIST_API, TRENDING_QUERY, {
    page,
    perPage,
  });

  const result = {
    anime: response.Page.media as AnimeMedia[],
    hasNextPage: response.Page.pageInfo.hasNextPage,
  };

  setCache(cacheKey, result);
  return result;
};

// Search anime
export const searchAnime = async (
  query: string,
  page: number = 1,
  perPage: number = 20
): Promise<{ anime: AnimeMedia[]; hasNextPage: boolean }> => {
  const response = await request(ANILIST_API, SEARCH_QUERY, {
    search: query,
    page,
    perPage,
  });

  return {
    anime: response.Page.media as AnimeMedia[],
    hasNextPage: response.Page.pageInfo.hasNextPage,
  };
};

// Generate streaming links for an anime
export const getStreamingLinks = (animeTitle: string): StreamingLink[] => {
  const encodedTitle = encodeURIComponent(animeTitle);

  return [
    {
      service: 'crunchyroll' as StreamingService,
      url: `https://www.crunchyroll.com/search?q=${encodedTitle}`,
      available: true,
    },
    {
      service: 'netflix' as StreamingService,
      url: `https://www.netflix.com/search?q=${encodedTitle}`,
      available: true,
    },
    {
      service: 'funimation' as StreamingService,
      url: `https://www.funimation.com/search/?q=${encodedTitle}`,
      available: true,
    },
    {
      service: 'hulu' as StreamingService,
      url: `https://www.hulu.com/search?q=${encodedTitle}`,
      available: true,
    },
    {
      service: 'prime' as StreamingService,
      url: `https://www.amazon.com/s?k=${encodedTitle}&i=instant-video`,
      available: true,
    },
    {
      service: 'hidive' as StreamingService,
      url: `https://www.hidive.com/search?q=${encodedTitle}`,
      available: true,
    },
  ];
};

// Convert AnimeMedia to simplified card data
export const toAnimeCardData = (
  anime: AnimeMedia,
  schedule?: AiringSchedule
): AnimeCardData => {
  const title = anime.title.english || anime.title.romaji || anime.title.native || 'Unknown';

  return {
    id: anime.id,
    title,
    coverImage: anime.coverImage.large || anime.coverImage.medium,
    episode: schedule?.episode ?? anime.nextAiringEpisode?.episode,
    airingAt: schedule?.airingAt ?? anime.nextAiringEpisode?.airingAt,
    streamingLinks: getStreamingLinks(title),
  };
};

// Format time until airing
export const formatTimeUntilAiring = (seconds: number): string => {
  if (seconds < 60) return 'NOW';

  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
};

// Clear cache
export const clearCache = (): void => {
  cache.clear();
};
