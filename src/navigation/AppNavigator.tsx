// Anima - App Navigator v2.0
// Main navigation structure with glassmorphic design and onboarding flow

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import { GlassNavBar } from '../components/glass-ui';
import { useUserStore } from '../store';
import { useOnboardingStore } from '../store/useOnboardingStore';
import { COLORS } from '../theme/designSystem';

// Screens - Glass UI versions
import { HomeScreenV2 } from '../screens/feed/HomeScreenV2';
import { AiringTodayScreen } from '../screens/feed/AiringToday';
import { SearchScreenV2 } from '../screens/discover/SearchScreenV2';
import { NotificationsScreenV2 } from '../screens/notifications/NotificationsScreenV2';
import { ProfileScreenV2 } from '../screens/profile/ProfileScreenV2';
import { GuildChatScreen } from '../screens/social/GuildChat';
import { LoginScreenV2 } from '../screens/auth/LoginScreenV2';
import { RegisterScreenV2 } from '../screens/auth/RegisterScreenV2';
import { AnimeLibraryScreen, AnimeDetailScreen } from '../screens/library';
import { ComposeScreen } from '../screens/compose';

// Onboarding Screens
import {
  WelcomeScreen,
  CreateAccountScreen,
  ProfileSetupScreen,
  GenrePreferencesScreen,
  OnboardingCompleteScreen,
} from '../screens/onboarding';

// Type definitions
export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  CreateAccount: undefined;
  ProfileSetup: undefined;
  GenrePreferences: undefined;
  OnboardingComplete: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Library: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  Feed: undefined;
  AiringToday: undefined;
  GuildChat: { roomId: string; animeName: string; episode: number };
  QuestDetail: { questId: string };
  Compose: undefined;
};

export type SearchStackParamList = {
  Discover: undefined;
  AnimeDetail: { animeId: number; openProgress?: boolean };
  UserProfile: { userId: string };
};

export type LibraryStackParamList = {
  MyLibrary: undefined;
  AnimeDetail: { animeId: number; openProgress?: boolean };
};

export type ProfileStackParamList = {
  MyProfile: undefined;
  Settings: undefined;
  EditProfile: undefined;
};

const RootStack = createStackNavigator<RootStackParamList>();
const OnboardingStack = createStackNavigator<OnboardingStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const SearchStack = createStackNavigator<SearchStackParamList>();
const LibraryStack = createStackNavigator<LibraryStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

// Onboarding Navigator
const OnboardingNavigator: React.FC = () => {
  return (
    <OnboardingStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background.primary },
        gestureEnabled: false,
      }}
    >
      <OnboardingStack.Screen name="Welcome" component={WelcomeScreen} />
      <OnboardingStack.Screen name="CreateAccount" component={CreateAccountScreen} />
      <OnboardingStack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <OnboardingStack.Screen name="GenrePreferences" component={GenrePreferencesScreen} />
      <OnboardingStack.Screen name="OnboardingComplete" component={OnboardingCompleteScreen} />
    </OnboardingStack.Navigator>
  );
};

// Auth Navigator
const AuthNavigator: React.FC = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background.primary },
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreenV2} />
      <AuthStack.Screen name="Register" component={RegisterScreenV2} />
    </AuthStack.Navigator>
  );
};

// Home Stack Navigator
const HomeStackNavigator: React.FC = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background.primary },
        presentation: 'card',
      }}
    >
      <HomeStack.Screen name="Feed" component={HomeScreenV2} />
      <HomeStack.Screen name="AiringToday" component={AiringTodayScreen} />
      <HomeStack.Screen name="GuildChat" component={GuildChatScreen} />
      <HomeStack.Screen
        name="Compose"
        component={ComposeScreen}
        options={{ presentation: 'modal' }}
      />
    </HomeStack.Navigator>
  );
};

// Search Stack Navigator
const SearchStackNavigator: React.FC = () => {
  return (
    <SearchStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background.primary },
      }}
    >
      <SearchStack.Screen name="Discover" component={SearchScreenV2} />
      <SearchStack.Screen name="AnimeDetail" component={AnimeDetailScreen} />
    </SearchStack.Navigator>
  );
};

// Library Stack Navigator
const LibraryStackNavigator: React.FC = () => {
  return (
    <LibraryStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background.primary },
      }}
    >
      <LibraryStack.Screen name="MyLibrary" component={AnimeLibraryScreen} />
      <LibraryStack.Screen name="AnimeDetail" component={AnimeDetailScreen} />
    </LibraryStack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStackNavigator: React.FC = () => {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background.primary },
      }}
    >
      <ProfileStack.Screen name="MyProfile" component={ProfileScreenV2} />
    </ProfileStack.Navigator>
  );
};

// Main Tab Navigator with Glass NavBar
const MainTabNavigator: React.FC = () => {
  return (
    <MainTab.Navigator
      tabBar={(props) => <GlassNavBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <MainTab.Screen name="Home" component={HomeStackNavigator} />
      <MainTab.Screen name="Search" component={SearchStackNavigator} />
      <MainTab.Screen name="Library" component={LibraryStackNavigator} />
      <MainTab.Screen name="Notifications" component={NotificationsScreenV2} />
      <MainTab.Screen name="Profile" component={ProfileStackNavigator} />
    </MainTab.Navigator>
  );
};

// Root Navigator
export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isGuest, isLoading: authLoading } = useUserStore();
  const { isComplete: onboardingComplete, isLoading: onboardingLoading, initialize } = useOnboardingStore();

  // Initialize onboarding store
  useEffect(() => {
    initialize();
  }, []);

  // Show loading while checking auth and onboarding status
  if (authLoading || onboardingLoading) {
    return null;
  }

  // Determine which screen to show
  const canAccessMain = isAuthenticated || isGuest;
  const needsOnboarding = !onboardingComplete && !isGuest && !isAuthenticated;

  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: COLORS.background.primary },
        }}
      >
        {needsOnboarding ? (
          // Show onboarding for new users
          <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : canAccessMain ? (
          // Show main app if authenticated or guest
          <RootStack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          // Show auth screens otherwise
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
