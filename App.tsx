// Anima - Main App Entry Point
// 16-Bit RPG Anime Social Platform

import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Font from 'expo-font';

import { AppNavigator } from './src/navigation/AppNavigator';
import { initializeFirebase } from './src/services/FirebaseConfig';
import { useUserStore } from './src/store';
import { COLORS, FONTS } from './src/theme';

// Loading screen component
const LoadingScreen: React.FC = () => (
  <View style={styles.loadingContainer}>
    <Text style={styles.loadingLogo}>ANIMA</Text>
    <ActivityIndicator size="large" color={COLORS.levelUpLime} style={styles.spinner} />
    <Text style={styles.loadingText}>LOADING QUEST DATA...</Text>
  </View>
);

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [appReady, setAppReady] = useState(false);
  const initialize = useUserStore((state) => state.initialize);

  // Load fonts
  // NOTE: Download pixel fonts from Google Fonts and place in src/assets/fonts/:
  // - PressStart2P-Regular.ttf (https://fonts.google.com/specimen/Press+Start+2P)
  // - Silkscreen-Regular.ttf (https://fonts.google.com/specimen/Silkscreen)
  // - VT323-Regular.ttf (https://fonts.google.com/specimen/VT323)
  const loadFonts = useCallback(async () => {
    try {
      // Fonts will load when files are added to src/assets/fonts/
      // For now, using system fallback fonts
      setFontsLoaded(true);
    } catch (error) {
      console.warn('Failed to load custom fonts, using fallbacks');
      setFontsLoaded(true);
    }
  }, []);

  // Initialize app
  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize Firebase
        initializeFirebase();

        // Load fonts
        await loadFonts();

        // Initialize auth state listener
        const unsubscribe = initialize();

        // App is ready
        setAppReady(true);

        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error('App initialization failed:', error);
        setAppReady(true); // Still show app even if init fails
      }
    };

    initApp();
  }, [initialize, loadFonts]);

  if (!appReady) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LoadingScreen />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.midnightGrape,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.midnightGrape,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingLogo: {
    fontFamily: 'monospace',
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.levelUpLime,
    marginBottom: 24,
    letterSpacing: 4,
  },
  spinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: COLORS.mediumGray,
    letterSpacing: 2,
  },
});
