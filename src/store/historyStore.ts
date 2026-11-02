import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryEntry, WeeklySummary } from '@/types';
import { calculateWeeklySummary, getLocalDateString } from '@/utils/date';

interface HistoryState {
  history: HistoryEntry[];
  loginDates: string[];
  savedWeeklySummary: WeeklySummary | null;
  recordLoginToday: () => void;
  addHistoryEntry: (entry: HistoryEntry) => void;
  deleteHistoryEntry: (id: string) => void;
  clearHistory: () => void;
}

// Inicia com histórico de treinos zerado e o dia de hoje registrado como logado
const initialHistory: HistoryEntry[] = [];
const initialLoginDates: string[] = [getLocalDateString()];

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      history: initialHistory,
      loginDates: initialLoginDates,
      savedWeeklySummary: calculateWeeklySummary(initialHistory, 'pt-BR', initialLoginDates),

      recordLoginToday: () => {
        const today = getLocalDateString();
        set((state) => {
          const existingDates = Array.isArray(state.loginDates) ? state.loginDates : [];
          const nextLoginDates = existingDates.includes(today)
            ? existingDates
            : [...existingDates, today].sort();
          const nextSummary = calculateWeeklySummary(state.history, 'pt-BR', nextLoginDates);

          return {
            loginDates: nextLoginDates,
            savedWeeklySummary: nextSummary,
          };
        });
      },

      addHistoryEntry: (entry) => {
        const today = getLocalDateString();
        set((state) => {
          const nextHistory = [
            entry,
            ...state.history.filter((h) => !h.id.startsWith('hist-seed-')),
          ];
          const existingDates = Array.isArray(state.loginDates) ? state.loginDates : [];
          const nextLoginDates = existingDates.includes(today)
            ? existingDates
            : [...existingDates, today].sort();
          const nextSummary = calculateWeeklySummary(nextHistory, 'pt-BR', nextLoginDates);

          return {
            history: nextHistory,
            loginDates: nextLoginDates,
            savedWeeklySummary: nextSummary,
          };
        });
      },

      deleteHistoryEntry: (id) => {
        set((state) => {
          const nextHistory = state.history.filter((h) => h.id !== id);
          const nextSummary = calculateWeeklySummary(nextHistory, 'pt-BR', state.loginDates);
          return {
            history: nextHistory,
            savedWeeklySummary: nextSummary,
          };
        });
      },

      clearHistory: () => {
        const today = getLocalDateString();
        set((state) => ({
          history: [],
          savedWeeklySummary: calculateWeeklySummary([], 'pt-BR', state.loginDates || [today]),
        }));
      },
    }),
    {
      name: 'fitmax_history_v2',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persistedState: unknown) => {
        const today = getLocalDateString();
        if (persistedState && typeof persistedState === 'object') {
          const raw = persistedState as Partial<HistoryState>;
          const cleanedHistory = Array.isArray(raw.history)
            ? raw.history.filter((h) => h && typeof h.id === 'string' && !h.id.startsWith('hist-seed-'))
            : [];
          const rawLogins = Array.isArray(raw.loginDates) ? raw.loginDates.filter(Boolean) : [];
          const mergedLogins = Array.from(new Set([...rawLogins, today])).sort();

          return {
            ...raw,
            history: cleanedHistory,
            loginDates: mergedLogins,
            savedWeeklySummary: calculateWeeklySummary(cleanedHistory, 'pt-BR', mergedLogins),
          } as HistoryState;
        }
        return {
          history: initialHistory,
          loginDates: [today],
          savedWeeklySummary: calculateWeeklySummary(initialHistory, 'pt-BR', [today]),
        } as HistoryState;
      },
    }
  )
);
