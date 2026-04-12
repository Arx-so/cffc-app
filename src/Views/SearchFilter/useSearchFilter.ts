import { useState } from "react";
import { useRouter } from "expo-router";
import { useSearchFilterStore } from "@/stores/searchFilterStore";
import { UseSearchFilterReturn } from "./SearchFilter.types";

export function useSearchFilter(): UseSearchFilterReturn {
  const router = useRouter();
  const store = useSearchFilterStore();

  const [positions, setPositions] = useState<string[]>(store.positions);
  const [ageMin, setAgeMin] = useState<string>(store.ageMin !== null ? String(store.ageMin) : "");
  const [ageMax, setAgeMax] = useState<string>(store.ageMax !== null ? String(store.ageMax) : "");
  const [dominantFoot, setDominantFoot] = useState<string | null>(store.dominantFoot);
  const [minHeight, setMinHeight] = useState<string>(store.minHeight !== null ? String(store.minHeight) : "");
  const [maxWeight, setMaxWeight] = useState<string>(store.maxWeight !== null ? String(store.maxWeight) : "");
  const [strengths, setStrengths] = useState<string[]>(store.strengths);

  const togglePosition = (pos: string) => {
    setPositions((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    );
  };

  const toggleStrength = (str: string) => {
    setStrengths((prev) =>
      prev.includes(str) ? prev.filter((s) => s !== str) : [...prev, str]
    );
  };

  const handleApply = () => {
    store.setFilters({
      positions,
      ageMin: ageMin !== "" ? Number(ageMin) : null,
      ageMax: ageMax !== "" ? Number(ageMax) : null,
      dominantFoot,
      minHeight: minHeight !== "" ? Number(minHeight) : null,
      maxWeight: maxWeight !== "" ? Number(maxWeight) : null,
      strengths,
    });
    router.back();
  };

  const handleClear = () => {
    store.clearFilters();
    router.back();
  };

  return {
    positions,
    ageMin,
    ageMax,
    dominantFoot,
    minHeight,
    maxWeight,
    strengths,
    togglePosition,
    toggleStrength,
    setDominantFoot,
    setAgeMin,
    setAgeMax,
    setMinHeight,
    setMaxWeight,
    handleApply,
    handleClear,
  };
}
