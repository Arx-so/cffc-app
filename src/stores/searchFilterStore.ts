import { create } from "zustand";

export interface SearchFilterState {
  positions: string[];
  ageMin: number | null;
  ageMax: number | null;
  dominantFoot: string | null;
  minHeight: number | null;
  maxWeight: number | null;
  strengths: string[];
}

interface SearchFilterStore extends SearchFilterState {
  setFilters: (partial: Partial<SearchFilterState>) => void;
  clearFilters: () => void;
  hasActiveFilters: () => boolean;
}

const initialState: SearchFilterState = {
  positions: [],
  ageMin: null,
  ageMax: null,
  dominantFoot: null,
  minHeight: null,
  maxWeight: null,
  strengths: [],
};

export const useSearchFilterStore = create<SearchFilterStore>((set, get) => ({
  ...initialState,
  setFilters: (partial) => set((state) => ({ ...state, ...partial })),
  clearFilters: () => set(initialState),
  hasActiveFilters: () => {
    const { positions, ageMin, ageMax, dominantFoot, minHeight, maxWeight, strengths } = get();
    return (
      positions.length > 0 ||
      ageMin !== null ||
      ageMax !== null ||
      dominantFoot !== null ||
      minHeight !== null ||
      maxWeight !== null ||
      strengths.length > 0
    );
  },
}));
