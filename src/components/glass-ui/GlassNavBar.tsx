// Anima - GlassNavBar Component v2.0
// Frosted glass bottom navigation with proper icons

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, LAYOUT, TYPOGRAPHY, SPACING, EFFECTS } from '../../theme/designSystem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TabConfig {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  badge?: number;
}

const TAB_CONFIG: TabConfig[] = [
  {
    name: 'Home',
    label: 'Home',
    icon: 'home-outline',
    activeIcon: 'home',
  },
  {
    name: 'Search',
    label: 'Explore',
    icon: 'search-outline',
    activeIcon: 'search',
  },
  {
    name: 'Library',
    label: 'Library',
    icon: 'library-outline',
    activeIcon: 'library',
  },
  {
    name: 'Notifications',
    label: 'Alerts',
    icon: 'notifications-outline',
    activeIcon: 'notifications',
  },
  {
    name: 'Profile',
    label: 'Profile',
    icon: 'person-outline',
    activeIcon: 'person',
  },
];

interface TabButtonProps {
  config: TabConfig;
  isActive: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({
  config,
  isActive,
  onPress,
  onLongPress,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[
        styles.tabButton,
        {
          opacity: isPressed ? 0.7 : 1,
          transform: [{ scale: isPressed ? 0.95 : 1 }],
        },
      ]}
    >
      {/* Icon Container */}
      <View
        style={[
          styles.iconContainer,
          isActive && styles.iconContainerActive,
        ]}
      >
        <Ionicons
          name={isActive ? config.activeIcon : config.icon}
          size={24}
          color={isActive ? COLORS.accent.primary : COLORS.text.tertiary}
        />

        {/* Badge */}
        {config.badge && config.badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {config.badge > 99 ? '99+' : config.badge}
            </Text>
          </View>
        )}
      </View>

      {/* Label */}
      <Text
        style={[
          styles.label,
          { color: isActive ? COLORS.accent.primary : COLORS.text.tertiary },
        ]}
      >
        {config.label}
      </Text>

      {/* Active Indicator */}
      {isActive && <View style={styles.activeIndicator} />}
    </Pressable>
  );
};

export const GlassNavBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const isBlurSupported = Platform.OS === 'ios';

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, SPACING[2]) },
      ]}
    >
      {/* Glass Background */}
      {isBlurSupported ? (
        <BlurView
          intensity={80}
          tint="dark"
          style={StyleSheet.absoluteFillObject}
        />
      ) : null}

      {/* Solid fallback for Android */}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: isBlurSupported
              ? 'transparent'
              : COLORS.glass.overlay,
          },
        ]}
      />

      {/* Top Border */}
      <View style={styles.topBorder} />

      {/* Tab Buttons */}
      <View style={styles.tabsContainer}>
        {state.routes.map((route, index) => {
          const config = TAB_CONFIG[index];
          if (!config) return null;

          const isActive = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isActive && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabButton
              key={route.key}
              config={config}
              isActive={isActive}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
};

// Floating Action Button for compose
export const FloatingComposeButton: React.FC<{
  onPress: () => void;
}> = ({ onPress }) => {
  const insets = useSafeAreaInsets();
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[
        styles.fab,
        {
          bottom: LAYOUT.heights.tabBar + insets.bottom + SPACING[4],
          opacity: isPressed ? 0.9 : 1,
          transform: [{ scale: isPressed ? 0.95 : 1 }],
        },
      ]}
    >
      <Ionicons name="add" size={28} color={COLORS.text.primary} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    borderTopLeftRadius: LAYOUT.radius['2xl'],
    borderTopRightRadius: LAYOUT.radius['2xl'],
    overflow: 'hidden',
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.glass.border,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: LAYOUT.heights.tabBar,
    paddingHorizontal: SPACING[2],
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[2],
  },
  iconContainer: {
    width: 48,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: LAYOUT.radius.lg,
    position: 'relative',
  },
  iconContainerActive: {
    backgroundColor: 'rgba(255, 107, 44, 0.15)',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.accent.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginTop: SPACING[1],
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.accent.primary,
  },
  // FAB
  fab: {
    position: 'absolute',
    right: SPACING[4],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...EFFECTS.shadows.lg,
  },
});

export default GlassNavBar;
