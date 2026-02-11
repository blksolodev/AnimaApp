// Anima - PixelBorder Component
// SVG-based sharp pixel borders with beveled 3D effect

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';
import { COLORS, BORDERS, SPACING } from '../../theme';

export interface PixelBorderProps {
  children: React.ReactNode;
  width?: number | string;
  height?: number | string;
  borderWidth?: number;
  variant?: 'dialog' | 'card' | 'button' | 'input';
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
  animated?: boolean;
}

export const PixelBorder: React.FC<PixelBorderProps> = ({
  children,
  width = '100%',
  height,
  borderWidth = BORDERS.normal,
  variant = 'card',
  color = COLORS.white,
  backgroundColor = COLORS.midnightGrape,
  style,
  animated = false,
}) => {
  const getVariantColors = () => {
    switch (variant) {
      case 'dialog':
        return {
          topLeft: COLORS.borderLight,
          bottomRight: COLORS.borderDark,
          inner: COLORS.borderMid,
        };
      case 'button':
        return {
          topLeft: COLORS.borderLight,
          bottomRight: COLORS.borderShadow,
          inner: color,
        };
      case 'input':
        return {
          topLeft: COLORS.borderDark,
          bottomRight: COLORS.borderLight,
          inner: COLORS.charcoal,
        };
      case 'card':
      default:
        return {
          topLeft: color,
          bottomRight: COLORS.borderDark,
          inner: color,
        };
    }
  };

  const colors = getVariantColors();
  const bw = borderWidth;

  return (
    <View
      style={[
        styles.container,
        {
          width: width as any,
          height: height as any,
        },
        style,
      ]}
    >
      {/* Outer border - creates beveled effect */}
      <View style={[styles.borderOuter, { borderColor: colors.topLeft }]}>
        {/* Inner border shadow */}
        <View
          style={[
            styles.borderInner,
            {
              borderTopColor: colors.topLeft,
              borderLeftColor: colors.topLeft,
              borderBottomColor: colors.bottomRight,
              borderRightColor: colors.bottomRight,
              borderWidth: bw,
            },
          ]}
        >
          {/* Content area */}
          <View
            style={[
              styles.content,
              {
                backgroundColor,
                borderColor: colors.inner,
                borderWidth: variant === 'dialog' ? 2 : 0,
              },
            ]}
          >
            {children}
          </View>
        </View>
      </View>
    </View>
  );
};

// Alternative: Pure SVG border for more control
export const PixelBorderSVG: React.FC<PixelBorderProps & { svgWidth: number; svgHeight: number }> = ({
  children,
  svgWidth,
  svgHeight,
  borderWidth = BORDERS.normal,
  color = COLORS.white,
  backgroundColor = COLORS.midnightGrape,
  style,
}) => {
  const bw = borderWidth;

  return (
    <View style={[styles.svgContainer, style]}>
      <Svg width={svgWidth} height={svgHeight} style={styles.svgAbsolute}>
        {/* Main border */}
        <Rect
          x={0}
          y={0}
          width={svgWidth}
          height={svgHeight}
          fill="none"
          stroke={color}
          strokeWidth={bw}
        />
        {/* Top highlight */}
        <Path
          d={`M 0 0 L ${svgWidth} 0 L ${svgWidth - bw} ${bw} L ${bw} ${bw} L ${bw} ${svgHeight - bw} L 0 ${svgHeight} Z`}
          fill={COLORS.borderLight}
          opacity={0.3}
        />
        {/* Bottom shadow */}
        <Path
          d={`M ${svgWidth} ${svgHeight} L 0 ${svgHeight} L ${bw} ${svgHeight - bw} L ${svgWidth - bw} ${svgHeight - bw} L ${svgWidth - bw} ${bw} L ${svgWidth} 0 Z`}
          fill={COLORS.borderShadow}
          opacity={0.5}
        />
        {/* Background */}
        <Rect
          x={bw}
          y={bw}
          width={svgWidth - bw * 2}
          height={svgHeight - bw * 2}
          fill={backgroundColor}
        />
      </Svg>
      <View style={[styles.svgContent, { padding: bw + SPACING[2] }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  borderOuter: {
    flex: 1,
  },
  borderInner: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING[3],
  },
  svgContainer: {
    position: 'relative',
  },
  svgAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  svgContent: {
    position: 'relative',
    zIndex: 1,
  },
});

export default PixelBorder;
