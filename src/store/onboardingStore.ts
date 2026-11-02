import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingState {
  hasCompletedWelcome: boolean;
  setWelcomeCompleted: (completed: boolean) => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasCompletedWelcome: false,
      setWelcomeCompleted: (completed) => set({ hasCompletedWelcome: completed }),
    }),
    {
      name: 'fitmax_onboarding_v1',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
