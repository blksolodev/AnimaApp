// Anima - Grid-Based Spacing System
// Everything aligns to a strict 4px grid for pixel-perfect UI

// Base unit (4px)
export const BASE_UNIT = 4;

// Spacing scale (multiples of 4)
export const SPACING = {
  0: 0,
  1: 4,   // 4px - minimum spacing
  2: 8,   // 8px - tight spacing
  3: 12,  // 12px - standard spacing
  4: 16,  // 16px - comfortable spacing
  5: 20,  // 20px
  6: 24,  // 24px - section spacing
  8: 32,  // 32px - large spacing
  10: 40, // 40px
  12: 48, // 48px - major section spacing
  16: 64, // 64px
  20: 80, // 80px
  24: 96, // 96px
} as const;

// Border widths (pixel-art borders should be thick)
export const BORDERS = {
  thin: 2,
  normal: 4,   // Default pixel border
  thick: 6,
  heavy: 8,
} as const;

// Border radius (none - we use sharp pixel corners)
export const RADII = {
  none: 0,
  // Optional: if you want "rounded" pixel corners (stepped)
  pixel: 4,
  pixelLarge: 8,
} as const;

// Component-specific sizes
export const COMPONENT_SIZES = {
  // Avatars
  avatarSmall: 32,
  avatarMedium: 48,
  avatarLarge: 64,
  avatarXLarge: 96,

  // Icons
  iconSmall: 16,
  iconMedium: 24,
  iconLarge: 32,
  iconXLarge: 48,

  // Buttons
  buttonHeight: 44,
  buttonHeightSmall: 32,
  buttonHeightLarge: 56,

  // Cards
  cardPadding: 16,
  cardMargin: 12,

  // Tab bar
  tabBarHeight: 64,
  tabIconSize: 24,

  // Status bar safe area
  statusBarHeight: 44,

  // Touch targets (minimum 44px for accessibility)
  touchTarget: 44,
} as const;

// Screen padding
export const SCREEN_PADDING = {
  horizontal: SPACING[4],
  vertical: SPACING[4],
  top: SPACING[4],
  bottom: SPACING[6],
} as const;

// Z-index layers
export const Z_INDEX = {
  base: 0,
  card: 10,
  dropdown: 100,
  modal: 1000,
  overlay: 2000,
  toast: 3000,
  tooltip: 4000,
} as const;

// Helper to calculate grid-aligned values
export const gridAlign = (value: number): number => {
  return Math.round(value / BASE_UNIT) * BASE_UNIT;
};

// Helper to get spacing value
export const space = (multiplier: keyof typeof SPACING): number => {
  return SPACING[multiplier];
};

export type SpacingKey = keyof typeof SPACING;
export type BorderKey = keyof typeof BORDERS;
