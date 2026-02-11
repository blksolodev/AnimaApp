// Anima - Firebase Configuration
// Initialize Firebase for auth, firestore, and storage

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  enableIndexedDbPersistence,
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration - Replace with your own config
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'your-app.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'your-project-id',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'your-app.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abc123',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-XXXXXXXXXX',
};

// Firebase app instance
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

// Initialize Firebase
export const initializeFirebase = (): {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
} => {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);

    // Initialize Auth with AsyncStorage persistence
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });

    // Initialize Firestore
    db = getFirestore(app);

    // Initialize Storage
    storage = getStorage(app);
  } else {
    app = getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  }

  return { app, auth, db, storage };
};

// Get Firebase instances
export const getFirebaseApp = (): FirebaseApp => {
  if (!app) {
    const { app: initializedApp } = initializeFirebase();
    return initializedApp;
  }
  return app;
};

export const getFirebaseAuth = (): Auth => {
  if (!auth) {
    const { auth: initializedAuth } = initializeFirebase();
    return initializedAuth;
  }
  return auth;
};

export const getFirebaseDb = (): Firestore => {
  if (!db) {
    const { db: initializedDb } = initializeFirebase();
    return initializedDb;
  }
  return db;
};

export const getFirebaseStorage = (): FirebaseStorage => {
  if (!storage) {
    const { storage: initializedStorage } = initializeFirebase();
    return initializedStorage;
  }
  return storage;
};

// Firestore collection names
export const COLLECTIONS = {
  USERS: 'users',
  QUESTS: 'quests',
  GUILD_CHATS: 'guild_chats',
  ARENA_TAKES: 'arena_takes',
  CUTSCENES: 'cutscenes',
  NOTIFICATIONS: 'notifications',
  STAMPS: 'stamps',
  BADGES: 'badges',
  ANIME_LIBRARY: 'anime_library', // User's anime tracking entries
} as const;

// Export initialized instances
export { app, auth, db, storage };
