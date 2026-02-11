// Anima - GlassCard Component
// Frosted glass card with blur effect and subtle borders

import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, LAYOUT, EFFECTS, SPACING } from '../../theme/designSystem';

export interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'light' | 'medium' | 'heavy' | 'dark';
  intensity?: number;
  gradient?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  noPadding?: boolean;
  elevated?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'light',
  intensity = 20,
  gradient = false,
  style,
  contentStyle,
  noPadding = false,
  elevated = false,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'heavy':
        return {
          backgroundColor: COLORS.glass.heavy,
          borderColor: COLORS.glass.borderLight,
        };
      case 'medium':
        return {
          backgroundColor: COLORS.glass.medium,
          borderColor: COLORS.glass.border,
        };
      case 'dark':
        return {
          backgroundColor: COLORS.glass.overlay,
          borderColor: COLORS.glass.border,
        };
      case 'light':
      default:
        return {
          backgroundColor: COLORS.glass.light,
          borderColor: COLORS.glass.border,
        };
    }
  };

  const variantStyles = getVariantStyles();

  // For Android, we use a solid background with opacity instead of blur
  const isBlurSupported = Platform.OS === 'ios';

  return (
    <View
      style={[
        styles.container,
        elevated && EFFECTS.shadows.lg,
        style,
      ]}
    >
      {/* Background Layer */}
      {isBlurSupported ? (
        <BlurView
          intensity={intensity}
          tint="dark"
          style={StyleSheet.absoluteFillObject}
        />
      ) : null}

      {/* Gradient Overlay (optional) */}
      {gradient && (
        <LinearGradient
          colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      {/* Glass Surface */}
      <View
        style={[
          styles.surface,
          {
            backgroundColor: isBlurSupported ? 'transparent' : variantStyles.backgroundColor,
            borderColor: variantStyles.borderColor,
          },
        ]}
      />

      {/* Content */}
      <View
        style={[
          styles.content,
          !noPadding && styles.padding,
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
};

// Specialized Card Variants
export const MediaCard: React.FC<GlassCardProps & { aspectRatio?: number }> = ({
  children,
  aspectRatio = 16 / 9,
  ...props
}) => {
  return (
    <GlassCard {...props} noPadding style={[{ aspectRatio }, props.style]}>
      {children}
    </GlassCard>
  );
};

export const FloatingCard: React.FC<GlassCardProps> = (props) => {
  return <GlassCard {...props} variant="medium" elevated gradient />;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: LAYOUT.radius.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  surface: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: LAYOUT.radius.xl,
    borderWidth: 1,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
  padding: {
    padding: SPACING[4],
  },
});

export default GlassCard;
