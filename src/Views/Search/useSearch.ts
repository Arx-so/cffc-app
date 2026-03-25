import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import { searchAthletes } from "@/processes/profile";
import { AthleteSearchResult } from "@/processes/types/profileTypes";
import { useSearchFilterStore } from "@/stores/searchFilterStore";
import { UseSearchReturn } from "./Search.types";

export function useSearch(): UseSearchReturn {
  const [query, setQuery] = useState("");
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
    }, [])
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["search-athletes", query, filters],
    queryFn: () => searchAthletes(query, filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const openFilter = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push("/search-filter" as any);
  };

  const handleViewProfile = useCallback(
    (athlete: AthleteSearchResult) => {
      router.push(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        `/visitor-profile?userId=${athlete.id}&username=${encodeURIComponent(athlete.username ?? "")}&name=${encodeURIComponent(athlete.name)}` as any
      );
    },
    [router]
  );

  return {
    query,
    setQuery,
    athletes: data ?? [],
    isLoading,
    isError,
    refetch,
    openFilter,
    hasActiveFilters: store.hasActiveFilters(),
    handleViewProfile,
  };
}
