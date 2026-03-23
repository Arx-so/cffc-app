import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import { searchAthletes } from "@/processes/profile";
import { useSearchFilterStore } from "@/stores/searchFilterStore";
import { UseSearchReturn } from "./Search.types";

export function useSearch(): UseSearchReturn {
  const [query, setQuery] = useState("");
  const queryClient = useQueryClient();
  const router = useRouter();
  const store = useSearchFilterStore();
  const filters = {
    positions: store.positions,
    ageMin: store.ageMin,
    ageMax: store.ageMax,
    dominantFoot: store.dominantFoot,
    minHeight: store.minHeight,
    maxWeight: store.maxWeight,
    strengths: store.strengths,
  };

  useFocusEffect(
    useCallback(() => {
      setQuery("");
      queryClient.resetQueries({ queryKey: ["search-athletes"] });
    }, [queryClient])
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["search-athletes", query, filters],
    queryFn: () => searchAthletes(query, filters),
    gcTime: 0,
    staleTime: 0,
  });

  const openFilter = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push("/search-filter" as any);
  };

  return {
    query,
    setQuery,
    athletes: data ?? [],
    isLoading,
    isError,
    refetch,
    openFilter,
    hasActiveFilters: store.hasActiveFilters(),
  };
}
