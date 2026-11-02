import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Workout, WorkoutItem } from '@/types';
import { BUNDLED_EXERCISES } from '@/services/bundledExercises';

interface WorkoutState {
  workouts: Workout[];
  addWorkout: (workout: Omit<Workout, 'id' | 'createdAt'>) => string;
  updateWorkout: (id: string, updates: Partial<Omit<Workout, 'id' | 'createdAt'>>) => void;
  deleteWorkout: (id: string) => void;
  duplicateWorkout: (id: string) => void;
  reorderExercises: (workoutId: string, fromIndex: number, toIndex: number) => void;
  moveExercise: (workoutId: string, index: number, direction: 'up' | 'down') => void;
  removeExerciseFromWorkout: (workoutId: string, index: number) => void;
}

// Exemplos iniciais prontos de treino sem equipamento
const defaultSampleWorkouts: Workout[] = [
  {
    id: 'workout-sample-1',
    name: 'Queima Rápida & Core em Casa',
    createdAt: new Date().toISOString(),
    items: [
      {
        exercise: BUNDLED_EXERCISES.find((e) => e.name.toLowerCase().includes('burpee')) || BUNDLED_EXERCISES[0],
        plannedSets: 3,
        targetReps: 12,
      },
      {
        exercise: BUNDLED_EXERCISES.find((e) => e.name.toLowerCase().includes('sit-up')) || BUNDLED_EXERCISES[1],
        plannedSets: 3,
        targetReps: 15,
      },
      {
        exercise: BUNDLED_EXERCISES.find((e) => e.name.toLowerCase().includes('push-up')) || BUNDLED_EXERCISES[2],
        plannedSets: 3,
        targetReps: 10,
      },
    ].filter(Boolean) as WorkoutItem[],
  },
  {
    id: 'workout-sample-2',
    name: 'Força de Membros Inferiores',
    createdAt: new Date().toISOString(),
    items: [
      {
        exercise: BUNDLED_EXERCISES.find((e) => e.name.toLowerCase().includes('squat')) || BUNDLED_EXERCISES[3],
        plannedSets: 4,
        targetReps: 15,
      },
      {
        exercise: BUNDLED_EXERCISES.find((e) => e.name.toLowerCase().includes('bridge')) || BUNDLED_EXERCISES[4],
        plannedSets: 3,
        targetReps: 12,
      },
    ].filter(Boolean) as WorkoutItem[],
  },
];

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      workouts: defaultSampleWorkouts,

      addWorkout: (data) => {
        const id = 'wkt-' + Date.now();
        const newWorkout: Workout = {
          id,
          name: data.name.trim(),
          createdAt: new Date().toISOString(),
          items: data.items,
        };
        set((state) => ({ workouts: [newWorkout, ...state.workouts] }));
        return id;
      },

      updateWorkout: (id, updates) => {
        set((state) => ({
          workouts: state.workouts.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        }));
      },

      deleteWorkout: (id) => {
        set((state) => ({
          workouts: state.workouts.filter((w) => w.id !== id),
        }));
      },

      duplicateWorkout: (id) => {
        const target = get().workouts.find((w) => w.id === id);
        if (!target) return;

        const duplicated: Workout = {
          id: 'wkt-' + Date.now(),
          name: `${target.name} (Cópia)`,
          createdAt: new Date().toISOString(),
          items: target.items.map((item) => ({ ...item })),
        };

        set((state) => ({
          workouts: [duplicated, ...state.workouts],
        }));
      },

      reorderExercises: (workoutId, fromIndex, toIndex) => {
        set((state) => ({
          workouts: state.workouts.map((w) => {
            if (w.id !== workoutId) return w;
            const updatedItems = [...w.items];
            const [moved] = updatedItems.splice(fromIndex, 1);
            updatedItems.splice(toIndex, 0, moved);
            return { ...w, items: updatedItems };
          }),
        }));
      },

      moveExercise: (workoutId, index, direction) => {
        set((state) => ({
          workouts: state.workouts.map((w) => {
            if (w.id !== workoutId) return w;
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            if (targetIndex < 0 || targetIndex >= w.items.length) return w;

            const updatedItems = [...w.items];
            const temp = updatedItems[index];
            updatedItems[index] = updatedItems[targetIndex];
            updatedItems[targetIndex] = temp;
            return { ...w, items: updatedItems };
          }),
        }));
      },

      removeExerciseFromWorkout: (workoutId, index) => {
        set((state) => ({
          workouts: state.workouts.map((w) => {
            if (w.id !== workoutId) return w;
            const updatedItems = w.items.filter((_, i) => i !== index);
            return { ...w, items: updatedItems };
          }),
        }));
      },
    }),
    {
      name: 'fitmax_workouts_v1',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persistedState: unknown) => {
        if (persistedState && typeof persistedState === 'object') {
          return persistedState as WorkoutState;
        }
        return { workouts: defaultSampleWorkouts } as WorkoutState;
      },
    }
  )
);
