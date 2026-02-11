// Anima - PixelTabBar Component
// Custom bottom tab bar with chunky pixel icons and bounce animation

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { PixelIcon, IconName } from '../pixel-ui';
import { COLORS, FONTS, FONT_SIZES, SPACING, COMPONENT_SIZES, SPRITE_FRAME } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TabConfig {
  name: string;
  icon: IconName;
  label: string;
}

const TAB_CONFIG: TabConfig[] = [
  { name: 'Home', icon: 'scroll', label: 'QUESTS' },
  { name: 'Search', icon: 'search', label: 'SEARCH' },
  { name: 'Notifications', icon: 'bell', label: 'ALERTS' },
  { name: 'Profile', icon: 'profile', label: 'HERO' },
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
  const [scale, setScale] = useState(1);
  const [translateY, setTranslateY] = useState(0);

  const handlePress = () => {
    // Simple bounce animation
    setScale(1.2);
    setTranslateY(-4);
    setTimeout(() => {
      setScale(1);
      setTranslateY(0);
    }, SPRITE_FRAME * 2);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress}
      style={[styles.tabButton, { transform: [{ scale }, { translateY }] }]}
    >
      <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
        <PixelIcon
          name={config.icon}
          size={COMPONENT_SIZES.tabIconSize}
          color={isActive ? COLORS.levelUpLime : COLORS.mediumGray}
        />
      </View>
      <Text
        style={[
          styles.label,
          { color: isActive ? COLORS.levelUpLime : COLORS.mediumGray },
        ]}
      >
        {config.label}
      </Text>
      {/* Active indicator */}
      {isActive && <View style={styles.activeIndicator} />}
    </Pressable>
  );
};

export const PixelTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom || SPACING[2] },
      ]}
    >
      {/* Top border with pixel effect */}
      <View style={styles.topBorder}>
        <View style={styles.borderHighlight} />
      </View>

      {/* Tab buttons */}
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

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.shadowBlack,
    borderTopWidth: 4,
    borderTopColor: COLORS.deepPurple,
  },
  topBorder: {
    position: 'absolute',
    top: -4,
    left: 0,
    right: 0,
    height: 4,
  },
  borderHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.borderLight,
    opacity: 0.3,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: COMPONENT_SIZES.tabBarHeight,
    paddingHorizontal: SPACING[2],
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[2],
    minHeight: COMPONENT_SIZES.touchTarget,
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconContainerActive: {
    borderColor: COLORS.levelUpLime,
    backgroundColor: 'rgba(0, 255, 65, 0.1)',
  },
  label: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING[1],
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 8,
    height: 4,
    backgroundColor: COLORS.levelUpLime,
  },
});

export default PixelTabBar;
