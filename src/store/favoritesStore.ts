import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exercise } from '@/types';

interface FavoritesState {
  favorites: Exercise[];
  favoriteIds: Record<string, boolean>;
  toggleFavorite: (exercise: Exercise) => boolean; // returns new state
  isFavorite: (id: string) => boolean;
  removeFavorite: (id: string) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      favoriteIds: {},

      toggleFavorite: (exercise) => {
        const id = String(exercise.id);
        const exists = !!get().favoriteIds[id];

        if (exists) {
          const nextFavorites = get().favorites.filter((ex) => String(ex.id) !== id);
          const nextMap = { ...get().favoriteIds };
          delete nextMap[id];
          set({ favorites: nextFavorites, favoriteIds: nextMap });
          return false;
        } else {
          // Salva snapshot completo para resiliência offline total
          const snapshot: Exercise = {
            id: String(exercise.id),
            name: exercise.name,
            bodyPart: exercise.bodyPart,
            equipment: exercise.equipment,
            target: exercise.target,
            secondaryMuscles: [...(exercise.secondaryMuscles || [])],
            instructions: [...(exercise.instructions || [])],
            gifUrl: exercise.gifUrl,
          };
          const nextFavorites = [snapshot, ...get().favorites];
          const nextMap = { ...get().favoriteIds, [id]: true };
          set({ favorites: nextFavorites, favoriteIds: nextMap });
          return true;
        }
      },

      isFavorite: (id) => {
        return !!get().favoriteIds[String(id)];
      },

      removeFavorite: (id) => {
        const targetId = String(id);
        const nextFavorites = get().favorites.filter((ex) => String(ex.id) !== targetId);
        const nextMap = { ...get().favoriteIds };
        delete nextMap[targetId];
        set({ favorites: nextFavorites, favoriteIds: nextMap });
      },
    }),
    {
      name: 'fitmax_favorites_v1',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
