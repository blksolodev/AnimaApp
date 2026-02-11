// Anima - PixelAvatar Component
// Pixel-perfect avatar with optional power aura effect

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, BORDERS, SPACING, COMPONENT_SIZES, SPRITE_FRAME } from '../../theme';

export interface PixelAvatarProps {
  imageUrl: string | null;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  powerLevel?: number;
  auraColor?: string;
  showAura?: boolean;
  borderColor?: string;
  style?: ViewStyle;
  onPress?: () => void;
}

export const PixelAvatar: React.FC<PixelAvatarProps> = ({
  imageUrl,
  size = 'medium',
  powerLevel = 0,
  auraColor,
  showAura = false,
  borderColor = COLORS.white,
  style,
  onPress,
}) => {
  // Simple pulse animation state
  const [auraOpacity, setAuraOpacity] = useState(0.6);
  const [auraScale, setAuraScale] = useState(1);

  useEffect(() => {
    if (showAura && powerLevel >= 20) {
      // Simple pulse animation using setInterval
      const interval = setInterval(() => {
        setAuraOpacity(prev => prev === 0.6 ? 0.3 : 0.6);
        setAuraScale(prev => prev === 1 ? 1.1 : 1);
      }, SPRITE_FRAME * 8);

      return () => clearInterval(interval);
    }
  }, [showAura, powerLevel]);

  const getSizeValue = (): number => {
    switch (size) {
      case 'small':
        return COMPONENT_SIZES.avatarSmall;
      case 'large':
        return COMPONENT_SIZES.avatarLarge;
      case 'xlarge':
        return COMPONENT_SIZES.avatarXLarge;
      case 'medium':
      default:
        return COMPONENT_SIZES.avatarMedium;
    }
  };

  const getDefaultAuraColor = (): string => {
    if (auraColor) return auraColor;

    // Determine aura color based on power level
    if (powerLevel >= 100) return '#FFD700'; // Mythic - Gold
    if (powerLevel >= 75) return '#FF6B35';  // Legend - Orange
    if (powerLevel >= 50) return '#FF0043';  // Champion - Crimson
    if (powerLevel >= 30) return '#9B59B6';  // Elite - Purple
    if (powerLevel >= 20) return '#F4D03F';  // Warrior - Gold
    if (powerLevel >= 10) return '#4ECDC4';  // Adventurer - Teal
    if (powerLevel >= 5) return '#00FF41';   // Apprentice - Lime
    return COLORS.white;                      // Newbie - White
  };

  const sizeValue = getSizeValue();
  const actualAuraColor = getDefaultAuraColor();
  const showAuraEffect = showAura && powerLevel >= 20;

  return (
    <View
      style={[
        styles.container,
        { width: sizeValue + 8, height: sizeValue + 8 },
        style,
      ]}
    >
      {/* Power Aura (background glow) */}
      {showAuraEffect && (
        <View
          style={[
            styles.aura,
            {
              width: sizeValue + 16,
              height: sizeValue + 16,
              backgroundColor: actualAuraColor,
              shadowColor: actualAuraColor,
              opacity: auraOpacity,
              transform: [{ scale: auraScale }],
            },
          ]}
        />
      )}

      {/* Avatar frame */}
      <View
        style={[
          styles.frame,
          {
            width: sizeValue,
            height: sizeValue,
            borderColor,
          },
        ]}
      >
        {/* Avatar image */}
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={[
              styles.image,
              {
                width: sizeValue - BORDERS.normal * 2,
                height: sizeValue - BORDERS.normal * 2,
              },
            ]}
            contentFit="cover"
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              {
                width: sizeValue - BORDERS.normal * 2,
                height: sizeValue - BORDERS.normal * 2,
              },
            ]}
          >
            {/* Default pixel character silhouette */}
            <View style={styles.placeholderHead} />
            <View style={styles.placeholderBody} />
          </View>
        )}
      </View>

      {/* Power level badge (optional) */}
      {powerLevel > 0 && size !== 'small' && (
        <View
          style={[
            styles.levelBadge,
            { backgroundColor: actualAuraColor },
          ]}
        >
          <View style={styles.levelBadgeInner}>
            {/* Power level number would go here */}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aura: {
    position: 'absolute',
    borderRadius: 0, // Keep it square/pixelated
    opacity: 0.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  frame: {
    borderWidth: BORDERS.normal,
    borderRadius: 0, // Sharp pixel corners
    overflow: 'hidden',
    backgroundColor: COLORS.darkGray,
  },
  image: {
    // Image will be pixelated at small sizes due to content scaling
  },
  placeholder: {
    backgroundColor: COLORS.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderHead: {
    width: 12,
    height: 12,
    backgroundColor: COLORS.mediumGray,
    marginBottom: 2,
  },
  placeholderBody: {
    width: 16,
    height: 10,
    backgroundColor: COLORS.mediumGray,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: COLORS.midnightGrape,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadgeInner: {
    width: 8,
    height: 8,
    backgroundColor: COLORS.white,
  },
});

export default PixelAvatar;
