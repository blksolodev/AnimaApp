// Anima - 16-Bit Premium Color Palette
// A vibrant 32-color system for the retro RPG aesthetic

export const COLORS = {
  // Primary Backgrounds
  midnightGrape: '#1A1A2E',
  deepPurple: '#16213E',
  darkNavy: '#0F0F23',
  shadowBlack: '#0A0A14',

  // Accent Colors
  levelUpLime: '#00FF41',
  criticalHitCrimson: '#FF0043',
  goldCoin: '#F4D03F',
  manaBlue: '#4ECDC4',
  royalPurple: '#9B59B6',
  sunsetOrange: '#FF6B35',

  // UI Colors
  white: '#FFFFFF',
  lightGray: '#E0E0E0',
  mediumGray: '#A0A0A0',
  darkGray: '#4A4A4A',
  charcoal: '#2D2D2D',

  // Status Colors
  expPurple: '#9B59B6',
  healthRed: '#E74C3C',
  shieldBlue: '#3498DB',
  poisonGreen: '#27AE60',
  warningYellow: '#F39C12',

  // Border Colors (for beveled effect)
  borderLight: '#FFFFFF',
  borderMid: '#C0C0C0',
  borderDark: '#404040',
  borderShadow: '#202020',

  // Dithering Pattern Colors
  ditherLight: '#2A2A3E',
  ditherDark: '#151525',

  // Gradient Simulations (for step-based gradients)
  gradientPurple1: '#1A1A2E',
  gradientPurple2: '#252540',
  gradientPurple3: '#303052',
  gradientPurple4: '#3B3B64',

  // Streaming Service Colors
  crunchyrollOrange: '#F47521',
  netflixRed: '#E50914',
  funimationPurple: '#5B0BB5',
  huluGreen: '#1CE783',
  primeBlue: '#00A8E1',
  hidiveBlue: '#00BAFF',
} as const;

// Semantic Color Mappings
export const SEMANTIC_COLORS = {
  background: COLORS.midnightGrape,
  backgroundSecondary: COLORS.deepPurple,
  surface: COLORS.darkNavy,

  text: COLORS.white,
  textSecondary: COLORS.lightGray,
  textMuted: COLORS.mediumGray,

  primary: COLORS.levelUpLime,
  secondary: COLORS.manaBlue,
  accent: COLORS.goldCoin,
  danger: COLORS.criticalHitCrimson,
  warning: COLORS.warningYellow,
  success: COLORS.poisonGreen,

  // Social Actions
  like: COLORS.criticalHitCrimson,
  repost: COLORS.manaBlue,
  reply: COLORS.lightGray,
  share: COLORS.goldCoin,

  // Arena Votes
  crit: COLORS.levelUpLime,
  miss: COLORS.criticalHitCrimson,
} as const;

export type ColorKey = keyof typeof COLORS;
export type SemanticColorKey = keyof typeof SEMANTIC_COLORS;
