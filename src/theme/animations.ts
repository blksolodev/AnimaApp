// Anima - Retro Animation Configuration
// Step-based animations to mimic 90s hardware limitations

// Frame-based timing (simulating sprite animations)
export const FRAME_DURATION = 1000 / 60; // ~16.67ms for 60fps
export const SPRITE_FRAME = 1000 / 12;   // ~83ms for 12fps sprite animations

// Animation durations
export const DURATIONS = {
  instant: 0,
  fast: 100,
  normal: 200,
  slow: 400,
  verySlow: 600,

  // Sprite animation specific
  spriteFrame: SPRITE_FRAME,
  twoFrame: SPRITE_FRAME * 2,
  fourFrame: SPRITE_FRAME * 4,
  eightFrame: SPRITE_FRAME * 8,
} as const;

// Step-based easing (for retro feel)
// This creates discrete "steps" instead of smooth transitions
export const createStepEasing = (steps: number) => {
  return (t: number) => Math.floor(t * steps) / steps;
};

// Simple easing functions (no reanimated dependency)
const linear = (t: number) => t;
const easeIn = (t: number) => t * t;
const easeOut = (t: number) => t * (2 - t);
const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
const bounce = (t: number) => {
  if (t < 1 / 2.75) return 7.5625 * t * t;
  if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
  if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
  return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
};

// Custom easing functions
export const EASINGS = {
  // Standard easings
  linear,
  easeIn,
  easeOut,
  easeInOut,

  // Bouncy for game-like feel
  bounce,

  // Step-based for retro sprite animations
  step2: createStepEasing(2),
  step4: createStepEasing(4),
  step8: createStepEasing(8),
  step16: createStepEasing(16),
} as const;

// Pre-defined animation configurations
export const ANIMATIONS = {
  // Spawn-in animation (frame-by-frame scaling)
  spawnIn: {
    duration: SPRITE_FRAME * 4,
    steps: 4,
    scales: [0, 0.5, 0.8, 1],
  },

  // Like heart burst
  heartBurst: {
    duration: SPRITE_FRAME * 4,
    steps: 4,
    scales: [1, 1.3, 1.1, 1],
    opacities: [1, 1, 0.8, 1],
  },

  // Tab bar bounce
  tabBounce: {
    duration: SPRITE_FRAME * 2,
    steps: 2,
    scales: [1, 1.2, 1],
  },

  // Border draw-in (clockwise)
  borderDraw: {
    duration: SPRITE_FRAME * 8,
    steps: 4, // top, right, bottom, left
  },

  // Fade in (but step-based, not smooth)
  fadeIn: {
    duration: SPRITE_FRAME * 4,
    steps: 4,
    opacities: [0, 0.33, 0.67, 1],
  },

  // Pulse (for notifications, etc.)
  pulse: {
    duration: SPRITE_FRAME * 6,
    steps: 6,
    scales: [1, 1.1, 1.05, 1.1, 1.05, 1],
  },

  // Shake (for errors)
  shake: {
    duration: SPRITE_FRAME * 6,
    steps: 6,
    offsets: [0, -4, 4, -4, 4, 0],
  },

  // Loading dots
  loadingDots: {
    duration: SPRITE_FRAME * 8,
    steps: 4,
  },
} as const;

// Spring configurations for physics-based animations
export const SPRING_CONFIGS = {
  // Snappy for UI interactions
  snappy: {
    damping: 20,
    stiffness: 300,
    mass: 0.5,
  },
  // Bouncy for playful elements
  bouncy: {
    damping: 10,
    stiffness: 200,
    mass: 0.8,
  },
  // Gentle for subtle movements
  gentle: {
    damping: 15,
    stiffness: 100,
    mass: 1,
  },
  // Stiff for immediate response
  stiff: {
    damping: 30,
    stiffness: 400,
    mass: 0.3,
  },
} as const;

// Parallax scroll configuration (step-based for retro feel)
export const PARALLAX = {
  // How much background moves relative to foreground
  backgroundRatio: 0.5,
  // Step size for background movement (pixels)
  stepSize: 4,
  // Calculate stepped parallax offset
  getSteppedOffset: (scrollY: number, ratio: number = 0.5, stepSize: number = 4): number => {
    return Math.floor((scrollY * ratio) / stepSize) * stepSize;
  },
} as const;

export type AnimationKey = keyof typeof ANIMATIONS;
export type EasingKey = keyof typeof EASINGS;
