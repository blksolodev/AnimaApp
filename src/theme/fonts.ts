// Anima - Pixel Font Configuration
// High-quality pixel fonts for the 16-bit aesthetic

export const FONTS = {
  // Headers and UI Labels - chunky retro feel
  header: 'PressStart2P',

  // Body text - readable pixel font
  body: 'Silkscreen',

  // Numbers and stats
  numeric: 'VT323',

  // Fallbacks (system fonts with pixel-like qualities)
  fallback: 'Courier',
} as const;

// Font size scale (based on 4px grid)
export const FONT_SIZES = {
  xs: 8,
  sm: 10,
  md: 12,
  lg: 14,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
} as const;

// Line heights (for pixel-perfect text alignment)
export const LINE_HEIGHTS = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
} as const;

// Letter spacing (for pixel font readability)
export const LETTER_SPACING = {
  tight: -0.5,
  normal: 0,
  wide: 1,
  wider: 2,
} as const;

// Font configurations for common use cases
export const TEXT_STYLES = {
  headerLarge: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES['2xl'],
    lineHeight: LINE_HEIGHTS.tight,
    letterSpacing: LETTER_SPACING.wide,
  },
  headerMedium: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.lg,
    lineHeight: LINE_HEIGHTS.tight,
    letterSpacing: LETTER_SPACING.normal,
  },
  headerSmall: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.sm,
    lineHeight: LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.normal,
  },
  bodyLarge: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.lg,
    lineHeight: LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.normal,
  },
  bodyMedium: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.md,
    lineHeight: LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.normal,
  },
  bodySmall: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    lineHeight: LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.normal,
  },
  stat: {
    fontFamily: FONTS.numeric,
    fontSize: FONT_SIZES.xl,
    lineHeight: LINE_HEIGHTS.tight,
    letterSpacing: LETTER_SPACING.wide,
  },
  meta: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.xs,
    lineHeight: LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.wide,
  },
} as const;

export type FontKey = keyof typeof FONTS;
export type FontSizeKey = keyof typeof FONT_SIZES;
