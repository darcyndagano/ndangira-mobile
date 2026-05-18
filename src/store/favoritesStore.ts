import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  favoriteIds: number[];
  toggleFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      toggleFavorite: (id) => {
        const ids = get().favoriteIds;
        const exists = ids.includes(id);
        const nextIds = exists
          ? ids.filter((fid) => fid !== id)
          : [...ids, id];
        set({ favoriteIds: nextIds });
      },
      isFavorite: (id) => get().favoriteIds.includes(id),
    }),
    {
      name: 'ndangira-favorites-storage', // local storage key
    }
  )
);
