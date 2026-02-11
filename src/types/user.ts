// Anima - User Type Definitions

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  powerLevel: number;
  xp: number;
  joinedAt: Date;
  badges: Badge[];
  pledgedCharacter: Character | null;
  stats: UserStats;
  settings: UserSettings;
}

export interface UserStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  completedAnime: number;
  watchingAnime: number;
  totalEpisodesWatched: number;
  critsGiven: number;
  critsReceived: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  rarity: BadgeRarity;
  earnedAt: Date;
  category: BadgeCategory;
}

export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type BadgeCategory =
  | 'watching'     // For completing series
  | 'social'       // For social interactions
  | 'seasonal'     // Boss Rush events
  | 'special'      // Limited time events
  | 'achievement'; // General achievements

export interface Character {
  id: number;
  name: string;
  imageUrl: string;
  animeId: number;
  animeName: string;
}

export interface Stamp {
  id: string;
  animeId: number;
  animeName: string;
  imageUrl: string; // High-detail pixel art
  earnedAt: Date;
  series: 'standard' | 'premium' | 'event';
}

export interface UserSettings {
  theme: 'default' | 'custom';
  customTheme?: CustomTheme;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  spoilerProtection: boolean;
}

export interface CustomTheme {
  primaryColor: string;
  accentColor: string;
  backgroundUrl?: string;
}

export interface NotificationSettings {
  newEpisodes: boolean;
  mentions: boolean;
  replies: boolean;
  likes: boolean;
  reposts: boolean;
  guildActivity: boolean;
  recommendations: boolean;
}

export interface PrivacySettings {
  showWatchlist: boolean;
  showActivity: boolean;
  allowDMs: boolean;
}

// Power Level calculation
export interface PowerLevelTier {
  level: number;
  minXP: number;
  title: string;
  auraColor: string;
}

export const POWER_LEVELS: PowerLevelTier[] = [
  { level: 1, minXP: 0, title: 'Newbie', auraColor: '#FFFFFF' },
  { level: 5, minXP: 500, title: 'Apprentice', auraColor: '#00FF41' },
  { level: 10, minXP: 2000, title: 'Adventurer', auraColor: '#4ECDC4' },
  { level: 20, minXP: 5000, title: 'Warrior', auraColor: '#F4D03F' },
  { level: 30, minXP: 12000, title: 'Elite', auraColor: '#9B59B6' },
  { level: 50, minXP: 30000, title: 'Champion', auraColor: '#FF0043' },
  { level: 75, minXP: 75000, title: 'Legend', auraColor: '#FF6B35' },
  { level: 100, minXP: 150000, title: 'Mythic', auraColor: '#FFD700' },
];

export const calculatePowerLevel = (xp: number): PowerLevelTier => {
  let tier = POWER_LEVELS[0];
  for (const level of POWER_LEVELS) {
    if (xp >= level.minXP) {
      tier = level;
    } else {
      break;
    }
  }
  return tier;
};

export const calculateXPProgress = (xp: number): { current: number; next: number; progress: number } => {
  const currentTier = calculatePowerLevel(xp);
  const nextTierIndex = POWER_LEVELS.findIndex(t => t.level === currentTier.level) + 1;
  const nextTier = POWER_LEVELS[nextTierIndex] || POWER_LEVELS[POWER_LEVELS.length - 1];

  const currentMin = currentTier.minXP;
  const nextMin = nextTier.minXP;
  const progress = (xp - currentMin) / (nextMin - currentMin);

  return {
    current: xp - currentMin,
    next: nextMin - currentMin,
    progress: Math.min(progress, 1),
  };
};
