// Anima - Authentication Service
// Handle user authentication with Firebase

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser,
  UserCredential,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDb, COLLECTIONS } from './FirebaseConfig';
import { User, UserSettings, UserStats } from '../types';

// Default user settings
const DEFAULT_SETTINGS: UserSettings = {
  theme: 'default',
  notifications: {
    newEpisodes: true,
    mentions: true,
    replies: true,
    likes: true,
    reposts: true,
    guildActivity: true,
    recommendations: true,
  },
  privacy: {
    showWatchlist: true,
    showActivity: true,
    allowDMs: true,
  },
  spoilerProtection: true,
};

// Default user stats
const DEFAULT_STATS: UserStats = {
  postsCount: 0,
  followersCount: 0,
  followingCount: 0,
  completedAnime: 0,
  watchingAnime: 0,
  totalEpisodesWatched: 0,
  critsGiven: 0,
  critsReceived: 0,
};

// Sign up with email and password
export const signUp = async (
  email: string,
  password: string,
  username: string,
  displayName: string
): Promise<User> => {
  const auth = getFirebaseAuth();
  const db = getFirebaseDb();

  // Create Firebase auth user
  const credential: UserCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const firebaseUser = credential.user;

  // Update Firebase profile
  await updateProfile(firebaseUser, {
    displayName,
  });

  // Create user document in Firestore
  const userDoc: Omit<User, 'id'> = {
    username: username.toLowerCase(),
    displayName,
    avatarUrl: null,
    bannerUrl: null,
    bio: null,
    powerLevel: 1,
    xp: 0,
    joinedAt: new Date(),
    badges: [],
    pledgedCharacter: null,
    stats: DEFAULT_STATS,
    settings: DEFAULT_SETTINGS,
  };

  await setDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid), {
    ...userDoc,
    joinedAt: serverTimestamp(),
  });

  return {
    id: firebaseUser.uid,
    ...userDoc,
  };
};

// Sign in with email and password
export const signIn = async (
  email: string,
  password: string
): Promise<User | null> => {
  const auth = getFirebaseAuth();

  const credential: UserCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  return getUserData(credential.user.uid);
};

// Sign out
export const signOut = async (): Promise<void> => {
  const auth = getFirebaseAuth();
  await firebaseSignOut(auth);
};

// Get user data from Firestore
export const getUserData = async (userId: string): Promise<User | null> => {
  const db = getFirebaseDb();
  const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));

  if (!userDoc.exists()) {
    return null;
  }

  const data = userDoc.data();
  return {
    id: userId,
    username: data.username,
    displayName: data.displayName,
    avatarUrl: data.avatarUrl,
    bannerUrl: data.bannerUrl,
    bio: data.bio,
    powerLevel: data.powerLevel,
    xp: data.xp,
    joinedAt: data.joinedAt?.toDate() || new Date(),
    badges: data.badges || [],
    pledgedCharacter: data.pledgedCharacter,
    stats: data.stats || DEFAULT_STATS,
    settings: data.settings || DEFAULT_SETTINGS,
  };
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  updates: Partial<Omit<User, 'id' | 'joinedAt' | 'stats'>>
): Promise<void> => {
  const db = getFirebaseDb();
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), updates);
};

// Update user settings
export const updateUserSettings = async (
  userId: string,
  settings: Partial<UserSettings>
): Promise<void> => {
  const db = getFirebaseDb();
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    settings,
  });
};

// Add XP to user
export const addUserXP = async (
  userId: string,
  xpAmount: number
): Promise<{ newXP: number; newPowerLevel: number }> => {
  const db = getFirebaseDb();
  const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));

  if (!userDoc.exists()) {
    throw new Error('User not found');
  }

  const currentXP = userDoc.data().xp || 0;
  const newXP = currentXP + xpAmount;

  // Calculate new power level
  const { calculatePowerLevel } = await import('../types/user');
  const tier = calculatePowerLevel(newXP);

  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    xp: newXP,
    powerLevel: tier.level,
  });

  return { newXP, newPowerLevel: tier.level };
};

// Password reset
export const resetPassword = async (email: string): Promise<void> => {
  const auth = getFirebaseAuth();
  await sendPasswordResetEmail(auth, email);
};

// Auth state listener
export const onAuthStateChange = (
  callback: (user: FirebaseUser | null) => void
): (() => void) => {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, callback);
};

// Check if username is available
export const isUsernameAvailable = async (username: string): Promise<boolean> => {
  const db = getFirebaseDb();
  const { query, where, getDocs, collection } = await import('firebase/firestore');

  const q = query(
    collection(db, COLLECTIONS.USERS),
    where('username', '==', username.toLowerCase())
  );

  const snapshot = await getDocs(q);
  return snapshot.empty;
};

// XP rewards for different actions
export const XP_REWARDS = {
  POST: 10,
  REPLY: 5,
  LIKE_RECEIVED: 2,
  REPOST_RECEIVED: 5,
  COMPLETE_ANIME: 50,
  WATCH_EPISODE: 10,
  ARENA_CRIT: 3,
  DAILY_LOGIN: 5,
} as const;
