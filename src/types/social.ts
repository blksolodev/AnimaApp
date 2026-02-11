// Anima - Social Feature Type Definitions

export interface Quest {
  id: string;
  authorId: string;
  author: QuestAuthor;
  content: string;
  mediaAttachment?: MediaAttachment;
  animeReference?: AnimeReference;
  likes: number;
  reposts: number;
  replies: number;
  isLiked: boolean;
  isReposted: boolean;
  createdAt: Date;
  isHotTake: boolean;
  parentId?: string; // For replies
}

export interface QuestAuthor {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  powerLevel: number;
  auraColor: string;
}

export interface MediaAttachment {
  type: 'image' | 'video' | 'gif';
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number; // For videos
}

export interface AnimeReference {
  animeId: number;
  title: string;
  episode?: number;
  coverImage: string;
}

export interface Reply extends Quest {
  parentId: string;
  depth: number;
}

// Guild Chat Types
export interface Guild {
  id: string;
  animeId: number;
  animeName: string;
  memberCount: number;
  activeNow: number;
  coverImage: string;
}

export interface GuildEpisodeRoom {
  guildId: string;
  episodeNumber: number;
  animeId: number;
  animeName: string;
  airingTime: number;
  isAired: boolean;
  messageCount: number;
  participants: number;
}

export interface GuildMessage {
  id: string;
  roomId: string;
  authorId: string;
  author: QuestAuthor;
  content: string;
  timestamp: Date;
  spoilerVerified: boolean;
  reactions: MessageReaction[];
}

export interface MessageReaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

// Power Level Arena Types
export interface ArenaTake {
  id: string;
  authorId: string;
  author: QuestAuthor;
  content: string;
  crits: number; // "Based" votes
  misses: number; // "Cringe" votes
  userVote: 'crit' | 'miss' | null;
  createdAt: Date;
  animeReference?: AnimeReference;
  isVersus?: VersusMatch;
}

export interface VersusMatch {
  characterA: VersusCharacter;
  characterB: VersusCharacter;
}

export interface VersusCharacter {
  name: string;
  imageUrl: string;
  animeName: string;
  votes: number;
}

// Cutscene (Short-form video) Types
export interface Cutscene {
  id: string;
  authorId: string;
  author: QuestAuthor;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  animeReference?: AnimeReference;
  createdAt: Date;
}

// Notification Types
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  relatedUser?: QuestAuthor;
  relatedQuest?: Quest;
  relatedAnime?: AnimeReference;
}

export type NotificationType =
  | 'new_episode'
  | 'mention'
  | 'reply'
  | 'like'
  | 'repost'
  | 'follow'
  | 'guild_activity'
  | 'arena_result'
  | 'badge_earned'
  | 'level_up'
  | 'recommendation';

// Feed Types
export type FeedItem = Quest | ArenaTake | Cutscene;

export interface FeedState {
  items: FeedItem[];
  isLoading: boolean;
  hasMore: boolean;
  lastCursor?: string;
  error?: string;
}

// Spoiler Protection
export interface SpoilerConfig {
  animeId: number;
  maxEpisode: number; // User's progress
  hideSpoilers: boolean;
}
