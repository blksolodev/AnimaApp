// Anima - Onboarding Store
// Track user's progress through onboarding flow

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@anima_onboarding_complete';
const ONBOARDING_DATA_KEY = '@anima_onboarding_data';

export type OnboardingStep =
  | 'welcome'
  | 'create_account'
  | 'profile_setup'
  | 'avatar_selection'
  | 'genre_preferences'
  | 'complete';

export interface OnboardingData {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  selectedGenres: string[];
  favoriteAnime: string[];
}

interface OnboardingState {
  currentStep: OnboardingStep;
  isComplete: boolean;
  isLoading: boolean;
  data: OnboardingData;

  // Actions
  initialize: () => Promise<void>;
  setStep: (step: OnboardingStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  updateData: (updates: Partial<OnboardingData>) => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

const STEP_ORDER: OnboardingStep[] = [
  'welcome',
  'create_account',
  'profile_setup',
  'avatar_selection',
  'genre_preferences',
  'complete',
];

const INITIAL_DATA: OnboardingData = {
  username: '',
  displayName: '',
  bio: '',
  avatarUrl: null,
  selectedGenres: [],
  favoriteAnime: [],
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  currentStep: 'welcome',
  isComplete: false,
  isLoading: true,
  data: INITIAL_DATA,

  initialize: async () => {
    try {
      const [completeStr, dataStr] = await Promise.all([
        AsyncStorage.getItem(ONBOARDING_KEY),
        AsyncStorage.getItem(ONBOARDING_DATA_KEY),
      ]);

      const isComplete = completeStr === 'true';
      const savedData = dataStr ? JSON.parse(dataStr) : INITIAL_DATA;

      set({
        isComplete,
        data: savedData,
        isLoading: false,
        currentStep: isComplete ? 'complete' : 'welcome',
      });
    } catch (error) {
      console.error('Failed to initialize onboarding:', error);
      set({ isLoading: false });
    }
  },

  setStep: (step: OnboardingStep) => {
    set({ currentStep: step });
  },

  nextStep: () => {
    const { currentStep } = get();
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    const nextIndex = Math.min(currentIndex + 1, STEP_ORDER.length - 1);
    set({ currentStep: STEP_ORDER[nextIndex] });
  },

  previousStep: () => {
    const { currentStep } = get();
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    const prevIndex = Math.max(currentIndex - 1, 0);
    set({ currentStep: STEP_ORDER[prevIndex] });
  },

  updateData: (updates: Partial<OnboardingData>) => {
    const { data } = get();
    const newData = { ...data, ...updates };
    set({ data: newData });

    // Persist data
    AsyncStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(newData)).catch(
      console.error
    );
  },

  completeOnboarding: async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      set({ isComplete: true, currentStep: 'complete' });
    } catch (error) {
      console.error('Failed to save onboarding completion:', error);
    }
  },

  resetOnboarding: async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(ONBOARDING_KEY),
        AsyncStorage.removeItem(ONBOARDING_DATA_KEY),
      ]);
      set({
        currentStep: 'welcome',
        isComplete: false,
        data: INITIAL_DATA,
      });
    } catch (error) {
      console.error('Failed to reset onboarding:', error);
    }
  },
}));

// Anime genres for preference selection
export const ANIME_GENRES = [
  { id: 'action', name: 'Action', icon: 'flash', color: '#EF4444' },
  { id: 'adventure', name: 'Adventure', icon: 'compass', color: '#F59E0B' },
  { id: 'comedy', name: 'Comedy', icon: 'happy', color: '#FBBF24' },
  { id: 'drama', name: 'Drama', icon: 'heart', color: '#EC4899' },
  { id: 'fantasy', name: 'Fantasy', icon: 'sparkles', color: '#8B5CF6' },
  { id: 'horror', name: 'Horror', icon: 'skull', color: '#6B7280' },
  { id: 'mystery', name: 'Mystery', icon: 'search', color: '#3B82F6' },
  { id: 'psychological', name: 'Psychological', icon: 'bulb', color: '#6366F1' },
  { id: 'romance', name: 'Romance', icon: 'heart', color: '#F472B6' },
  { id: 'sci-fi', name: 'Sci-Fi', icon: 'planet', color: '#06B6D4' },
  { id: 'slice-of-life', name: 'Slice of Life', icon: 'sunny', color: '#10B981' },
  { id: 'sports', name: 'Sports', icon: 'basketball', color: '#F97316' },
  { id: 'supernatural', name: 'Supernatural', icon: 'moon', color: '#7C3AED' },
  { id: 'thriller', name: 'Thriller', icon: 'alert', color: '#DC2626' },
  { id: 'mecha', name: 'Mecha', icon: 'hardware-chip', color: '#64748B' },
  { id: 'isekai', name: 'Isekai', icon: 'globe', color: '#14B8A6' },
];
