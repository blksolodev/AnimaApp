// Anima - ProfileScreen
// Adventurer profile with stats and digital inventory

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PixelCard, PixelAvatar, PixelButton, PixelIcon, ScanlineOverlayCSS } from '../../components/pixel-ui';
import { useUserStore } from '../../store';
import { calculateXPProgress, POWER_LEVELS } from '../../types/user';
import { COLORS, FONTS, FONT_SIZES, SPACING, COMPONENT_SIZES } from '../../theme';

// XP Progress Bar component
const XPProgressBar: React.FC<{ current: number; next: number; progress: number }> = ({
  current,
  next,
  progress,
}) => {
  const progressWidth = Math.floor(progress * 10) * 10; // Step by 10%

  return (
    <View style={styles.xpContainer}>
      <View style={styles.xpBar}>
        <View style={[styles.xpFill, { width: `${progressWidth}%` }]} />
        {/* Pixel segments */}
        {Array.from({ length: 10 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.xpSegment,
              { left: `${i * 10}%` },
            ]}
          />
        ))}
      </View>
      <Text style={styles.xpText}>
        {current} / {next} XP
      </Text>
    </View>
  );
};

// Stat card component
const StatCard: React.FC<{ label: string; value: number | string }> = ({
  label,
  value,
}) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useUserStore();

  // Demo user for when not logged in
  const displayUser = user || {
    id: 'demo',
    username: 'adventurer',
    displayName: 'Demo Adventurer',
    avatarUrl: null,
    bannerUrl: null,
    bio: 'A new adventurer on their quest to watch all the anime!',
    powerLevel: 15,
    xp: 2500,
    joinedAt: new Date(),
    badges: [],
    pledgedCharacter: null,
    stats: {
      postsCount: 42,
      followersCount: 128,
      followingCount: 256,
      completedAnime: 25,
      watchingAnime: 8,
      totalEpisodesWatched: 450,
      critsGiven: 87,
      critsReceived: 134,
    },
  };

  const xpProgress = calculateXPProgress(displayUser.xp);
  const powerTier = POWER_LEVELS.find((t) => t.level === displayUser.powerLevel) || POWER_LEVELS[0];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScanlineOverlayCSS opacity={0.03} enabled={true} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ADVENTURER</Text>
          <Pressable>
            <PixelIcon name="settings" size={24} color={COLORS.mediumGray} />
          </Pressable>
        </View>

        {/* Profile Card */}
        <PixelCard variant="dialog" style={styles.profileCard}>
          {/* Avatar with aura */}
          <View style={styles.avatarContainer}>
            <PixelAvatar
              imageUrl={displayUser.avatarUrl}
              size="xlarge"
              powerLevel={displayUser.powerLevel}
              auraColor={powerTier.auraColor}
              showAura={displayUser.powerLevel >= 20}
            />
          </View>

          {/* Name and title */}
          <Text style={styles.displayName}>{displayUser.displayName}</Text>
          <Text style={styles.username}>@{displayUser.username}</Text>

          {/* Power Level */}
          <View style={styles.powerLevelContainer}>
            <Text style={styles.powerLevelLabel}>POWER LEVEL</Text>
            <Text style={[styles.powerLevelValue, { color: powerTier.auraColor }]}>
              {displayUser.powerLevel}
            </Text>
            <Text style={[styles.powerTierTitle, { color: powerTier.auraColor }]}>
              {powerTier.title.toUpperCase()}
            </Text>
          </View>

          {/* XP Progress */}
          <XPProgressBar
            current={xpProgress.current}
            next={xpProgress.next}
            progress={xpProgress.progress}
          />

          {/* Bio */}
          {displayUser.bio && (
            <Text style={styles.bio}>{displayUser.bio}</Text>
          )}
        </PixelCard>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>STATS</Text>
        <View style={styles.statsGrid}>
          <StatCard label="QUESTS" value={displayUser.stats.postsCount} />
          <StatCard label="FOLLOWERS" value={displayUser.stats.followersCount} />
          <StatCard label="FOLLOWING" value={displayUser.stats.followingCount} />
          <StatCard label="COMPLETED" value={displayUser.stats.completedAnime} />
          <StatCard label="WATCHING" value={displayUser.stats.watchingAnime} />
          <StatCard label="EPISODES" value={displayUser.stats.totalEpisodesWatched} />
        </View>

        {/* Arena Stats */}
        <Text style={styles.sectionTitle}>ARENA RECORD</Text>
        <PixelCard variant="quest" style={styles.arenaCard}>
          <View style={styles.arenaStats}>
            <View style={styles.arenaStat}>
              <PixelIcon name="crit" size={24} color={COLORS.levelUpLime} />
              <Text style={styles.arenaValue}>{displayUser.stats.critsGiven}</Text>
              <Text style={styles.arenaLabel}>CRITS GIVEN</Text>
            </View>
            <View style={styles.arenaDivider} />
            <View style={styles.arenaStat}>
              <PixelIcon name="crit" size={24} color={COLORS.goldCoin} />
              <Text style={styles.arenaValue}>{displayUser.stats.critsReceived}</Text>
              <Text style={styles.arenaLabel}>CRITS RECEIVED</Text>
            </View>
          </View>
        </PixelCard>

        {/* Digital Inventory Preview */}
        <Text style={styles.sectionTitle}>DIGITAL INVENTORY</Text>
        <PixelCard variant="quest" style={styles.inventoryCard}>
          <View style={styles.inventoryPreview}>
            {displayUser.badges.length > 0 ? (
              displayUser.badges.slice(0, 6).map((badge, index) => (
                <View key={badge.id} style={styles.badgeSlot}>
                  {/* Badge image would go here */}
                  <View style={styles.badgePlaceholder} />
                </View>
              ))
            ) : (
              <Text style={styles.inventoryEmpty}>
                No stamps collected yet. Complete anime to earn stamps!
              </Text>
            )}
          </View>
          <PixelButton
            title="VIEW INVENTORY"
            onPress={() => {}}
            variant="ghost"
            size="small"
            fullWidth
          />
        </PixelCard>

        {/* Logout */}
        {user && (
          <PixelButton
            title="LOG OUT"
            onPress={handleLogout}
            variant="danger"
            fullWidth
            style={styles.logoutButton}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.midnightGrape,
  },
  scrollContent: {
    paddingHorizontal: SPACING[4],
    paddingBottom: COMPONENT_SIZES.tabBarHeight + SPACING[6],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING[3],
  },
  headerTitle: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  avatarContainer: {
    marginBottom: SPACING[3],
  },
  displayName: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
    marginBottom: 4,
  },
  username: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.mediumGray,
    marginBottom: SPACING[4],
  },
  powerLevelContainer: {
    alignItems: 'center',
    marginBottom: SPACING[3],
  },
  powerLevelLabel: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.xs,
    color: COLORS.mediumGray,
    marginBottom: 4,
  },
  powerLevelValue: {
    fontFamily: FONTS.numeric,
    fontSize: 48,
    lineHeight: 52,
  },
  powerTierTitle: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.sm,
  },
  xpContainer: {
    width: '100%',
    marginBottom: SPACING[4],
  },
  xpBar: {
    height: 16,
    backgroundColor: COLORS.shadowBlack,
    borderWidth: 2,
    borderColor: COLORS.borderMid,
    position: 'relative',
    overflow: 'hidden',
  },
  xpFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: COLORS.levelUpLime,
  },
  xpSegment: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: COLORS.midnightGrape,
  },
  xpText: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.xs,
    color: COLORS.mediumGray,
    textAlign: 'center',
    marginTop: 4,
  },
  bio: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.lightGray,
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.md,
    color: COLORS.goldCoin,
    marginBottom: SPACING[3],
    marginTop: SPACING[2],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING[4],
  },
  statCard: {
    width: '31%',
    backgroundColor: COLORS.deepPurple,
    borderWidth: 2,
    borderColor: COLORS.borderMid,
    padding: SPACING[3],
    alignItems: 'center',
    marginBottom: SPACING[2],
  },
  statValue: {
    fontFamily: FONTS.numeric,
    fontSize: FONT_SIZES.xl,
    color: COLORS.white,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: FONTS.header,
    fontSize: 8,
    color: COLORS.mediumGray,
  },
  arenaCard: {
    marginBottom: SPACING[4],
  },
  arenaStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  arenaStat: {
    alignItems: 'center',
    flex: 1,
  },
  arenaDivider: {
    width: 2,
    height: 60,
    backgroundColor: COLORS.borderMid,
  },
  arenaValue: {
    fontFamily: FONTS.numeric,
    fontSize: FONT_SIZES['2xl'],
    color: COLORS.white,
    marginTop: SPACING[2],
  },
  arenaLabel: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.xs,
    color: COLORS.mediumGray,
    marginTop: 4,
  },
  inventoryCard: {
    marginBottom: SPACING[4],
  },
  inventoryPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: SPACING[3],
    minHeight: 60,
  },
  badgeSlot: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.shadowBlack,
    borderWidth: 2,
    borderColor: COLORS.borderDark,
    margin: 4,
  },
  badgePlaceholder: {
    flex: 1,
    backgroundColor: COLORS.charcoal,
  },
  inventoryEmpty: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.mediumGray,
    textAlign: 'center',
    paddingVertical: SPACING[4],
  },
  logoutButton: {
    marginTop: SPACING[4],
    marginBottom: SPACING[4],
  },
});

export default ProfileScreen;
