// Anima - User Store
// Global state management for user authentication and profile

import { create } from 'zustand';
import { User } from '../types';
import {
  signIn,
  signUp,
  signOut,
  getUserData,
  onAuthStateChange,
  updateUserProfile,
  addUserXP,
} from '../services/AuthService';

interface UserState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  error: string | null;

  // Actions
  initialize: () => () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  addXP: (amount: number) => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isGuest: false,
  error: null,

  initialize: () => {
    // Listen to auth state changes
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await getUserData(firebaseUser.uid);
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Failed to load user data',
          });
        }
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    });

    return unsubscribe;
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = await signIn(email, password);
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Login failed',
      });
      throw error;
    }
  },

  register: async (email: string, password: string, username: string, displayName: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = await signUp(email, password, username, displayName);
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Registration failed',
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await signOut();
      set({
        user: null,
        isAuthenticated: false,
        isGuest: false,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Logout failed',
      });
    }
  },

  enterGuestMode: () => {
    set({
      user: null,
      isAuthenticated: false,
      isGuest: true,
      isLoading: false,
      error: null,
    });
  },

  exitGuestMode: () => {
    set({
      isGuest: false,
    });
  },

  updateProfile: async (updates: Partial<User>) => {
    const { user } = get();
    if (!user) return;

    try {
      await updateUserProfile(user.id, updates);
      set({
        user: { ...user, ...updates },
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to update profile' });
    }
  },

  addXP: async (amount: number) => {
    const { user } = get();
    if (!user) return;

    try {
      const { newXP, newPowerLevel } = await addUserXP(user.id, amount);
      set({
        user: {
          ...user,
          xp: newXP,
          powerLevel: newPowerLevel,
        },
      });
    } catch (error: any) {
      console.error('Failed to add XP:', error);
    }
  },

  clearError: () => set({ error: null }),
}));
