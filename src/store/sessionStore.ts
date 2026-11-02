import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, SessionItem, Workout, Exercise, HistoryEntry } from '@/types';

interface SessionState {
  currentSession: Session | null;
  startSession: (workout: Workout) => void;
  setCurrentIndex: (index: number) => void;
  toggleSetDone: (exerciseId: string, setIndex: number) => void;
  addExtraSet: (exerciseId: string) => void;
  removeSet: (exerciseId: string) => void;
  updateExerciseRestSeconds: (exerciseId: string, restSeconds: number) => void;
  startRestTimer: (durationSeconds: number) => void;
  addRestTime: (deltaSeconds: number) => void;
  clearRestTimer: () => void;
  updateExerciseElapsed: (exerciseId: string, deltaMs: number) => void;
  discardSession: () => void;
  completeSession: () => HistoryEntry | null;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      currentSession: null,

      startSession: (workout: Workout) => {
        const snapshots: Record<string, Exercise> = {};
        const defaultRest = workout.defaultRestSeconds || 60;
        const items: SessionItem[] = workout.items.map((item) => {
          snapshots[String(item.exercise.id)] = item.exercise;
          return {
            exerciseId: String(item.exercise.id),
            plannedSets: item.plannedSets || 3,
            doneSets: 0,
            elapsedMs: 0,
            restSeconds: item.restSeconds || defaultRest,
            targetDurationSeconds: item.targetDurationSeconds || 45,
          };
        });

        const newSession: Session = {
          id: 'session-' + Date.now(),
          workoutId: workout.id,
          workoutName: workout.name,
          startedAt: Date.now(),
          currentIndex: 0,
          defaultRestSeconds: defaultRest,
          restEndsAt: null,
          restTotalMs: 0,
          items,
          snapshots,
        };

        set({ currentSession: newSession });
      },

      setCurrentIndex: (index: number) => {
        const { currentSession } = get();
        if (!currentSession) return;
        const validIndex = Math.max(0, Math.min(index, currentSession.items.length - 1));
        set({
          currentSession: {
            ...currentSession,
            currentIndex: validIndex,
          },
        });
      },

      toggleSetDone: (exerciseId: string, setIndex: number) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const updatedItems = currentSession.items.map((item) => {
          if (item.exerciseId !== exerciseId) return item;

          // Se clicar em um setIndex: se estava feito até esse ponto, altera
          let nextDone = item.doneSets;
          if (setIndex < item.doneSets) {
            nextDone = setIndex; // desmarca a partir dele
          } else {
            nextDone = setIndex + 1; // marca até ele
          }

          return {
            ...item,
            doneSets: Math.max(0, Math.min(nextDone, item.plannedSets)),
          };
        });

        set({
          currentSession: {
            ...currentSession,
            items: updatedItems,
          },
        });
      },

      addExtraSet: (exerciseId: string) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const updatedItems = currentSession.items.map((item) => {
          if (item.exerciseId !== exerciseId) return item;
          return {
            ...item,
            plannedSets: item.plannedSets + 1,
          };
        });

        set({
          currentSession: {
            ...currentSession,
            items: updatedItems,
          },
        });
      },

      removeSet: (exerciseId: string) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const updatedItems = currentSession.items.map((item) => {
          if (item.exerciseId !== exerciseId) return item;
          const nextPlanned = Math.max(1, item.plannedSets - 1);
          return {
            ...item,
            plannedSets: nextPlanned,
            doneSets: Math.min(item.doneSets, nextPlanned),
          };
        });

        set({
          currentSession: {
            ...currentSession,
            items: updatedItems,
          },
        });
      },

      updateExerciseRestSeconds: (exerciseId: string, restSeconds: number) => {
        const { currentSession } = get();
        if (!currentSession) return;
        const clamped = Math.max(15, Math.min(300, restSeconds));

        const updatedItems = currentSession.items.map((item) => {
          if (item.exerciseId !== exerciseId) return item;
          return {
            ...item,
            restSeconds: clamped,
          };
        });

        set({
          currentSession: {
            ...currentSession,
            items: updatedItems,
          },
        });
      },

      startRestTimer: (durationSeconds: number) => {
        const { currentSession } = get();
        if (!currentSession) return;
        const durationMs = Math.max(5, durationSeconds) * 1000;
        set({
          currentSession: {
            ...currentSession,
            restEndsAt: Date.now() + durationMs,
            restTotalMs: durationMs,
          },
        });
      },

      addRestTime: (deltaSeconds: number) => {
        const { currentSession } = get();
        if (!currentSession || !currentSession.restEndsAt) return;
        const deltaMs = deltaSeconds * 1000;
        const now = Date.now();
        const nextEndsAt = Math.max(now + 1000, currentSession.restEndsAt + deltaMs);
        const nextRemaining = nextEndsAt - now;
        const nextTotal = Math.max(nextRemaining, (currentSession.restTotalMs || 0) + deltaMs);

        set({
          currentSession: {
            ...currentSession,
            restEndsAt: nextEndsAt,
            restTotalMs: nextTotal,
          },
        });
      },

      clearRestTimer: () => {
        const { currentSession } = get();
        if (!currentSession) return;
        set({
          currentSession: {
            ...currentSession,
            restEndsAt: null,
            restTotalMs: 0,
          },
        });
      },

      updateExerciseElapsed: (exerciseId: string, deltaMs: number) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const updatedItems = currentSession.items.map((item) => {
          if (item.exerciseId !== exerciseId) return item;
          return {
            ...item,
            elapsedMs: (item.elapsedMs || 0) + deltaMs,
          };
        });

        set({
          currentSession: {
            ...currentSession,
            items: updatedItems,
          },
        });
      },

      discardSession: () => {
        set({ currentSession: null });
      },

      completeSession: () => {
        const { currentSession } = get();
        if (!currentSession) return null;

        const now = Date.now();
        const durationMs = Math.max(1000, now - currentSession.startedAt);

        const historyEntry: HistoryEntry = {
          id: 'hist-' + now,
          workoutName: currentSession.workoutName,
          startedAt: new Date(currentSession.startedAt).toISOString(),
          finishedAt: new Date(now).toISOString(),
          durationMs,
          items: currentSession.items,
          exercisesSnapshot: currentSession.snapshots,
        };

        set({ currentSession: null });
        return historyEntry;
      },
    }),
    {
      name: 'fitmax_session_v1',
      version: 3,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persistedState: unknown) => {
        if (persistedState && typeof persistedState === 'object') {
          return persistedState as SessionState;
        }
        return { currentSession: null } as SessionState;
      },
    }
  )
);
