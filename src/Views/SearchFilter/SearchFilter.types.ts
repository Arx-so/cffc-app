export interface UseSearchFilterReturn {
  positions: string[];
  ageMin: string;
  ageMax: string;
  dominantFoot: string | null;
  minHeight: string;
  maxWeight: string;
  strengths: string[];
  togglePosition: (pos: string) => void;
  toggleStrength: (str: string) => void;
  setDominantFoot: (foot: string | null) => void;
  setAgeMin: (val: string) => void;
  setAgeMax: (val: string) => void;
  setMinHeight: (val: string) => void;
  setMaxWeight: (val: string) => void;
  handleApply: () => void;
  handleClear: () => void;
}
