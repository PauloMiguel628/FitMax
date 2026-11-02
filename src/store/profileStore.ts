import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile, WeightEntry } from '@/types';
import { getLocalDateString } from '@/utils/date';

interface ProfileState {
  profile: Profile;
  weightHistory: WeightEntry[];
  updateProfile: (updates: Partial<Profile>) => void;
  setLocale: (locale: 'pt-BR' | 'en') => void;
  setThemeMode: (themeMode: 'dark' | 'light') => void;
  toggleThemeMode: () => void;
  addWeightEntry: (weightKg: number, date?: string) => void;
  removeWeightEntry: (id: string) => void;
}

const defaultProfile: Profile = {
  name: 'Paulo Miguel',
  bio: 'Treinando calistenia em casa com foco e consistência.',
  photoUri: undefined,
  weightKg: 74,
  heightCm: 176,
  age: 26,
  sex: 'm',
  goal: 'Ganhar massa e definição',
  level: 'intermediario',
  locale: 'pt-BR',
  themeMode: 'dark',
};

// Inicia sem registros automáticos; apenas o usuário registra seu peso quando quiser
const initialWeightHistory: WeightEntry[] = [];

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: defaultProfile,
      weightHistory: initialWeightHistory,

      updateProfile: (updates) => {
        set((state) => ({
          profile: { ...state.profile, ...updates },
        }));
      },

      setLocale: (locale) => {
        set((state) => ({
          profile: { ...state.profile, locale },
        }));
      },

      setThemeMode: (themeMode) => {
        set((state) => ({
          profile: { ...state.profile, themeMode },
        }));
      },

      toggleThemeMode: () => {
        set((state) => ({
          profile: {
            ...state.profile,
            themeMode: state.profile.themeMode === 'light' ? 'dark' : 'light',
          },
        }));
      },

      addWeightEntry: (weightKg, date) => {
        if (!weightKg || weightKg <= 0) return;
        const now = new Date();
        const entryDate = date || getLocalDateString(now);
        const recordedAt = now.toISOString();
        const normalizedWeight = Number(weightKg.toFixed(1));

        set((state) => {
          const newEntry: WeightEntry = {
            id: `w-${now.getTime()}-${Math.random().toString(36).slice(2, 6)}`,
            date: entryDate,
            recordedAt,
            weightKg: normalizedWeight,
          };

          const updated = [...state.weightHistory, newEntry].sort((a, b) => {
            const keyA = a.recordedAt || a.date;
            const keyB = b.recordedAt || b.date;
            return keyA.localeCompare(keyB);
          });

          return {
            weightHistory: updated,
            profile: { ...state.profile, weightKg: normalizedWeight },
          };
        });
      },

      removeWeightEntry: (id) => {
        set((state) => ({
          weightHistory: state.weightHistory.filter((w) => w.id !== id),
        }));
      },
    }),
    {
      name: 'fitmax_profile_v3',
      version: 4,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persistedState: unknown) => {
        if (persistedState && typeof persistedState === 'object') {
          const raw = persistedState as Partial<ProfileState>;
          const rawHistory = Array.isArray(raw.weightHistory) ? raw.weightHistory : [];
          // Remove quaisquer registros automáticos ou fictícios, mantendo apenas os criados pelo usuário
          const cleaned = rawHistory
            .filter(
              (w) =>
                w &&
                w.id !== 'w-initial' &&
                w.id !== 'w-1' &&
                w.id !== 'w-2' &&
                w.id !== 'w-3' &&
                w.id !== 'w-4'
            )
            .map((w) => ({
              ...w,
              recordedAt: w.recordedAt || `${w.date}T12:00:00.000Z`,
            }));

          return {
            ...raw,
            profile: {
              ...defaultProfile,
              ...(raw.profile || {}),
              themeMode: raw.profile?.themeMode === 'light' ? 'light' : 'dark',
            },
            weightHistory: cleaned,
          } as ProfileState;
        }
        return {
          profile: defaultProfile,
          weightHistory: initialWeightHistory,
        } as unknown as ProfileState;
      },
    }
  )
);
