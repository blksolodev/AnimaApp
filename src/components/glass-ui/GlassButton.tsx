// Anima - GlassButton Component
// Modern button with glass and solid variants

import React, { useState } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, LAYOUT, TYPOGRAPHY, SPACING, ANIMATION } from '../../theme/designSystem';

export interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          height: LAYOUT.heights.buttonSmall,
          paddingHorizontal: SPACING[4],
          fontSize: TYPOGRAPHY.sizes.sm,
          iconSize: 16,
        };
      case 'large':
        return {
          height: 56,
          paddingHorizontal: SPACING[8],
          fontSize: TYPOGRAPHY.sizes.md,
          iconSize: 24,
        };
      case 'medium':
      default:
        return {
          height: LAYOUT.heights.button,
          paddingHorizontal: SPACING[6],
          fontSize: TYPOGRAPHY.sizes.base,
          iconSize: 20,
        };
    }
  };

  const getVariantStyles = () => {
    const isActive = disabled || loading;

    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: COLORS.background.tertiary,
          borderWidth: 1,
          borderColor: COLORS.glass.border,
          textColor: COLORS.text.primary,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
          textColor: COLORS.text.primary,
        };
      case 'glass':
        return {
          backgroundColor: COLORS.glass.medium,
          borderWidth: 1,
          borderColor: COLORS.glass.borderLight,
          textColor: COLORS.text.primary,
        };
      case 'danger':
        return {
          backgroundColor: COLORS.accent.error,
          borderWidth: 0,
          textColor: COLORS.text.primary,
        };
      case 'primary':
      default:
        return {
          backgroundColor: isActive ? 'rgba(255, 107, 44, 0.5)' : COLORS.accent.primary,
          borderWidth: 0,
          textColor: COLORS.text.primary,
          gradient: !isActive ? COLORS.gradients.primary : undefined,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  const content = (
    <View style={styles.contentContainer}>
      {loading ? (
        <ActivityIndicator size="small" color={variantStyles.textColor} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text
            style={[
              styles.text,
              {
                color: variantStyles.textColor,
                fontSize: sizeStyles.fontSize,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </>
      )}
    </View>
  );

  const buttonStyles = [
    styles.button,
    {
      height: sizeStyles.height,
      paddingHorizontal: sizeStyles.paddingHorizontal,
      backgroundColor: variantStyles.backgroundColor,
      borderWidth: variantStyles.borderWidth,
      borderColor: variantStyles.borderColor,
      opacity: isPressed ? 0.8 : 1,
      transform: [{ scale: isPressed ? 0.98 : 1 }],
    },
    fullWidth && styles.fullWidth,
    style,
  ];

  // Use gradient for primary variant
  if (variant === 'primary' && variantStyles.gradient && !disabled && !loading) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        disabled={disabled || loading}
      >
        <LinearGradient
          colors={variantStyles.gradient as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            buttonStyles,
            { opacity: isPressed ? 0.9 : 1, transform: [{ scale: isPressed ? 0.98 : 1 }] },
          ]}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={disabled || loading}
      style={buttonStyles}
    >
      {content}
    </Pressable>
  );
};

// Icon-only button variant
export const IconButton: React.FC<{
  icon: React.ReactNode;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'ghost' | 'glass';
  disabled?: boolean;
  style?: ViewStyle;
}> = ({
  icon,
  onPress,
  size = 'medium',
  variant = 'ghost',
  disabled = false,
  style,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const getSizeValue = () => {
    switch (size) {
      case 'small': return 32;
      case 'large': return 48;
      default: return 40;
    }
  };

  const sizeValue = getSizeValue();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={disabled}
      style={[
        styles.iconButton,
        {
          width: sizeValue,
          height: sizeValue,
          borderRadius: sizeValue / 2,
          backgroundColor: variant === 'glass' ? COLORS.glass.light : 'transparent',
          opacity: isPressed ? 0.6 : 1,
          transform: [{ scale: isPressed ? 0.95 : 1 }],
        },
        variant === 'glass' && {
          borderWidth: 1,
          borderColor: COLORS.glass.border,
        },
        style,
      ]}
    >
      {icon}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: LAYOUT.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  iconLeft: {
    marginRight: SPACING[2],
  },
  iconRight: {
    marginLeft: SPACING[2],
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GlassButton;
