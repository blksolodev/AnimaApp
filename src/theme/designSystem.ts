// Anima Design System v2.0
// Premium Glassmorphic Social Media Experience
// Inspired by Twitter/X + Crunchyroll + Apple Vision Pro

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const COLORS = {
  // Base Layers (Dark Mode First)
  background: {
    primary: '#0A0A0F',      // Deep space black
    secondary: '#12121A',    // Elevated surface
    tertiary: '#1A1A24',     // Cards and containers
    elevated: '#22222E',     // Highest elevation
  },

  // Glass Effects
  glass: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.08)',
    heavy: 'rgba(255, 255, 255, 0.12)',
    border: 'rgba(255, 255, 255, 0.1)',
    borderLight: 'rgba(255, 255, 255, 0.15)',
    overlay: 'rgba(10, 10, 15, 0.8)',
  },

  // Text Hierarchy
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.7)',
    tertiary: 'rgba(255, 255, 255, 0.5)',
    disabled: 'rgba(255, 255, 255, 0.3)',
    inverse: '#0A0A0F',
  },

  // Accent Colors (Crunchyroll-inspired vibrancy)
  accent: {
    primary: '#FF6B2C',      // Warm orange (main CTA)
    secondary: '#7C3AED',    // Electric purple
    tertiary: '#06B6D4',     // Cyan for info
    success: '#10B981',      // Emerald green
    warning: '#F59E0B',      // Amber
    error: '#EF4444',        // Red
    like: '#F43F5E',         // Rose for hearts
  },

  // Gradients
  gradients: {
    primary: ['#FF6B2C', '#FF8F5C'],
    secondary: ['#7C3AED', '#A78BFA'],
    premium: ['#F59E0B', '#FBBF24'],
    dark: ['rgba(10, 10, 15, 0)', 'rgba(10, 10, 15, 0.95)'],
    glass: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
  },

  // Semantic
  semantic: {
    online: '#10B981',
    offline: 'rgba(255, 255, 255, 0.3)',
    live: '#EF4444',
    new: '#7C3AED',
  },
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const TYPOGRAPHY = {
  // Font Families (System fonts for performance)
  fonts: {
    display: 'System',           // SF Pro Display on iOS, Roboto on Android
    body: 'System',
    mono: 'monospace',
  },

  // Font Sizes
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 30,
    '3xl': 36,
    '4xl': 48,
  },

  // Line Heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Font Weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
} as const;

// ============================================================================
// SPACING & LAYOUT
// ============================================================================

export const SPACING = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

export const LAYOUT = {
  // Border Radius
  radius: {
    none: 0,
    sm: 6,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
  },

  // Max Widths
  maxWidth: {
    card: 600,
    content: 680,
    screen: 1200,
  },

  // Component Heights
  heights: {
    navBar: 56,
    tabBar: 80,
    header: 64,
    input: 48,
    button: 48,
    buttonSmall: 36,
    avatar: {
      xs: 24,
      sm: 32,
      md: 40,
      lg: 48,
      xl: 64,
      '2xl': 80,
    },
  },
} as const;

// ============================================================================
// EFFECTS & SHADOWS
// ============================================================================

export const EFFECTS = {
  // Blur Values
  blur: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 40,
  },

  // Shadows (for non-glass elements)
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.35,
      shadowRadius: 24,
      elevation: 12,
    },
    glow: (color: string) => ({
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 8,
    }),
  },

  // Glass Effect Presets
  glass: {
    light: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    medium: {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.12)',
    },
    heavy: {
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    dark: {
      backgroundColor: 'rgba(10, 10, 15, 0.8)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
  },
} as const;

// ============================================================================
// ANIMATION
// ============================================================================

export const ANIMATION = {
  // Durations
  duration: {
    instant: 100,
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
  },

  // Easing (for Animated API)
  easing: {
    ease: [0.25, 0.1, 0.25, 1],
    easeIn: [0.42, 0, 1, 1],
    easeOut: [0, 0, 0.58, 1],
    easeInOut: [0.42, 0, 0.58, 1],
    spring: [0.175, 0.885, 0.32, 1.275],
  },

  // Spring Configs
  spring: {
    gentle: { tension: 120, friction: 14 },
    wobbly: { tension: 180, friction: 12 },
    stiff: { tension: 300, friction: 20 },
    slow: { tension: 80, friction: 20 },
  },
} as const;

// ============================================================================
// COMPONENT TOKENS
// ============================================================================

export const COMPONENTS = {
  // Card Variants
  card: {
    default: {
      backgroundColor: COLORS.background.tertiary,
      borderRadius: LAYOUT.radius.xl,
      padding: SPACING[4],
    },
    glass: {
      ...EFFECTS.glass.light,
      borderRadius: LAYOUT.radius.xl,
      padding: SPACING[4],
    },
    elevated: {
      backgroundColor: COLORS.background.elevated,
      borderRadius: LAYOUT.radius.xl,
      padding: SPACING[4],
      ...EFFECTS.shadows.md,
    },
  },

  // Button Variants
  button: {
    primary: {
      backgroundColor: COLORS.accent.primary,
      borderRadius: LAYOUT.radius.full,
      height: LAYOUT.heights.button,
    },
    secondary: {
      ...EFFECTS.glass.medium,
      borderRadius: LAYOUT.radius.full,
      height: LAYOUT.heights.button,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderRadius: LAYOUT.radius.full,
      height: LAYOUT.heights.button,
    },
  },

  // Input Styles
  input: {
    default: {
      backgroundColor: COLORS.background.secondary,
      borderRadius: LAYOUT.radius.lg,
      height: LAYOUT.heights.input,
      borderWidth: 1,
      borderColor: COLORS.glass.border,
    },
    glass: {
      ...EFFECTS.glass.light,
      borderRadius: LAYOUT.radius.lg,
      height: LAYOUT.heights.input,
    },
  },
} as const;

// ============================================================================
// BREAKPOINTS (for responsive design)
// ============================================================================

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

// Type exports
export type ColorKey = keyof typeof COLORS;
export type SpacingKey = keyof typeof SPACING;
export type RadiusKey = keyof typeof LAYOUT.radius;
