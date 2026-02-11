// Anima - ScanlineOverlay Component
// CRT scanline effect for retro handheld console feel

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, Pattern, Rect, Line } from 'react-native-svg';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export interface ScanlineOverlayProps {
  opacity?: number;
  lineSpacing?: number;
  enabled?: boolean;
}

export const ScanlineOverlay: React.FC<ScanlineOverlayProps> = ({
  opacity = 0.03,
  lineSpacing = 2,
  enabled = true,
}) => {
  if (!enabled) return null;

  // Generate scanline pattern
  const lines = [];
  for (let i = 0; i < SCREEN_HEIGHT / lineSpacing; i++) {
    lines.push(
      <Line
        key={i}
        x1="0"
        y1={i * lineSpacing}
        x2={SCREEN_WIDTH}
        y2={i * lineSpacing}
        stroke="black"
        strokeWidth="1"
      />
    );
  }

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Svg
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        style={{ opacity }}
      >
        {lines}
      </Svg>
    </View>
  );
};

// Alternative: Pattern-based scanlines (more performant)
export const ScanlineOverlayPattern: React.FC<ScanlineOverlayProps> = ({
  opacity = 0.03,
  lineSpacing = 2,
  enabled = true,
}) => {
  if (!enabled) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Svg width="100%" height="100%" style={{ opacity }}>
        <Defs>
          <Pattern
            id="scanlines"
            patternUnits="userSpaceOnUse"
            width={SCREEN_WIDTH}
            height={lineSpacing * 2}
          >
            <Rect
              x="0"
              y="0"
              width={SCREEN_WIDTH}
              height={lineSpacing}
              fill="transparent"
            />
            <Rect
              x="0"
              y={lineSpacing}
              width={SCREEN_WIDTH}
              height={lineSpacing}
              fill="black"
            />
          </Pattern>
        </Defs>
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#scanlines)"
        />
      </Svg>
    </View>
  );
};

// CSS-based overlay (most performant - uses View styling)
export const ScanlineOverlayCSS: React.FC<ScanlineOverlayProps> = ({
  opacity = 0.03,
  enabled = true,
}) => {
  if (!enabled) return null;

  return (
    <View style={[styles.overlay, styles.cssPattern, { opacity }]} pointerEvents="none">
      {/* Create multiple thin lines */}
      {Array.from({ length: Math.ceil(SCREEN_HEIGHT / 2) }).map((_, index) => (
        <View key={index} style={styles.scanline} />
      ))}
    </View>
  );
};

// Static image overlay (best for production - use a pre-made PNG)
export const ScanlineOverlayStatic: React.FC<ScanlineOverlayProps> = ({
  opacity = 0.03,
  enabled = true,
}) => {
  if (!enabled) return null;

  // In production, use a tiled scanline image
  // For now, using CSS pattern
  return <ScanlineOverlayCSS opacity={opacity} enabled={enabled} />;
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  cssPattern: {
    flexDirection: 'column',
  },
  scanline: {
    height: 1,
    backgroundColor: 'black',
    marginBottom: 1,
  },
});

export default ScanlineOverlay;
