// Anima - PixelButton Component
// 3-state pixel art button

import React, { useState } from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, BORDERS, SPACING } from '../../theme';

export interface PixelButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const PixelButton: React.FC<PixelButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const getVariantColors = () => {
    if (disabled) {
      return {
        background: COLORS.darkGray,
        border: COLORS.charcoal,
        text: COLORS.mediumGray,
        highlight: COLORS.mediumGray,
        shadow: COLORS.charcoal,
      };
    }

    switch (variant) {
      case 'primary':
        return {
          background: COLORS.levelUpLime,
          border: COLORS.levelUpLime,
          text: COLORS.midnightGrape,
          highlight: '#66FF8C',
          shadow: '#00AA2E',
        };
      case 'secondary':
        return {
          background: COLORS.manaBlue,
          border: COLORS.manaBlue,
          text: COLORS.midnightGrape,
          highlight: '#7EDDD4',
          shadow: '#38A89D',
        };
      case 'danger':
        return {
          background: COLORS.criticalHitCrimson,
          border: COLORS.criticalHitCrimson,
          text: COLORS.white,
          highlight: '#FF4D6F',
          shadow: '#CC0035',
        };
      case 'ghost':
        return {
          background: 'transparent',
          border: COLORS.white,
          text: COLORS.white,
          highlight: COLORS.borderLight,
          shadow: COLORS.borderDark,
        };
      default:
        return {
          background: COLORS.levelUpLime,
          border: COLORS.levelUpLime,
          text: COLORS.midnightGrape,
          highlight: '#66FF8C',
          shadow: '#00AA2E',
        };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: SPACING[1],
          paddingHorizontal: SPACING[2],
          fontSize: FONT_SIZES.xs,
        };
      case 'large':
        return {
          paddingVertical: SPACING[4],
          paddingHorizontal: SPACING[6],
          fontSize: FONT_SIZES.lg,
        };
      case 'medium':
      default:
        return {
          paddingVertical: SPACING[2],
          paddingHorizontal: SPACING[4],
          fontSize: FONT_SIZES.sm,
        };
    }
  };

  const colors = getVariantColors();
  const sizeStyle = getSizeStyle();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => !disabled && setIsPressed(true)}
      onPressOut={() => !disabled && setIsPressed(false)}
      disabled={disabled}
      style={[
        styles.button,
        {
          backgroundColor: isPressed ? colors.shadow : colors.background,
          borderColor: colors.border,
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          width: fullWidth ? '100%' : 'auto',
          borderBottomWidth: isPressed ? BORDERS.thin : BORDERS.normal,
          borderRightWidth: isPressed ? BORDERS.thin : BORDERS.normal,
          borderTopColor: isPressed ? colors.shadow : colors.highlight,
          borderLeftColor: isPressed ? colors.shadow : colors.highlight,
          borderBottomColor: isPressed ? colors.highlight : colors.shadow,
          borderRightColor: isPressed ? colors.highlight : colors.shadow,
        },
        style,
      ]}
    >
      {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
      <Text
        style={[
          styles.text,
          { color: colors.text, fontSize: sizeStyle.fontSize },
          textStyle,
        ]}
      >
        {title}
      </Text>
      {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: BORDERS.normal,
    borderRadius: 0,
  },
  text: {
    fontFamily: FONTS.header,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  iconLeft: {
    marginRight: SPACING[2],
  },
  iconRight: {
    marginLeft: SPACING[2],
  },
});

export default PixelButton;
