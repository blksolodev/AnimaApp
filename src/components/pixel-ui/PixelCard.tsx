// Anima - PixelCard Component
// RPG dialogue box styled card

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, BORDERS, SPACING } from '../../theme';

export interface PixelCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'dialog' | 'quest' | 'notification';
  backgroundColor?: string;
  borderColor?: string;
  style?: ViewStyle;
  animate?: boolean;
  onAnimationComplete?: () => void;
}

export const PixelCard: React.FC<PixelCardProps> = ({
  children,
  variant = 'default',
  backgroundColor = COLORS.deepPurple,
  borderColor = COLORS.white,
  style,
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'dialog':
        return {
          borderWidth: BORDERS.thick,
          paddingHorizontal: SPACING[4],
          paddingVertical: SPACING[3],
        };
      case 'quest':
        return {
          borderWidth: BORDERS.normal,
          paddingHorizontal: SPACING[3],
          paddingVertical: SPACING[3],
        };
      case 'notification':
        return {
          borderWidth: BORDERS.thin,
          paddingHorizontal: SPACING[3],
          paddingVertical: SPACING[2],
        };
      default:
        return {
          borderWidth: BORDERS.normal,
          paddingHorizontal: SPACING[4],
          paddingVertical: SPACING[4],
        };
    }
  };

  const variantStyle = getVariantStyle();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor,
          borderColor,
          ...variantStyle,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.highlightTop,
          { borderColor: COLORS.borderLight },
        ]}
      />
      <View
        style={[
          styles.shadowBottom,
          { borderColor: COLORS.borderShadow },
        ]}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
};

export const PixelCardDithered: React.FC<PixelCardProps> = (props) => {
  return (
    <PixelCard {...props}>
      <View style={styles.ditherOverlay} />
      {props.children}
    </PixelCard>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 0,
  },
  highlightTop: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 4,
    bottom: 4,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    borderLeftColor: 'rgba(255, 255, 255, 0.2)',
    pointerEvents: 'none',
  },
  shadowBottom: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 2,
    bottom: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: 'rgba(0, 0, 0, 0.3)',
    borderRightColor: 'rgba(0, 0, 0, 0.3)',
    pointerEvents: 'none',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
  ditherOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    pointerEvents: 'none',
  },
});

export default PixelCard;
