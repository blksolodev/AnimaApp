// Anima - Recommendation Service
// Connect to AI backend for mood-based recommendations and party matching

import axios from 'axios';

// Backend API URL - update for production
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

interface AuraSearchResult {
  id: number;
  title: string;
  genres: string[];
  score: number;
  similarity: number;
  description: string;
}

interface PartyMatch {
  user_id: string;
  compatibility: number;
  shared_anime: number[];
  shared_count: number;
}

interface StreamingAvailability {
  service: string;
  available: boolean;
  url: string;
  region: string;
}

interface BossRushRanking {
  rank: number;
  animeId: number;
  title: string;
  predictedScore: number;
  actualScore?: number;
}

// Aura Search - Natural language anime recommendations
export const auraSearch = async (
  query: string,
  limit: number = 10,
  minScore: number = 0
): Promise<AuraSearchResult[]> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/recommend/aura`, {
      query,
      limit,
      minScore,
    });

    if (response.data.success) {
      return response.data.recommendations;
    }
    return [];
  } catch (error) {
    console.error('Aura search failed:', error);
    return [];
  }
};

// Find similar anime
export const findSimilarAnime = async (
  animeId: number,
  limit: number = 10
): Promise<AuraSearchResult[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/recommend/similar/${animeId}?limit=${limit}`
    );

    if (response.data.success) {
      return response.data.recommendations;
    }
    return [];
  } catch (error) {
    console.error('Find similar anime failed:', error);
    return [];
  }
};

// Party Matching - Find users with similar watchlists
export const findPartyMatches = async (
  watchlist: number[],
  minOverlap: number = 0.3
): Promise<PartyMatch[]> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/party/match`, {
      watchlist,
      minOverlap,
    });

    if (response.data.success) {
      return response.data.matches;
    }
    return [];
  } catch (error) {
    console.error('Party matching failed:', error);
    return [];
  }
};

// Get streaming availability for an anime
export const getStreamingAvailability = async (
  animeId: number
): Promise<StreamingAvailability[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/streaming/${animeId}`);
    return response.data.availability || [];
  } catch (error) {
    console.error('Streaming lookup failed:', error);
    return [];
  }
};

// Boss Rush - Get current season rankings
export const getBossRushRankings = async (
  season?: string,
  year?: number
): Promise<{
  rankings: BossRushRanking[];
  userParticipants: number;
  prizesAwarded: number;
}> => {
  try {
    const params = new URLSearchParams();
    if (season) params.append('season', season);
    if (year) params.append('year', year.toString());

    const response = await axios.get(
      `${API_BASE_URL}/bossrush/rankings?${params.toString()}`
    );

    return {
      rankings: response.data.rankings || [],
      userParticipants: response.data.userParticipants || 0,
      prizesAwarded: response.data.prizesAwarded || 0,
    };
  } catch (error) {
    console.error('Boss Rush rankings failed:', error);
    return { rankings: [], userParticipants: 0, prizesAwarded: 0 };
  }
};

// Boss Rush - Submit predictions
export const submitBossRushPredictions = async (
  userId: string,
  predictions: Array<{ animeId: number; predictedRank: number }>
): Promise<boolean> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/bossrush/predict`, {
      userId,
      predictions,
    });

    return response.data.success;
  } catch (error) {
    console.error('Boss Rush prediction submission failed:', error);
    return false;
  }
};

// Generate smart notification for episode
export const generateEpisodeNotification = async (
  animeId: number,
  episode: number,
  watchingCount: number
): Promise<string> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/notifications/episode`, {
      animeId,
      episode,
      watchingCount,
    });

    return response.data.message;
  } catch (error) {
    console.error('Notification generation failed:', error);
    return `Episode ${episode} is now available!`;
  }
};

// Mood suggestions for Aura Search
export const MOOD_SUGGESTIONS = [
  'A rainy afternoon',
  'Epic fight scenes',
  'Wholesome and cozy',
  'Mind-bending thriller',
  'Action-packed adventure',
  'Emotional and deep',
  'High-budget animation',
  'Romantic comedy',
  'Dark and gritty',
  'Nostalgic classic',
];
